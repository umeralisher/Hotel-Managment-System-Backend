require("dotenv").config();
const mongoose = require("mongoose");
const dBConnect = () => {
  mongoose
    .connect(process.env.MONGO_URL)
    .then(() => {
      console.log(`DB connect ${mongoose.connection.host}`);
    })
    .catch((err) => {
      console.log(`Connection Error! ${err}`);
    });
};
module.exports = dBConnect;
