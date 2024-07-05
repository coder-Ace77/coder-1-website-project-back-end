const { user } = require('../modals/user');
const bcrypt = require('bcryptjs');


exports.loginController = (req, res) => {
    const id = req.body.username;
    const pass = req.body.password;
    user.findOne({ username: id }).then((result) => {
        if (!result) {
            res.json({ code: 404, message: 'User not exist' });
        } else {
            bcrypt.compare(pass, result.password).then((value) => {
                if (value) {
                    console.log('Logged in',result);
                    req.session.isloggedin = true;
                    req.session.user = result;
                    req.session.save((err) => {
                        if (err) {
                            res.json({ code: 500, message: 'Internal server error' });
                        } else {
                            console.log(req.session);
                            res.json({ code: 200, message: 'Successfully logged in.' });
                        }
                    });
                } else {
                    res.json({ code: 404, message: 'Wrong ID or password.' });
                }
            });
        }
    });
};

exports.logOutController = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ code: 500, message: 'Internal server error' });
        }
        res.json({ code: 200, message: 'Successfully logged out' });
    });
};

exports.checkLoginController = (req, res) => {
    if (req.session.isloggedin) {
        res.json({ isLoggedIn: true, username: req.session.user.user });
    } else {
        res.json({ isLoggedIn: false });
    }
};
