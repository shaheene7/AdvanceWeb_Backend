const Project = require("../../models/project");
const User = require("../../models/user");
const { AuthenticationError } = require("apollo-server-express");

module.exports = {
  Query: {
    projects: async () => {
      return await Project.find().populate("members");
    },
    project: async (_, { id }) => {
      return await Project.findById(id).populate("members");
    },
    userProjects: async (_, { userId }) => {
      return await Project.find({ members: userId }).populate("members");
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
