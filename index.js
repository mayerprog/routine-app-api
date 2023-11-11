require("dotenv").config();
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const { User } = require("./schemas/users");
const session = require("express-session");
const passport = require("passport");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

const uploadDir = path.join(__dirname, "uploads");

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));

app.use(
  session({
    //initialized session
    secret: "our little secret",
    resave: true,
    saveUninitialized: true,
  })
);
app.use(passport.initialize());
app.use(passport.session()); //for dealing with the session

passport.use(User.createStrategy()); //local strategy to authenticate users using their username and password

passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (user, done) {
  done(null, user);
});

mongoose.connect(process.env.DATABASE_URL);

const db = mongoose.connection;
db.on("error", (error) => console.log(error));
db.once("open", () => console.log("Connected to Database"));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({
  storage: storage,
  limits: { fieldSize: 10 * 1024 * 1024 },
});
module.exports = { upload };

const usersRouter = require("./routes/users");
const tasksRouter = require("./routes/tasks");

app.use("/users", usersRouter);
app.use("/tasks", tasksRouter);

app.listen(3000, () => console.log("Server Started"));
