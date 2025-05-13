const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const projectSchema = new Schema({
  name: String,
  description: String,
  category: String,
  status: {
    type: String,
    enum: ["Pending", "In Progress", "Completed", "On Hold", "Cancelld"],
    default: "Pending",
  },
  startDate: Date,
  endDate: Date,
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
});

module.exports = mongoose.model("Project", projectSchema);
