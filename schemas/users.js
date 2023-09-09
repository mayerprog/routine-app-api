const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");
const findOrCreate = require("mongoose-findorcreate");

const task = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: String,
  media: String,
  link: String,
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

module.exports = { User: userSchema, Task: taskSchema };
