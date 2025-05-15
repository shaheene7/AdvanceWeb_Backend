const jwt = require("jsonwebtoken");
const User = require("../../models/user");
const generateToken = require("../../utils/generateToken");
const bcrypt = require("bcryptjs");
const { AuthenticationError } = require("apollo-server-express");

module.exports = {
  Query: {
    me: async (_, __, context) => {
      if (!context.user) {
        throw new AuthenticationError("Not authenticated");
      }
      return await User.findById(context.user.id);
    },

    allStudents: async (_, __, context) => {
      const students = await User.find({ role: "student" });
      return students.map((s) => ({
        ...s.toObject(),
        id: s._id.toString(),
      }));
    },
    allAdmins: async (_, __, context) => {
      const students = await User.find({ role: "admin" });
      return students.map((s) => ({
        ...s.toObject(),
        id: s._id.toString(),
      }));
    },
  },

  Mutation: {
    registerStudent: async (_, { email, password, universityId }) => {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        throw new Error("Email already in use");
      }
      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await new User({
        email,
        password: hashedPassword,
        universityId,
        role: "student",
      }).save();

      return {
        message: "Created Successfully",
        status: "SUCCESS",
      };
    },

    registerAdmin: async (_, { email, password }) => {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        throw new Error("Email already in use");
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await new User({
        email,
        password: hashedPassword,
        role: "admin",
      }).save();

      return {
        message: "Created Successfully",
        status: "SUCCESS",
      };
    },

    login: async (parent, args, context, info) => {
      try {
        const { email, password } = args;

        const user = await User.findOne({ email });
        if (!user) {
          throw new AuthenticationError("Invalid credentials");
        }

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
          throw new AuthenticationError("Invalid credentials");
        }

        return {
          token: generateToken(user),
          user: {
            ...user.toObject(),
            id: user._id.toString(),
          },
        };
      } catch (error) {
        console.error("Login error:", error);
        throw new AuthenticationError("Login failed");
      }
    },
  },
};
