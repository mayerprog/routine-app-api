const express = require("express");
const passport = require("passport");
const { User } = require("../schemas/users");

const router = express.Router();

module.exports = router;

// router.get("/home", (req, res) => {
//   req.isAuthenticated()
//     ? res.status(200).json("We are home")
//     : res.status(401).json( { message: err.message } );
// });

router.get("/logout", (req, res, next) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.status(200).json("Successfully logged out")
  });
});

router.post("/login", (req, res) => {
  const newUser = new User({
    username: req.body.username,
    password: req.body.password,
  });
  req.login(newUser, (err, user) => {
    if (err) {
      res.status(401).json( { message: err.message } );
    } else {
      passport.authenticate("local")(req, res, () => {
        res.status(200).json("Successfully logged in")
      });
    }
  });
});

router.post("/register", (req, res) => {
  User.register(
    { username: req.body.username },
    req.body.password,
    (err, user) => {
      if (err) {
        res.status(401).json( { message: err.message } );
      } else {
        passport.authenticate("local")(req, res, () => {});
        res.status(200).json("Successfully registered")
      }
    }
  );
});
