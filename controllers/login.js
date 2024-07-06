const { user } = require("../models/user.js");
const bcrypt = require("bcryptjs");

exports.loginController = (req, res) => {
  const id = req.body.username;
  const pass = req.body.password;

  user
    .findOne({ user: id })
    .then((result) => {
      if (!result) {
        return res.json({ code: 404, message: "User not exist" });
      }

      bcrypt
        .compare(pass, result.password)
        .then((isMatch) => {
          if (isMatch) {
            req.session.isLoggedIn = true;
            req.session.user = result;
            req.session.save((err) => {
              if (err) {
                return res.json({
                  code: 500,
                  message: "Internal server error",
                });
              }
              console.log("This is the req session");
              console.log(req.session);
              res.json({ code: 200, message: "Successfully logged in." });
            });
          } else {
            res.json({ code: 404, message: "Wrong ID or password." });
          }
        })
        .catch((err) => {
          res.json({
            code: 500,
            message: "Error comparing passwords",
            error: err,
          });
        });
    })
    .catch((err) => {
      res.json({ code: 500, message: "Error finding user", error: err });
    });
};

exports.logOutController = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res
        .status(500)
        .json({ code: 500, message: "Internal server error" });
    }
    res.json({ code: 200, message: "Successfully logged out" });
  });
};

exports.checkLoginController = (req, res) => {
  if (req.session.isLoggedIn) {
    res.json({ isLoggedIn: true, username: req.session.user.username });
  } else {
    res.json({ isLoggedIn: false });
  }
};
