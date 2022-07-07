// const {randomBytes} = require("crypto");

const AWS = require("aws-sdk");
const {v4} = require("uuid");
const {promisify} = require("util");
require("dotenv").config();
const crypto = require("crypto");
const randomBytes = promisify(crypto.randomBytes);

const region = "us-east-2";
const bucketName = "google-maps-bucket";
const accessKeyId = process.env.AWS_ACCESS_KEY;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

const s3 = new AWS.S3({
  region,
  accessKeyId,
  secretAccessKey,
  signatureVersion: "v4",
});

const generateUploadURL = async () => {
  const rawBytes = await randomBytes(16);
  const imageName = rawBytes.toString("hex");

  const params = {
    Bucket: bucketName,
    Key: imageName,
    Expires: 60,
  };

  const uploadURL = await s3.getSignedUrlPromise("putObject", params);
  return uploadURL;
};

module.exports = {generateUploadURL};
