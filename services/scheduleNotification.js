const { taskQueue } = require("../index");

const scheduleNotification = async (notificationTime, user) => {
  const now = new Date();
  const delay = notificationTime.getTime() - now.getTime(); // Delay in milliseconds
  console.log("delay", delay);
  if (delay < 0) {
    console.error("Cannot schedule a notification in the past");
    return;
  }

  // console.log("taskQueue", taskQueue);
  console.log("expoPushToken", user.expoPushToken);
  try {
    const myJob = await taskQueue.add(
      {
        expoPushToken: user.expoPushToken,
      },
      { delay: delay }
    );
    console.log("myJob", myJob);
  } catch (err) {
    console.error("Error scheduling job:", err);
  }
};

// taskQueue.process(async (job) => {
//   await sendNotification(job.data.user, taskTitle);
// });

module.exports = { scheduleNotification };
