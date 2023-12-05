const cron = require("node-cron");
const { Task, User } = require("../schemas/users");
const { Expo } = require("expo-server-sdk");

let expo = new Expo();

// const shouldSendNotification = (task) => {
//   const today = new Date();
//   const dayOfWeek = today.getDay(); // Sunday - 0, Monday - 1, ..., Saturday - 6

//   switch (task.notificationDate) {
//     case "Every day":
//       return true;
//     case "Every weekday":
//       return dayOfWeek >= 1 && dayOfWeek <= 5; // Monday to Friday
//     case "Every weekend":
//       return dayOfWeek === 0 || dayOfWeek === 6; // Saturday or Sunday
//     default:
//       return false;
//   }
// };

async function sendNotification(userID, taskTitle) {
  let messages = [];
  let receiptIds = [];
  // console.log("user ID", userID);

  const user = await User.findOne({ _id: userID });

  if (!user.expoPushToken || !Expo.isExpoPushToken(user.expoPushToken)) {
    console.error(`Invalid or missing push token for user ${user._id}`);
    return;
  }

  messages.push({
    to: user.expoPushToken,
    sound: "default",
    body: taskTitle,
    title: "You have a task to complete!",
  });

  let chunks = expo.chunkPushNotifications(messages);

  for (let chunk of chunks) {
    try {
      let ticketChunk = await expo.sendPushNotificationsAsync(chunk);
      ticketChunk.forEach((ticket) => {
        if (ticket.id) {
          receiptIds.push(ticket.id);
        }
      });
    } catch (error) {
      console.error(error);
    }
  }

  let receiptIdChunks = expo.chunkPushNotificationReceiptIds(receiptIds);
  for (let chunk of receiptIdChunks) {
    try {
      let receipts = await expo.getPushNotificationReceiptsAsync(chunk);
      for (let receiptId in receipts) {
        let receipt = receipts[receiptId];
        if (receipt.status === "error") {
          await handleReceiptError(receipt, userID);
        }
      }
    } catch (error) {
      console.error(`Error fetching receipts: ${error}`);
    }
  }
}

async function handleReceiptError(receipt, userID) {
  const { message, details } = receipt;
  if (details && details.error) {
    switch (details.error) {
      case "DeviceNotRegistered":
        // Handle the unregistered device
        await User.findOneAndUpdate(
          { _id: userID },
          { expoPushToken: "" },
          { new: true }
        );
        break;
    }
  } else {
    console.error(`Unknown receipt error: ${message}`);
  }
}

module.exports = { sendNotification };
