const express = require("express");
const morgan = require("morgan");
// const PORT = 4000;
const PORT = process.env.PORT || 5000;

const cors = require("cors");
const {
  addUser,
  checkForUser,
  getLocations,
  updateUserScore,
  getFeaturedMaps,
  addName,
  searchOpponent,
  retrieveMap,
  loadOtherPlayers,
  getTopPlayers,
  createGame,
  getGame,
  CreateMap,
  AddMapToUser,
  getGames,
  likeGame,
  addToLikes,
  removeGameFromUser,
  deleteGame,
  comment,
  getS3url,
  getPlayerGames,
  submitGuess,
  nextLocation,
  searchMaps,
  retrieveMaps,
} = require("./handlers");

// const {getS3url} = require("./s3");

// const bodyParser = require("body-parser");

express()
  .use(morgan("tiny"))
  .use(express.json())
  .use(express.static("public"))
  // .use(bodyParser.json())
  .use(cors())

  .post("/users", addUser)
  .post("/checkusers", checkForUser)
  .get("/getGames", getGames)
  .get("/getGame/:_id", getGame)
  .patch("/updateUserScore", updateUserScore)
  .get("/locations/:_id", getLocations)
  // .get("/RandomLocations/:_id", getRandomLocations)
  .patch("/addName", addName)
  .get("/featuredMaps", getFeaturedMaps)
  .get("/getTopPlayers", getTopPlayers)
  .get("/searchOpponent", searchOpponent)
  .patch("/getMap/:_id", retrieveMap)
  .patch("/getMaps", retrieveMaps)
  .get("/loadOtherPlayers/:_id/:player", loadOtherPlayers)
  .post("/CreateMap", CreateMap)
  .post("/createGame", createGame)
  .patch("/submitGuess", submitGuess)
  .patch("/nextLocation", nextLocation)
  .delete("/deleteGame/:_id", deleteGame)
  .put("/addMapToUser", AddMapToUser)
  .put("/removeFromUser", removeGameFromUser)
  .put("/addLikeToUser/:_id", addToLikes)
  .patch("/likeGame/:_id", likeGame)
  .put("/comment/:_id", comment)
  .put("/getPlayerGames", getPlayerGames)
  .get("/s3url", getS3url)
  .get("/searchMaps", searchMaps)

  .get("*", (req, res) => {
    res.status(404).json({
      status: 404,
      message: "This is obviously not what you are looking for.",
    });
  })

  .listen(PORT, () => {
    console.log(`listen on PORT${PORT}`);
  });
