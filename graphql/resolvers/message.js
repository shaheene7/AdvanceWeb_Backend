const Message = require("../../models/message");
const User = require("../../models/user");

module.exports = {
  Query: {
    getMessagesBetween: async (_, { senderId, recipientId }, { user }) => {
      if (!user) throw new Error("Unauthorized");

      const sender = await User.findById(senderId);
      const recipient = await User.findById(recipientId);

      if (
        !sender ||
        !recipient ||
        (sender.role === recipient.role && sender.role !== "admin")
      ) {
        throw new Error("Messages allowed only between admin and student.");
      }

      const messages = await Message.find({
        $or: [
          { sender: senderId, recipient: recipientId },
          { sender: recipientId, recipient: senderId },
        ],
      })
        .sort({ createdAt: 1 })
        .populate("sender")
        .populate("recipient");

      return messages.map((msg) => ({
        id: msg._id.toString(),
        content: msg.content,
        createdAt: msg.createdAt,
        sender: {
          id: msg.sender._id.toString(),
          name: msg.sender.name,
          email: msg.sender.email,
          role: msg.sender.role,
        },
        recipient: {
          id: msg.recipient._id.toString(),
          name: msg.recipient.name,
          email: msg.recipient.email,
          role: msg.recipient.role,
        },
      }));
    },
  },

  Mutation: {
    sendMessage: async (_, { senderId, recipientId, content }, { user }) => {
      if (!user) throw new Error("Unauthorized");

      if (user.id !== senderId) {
        throw new Error("You can only send messages from your own account.");
      }

      const sender = await User.findById(senderId);
      const recipient = await User.findById(recipientId);

      if (
        !sender ||
        !recipient ||
        (sender.role === recipient.role && sender.role !== "admin")
      ) {
        throw new Error("Only admin-student chat is allowed.");
      }

      const message = await Message.create({
        sender: senderId,
        recipient: recipientId,
        content,
      });

      const populatedMessage = await message.populate("sender recipient");

      return populatedMessage;
    },
  },
};
