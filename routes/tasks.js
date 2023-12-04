const express = require("express");
const { User, Task, Image } = require("../schemas/users");
const { upload } = require("../middlewares/uploadMiddleware");
const fs = require("fs");
const { taskQueue } = require("../index");
const { sendNotification } = require("../services/notificationHelpers");
const moment = require("moment-timezone");

const { scheduleNotification } = require("../services/scheduleNotification");

const router = express.Router();

module.exports = router;

// CREATE TASK
router.post("/createTask", upload.array("image", 10), async (req, res) => {
  // console.log("files", req.files);
  // console.log("body", req.body);
  let linksArray = [];
  let dateToDB;
  let newTaskQueue;

  const dateObj = JSON.parse(req.body.date);
  const { date: dateString, timeZone: localTimeZone } = dateObj;
  const files = req.files;

  let savedImages;
  if (files) {
    const imageSavePromises = files.map(async (file) => {
      const image = new Image({
        name: file.filename,
        data: file.path,
        contentType: file.mimetype,
      });
      return image.save();
    });

    try {
      savedImages = await Promise.all(imageSavePromises);
    } catch (error) {
      console.log(error);
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  if (req.body.links) {
    try {
      linksArray = JSON.parse(req.body.links);
    } catch (error) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid links format" });
    }
  }

  if (req.body.date) {
    try {
      dateToDB = moment
        .tz(dateString, "YYYY-MM-DDTHH:mm", localTimeZone)
        .utc()
        .toDate();

      console.log("date after formatting", dateToDB);
    } catch (error) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid date format" });
    }
  }

  const task = new Task({
    title: req.body.title,
    description: req.body.description,
    images: savedImages,
    links: linksArray,
    // notificationDate: req.body.date,
    specificDate: dateToDB,
  });

  const user = await User.findOne({ _id: req.user._id });
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  try {
    const newTask = await task.save();

    user.tasks.push(newTask);

    await user.save();

    await scheduleNotification(dateToDB, user, task.title);

    await Task.deleteMany({});
    res.status(201).json(newTask);
  } catch (err) {
    console.error("Error in task creation:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
  console.log("expoPushToken", user.expoPushToken);
  // await sendNotification(user.expoPushToken);
});

// GET ALL TASKS
router.get("/getAll", async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.user._id });

    const tasks = user.tasks;

    res.status(200).json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET ONE TASK
router.get("/getOne/:id", (req, res) => {
  const foundTask = req.user.tasks.find((t) => t._id === req.params.id);
  res.status(200).json(foundTask);
});

//UPDATE ELEMENTS IN A TASK
router.put("/updateTask/:id", async (req, res) => {
  try {
    const updateTask = req.body;
    console.log("updateTask", updateTask);
    const updatedUser = await User.findOneAndUpdate(
      { _id: req.user._id, "tasks._id": req.params.id }, //finds user and task
      { $set: { "tasks.$": req.body } }, // put updated task
      { new: true }
    );
    res.json(updatedUser);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

//DELETE CERTAIN TASK + ITS FILES FROM FOLDER
router.delete("/deleteOne/:id", async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.user._id });

    user.tasks.forEach((task) => {
      if (task._id == req.params.id) {
        task.images.forEach((image) => {
          imageName = image.name;
          fs.unlink(`uploads/${imageName}`, (err) => {
            if (err) {
              console.error("Error deleting file:", err);
              return;
            }
            // console.log(`${imageName} was deleted successfully`);
          });
        });
      }
      return;
    });

    const updatedUser = await User.findOneAndUpdate(
      { _id: req.user._id }, //finds user and task
      { $pull: { tasks: { _id: req.params.id } } } // deletes certain task
    );

    res.json({ message: "Task deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete("/deleteAll", async (req, res) => {
  try {
    const updatedUser = await User.findOneAndUpdate(
      { _id: req.user._id },
      { $unset: { tasks: 1 } },
      { new: true }
    );

    res.json({ message: "Tasks deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
