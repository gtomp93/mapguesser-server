const { MongoClient } = require("mongodb");
require("dotenv").config();
const { MONGO_URI } = process.env;
const { v4: uuidv4 } = require("uuid");
const { s3 } = require("./s3");
const { generateUploadURL } = require("./s3");

const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

const retrieveMaps = async (req, res) => {
  const client = new MongoClient(MONGO_URI, options);
  const db = client.db("Final_Project");

  try {
    const { games, email } = req.body;
    await client.connect();

    const myGames = await db
      .collection("Games")
      .find({ _id: { $in: games } })
      .toArray();

    let allGames = myGames.reduce(
      (games, game) => {
        if (game.type === "single") {
          return game.gameData.length === 5
            ? { ...games, complete: [...games.complete, game] }
            : { ...games, active: [...games.active, game] };
        } else {
          return game.players.find(({ player }) => player === email)?.gameData
            .length === 5
            ? { ...games, complete: [...games.complete, game] }
            : { ...games, active: [...games.active, game] };
        }
      },
      { active: [], complete: [] }
    );

    const sortingFunc = (a, b) => {
      a = !a
        ? 0
        : a.time
        ? a.time
        : a.players.find(({ player }) => player === email)?.time
        ? a.players.find(({ player }) => player === email).time
        : 0;
      b = !b
        ? 0
        : b.time
        ? b.time
        : b.players.find(({ player }) => player === email)?.time
        ? b.players.find(({ player }) => player === email).time
        : 0;

      return b - a;
    };

    allGames.active.sort(sortingFunc);

    allGames.complete.sort(sortingFunc);

    res.status(200).json({
      status: 200,
      data: {
        active: allGames.active,
        complete: allGames.complete,
      },
    });
  } catch (err) {
    console.log(err.stack);
  } finally {
    await client.close();
  }
};

const getPlayerGames = async (req, res) => {
  const client = new MongoClient(MONGO_URI, options);
  const db = client.db("Final_Project");

  const { games } = req.body;
  try {
    await client.connect();
    const results = await db
      .collection("Game_Modes")
      .find({ _id: { $in: games } })
      .toArray();

    res.status(200).json({ status: 200, data: results });
  } catch (err) {
    res.status(404).json({ status: 404, message: "Not Found" });
    console.log(err.stack);
  } finally {
    await client.close();
  }
};

module.exports = { retrieveMaps, getPlayerGames };
