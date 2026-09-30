const express = require('express');
const dotenv = require('dotenv').config();
const mongoose = require("mongoose");
const cors = require("cors");
const dns = require("dns");
const connectDB = require('./database/connectDB');

dns.setServers(["8.8.8.8", "8.8.4.4"]);
const app = express();

app.use(express.json());
app.use(cors());

const UserRouter = require("./routers/user.routes");
app.use("/api/v1", UserRouter);

mongoose.connect(process.env.DB_URI)
  .then(() => {
    console.log("DB connected successfully");
  })
  .catch((err) => {
    console.log("Cannot connect to DB", err);
  });

let PORT = process.env.PORT;
app.listen(PORT, (err) => {
  if (err) {
    console.error('Cannot start the server:', err);
  } else {
    console.log(`Server started on port ${PORT}`);
  }
});

module.exports= connectDB=async(req, res)=>{
    await connectDB()
    
}
