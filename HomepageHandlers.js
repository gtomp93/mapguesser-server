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

const getTopPlayers = async (req, res) => {
  const client = new MongoClient(MONGO_URI, options);
  const db = client.db("Final_Project");

  await client.connect();

  try {
    const players = await db
      .collection("Users")
      .find(
        {},
        {
          projection: {
            givenName: 1,
            score: 1,
            lastName: 1,
            picture: 1,
            _id: 1,
          },
        }
      )
      .sort({ score: -1 })
      .limit(17)
      .toArray();

    res.status(200).json({ data: players, status: 200 });
  } catch (err) {
    res.status(404).json({ status: 404, message: "not found" });
    console.log(err.stack);
  } finally {
    await client.close();
  }
};

const getGame = async (req, res) => {
  const client = new MongoClient(MONGO_URI, options);
  const db = client.db("Final_Project");

  try {
    const { _id } = req.params;

    await client.connect();

    const result = await db.collection("Game_Modes").findOne({ _id });

    res.status(200).json({ status: 200, result });
    client.close();
  } catch (err) {
    console.log(err);
  } finally {
    await client.close();
  }
};

const getGames = async (req, res) => {
  const client = new MongoClient(MONGO_URI, options);
  const db = client.db("Final_Project");

  try {
    const { page } = req.query;
    let indexStart = (Number(page) - 1) * 20;
    await client.connect();
    let result = null;
    if (page > 1) {
      result = await db
        .collection("Game_Modes")
        .find()
        .skip(indexStart)
        .limit(20)
        .toArray();
    } else {
      result = await db.collection("Game_Modes").find().limit(20).toArray();
    }

    res.status(200).json({ status: 200, result });
  } catch (err) {
    console.log(err.stack);
  } finally {
    await client.close();
  }
};

const getFeaturedMaps = async (req, res) => {
  const client = new MongoClient(MONGO_URI, options);
  const db = client.db("Final_Project");

  const maps = [
    "4af008af-ea08-4e40-ac70-5c7b54a62391",
    "21e2c943-aad3-4d77-a5eb-65a7a6742d96",
  ];

  try {
    await client.connect();
    const result = await db
      .collection("Game_Modes")
      .find({ _id: { $in: maps } })
      .toArray();

    res.status(200).json({ status: 200, result });
  } catch (err) {
    console.log(err.stack);
  } finally {
    await client.close();
  }
};

const likeGame = async (req, res) => {
  const client = new MongoClient(MONGO_URI, options);
  const db = client.db("Final_Project");

  try {
    const { _id } = req.params;
    const { liked } = req.body;

    await client.connect();

    if (liked) {
      await db
        .collection("Game_Modes")
        .updateOne({ _id }, { $inc: { likes: 1 } });
    } else {
      await db
        .collection("Game_Modes")
        .updateOne({ _id }, { $inc: { likes: -1 } });
    }

    res.status(200).json({ status: 200, updated: _id });
  } catch (err) {
    res.status(404).json({ status: 404, message: "not found" });
    console.log(err);
  } finally {
    await client.close();
  }
};

const comment = async (req, res) => {
  const client = new MongoClient(MONGO_URI, options);
  const db = client.db("Final_Project");
  try {
    const { _id } = req.params;
    const { comment, commentBy, pic } = req.body;

    await client.connect();

    await db
      .collection("Game_Modes")
      .updateOne({ _id }, { $push: { comments: { comment, commentBy, pic } } });
    res
      .status(200)
      .json({ status: 200, message: "successfully added comment" });
  } catch (err) {
    res.status(400).json({ err });
  } finally {
    await client.close();
  }
};

const addToLikes = async (req, res) => {
  const client = new MongoClient(MONGO_URI, options);
  const db = client.db("Final_Project");

  try {
    const { _id } = req.params;
    const { likedGame, liked } = req.body;

    // const newGame = {$push: {games: gameid}};
    // { $pull: { <field1>: <value|condition>

    await client.connect();
    const result = null;
    if (liked) {
      await db
        .collection("Users")
        .updateOne({ _id }, { $push: { likes: likedGame } });
    } else if (!liked) {
      await db
        .collection("Users")
        .updateOne({ _id }, { $pull: { likes: likedGame } });
    }

    res.status(200).json({ status: 200, result });
  } catch (err) {
    res.status(404).json({ status: 404, message: "Not Found" });
    console.log(err);
  } finally {
    await client.close();
  }
};

const searchMaps = async (req, res) => {
  const client = new MongoClient(MONGO_URI, options);
  const db = client.db("Final_Project");

  try {
    await client.connect();

    const { searchQuery } = req.query;

    await db
      .collection("Game_Modes")
      .createIndex({ description: "text", name: "text" });

    const games = await db
      .collection("Game_Modes")
      .find({ $text: { $search: searchQuery, $caseSensitive: false } })
      .toArray();

    if (games) {
      res.status(200).json({ status: 200, data: games });
    } else {
      res.status(404).json({ status: 404, message: "not found" });
    }
  } catch (err) {
    console.log(err.stack);
  } finally {
    await client.close();
  }
};

const searchOpponent = (req, res) => {};

module.exports = {
  getTopPlayers,
  getFeaturedMaps,
  searchOpponent,
  getGame,
  getGames,
  likeGame,
  comment,
  addToLikes,
  searchMaps,
};
