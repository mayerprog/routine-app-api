require("dotenv").config();
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const { User } = require("./schemas/users");
const session = require("express-session");
const passport = require("passport");
const path = require("path");
const Queue = require("bull");
const { sendNotification } = require("./services/notificationHelpers");

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

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

const uploadDir = path.join(__dirname, "uploads");
app.use("/uploads", express.static(uploadDir));
//app.use(express.static("public"));

const taskQueue = new Queue("My Queue");
taskQueue.process(async (job) => {
  try {
    console.log("expoPushToken", job.data.expoPushToken);
    await sendNotification(job.data.expoPushToken);
  } catch (err) {
    console.log(err);
  }
});
taskQueue.on("completed", (job, result) => {
  console.log(`Job completed with result ${result}`);
});

module.exports = { uploadDir, taskQueue };

const usersRouter = require("./routes/users");
const tasksRouter = require("./routes/tasks");

app.use("/users", usersRouter);
app.use("/tasks", tasksRouter);

app.listen(3000, () => console.log("Server Started"));
