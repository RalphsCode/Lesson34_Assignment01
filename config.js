/** Common config for message.ly */

// read .env files and make environmental variables

require("dotenv").config();

const DB_URI = (process.env.NODE_ENV === "test")
  ? "postgresql://postgres:2024/messagely_test"
  : "postgresql://postgres:2024@localhost/messagely";
  // postgresql://postgres:Ponderosa@localhost/movies_example

const SECRET_KEY = process.env.SECRET_KEY || "secret";

const BCRYPT_WORK_FACTOR = 2;


module.exports = {
  DB_URI,
  SECRET_KEY,
  BCRYPT_WORK_FACTOR,
};