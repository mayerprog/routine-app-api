const express = require("express");
const { User, Task, Image } = require("../schemas/users");
const { upload } = require("../middlewares/uploadMiddleware");
const fs = require("fs");
const path = require("path");

const { taskQueue } = require("../index");
const { sendNotification } = require("../services/notificationHelpers");
const moment = require("moment-timezone");

const { scheduleNotification } = require("../services/scheduleNotification");
const saveImages = require("../services/imageHandler");

const router = express.Router();

module.exports = router;

// CREATE TASK
router.post("/createTask", upload.array("image", 10), async (req, res) => {
  // console.log("files", req.files);
  // console.log("body", req.body);
  let linksArray = [];
  let dateToDB;

  const dateObj = JSON.parse(req.body.date);
  const { date: dateString, timeZone: localTimeZone } = dateObj;
  const files = req.files;

  let imageNames, savedImages;

  if (files && files.length > 0) {
    try {
      const result = await saveImages(files);
      imageNames = result.imageNames;
      savedImages = result.savedImages;
    } catch (error) {
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
    specificDate: dateToDB,
  });

  const user = await User.findOne({ _id: req.user._id });
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  try {
    const newTask = await task.save();

    // await Task.deleteMany({});

    user.tasks.push(newTask);

    await user.save();

    await scheduleNotification(dateToDB, user, newTask);

    res.status(201).json(newTask);
  } catch (err) {
    imageNames.forEach(async (name) => {
      fs.unlink(`uploads/${name}`, (err) => {
        if (err) {
          console.error("Error deleting file:", err);
          return;
        }
      });
    });
    console.error("Error in task creation:", err);
    return res.status(500).json({ message: "Internal Server Error" });
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
router.put("/updateTask/:id", upload.array("image", 10), async (req, res) => {
  let savedImages, imageNames;
  const imagesForDelete = JSON.parse(req.body.imagesForDelete);
  const taskID = req.params.id;
  const updateTask = JSON.parse(req.body.updatedTask);
  const files = req.files;

  console.log("files", files);

  if (files && files.length > 0) {
    try {
      const result = await saveImages(files);
      imageNames = result.imageNames;
      savedImages = result.savedImages;
      // updateTask.images.push(...savedImages);
      updateTask.images = updateTask.images.concat(result.savedImages);
    } catch (error) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  try {
    const updatedUser = await User.findOneAndUpdate(
      { _id: req.user._id, "tasks._id": taskID }, //finds user and task
      { $set: { "tasks.$": updateTask } }, // put updated task
      { new: true }
    );
    imagesForDelete.forEach(async (name) => {
      fs.unlink(`uploads/${name}`, (err) => {
        if (err) {
          console.error("Error deleting file:", err);
          return;
        }
      });
    });

    console.log("imageNames", imageNames);

    res.json(updatedUser);
  } catch (err) {
    imageNames.forEach(async (name) => {
      fs.unlink(`uploads/${name}`, (err) => {
        if (err) {
          console.error("Error deleting file:", err);
          return;
        }
      });
    });

    console.log("Error in task update:", err);
    res.status(400).json({ message: err.message });
  }
});

//DELETE CERTAIN TASK + ITS FILES FROM FOLDER
router.delete("/deleteOne/:id", async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.user._id });
    const taskID = req.params.id;
    // console.log("deletTaskId", taskID);
    user.tasks.forEach(async (task) => {
      if (task._id == taskID) {
        await Task.findByIdAndRemove(taskID);
        task.images.forEach(async (image) => {
          await Image.findByIdAndRemove(image._id);
          imageName = image.name;
          fs.unlink(`uploads/${imageName}`, (err) => {
            if (err) {
              console.error("Error deleting file:", err);
              return;
            }
          });
        });
      }
      return;
    });

    const updatedUser = await User.findOneAndUpdate(
      { _id: req.user._id }, //finds user and task
      { $pull: { tasks: { _id: taskID } } } // deletes certain task
    );

    const job = await taskQueue.getJob(taskID);
    await job?.remove();

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
