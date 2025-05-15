const Task = require("../../models/task");
const User = require("../../models/user");
const Project = require("../../models/project");
const { AuthenticationError } = require("apollo-server-express");
const { description } = require("../schema");

module.exports = {
  Query: {
    tasks: async () => {
      const tasks = await Task.find().populate("assignedTo", "id email").exec();

      return tasks.map((task) => {
        const taskObj = {
          id: task._id.toString(),
          name: task.name,
          description: task.description,
          status: task.status,
          dueDate: new Date(task.dueDate).toISOString().split("T")[0],
          assignedTo: task.assignedTo
            ? {
                id: task.assignedTo._id.toString(),
                email: task.assignedTo.email,
              }
            : null,
        };

        return taskObj;
      });
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
  },
};
