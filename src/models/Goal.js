const mongoose = require("mongoose");
const ObjectId = mongoose.Schema.Types.ObjectId;

const goalSchema = new mongoose.Schema({
  teamTo: {
    type: ObjectId,
    ref: "Team",
    required: true,
  },
  teamFor: {
    type: ObjectId,
    ref: "Team",
    required: true,
  },
  author: { type: String, require: true },
  minute: { type: Number, require: true },
});

module.exports = mongoose.model("Goal", goalSchema);
