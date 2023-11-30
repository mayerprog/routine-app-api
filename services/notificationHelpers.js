const cron = require("node-cron");
const { Task, User } = require("../schemas/users");
const { Expo } = require("expo-server-sdk");

let expo = new Expo();

// cron.schedule("0 0 * * *", async () => {
//   // This runs at midnight every day
//   const tasks = await Task.find({});
//   tasks.forEach((task) => {
//     if (shouldSendNotification(task)) {
//       sendNotification(task);
//     }
//   });
// });

const shouldSendNotification = (task) => {
  const today = new Date();
  const dayOfWeek = today.getDay(); // Sunday - 0, Monday - 1, ..., Saturday - 6

  switch (task.notificationDate) {
    case "Every day":
      return true;
    case "Every weekday":
      return dayOfWeek >= 1 && dayOfWeek <= 5; // Monday to Friday
    case "Every weekend":
      return dayOfWeek === 0 || dayOfWeek === 6; // Saturday or Sunday
    default:
      return false;
  }
};

async function sendNotification(user) {
  let messages = [];
  // Fetch user's push token
  //   const user = await User.findById(task.userId);

  if (!Expo.isExpoPushToken(user.expoPushToken)) {
    console.error(
      `Push token ${user.expoPushToken} is not a valid Expo push token`
    );
    return;
  }

  messages.push({
    to: user.expoPushToken,
    sound: "default",
    body: "You have a task to complete!", // Customize your message
    // data: { task }, // Send additional data if needed
  });

  let chunks = expo.chunkPushNotifications(messages);
  for (let chunk of chunks) {
    try {
      await expo.sendPushNotificationsAsync(chunk);
    } catch (error) {
      console.error(error);
    }
  }
}

module.exports = { sendNotification };
