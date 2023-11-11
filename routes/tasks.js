const express = require("express");
const { User, Task, Image } = require("../schemas/users");
const { upload } = require("../index");

const router = express.Router();

module.exports = router;

// GET IMAGE

// router.get("/images/:name", async (req, res) => {
//   const { imagename } = req.params;
//   const image = await Image.findOne({ name });
//   if (!image) {
//     return res
//       .status(404)
//       .json({ success: false, message: "Image not found." });
//   }
//   res.set("Content-Type", image.contentType);
//   res.send(image.data);
// });

// UPLOAD IMAGE
router.post(
  "/uploadImage",
  upload.single("image"),
  async (req, res) => {
    console.log("file", req.file);
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "No file provided." });
    }
    const image = new Image({
      name: req.file.filename,
      data: req.file.path,
      contentType: req.file.mimetype,
    });
    try {
      await image.save();
    } catch (error) {
      console.log(error);
      return res.status(400).json({ success: false, message: error.message });
    }
    return res.status(201).json({
      success: true,
      message: "Image created successfully.",
      image: image,
    });
  }
  // res.status(200).json({
  //   message: "Image uploaded successfully!",
  //   file: req.file,
  // })
);

// CREATE TASK
router.post("/createTask", async (req, res) => {
  const task = new Task({
    title: req.body.title,
    description: req.body.description,
    images: req.body.images,
    links: req.body.links,
    date: req.body.date,
  });

  const user = await User.findOne({ _id: req.user._id });

  try {
    const newTask = await task.save();

    user.tasks.push(newTask);

    await user.save();

    await Task.deleteMany({});

    res.status(201).json(newTask);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
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
    const updatedUser = await User.findOneAndUpdate(
      { _id: req.user._id, "tasks._id": req.params.id }, //finds user and task
      { $set: { "tasks.$": req.body } }, // updates certain task
      { new: true }
    );
    res.json(updatedUser);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete("/deleteOne/:id", async (req, res) => {
  try {
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
