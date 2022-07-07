const { MongoClient } = require("mongodb");
require("dotenv").config({ path: "./.env" });
const { MONGO_URI } = process.env;
const { v4: uuidv4 } = require("uuid");

const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

const users = [
  {
    email: "slhjsn@jn",
    givenName: "John",
    lastName: "Smith",
    picture: "https://unsplash.com/images/animals/kitten",
    score: 3500,
    games: [],
    likes: [],
    comments: [],
  },
  {
    email: "slaaak@jn",
    givenName: "Geoff",
    lastName: "Michaels",
    score: 4000,
    picture:
      "https://images.pexels.com/photos/210243/pexels-photo-210243.jpeg?cs=srgb&dl=pexels-pixabay-210243.jpg&fm=jpg",
  },
  // {
  //   email: "ksdnksj@n",
  //   givenName: "Bob",
  //   lastName: "Jones",
  //   picture:
  //     "https://cdn.pixabay.com/photo/2013/07/13/10/07/man-156584_960_720.png",
  // },
  // {
  //   givenName: "Horatio",
  //   lastName: "Gutierrez",
  //   picture:
  //     "https://cdn.pixabay.com/photo/2016/08/20/05/38/avatar-1606916_960_720.png",
  //   score: 1800,
  // },
  // {
  //   givenName: "Bartholemew",
  //   lastName: "McChristiansen",
  //   score: 550,
  //   picture:
  //     "https://cdn.vox-cdn.com/thumbor/WkwPB916XqeN2jj_gK0aCEPW_RA=/0x0:1400x1050/920x613/filters:focal(662x361:886x585):format(webp)/cdn.vox-cdn.com/uploads/chorus_image/image/67194273/avatar_the_last_airbender_image.0.jpeg",
  // },
  // {
  //   givenName: "Marty",
  //   lastName: "McFly",
  //   score: 7500,
  //   pic: "https://www.kindpng.com/picc/m/136-1369892_avatar-people-person-business-user-man-character-avatar.png",
  // },
];

const addUsers = async (req, res) => {
  try {
    const client = new MongoClient(MONGO_URI, options);
    await client.connect();
    const db = client.db("Final_Project");
    const result = await db.collection("Users").insertMany(users);

    console.log(result);
  } catch (err) {
    console.log(err);
  }
  client.close();
};

addUsers();
