const { User } = require("../schemas/users");

async function removePushToken(user) {
  try {
    const user = await User.findOneAndUpdate(
      { _id: user._id },
      { expoPushToken: "" },
      { new: true }
    );
    console.log(`Removed push token for user ${user._id}`);
  } catch (error) {
    console.error(`Error removing push token for user ${user._id}: ${error}`);
  }
}

module.exports = { removePushToken };
