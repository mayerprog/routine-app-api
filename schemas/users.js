const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");
const findOrCreate = require("mongoose-findorcreate");

const link = new mongoose.Schema({
  name: String,
  link: String,
  id: Number,
});

const task = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: String,
  links: [link],
  date: String,
  // photo: String,
  // media: String,
  // document: String
  // date: Date // unnecesarry so far
});

const user = new mongoose.Schema({
  username: String,
  password: String,
  fullname: String,
  birthdate: String,
  googleId: String,
  tasks: [task],
});

user.plugin(passportLocalMongoose); //to hash and salt passwords and to save our users to our mongoDB database
user.plugin(findOrCreate);

const userSchema = mongoose.model("user", user);
const taskSchema = mongoose.model("task", task);
const linkSchema = mongoose.model("link", link);

module.exports = { User: userSchema, Task: taskSchema, Link: linkSchema };
