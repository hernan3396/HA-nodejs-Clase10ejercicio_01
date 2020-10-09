const mongoose = require("mongoose");
// esto de abajo funciona porque es un objeto
const { isFlag, makeSortCriteria } = require("../utils.js");

const ObjectId = mongoose.Schema.Types.ObjectId;

const teamSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      validate: (code) => code.lenght === 2,
    },
    flag: { type: String, required: true, validate: (flag) => isFlag(flag) },
    name: String,
    goalsScored: [{ type: ObjectId, ref: "Goal" }],
    goalsAgainst: [{ type: ObjectId, ref: "Goal" }],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Team", teamSchema);
