const authResolvers = require("./resolvers/auth");
const taskResolvers = require("./resolvers/task");
const projectResolvers = require("./resolvers/project");

module.exports = {
  Query: {
    ...authResolvers.Query,
    ...taskResolvers.Query,
    ...projectResolvers.Query,
  },
  Mutation: {
    ...authResolvers.Mutation,
    ...taskResolvers.Mutation,
    ...projectResolvers.Mutation,
  },
};
