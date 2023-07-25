require("dotenv").config();
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const { User } = require("./schemas/users");
const session = require("express-session");
const passport = require("passport");

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static("public"));

app.use(
  session({
    //initialized session
    secret: "our little secret",
    resave: false,
    saveUninitialized: false,
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

const usersRouter = require("./routes/users");
const tasksRouter = require("./routes/tasks");

app.use("/users", usersRouter);
app.use("/tasks", tasksRouter);

app.listen(3000, () => console.log("Server Started"));
