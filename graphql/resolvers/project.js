const Project = require("../../models/project");
const User = require("../../models/user");
const Task = require("../../models/task");
const { AuthenticationError } = require("apollo-server-express");

module.exports = {
  Query: {
    projects: async (_, { status, search }) => {
      let filter = {};

      if (status && status !== "all") {
        filter.status = status;
      }

      if (search) {
        filter.$or = [
          { name: { $regex: search, $options: "i" } },
          { description: { $regex: search, $options: "i" } },
        ];
      }

      const projects = await Project.find(filter)
        .populate("members")
        .populate("createdBy");

      const results = await Promise.all(
        projects.map(async (project) => {
          const tasks = await Task.find({ assignedToProject: project._id });
          const totalTasks = tasks.length;
          const completedTasks = tasks.filter(
            (task) => task.status === "Completed"
          ).length;
          const completionPercentage =
            totalTasks > 0
              ? Math.round((completedTasks / totalTasks) * 100)
              : 0;

          return {
            ...project.toObject(),
            id: project._id.toString(),
            startDate: new Date(project.startDate).toISOString().split("T")[0],
            endDate: new Date(project.endDate).toISOString().split("T")[0],
            members: project.members.map((member) => ({
              ...member.toObject(),
              id: member._id.toString(),
            })),
            createdBy: project.createdBy
              ? {
                  ...project.createdBy.toObject(),
                  id: project.createdBy._id.toString(),
                }
              : null,
            completionPercentage,
          };
        })
      );

      return results;
    },

    getProjectCompletion: async (_, { projectId }, { user }) => {
      if (!user) throw new Error("Unauthorized");

      const totalTasks = await Task.countDocuments({
        assignedToProject: projectId,
      });

      if (totalTasks === 0) return { percentage: 0 };

      const completedTasks = await Task.countDocuments({
        assignedToProject: projectId,
        status: "Completed",
      });

      const percentage = Math.round((completedTasks / totalTasks) * 100);

      return { percentage };
    },

    project: async (_, { id }) => {
      return await Project.findById(id)
        .populate("members")
        .populate("createdBy");
    },
    userProjects: async (_, { userId }) => {
      return await Project.find({ members: userId })
        .populate("members")
        .populate("createdBy");
    },
    getProjectWithTasks: async (_, { id }) => {
      const project = await Project.findById(id);
      if (!project) throw new Error("Project not found");

      const tasks = await Task.find({ assignedToProject: id })
        .populate("assignedTo", "id email")
        .populate("assignedToProject", "id name");

      return {
        id: project._id.toString(),
        name: project.name,
        description: project.description,
        startDate: new Date(project.startDate).toISOString().split("T")[0],
        endDate: new Date(project.endDate).toISOString().split("T")[0],
        tasks: tasks.map((task) => ({
          id: task._id.toString(),
          name: task.name,
          status: task.status,
          description: task.description,
          assignedTo: task.assignedTo,
          assignedToProject: task.assignedToProject,
          dueDate: new Date(task.dueDate).toISOString().split("T")[0],
        })),
      };
    },
  },

  Mutation: {
    createProject: async (_, { projectInput }, context) => {
      if (!context.user || context.user.role !== "admin") {
        throw new AuthenticationError("Not authorized");
      }

      const project = new Project({
        ...projectInput,
        createdBy: context.user.id,
        members: projectInput.users || [],
      });

      await project.save();
      const populatedProject = await Project.findById(project._id).populate(
        "members"
      );

      return {
        ...populatedProject.toObject(),
        id: populatedProject._id.toString(),
        members: populatedProject.members.map((member) => ({
          ...member.toObject(),
          id: member._id.toString(),
        })),
        category: populatedProject.category,
      };
    },

    deleteProject: async (_, { id }, context) => {
      if (!context.user || context.user.role !== "admin") {
        throw new AuthenticationError("Not authorized");
      }

      const project = await Project.findByIdAndDelete(id);
      return !!project;
    },

    addProjectMember: async (_, { projectId, userId }, context) => {
      if (!context.user || context.user.role !== "admin") {
        throw new AuthenticationError("Not authorized");
      }

      const project = await Project.findById(projectId);
      const user = await User.findById(userId);

      if (!project || !user) {
        throw new Error("Project or user not found");
      }

      if (!project.members.includes(userId)) {
        project.members.push(userId);
        await project.save();
      }

      return project;
    },

    removeProjectMember: async (_, { projectId, userId }, context) => {
      if (!context.user || context.user.role !== "admin") {
        throw new AuthenticationError("Not authorized");
      }

      const project = await Project.findById(projectId);
      if (!project) {
        throw new Error("Project not found");
      }

      project.members = project.members.filter(
        (member) => member.toString() !== userId
      );
      await project.save();

      return project;
    },
  },
};
