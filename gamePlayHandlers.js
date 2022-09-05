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

const getLocations = async (req, res) => {
  const client = new MongoClient(MONGO_URI, options);
  const db = client.db("Final_Project");

  try {
    const { _id } = req.params;

    await client.connect();

    const result = await db.collection("Game_Modes").findOne({ _id });

    const { locations } = result;

    let arr = [];
    while (arr.length < 5) {
      var r = Math.floor(Math.random() * locations.length);
      if (arr.indexOf(r) === -1) arr.push(r);
    }

    const randomLocations = arr.map((num) => {
      return locations[num];
    });

    res.status(200).json({ status: 200, randomLocations, name: result.name });
  } catch (err) {
    res.status(404).json({ status: 404, message: "not found" });
    console.log(err.stack);
  } finally {
    await client.close();
  }
};

const updateUserScore = async (req, res) => {
  const client = new MongoClient(MONGO_URI, options);
  const db = client.db("Final_Project");

  try {
    const { score, _id } = req.body;
    await client.connect();

    await db.collection("Users").updateOne({ _id }, { $inc: { score: score } });

    res.status(200).json({ status: 200, updated: _id });
  } catch (err) {
    console.log(err);
  } finally {
    client.close();
  }
};

const createGame = async (req, res) => {
  const client = new MongoClient(MONGO_URI, options);
  const db = client.db("Final_Project");

  const { locations, player, mode, timeMode, icon, name } = req.body;
  try {
    await client.connect();
    const _id = uuidv4();
    let result = null;

    let newMultiplayerGame = {
      _id,
      type: "multi",
      locations: locations,
      timeMode,
      name,
      players: [
        {
          player: player?.email,
          icon,
          gameData: [],
          guessed: false,
          time: Date.now(),
          name: player?.givenName,
        },
      ],
    };

    if (mode === "multi") {
      result = await db.collection("Games").insertOne(newMultiplayerGame);
    }

    if (mode === "single") {
      result = await db.collection("Games").insertOne({
        _id,
        type: "single",
        guessed: false,
        player,
        locations: locations,
        gameData: [],
        timeMode,
        name,
        time: Date.now(),
      });
    }
    if (player) {
      await db
        .collection("Users")
        .updateOne({ email: player.email }, { $push: { games: _id } });
    }

    res.status(200).json({ status: 200, gameId: _id });

    client.close();
  } catch (err) {
    console.log(err.stack);
  }
};

const submitGuess = async (req, res) => {
  const client = new MongoClient(MONGO_URI, options);
  const db = client.db("Final_Project");

  try {
    const {
      mode,
      _id,
      score,
      distance,
      ans,
      guess,
      zoom,
      center,
      thirdPoint,
      player,
      midpoint,
    } = req.body;

    let result = null;
    await client.connect();

    if (mode === "single") {
      result = await db.collection("Games").updateOne(
        { _id },
        {
          $push: {
            gameData: {
              score,
              distance,
              guess,
              thirdPoint,
              midpoint,
            },
          },
          $set: { guessed: true, time: Date.now() },
        }
      );
    }

    if (mode === "multi") {
      result = await db.collection("Games").updateOne(
        { _id, "players.player": player },
        {
          $push: {
            "players.$.gameData": {
              score,
              distance,
              guess,
              thirdPoint,
              midpoint,
            },
          },
          $set: {
            "players.$.guessed": true,
            "players.$.time": Date.now(),
          },
        }
      );
    }
    res.status(200).json({ status: 200 });
  } catch (err) {
    console.log(err.stack);
  } finally {
    client.close();
  }
};

const nextLocation = async (req, res) => {
  const client = new MongoClient(MONGO_URI, options);
  const db = client.db("Final_Project");

  try {
    const { mode, _id, player } = req.body;
    await client.connect();
    if (mode === "single") {
      await db
        .collection("Games")
        .updateOne({ _id }, { $set: { guessed: false, time: Date.now() } });
    } else if (mode === "multi") {
      await db.collection("Games").updateOne(
        { _id, "players.player": player },
        {
          $set: {
            "players.$.guessed": false,
            "players.$.time": Date.now(),
          },
        }
      );
    }
    res.status(200).json({ status: 200 });
  } catch (err) {
    console.log(err.stack);
  } finally {
    await client.close();
  }
};

