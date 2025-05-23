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

type ProjectCompletion {
  percentage: Int!
}

type Message {
  id: ID!
  sender: User!
  recipient: User!
  content: String!
  createdAt: String!
}



  type Project {
    id: ID!
    name: String!
    description: String
    status: String!
    members: [User!]!
    completionPercentage: Int!
    category:String!
    startDate: String!
    endDate: String
    createdBy: User!
    tasks: [Task!]!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  type MessageResponse {
     message: String!
     status: String!
    }

  type CountSummary {
    title: String!
    count: Int!
  }

  type ProjectWithTasks {
    id: ID!
    name: String!
    description: String
    status: String!
    members: [User!]!
    completionPercentage: Int!
    category:String!
    startDate: String!
    endDate: String
    createdBy: User!
    tasks: [Task!]!
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
    allAdmins:[User!]!

    # Tasks
    tasks: [Task!]!
   

    # Projects
    projects(status: String, search: String): [Project!]!
    getProjectWithTasks(id: ID!): ProjectWithTasks
    project(id: ID!): Project
  }

  extend type Query {
  getMessagesBetween(senderId: ID!, recipientId: ID!): [Message!]!
   getSummaryCounts: [CountSummary!]!
   getProjectCompletion(projectId: ID!): ProjectCompletion!
}

  type Mutation {
    # Auth
    registerStudent(email: String!, password: String!, universityId: String!):MessageResponse!
    registerAdmin(email: String!, password: String!):MessageResponse!
    login(email: String!, password: String!): AuthPayload!

    # Tasks
    addTask(taskInput: TaskInput!): Task!

    # Projects
    createProject(projectInput: ProjectInput!): Project!
  }
  extend type Mutation {
  sendMessage(senderId: ID!, recipientId: ID!, content: String!): Message!
}
`);
