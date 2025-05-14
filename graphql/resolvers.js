const authResolvers = require("./resolvers/auth");
const taskResolvers = require("./resolvers/task");
const projectResolvers = require("./resolvers/project");
const messageResolvers = require("./resolvers/message");

module.exports = {
  Query: {
    ...authResolvers.Query,
    ...taskResolvers.Query,
    ...projectResolvers.Query,
    ...messageResolvers.Query,
  },
  Mutation: {
    ...authResolvers.Mutation,
    ...taskResolvers.Mutation,
    ...projectResolvers.Mutation,
    ...messageResolvers.Mutation,
  },
};
