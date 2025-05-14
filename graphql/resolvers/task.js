const Task = require("../../models/task");
const User = require("../../models/user");
const Project = require("../../models/project");
const { AuthenticationError } = require("apollo-server-express");

module.exports = {
  Query: {
    tasks: async () => {
      const tasks = await Task.find()
        .populate({ path: "assignedTo", select: "id email" })
        .exec();

      return tasks.map((task) => {
        if (task.assignedTo) {
          return task;
        }

        task.assignedTo = { id: null, email: null };
        return task;
      });
    },
    task: async (_, { id }) => {
      const task = await Task.findById(id)
        .populate("assignedTo", "id email")
        .populate("assignedToProject");

      return task
        ? {
            ...task.toObject(),
            id: task._id.toString(),
            dueDate: task.dueDate
              ? new Date(task.dueDate).toISOString().split("T")[0]
              : null,
          }
        : null;
    },

    userTasks: async (_, { userId }) => {
      const tasks = await Task.find({ assignedTo: userId })
        .populate("assignedTo", "email")
        .populate("assignedToProject");

      return tasks.map((task) => ({
        ...task.toObject(),
        id: task._id.toString(),
        dueDate: task.dueDate
          ? new Date(task.dueDate).toISOString().split("T")[0]
          : null,
      }));
    },
  },
  tasksByProject: async (_, { projectId }) => {
    const tasks = await Task.find({ assignedToProject: projectId })
      .populate({ path: "assignedTo", select: "email" })
      .populate({ path: "assignedToProject" });

    return tasks.map((task) => ({
      ...task.toObject(),
      id: task._id.toString(),
      dueDate: task.dueDate
        ? new Date(task.dueDate).toISOString().split("T")[0]
        : null,
    }));
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
