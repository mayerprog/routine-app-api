const express = require("express");
const passport = require("passport");
const { User } = require("../schemas/users");

const router = express.Router();

module.exports = router;

router.get("/isauth", (req, res) => {
  res.json(req.isAuthenticated());
});

router.post("/logout", async function (req, res, next) {
  // console.log("logout user", req.user);

  try {
    req.logOut(req.user, function (err) {
      if (err) {
        console.log("error", err);
        return next(err);
      }
    });
  } catch (e) {
    console.log(e);
  }
  res.json(req.isAuthenticated());
  console.log("logout called");
});

router.post("/login", passport.authenticate("local"), (req, res) => {
  res.status(200).json(req.isAuthenticated());
});

router.post("/register", (req, res) => {
  User.register(
    {
      username: req.body.username,
      fullname: req.body.fullname,
      birthdate: req.body.birthdate,
    },
    req.body.password,
    (err, user) => {
      if (err) {
        res.status(401).json(err);
      } else {
        passport.authenticate("local")(req, res, () => {
          res.status(200).json(req.isAuthenticated());
        });
      }
    }
  );
});

router.post("/updateToken", async (req, res) => {
  try {
    const updatedToken = req.body.expoPushToken;
    console.log("updatedToken", updatedToken);
    const updatedUser = await User.findOneAndUpdate(
      { _id: req.user._id }, //finds user
      { expoPushToken: req.body.expoPushToken },
      { new: true }
    );
    // console.log(updatedUser.expoPushToken);
    res.status(200).send("Token updated successfully");
  } catch (err) {
    res.status(500).send("Error updating token");
  }
});

// router.post("/login", (req, res) => {
//   const newUser = new User({
//     username: req.body.username,
//     password: req.body.password,
//   });
//   req.login(newUser, (err, user) => {
//     if (err) {
//       res.status(401).json(err);
//     } else {
//       passport.authenticate("local")(req, res, () => {
//         res.status(200).json(req.isAuthenticated());
//       });
//     }
//   });
// });
