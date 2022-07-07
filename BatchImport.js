const {MongoClient} = require("mongodb");
require("dotenv").config();
const {MONGO_URI} = process.env;
const {v4: uuidv4} = require("uuid");

const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

const locations = [
  {lat: 48.5245856, lng: -64.2058584},
  {lat: -22.9468822, lng: -43.1982841},
  {lat: 35.2835117, lng: 138.8666567},
  {lat: 37.322816, lng: -113.0400476},
  {lat: 0.6198964, lng: 73.4599683},
  {lat: 62.0218124, lng: -6.7825299},
];

const addLocations = async (req, res) => {
  try {
    const _id = "test";

    const client = new MongoClient(MONGO_URI, options);
    await client.connect();
    const db = client.db("Final_Project");
    const result = await db
      .collection("Game_Modes")
      .insertOne({_id, locations});

    console.log(result);
  } catch (err) {
    console.log(err);
  }
};

addLocations();