const retrieveMap = async (req, res) => {
  const client = new MongoClient(MONGO_URI, options);
  const db = client.db("Final_Project");

  try {
    const { _id } = req.params;
    const { currentUser } = req.body;
    const { email, picture, givenName, lastName } = currentUser
      ? currentUser
      : { email: null, picture: null, givenName: null, lastName: null };

    await client.connect();

    let game = await db.collection("Games").findOne({ _id });

    if (
      game.type === "multi" &&
      !game.players.some((item) => item.player === email)
    ) {
      game.players.push({
        player: email,
        gameData: [],
        guessed: false,
        icon: picture,
        time: Date.now(),
        name: givenName,
      });
      //player

      const addGameToUser = await db
        .collection("Users")
        .updateOne({ email }, { $push: { games: _id } });

      const addUser = await db.collection("Games").updateOne(
        { _id },
        {
          $push: {
            players: {
              player: email,
              gameData: [],
              guessed: false,
              icon: picture,
              name: givenName,
            },
          },
        }
      );
    }
    //uuid
    let guessed = false;
    let locationIndex = 0;
    let points = 0;
    let endGame = false;
    let gameScore = 0;
    let timeMode = null;
    let distance = 0;
    let thirdPoint = null;
    let midpoint = { lat: 0, lng: 0 };
    let guess = null;
    let gameProgress = 0;
    let zoom = 2;
    let currentUserGame = null;
    let otherPlayerData = null;

    if (game.type === "single") {
      gameProgress = game.gameData.length;
      currentUserGame = game;
      endGame = gameProgress >= 5;
      game.gameData.forEach((round) => {
        gameScore += round.score;
      });
      if (game.guessed) {
        guessed = true;
        locationIndex = gameProgress - 1;
        distance = game.gameData[gameProgress - 1].distance;
        points = game.gameData[gameProgress - 1].score;
        guess = game.gameData[gameProgress - 1].guess;
        thirdPoint = game.gameData[gameProgress - 1].thirdPoint;
        midpoint = game.gameData[gameProgress - 1].midpoint;
      } else locationIndex = gameProgress;
    }
    if (game.type === "multi") {
      currentUserGame = game.players.find((item) => item.player === email);
      gameProgress = currentUserGame.gameData.length;
      endGame = gameProgress >= 5;
      otherPlayerData = game.players.filter((user) => {
        return user.player !== email;
      });

      currentUserGame.gameData.forEach((round) => {
        gameScore += round.score;
      });
      if (currentUserGame.guessed) {
        guessed = true;
        points = currentUserGame.gameData[gameProgress - 1].score;
        locationIndex = gameProgress - 1;
        distance = currentUserGame.gameData[gameProgress - 1].distance;
        thirdPoint = currentUserGame.gameData[gameProgress - 1].thirdPoint;
        guess = currentUserGame.gameData[gameProgress - 1].guess;
        midpoint = currentUserGame.gameData[gameProgress - 1].midpoint;
      } else locationIndex = gameProgress;
    }

    if (guessed) {
      if (distance > 3000000) {
        zoom = 1;
      } else if (distance > 1000000 && (guess.lat > 58 || guess.lat < -58)) {
        zoom = 2;
      } else if (distance > 1750000) {
        zoom = 2;
      } else if (distance > 1000000) {
        zoom = 3;
      } else if (distance > 500000) {
        zoom = 4;
      } else if (distance > 200000) {
        zoom = 5;
      } else if (distance > 100000) {
        zoom = 6;
      } else if (distance > 50000) {
        zoom = 7;
      } else if (distance > 20000) {
        zoom = 8;
      } else if (distance > 5000) {
        zoom = 9;
      } else if (distance > 1000) {
        zoom = 10;
      } else {
        zoom = 11;
      }
    }

    res.status(200).json({
      status: 200,
      data: {
        locationIndex,
        playerMode: game.type,
        locations: game.locations,
        guessed,
        points,
        endGame,
        gameScore,
        timeMode: game.timeMode,
        points,
        distance,
        thirdPoint,
        guess,
        zoom,
        midpoint: midpoint,
        otherPlayerData,
        myGameData: currentUserGame.gameData ? currentUserGame.gameData : [],
      },
    });
  } catch (err) {
    console.log(err.stack);
  } finally {
    await client.close();
  }
};

const loadOtherPlayers = async (req, res) => {
  const client = new MongoClient(MONGO_URI, options);
  const db = client.db("Final_Project");

  try {
    const { _id, player } = req.params;

    await client.connect();

    let gameInfo = await db.collection("Games").findOne({ _id });
    let data = gameInfo
      ? gameInfo.players.filter((user) => {
          return user.player !== player;
        })
      : null;
    if (!data.length) {
      data = null;
    }

    res.status(200).json({ status: 200, data });
  } catch (err) {
    console.log(err.stack);
  } finally {
    await client.close();
  }
};

module.exports = {
  getLocations,
  updateUserScore,
  createGame,
  submitGuess,
  nextLocation,
  retrieveMap,
  loadOtherPlayers,
};
