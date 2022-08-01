const express = require("express");
const morgan = require("morgan");
// const PORT = 4000;
const PORT = process.env.PORT || 5000;

const cors = require("cors");
const {
  getFeaturedMaps,
  searchOpponent,
  getTopPlayers,
  getGame,
  getGames,
  likeGame,
  addToLikes,
  comment,
  searchMaps,
} = require("./HomepageHandlers");

const {
  getLocations,
  updateUserScore,
  createGame,
  submitGuess,
  nextLocation,
  retrieveMap,
  loadOtherPlayers,
} = require("./gamePlayHandlers");

const { checkForUser, addUser, addName } = require("./UserLoginHandlers");

const {
  AddMapToUser,
  getS3url,
  removeGameFromUser,
  CreateMap,
  deleteGame,
} = require("./MapCreationHandlers");

const { retrieveMaps, getPlayerGames } = require("./ProfileHandlers");
// const bodyParser = require("body-parser");

express()
  .use(morgan("tiny"))
  .use(express.json())
  .use(express.static("public"))
  // .use(bodyParser.json())
  .use(cors())

  .post("/api/users", addUser)
  .post("/api/checkusers", checkForUser)
  .get("/api/getGames", getGames)
  .get("/api/getGame/:_id", getGame)
  .patch("/api/updateUserScore", updateUserScore)
  .get("/api/locations/:_id", getLocations)
  // .get("/RandomLocations/:_id", getRandomLocations)
  .patch("/api/addName", addName)
  .get("/api/featuredMaps", getFeaturedMaps)
  .get("/api/getTopPlayers", getTopPlayers)
  .get("/api/searchOpponent", searchOpponent)
  .patch("/api/getMap/:_id", retrieveMap)
  .patch("/api/getMaps", retrieveMaps)
  .get("/api/loadOtherPlayers/:_id/:player", loadOtherPlayers)
  .post("/api/CreateMap", CreateMap)
  .post("/api/createGame", createGame)
  .patch("/api/submitGuess", submitGuess)
  .patch("/api/nextLocation", nextLocation)
  .delete("/api/deleteGame/:_id", deleteGame)
  .put("/api/addMapToUser", AddMapToUser)
  .put("/api/removeFromUser", removeGameFromUser)
  .put("/api/addLikeToUser/:_id", addToLikes)
  .patch("/api/likeGame/:_id", likeGame)
  .put("/api/comment/:_id", comment)
  .put("/api/getPlayerGames", getPlayerGames)
  .get("/api/s3url", getS3url)
  .get("/api/searchMaps", searchMaps)

  .get("*", (req, res) => {
    res.status(404).json({
      status: 404,
      message: "This is obviously not what you are looking for.",
    });
  })

  .listen(PORT, () => {
    console.log(`listen on PORT ${PORT}`);
  });
