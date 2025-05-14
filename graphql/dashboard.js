const Task = require("../models/task");
const Project = require("../models/project");
const User = require("../models/user");

module.exports = {
  Query: {
    getSummaryCounts: async (_, __, { user }) => {
      if (!user) throw new Error("Unauthorized");

      const [projectCount, taskCount, studentCount, finishedProjectCount] =
        await Promise.all([
          Project.countDocuments(),
          Task.countDocuments(),
          User.countDocuments({ role: "student" }),
          Project.countDocuments({ status: "finished" }),
        ]);

      return [
        { title: "Projects", count: projectCount },
        { title: "Tasks", count: taskCount },
        { title: "Students", count: studentCount },
        { title: "Finished", count: finishedProjectCount },
      ];
    },
  },
};
