const { user } = require('../modals/user');
const bcrypt = require('bcryptjs');


exports.loginController = (req, res) => {
    const id = req.body.username;
    const pass = req.body.password;
    user.findOne({ username: id }).then(result => {
        if (!result) {
            res.json({ code: 404, message: "user not exist" });
        }
        else {
            bcrypt.compare(pass, result.password).then(value => {
                if (value == true) {
                    req.session.isloggedin = true;
                    req.session.user = result;
                    req.session.save(err => {
                        res.json({ code: 404, message: "successfully loged in." });
                    })

                } else {
                    res.json({ code: 404, message: "Wrong Id or password." });
                }
            })
        }
    })
}

exports.logOutController = (req, res) => {
    req.session.isloggedin = false;
    req.session.user = null;
    req.session.save(err => {
        res.redirect('/');
    })
}
