const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");
const findOrCreate = require("mongoose-findorcreate");

const link = new mongoose.Schema({
  name: String,
  link: String,
  id: Number,
});

const image = new mongoose.Schema({
  name: String,
  data: {
    type: Buffer,
    required: true,
  },
  contentType: { type: String, required: true },
});

const task = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: String,
  links: [link],
  images: [image],
  date: String,
});

const notification = new mongoose.Schema({
  type: String,
  enum: ["daily", "weekly", "specific"],
  specificDates: [Date],
});

const user = new mongoose.Schema({
  username: String,
  password: String,
  fullname: String,
  birthdate: String,
  googleId: String,
  tasks: [task],
  expoPushToken: String,
  notification: [notification],
});

user.plugin(passportLocalMongoose); //to hash and salt passwords and to save our users to our mongoDB database
user.plugin(findOrCreate);

const userSchema = mongoose.model("user", user);
const taskSchema = mongoose.model("task", task);
const linkSchema = mongoose.model("link", link);
const imageSchema = mongoose.model("image", image);

module.exports = {
  User: userSchema,
  Task: taskSchema,
  Link: linkSchema,
  Image: imageSchema,
};
