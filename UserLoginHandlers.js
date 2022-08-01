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

const checkForUser = async (req, res) => {
  const client = new MongoClient(MONGO_URI, options);
  const db = client.db("Final_Project");

  try {
    const email = req.body;
    let doesNotExist = true;
    let userInfo = null;

    await client.connect();

    const result = await db.collection("Users").findOne(email);

    if (result) {
      doesNotExist = false;
      userInfo = result;
    }

    res.status(200).json({ status: 200, doesNotExist, userInfo });
    client.close();
  } catch (err) {
    res.status(404).json({ status: 404 });
  } finally {
    await client.close();
  }
};

const addUser = async (req, res) => {
  const client = new MongoClient(MONGO_URI, options);
  const db = client.db("Final_Project");

  try {
    const { email, givenName, lastName, picture, likes, games, score } =
      req.body;

    let _id = uuidv4();

    await client.connect();

    let result = await db.collection("Users").insertOne({
      _id,
      email,
      givenName,
      lastName,
      picture,
      likes,
      games,
      score,
      maps: [],
    });
    res.status(200).json({ status: 200, updated: _id });
  } catch (err) {
    console.log(err);
    res.status(404).json({ status: 404 });
  } finally {
    await client.close();
  }
};

const addName = async (req, res) => {
  const client = new MongoClient(MONGO_URI, options);
  const db = client.db("Final_Project");
  const { email, givenName, lastName } = req.body;

  try {
    await client.connect();
    const update = await db
      .collection("Users")
      .updateOne({ email }, { $set: { givenName, lastName } });
    if (update.modifiedCount) {
      res.status(200).json({ status: 200 });
    }
  } catch (err) {
    console.log(err.stack);
  } finally {
    await client.close();
  }
};

module.exports = { checkForUser, addUser, addName };
