const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const { ApolloServer } = require("apollo-server-express");
const Message = require("./models/message");
const mongoose = require("mongoose");
const connectDB = require("./config/db");
const typeDefs = require("./graphql/schema");
const resolvers = require("./graphql/resolvers");
const authMiddleware = require("./middleware/auth");
require("dotenv").config();

const app = express();
connectDB();

// Create HTTP server (needed for WebSocket support)
const httpServer = http.createServer(app);

const io = new Server(httpServer, {
  cors: { origin: "*" },
});

const userSocketMap = new Map();

io.on("connection", (socket) => {
  // After auth (e.g., token verified), client emits 'register' with their userId
  socket.on("register", (userId) => {
    userSocketMap.set(userId, socket.id);
  });

  socket.on("chat message", async ({ toUserId, message, fromUserId }) => {
    try {
      const savedMessage = await Message.create({
        sender: fromUserId,
        recipient: toUserId,
        content: message,
      });

      const toSocketId = userSocketMap.get(toUserId);
      if (toSocketId) {
        io.to(toSocketId).emit("chat message", {
          fromUserId,
          message,
          timestamp: savedMessage.createdAt,
        });
      }
    } catch (err) {
      console.error("Error saving message:", err);
    }
  });

  socket.on("disconnect", () => {
    // Remove socketId from map on disconnect
    for (const [userId, sid] of userSocketMap.entries()) {
      if (sid === socket.id) {
        userSocketMap.delete(userId);
        break;
      }
    }
  });
});

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: async ({ req }) => {
    const user = await authMiddleware(req);
    return { user };
  },
  formatError: (err) => {
    if (err.message.startsWith("Database Error: ")) {
      return new Error("Internal server error");
    }
    return err;
  },
});

async function startServer() {
  await server.start();
  server.applyMiddleware({ app });

  const PORT = process.env.PORT || 4000;
  httpServer.listen(PORT, () => {
    console.log(`GraphQL: http://localhost:${PORT}${server.graphqlPath}`);
    console.log(` Socket.IO: ws://localhost:${PORT}`);
  });
}

startServer();
