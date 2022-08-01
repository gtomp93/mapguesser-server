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
const AddMapToUser = async (req, res) => {
  const client = new MongoClient(MONGO_URI, options);
  const db = client.db("Final_Project");

  try {
    const { gameid, user } = req.body;
    let _id = user;

    await client.connect();

    const newGame = { $push: { maps: gameid } };

    const result = await db.collection("Users").updateOne({ _id }, newGame);

    res.status(200).json({ status: 200, updated: _id });
  } catch (err) {
    console.log(err);
  } finally {
    await client.close();
  }
};

const removeGameFromUser = async (req, res) => {
  const client = new MongoClient(MONGO_URI, options);
  const db = client.db("Final_Project");

  try {
    const { gameid, user } = req.body;
    let _id = user;

    await client.connect();

    const newGame = { $pull: { games: gameid } };

    const result = await db.collection("Users").updateOne({ _id }, newGame);

    res.status(200).json({ status: 200, updated: _id });
  } catch (err) {
    console.log(err);
  } finally {
    await client.close();
  }
};

const getS3url = async (req, res) => {
  try {
    const url = await generateUploadURL();
    res.status(200).json({ status: 200, url });
  } catch (err) {
    console.log(err);
  }
};

const CreateMap = async (req, res) => {
  const client = new MongoClient(MONGO_URI, options);
  const db = client.db("Final_Project");

  try {
    const { name, description, pic, locations, creator, comments } = req.body;

    let _id = uuidv4();

    await client.connect();
    const result = await db
      .collection("Game_Modes")
      .insertOne({ _id, name, description, pic, locations, creator, comments });

    res.status(200).json({ status: 200, _id, result });
  } catch (err) {
    res.status(404).json({ err });
    console.log(err);
  } finally {
    await client.close();
  }
};

const deleteGame = async (req, res) => {
  const client = new MongoClient(MONGO_URI, options);
  const db = client.db("Final_Project");

  try {
    const { _id } = req.params;

    await client.connect();

    // const Game_Modes = db.collection;

    await db.collection("Game_Modes").deleteOne({ _id });
    // const result = Game_Modes.aggregate([{$unwind: "$locations"}]);

    res.status(204).json({ status: 200, deleted: _id });
  } catch (err) {
    console.log(err);
  } finally {
    await client.close();
  }
};

module.exports = {
  AddMapToUser,
  getS3url,
  removeGameFromUser,
  CreateMap,
  deleteGame,
};
