const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const taskSchema = Schema({
  name: String,
  description: String,
  status: {
    type: String,
    enum: ["Pending", "In Progress", "Completed", "On Hold", "Cancelled"],
    default: "Pending",
  },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  assignedToProject: { type: mongoose.Schema.Types.ObjectId, ref: "Project" },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  dueDate: Date,
});

module.exports = mongoose.model("Task", taskSchema);
