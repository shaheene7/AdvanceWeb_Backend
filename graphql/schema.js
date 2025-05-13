const { buildSchema } = require("graphql");

module.exports = buildSchema(`
  type User {
    id: ID!
    email: String!
    role: String!
    universityId: String
    createdAt: String!
  }

 type Task {
  id: ID!
  name: String!
  description: String
  assignedTo: User
  assignedToProject: Project
  status: String
   dueDate: String
}


  type Project {
    id: ID!
    name: String!
    description: String
    status: String!
    members: [User!]!
    category:String!
    startDate: String!
    endDate: String
    createdAt: String!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

input TaskInput {
  name: String!
  description: String
  assignedTo: ID
  assignedToProject: ID
  status: String
  dueDate: String
}

input ProjectInput {
  name: String!
  description: String
  category:String!
  status: String!
  users: [ID!]! 
  startDate: String!
  endDate: String
}


  type Query {
    # Auth
    me: User
    allStudents: [User!]!

    # Tasks
    tasks: [Task!]!
    task(id: ID!): Task
    userTasks(userId: ID!): [Task!]!
    tasksByProject(projectId: ID!): [Task]

    # Projects
    projects: [Project!]!
    project(id: ID!): Project
    userProjects(userId: ID!): [Project!]!
  }

  type Mutation {
    # Auth
    registerStudent(email: String!, password: String!, universityId: String!): AuthPayload!
    registerAdmin(email: String!, password: String!): AuthPayload!
    login(email: String!, password: String!): AuthPayload!

    # Tasks
    addTask(taskInput: TaskInput!): Task!
    deleteTask(id: ID!): Boolean!

    # Projects
    createProject(projectInput: ProjectInput!): Project!
    deleteProject(id: ID!): Boolean!
    addProjectMember(projectId: ID!, userId: ID!): Project!
    removeProjectMember(projectId: ID!, userId: ID!): Project!
  }
`);
