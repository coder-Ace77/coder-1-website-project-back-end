const { user } = require('../modals/user.js');
const bcrypt = require('bcryptjs');

exports.SignInController = (req, res) => {
    if (validator(req.body) == false)
        res.json({ code: 300, message: "Something wrong" });

    user.findOne({ user: req.body.username }).then((result) => {
        if (result != null) {
            res.json({ code: 301, message: "User already exists" });
        }else{
            bcrypt.hash(req.body.password, 12).then((hashed) => {
                const new_user = new user({
                    user: req.body.username,
                    password: hashed,
                    name: req.body.name,
                    email: req.body.email,
                    institute: req.body.institute,
                    rating: 0,
                    rank: 0,
                    solved_ques: [],
                    todo: [],
                    contests: [],
                    dailyLog: [],
                    image: "",
                    contributions: []
                })
                new_user.save();
                req.session.isLoggedIn = true;
                req.session.user = req.body;
                req.session.save(err => {
                    res.json({ code: 350, message: "Created" });
                });
            });

        }
    });
    
}
const validator = (userOb) => {
    if (userOb == null || userOb == undefined || userOb.password == null || userOb.password == undefined) {
        return false;
    }
    return true;
}
