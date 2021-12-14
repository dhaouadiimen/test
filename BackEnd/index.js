require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const app = express();
const PORT = 4000;
const { mongoUrl } = require("./KeyBD");
var fs = require("fs");
var path = require("path");
const cors = require("cors");
require("./Models/User");


const auth = require("./Routes/auth");
app.use(express.json());
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  })
);
app.use(express.static(`${__dirname}/public`));
app.use(auth);
//  mongoose
mongoose
  .connect(mongoUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("DB is connected");
  })
  .catch((err) => {
    console.log("i found error : " + err);
  });

app.use("/", (req, res) => {
  res.status(200).render("index");
});

app.listen(PORT, () => {
  console.log("server running " + PORT);
});
