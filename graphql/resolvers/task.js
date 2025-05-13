const Task = require("../../models/task");
const User = require("../../models/user");
const Project = require("../../models/project");
const { AuthenticationError } = require("apollo-server-express");

module.exports = {
  Query: {
    tasks: async () => {
      return await Task.find()
        .populate("assignedTo", "email")
        .populate("assignedToProject");
    },
    task: async (_, { id }) => {
      return await Task.findById(id)
        .populate("assignedTo", "email")
        .populate("assignedToProject");
    },
    userTasks: async (_, { userId }) => {
      return await Task.find({ assignedTo: userId })
        .populate("assignedTo", "email")
        .populate("assignedToProject");
    },

    tasksByProject: async (_, { projectId }) => {
      return await Task.find({ assignedToProject: projectId })
        .populate({ path: "assignedTo", select: "email" })
        .populate({ path: "assignedToProject" });
    },
  },

  Mutation: {
    addTask: async (_, { taskInput }, { user }) => {
      const {
        name,
        description,
        assignedTo,
        assignedToProject,
        status,
        dueDate,
      } = taskInput;

      if (!user) throw new Error("Not authenticated");

      const task = new Task({
        name,
        description,
        assignedTo,
        assignedToProject,
        status,
        createdBy: user.id,
        dueDate,
      });

      const savedTask = await task.save();

      const populatedTask = await Task.findById(savedTask._id)
        .populate({ path: "assignedTo", select: "email" })
        .populate({ path: "assignedToProject" });

      return populatedTask;
    },

    deleteTask: async (_, { id }, context) => {
      if (!context.user || context.user.role !== "admin") {
        throw new AuthenticationError("Not authorized");
      }

      const task = await Task.findByIdAndDelete(id);
      return !!task;
    },
  },
};
