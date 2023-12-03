const { User } = require("../schemas/users");

async function removePushToken(user) {
  try {
    await User.findByIdAndUpdate(user._id, { expoPushToken: "" });
    console.log(`Removed push token for user ${user._id}`);
  } catch (error) {
    console.error(`Error removing push token for user ${user._id}: ${error}`);
  }
}

module.exports = { removePushToken };
