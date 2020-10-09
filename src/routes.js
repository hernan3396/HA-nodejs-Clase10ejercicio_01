const mongoose = require("mongoose");
const Team = require("./models/Team");
const Goal = require("./models/Goal.js");
const { isFlag, makeSortCriteria } = require("./utils.js");

module.exports = (app) => {
  app.get("/teams", async (req, res) => {
    try {
      const sortBy = req.query.sortBy || "";
      const order = parseInt(req.query.order, 10) || 1;
      const skip = parseInt(req.query.skip, 10) || 0;
      const sortCriteria = makeSortCriteria(sortBy, order);

      const docs = await Team.find().sort(sortCriteria).skip(skip).lean();

      res.json({
        count: docs.length,
        value: docs,
      });
    } catch (error) {
      res.status(500).json({
        error: error.message,
      });
    }
  });

  app.get("/teams/:teamId", async (req, res) => {
    try {
      const teamId = req.params.teamId;
      const include = req.query.include;
      const exclude = req.query.exclude;

      const doc = await Team.findById(teamId)
        .select(include || exclude)
        .lean();

      if (doc) {
        res.json({
          count: 1,
          value: doc,
        });
      } else {
        res.status(404).json({
          error: "No hay equipo con este ID",
        });
      }
    } catch (error) {
      res.status(500).json({
        error: error.message,
      });
    }
  });

  app.post("/teams", async (req, res) => {
    try {
      const team = req.body;

      const doc = await Team.create(team);

      res.status(201).json({
        count: 1,
        value: doc,
      });
    } catch (error) {
      res.status(500).json({
        error: error.message,
      });
    }
  });

  app.put("/teams/:teamId", async (req, res) => {
    try {
      const teamId = req.params.teamId;
      const updatePayload = req.body;

      const doc = await Team.findByIdAndUpdate(teamId, updatePayload, {
        new: true,
        runValidators: true,
      }).lean();

      if (doc) {
        res.json({
          count: 1,
          value: doc,
        });
      } else {
        res.status(404).json({
          error: "No hay equipo con este ID",
        });
      }
    } catch (err) {
      res.status(500).json({
        error: err.message,
      });
    }
  });

  app.patch("/teams/:teamId", async (req, res) => {
    try {
      const teamId = req.params.teamId;
      const updatePayload = req.body;

      const doc = await Team.findByIdAndUpdate(teamId, updatePayload, {
        new: true,
        runValidators: true,
      }).lean();

      if (doc) {
        res.json({
          count: 1,
          value: doc,
        });
      } else {
        throw new Error("No hay equipo con este ID");
      }
    } catch (err) {
      res.status(400).json({
        error: err.message,
      });
    }
  });

  app.delete("/teams/:teamId", async (req, res) => {
    try {
      const teamId = req.params.teamId;

      const doc = await Team.findByIdAndDelete(teamId).lean();

      if (doc) {
        res.json({
          count: 1,
          value: doc,
        });
      } else {
        res.status(404).json({
          error: "No hay equipo con este ID",
        });
      }
    } catch (error) {
      res.status(500).json({
        error: error.message,
      });
    }
  });

  app.post("/teams/:teamId/goal", async (req, res) => {
    try {
      const teamId = req.params.teamId;

      const updateProps = {
        $push: {
          goals: req.body,
        },
      };

      const options = {
        new: true,
        runValidators: true,
      };

      const doc = await Team.findByIdAndUpdate(
        teamId,
        updateProps,
        options
      ).lean();

      if (doc) {
        res.json({
          count: 1,
          value: doc,
        });
      } else {
        res.status(404).json({
          error: "No hay equipo con este ID",
        });
      }
    } catch (error) {
      res.status(500).json({
        error,
      });
    }
  });

  app.delete("/teams/:teamId/goal", async (req, res) => {
    try {
      const teamId = req.params.teamId;

      const updateProps = {
        $pull: {
          goals: req.body,
        },
      };

      const options = {
        new: true,
      };

      const doc = await Team.findByIdAndUpdate(
        teamId,
        updateProps,
        options
      ).lean();

      if (doc) {
        res.json({
          count: 1,
          value: doc,
        });
      } else {
        res.status(404).json({
          error: "No hay equipo con este ID",
        });
      }
    } catch (error) {
      res.status(500).json({
        error: error.message,
      });
    }
  });

  app.patch("/teams/:teamId/goal", async (req, res) => {
    try {
      const find = {
        _id: req.params.teamId,
        goals: {
          $elemMatch: req.body.find,
        },
      };

      const updateProps = {
        $set: { "goals.$": req.body.update },
      };

      const options = {
        new: true,
        runValidators: true,
      };

      const doc = await Team.findOneAndUpdate(
        find,
        updateProps,
        options
      ).lean();

      if (doc) {
        res.json({
          count: 1,
          value: doc,
        });
      } else {
        res.status(404).json({
          error: "No hay equipo con este ID",
        });
      }
    } catch (error) {
      res.status(500).json({
        error: error.message,
      });
    }
  });

  app.get("/teams/:teamId/goal/last", async (req, res) => {
    try {
      const teamId = req.params.teamId;

      const pipeline = [
        {
          $match: {
            _id: mongoose.Types.ObjectId(teamId),
          },
        },
        {
          $unwind: "$goals",
        },
        {
          $sort: {
            "goals.minute": 1,
          },
        },
        {
          $group: {
            _id: "$_id",
            lastGoal: {
              $last: "$goals",
            },
          },
        },
      ];

      const agg = await Team.aggregate(pipeline);

      const goal = agg
        .map((item) => item.lastGoal)
        .reduce((prev, curr) => curr, null);

      if (goal) {
        res.json({
          count: 1,
          value: goal,
        });
      } else {
        res.status(400).json({
          error: "Este equipo todavía no ha registrado goles",
        });
      }
    } catch (error) {
      res.status(500).json({
        error: error.message,
      });
    }
  });

  app.delete("/teams/:teamId/goal/last", async (req, res) => {
    try {
      const teamId = req.params.teamId;

      const pipeline = [
        {
          $match: {
            _id: mongoose.Types.ObjectId(teamId),
          },
        },
        {
          $unwind: "$goals",
        },
        {
          $sort: {
            "goals.minute": 1,
          },
        },
        {
          $group: {
            _id: "$_id",
            lastGoal: {
              $last: "$goals",
            },
          },
        },
      ];

      const agg = await Team.aggregate(pipeline);

      const goal = agg
        .map((item) => item.lastGoal)
        .reduce((prev, curr) => curr, null);

      if (goal) {
        const updateProps = {
          $pull: {
            goals: {
              _id: goal._id,
            },
          },
        };

        const options = {
          new: true,
        };

        const doc = await Team.findByIdAndUpdate(teamId, updateProps, options);
        res.json({
          count: 1,
          value: doc,
        });
      } else {
        res.status(404).json({
          error: "Este equipo todavía no ha registrado goles",
        });
      }
    } catch (error) {
      res.status(500).json({
        error: error.message,
      });
    }
  });

  // get goal by id
  app.get("/goals/:goalId", async (req, res) => {
    const goal = await Goal.findById(req.params.goalId)
      .populate("teamFor", "code name")
      .populate("teamTo", "code name")
      .lean();

    try {
      res.status(200).json(goal);
    } catch (err) {
      res.status(500).json({ error: err });
    }
  });

  // add goal
  app.post("/goals", async (req, res) => {
    const newGoal = await Goal.create(req.body);

    const teamFor = await Team.findByIdAndUpdate(
      req.body.teamFor,
      {
        $push: { goalsScored: newGoal._id },
      },
      { new: true }
    );

    const teamTo = await Team.findByIdAndUpdate(
      req.body.teamTo,
      {
        $push: { goalsAgainst: newGoal._id },
      },
      { new: true }
    );

    try {
      res
        .status(200)
        .json(
          await newGoal.populate("teamTo").populate("teamFor").execPopulate()
        );
    } catch (err) {
      res.status(500).json({ err: error });
    }
  });

  // patch goal by id with body
  app.patch("/goals/:goalId", async (req, res) => {
    try {
      const goal = await Goal.findByIdAndUpdate(req.params.goalId, req.body, {
        new: true,
      }).lean();
      res.status(200).json(goal);
    } catch (err) {
      res.status(500).json({ error: err });
    }
  });

  // delete goal by id
  app.delete("/goals/:goalId", async (req, res) => {
    const goal = await Goal.findByIdAndDelete(req.params.goalId);

    // teamFor
    const teamFor = await Team.findOneAndUpdate(
      {
        _id: goal.teamFor,
      },
      // busca en el array goalsScored al elemento que conicida con goal._id y lo elimina
      { $pull: { goalsScored: goal._id } }
    );

    // teamTo
    await Team.findOneAndUpdate(
      {
        _id: goal.teamTo,
      },
      // busca en el array goalsAgainst al elemento que conicida con goal._id y lo elimina
      { $pull: { goalsAgainst: goal._id } }
    );
    try {
      res.status(200).json(goal);
    } catch (err) {
      res.status(500).json({ error: err });
    }
  });
};
