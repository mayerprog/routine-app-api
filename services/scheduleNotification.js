const { taskQueue } = require("../index");

const scheduleNotification = async (notificationTime, user, task) => {
  if (!task.title) {
    console.error("Task title is undefined");
    return;
  }
  const now = new Date();
  const delay = notificationTime.getTime() - now.getTime(); // Delay in milliseconds
  console.log("delay", delay);
  if (delay < 0) {
    console.error("Cannot schedule a notification in the past");
    return;
  }

  // console.log("taskQueue", taskQueue);
  // console.log("expoPushToken", user.expoPushToken);
  try {
    console.log("taskID", task._id);
    const myJob = await taskQueue.add(
      {
        userID: user._id,
        taskTitle: task.title,
        taskID: task._id,
      },
      { delay: delay, jobId: task._id }
    );
    // console.log("myJob", myJob);
  } catch (err) {
    console.error("Error scheduling job:", err);
  }
};

module.exports = { scheduleNotification };
