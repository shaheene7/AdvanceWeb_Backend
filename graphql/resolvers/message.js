const Message = require("../../models/message");
const User = require("../../models/user");

module.exports = {
  Query: {
    getMessagesBetween: async (_, { senderId, recipientId }, { user }) => {
      if (!user) throw new Error("Unauthorized");

      // Only allow admins or students to access messages
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
        ...msg.toObject(),
        id: msg._id.toString(),
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

      const message = new Message({ sender, recipient, content });
      await message.save();

      return {
        ...message.toObject(),
        id: message._id.toString(),
      };
    },
  },
};
