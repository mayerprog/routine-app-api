const express = require("express");
const passport = require("passport");
const { User } = require("../schemas/users");

const router = express.Router();

module.exports = router;

router.get("/isauth", (req, res) => {
  if (req.isAuthenticated()) {
    res.status(200).json(true);
  } else {
    res.status(401).json(false);
  }
});

router.delete("/logout", (req, res, next) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.status(200).json(false);
  });
});

router.post("/login", (req, res) => {
  const newUser = new User({
    username: req.body.username,
    password: req.body.password,
  });
  req.login(newUser, (err, user) => {
    if (err) {
      // res.status(401).json({ message: err.message });
      res.status(401).json(false);
    } else {
      passport.authenticate("local")(req, res, () => {
        // res.status(200).json("Successfully logged in");
        res.status(200).json(true);
      });
    }
  });
});

router.post("/register", (req, res) => {
  User.register(
    { username: req.body.username, fullname: req.body.fullname },
    req.body.password,
    (err, user) => {
      if (err) {
        // res.status(401).json({ message: err.message });
        res.status(401).json(false);
      } else {
        passport.authenticate("local")(req, res, () => {});
        // res.status(200).json("Successfully registered");
        res.status(200).json(true);
      }
    }
  );
});

router.get("/me", async (req, res) => {
  try {
    const userData = {
      id: req.user._id,
      username: req.user.username,
      fullname: req.user.fullname,
    };

    res.status(200).json(userData);
    return userData;
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
