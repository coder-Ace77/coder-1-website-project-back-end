const express = require('express');
const path = require('path');
const body1 = require('body-parser');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const cp = require('child_process');
const mongoose = require('mongoose');
const session = require('express-session');
const mongosession = require('connect-mongodb-session')(session);
const Schema = mongoose.Schema;
const app = express();
const cors = require('cors');

// const { loginController, logOutController } = require('./controllers/login.js');
// const { SignInController } = require('./controllers/signIn.js');
const { addQuesPostController } = require('./controllers/addQuestion.js');
const bodyParser = require('body-parser');
const { questionRenderController } = require('./controllers/question_render.js');
const { quesSubmitController } = require('./controllers/judge.js');
// const { makeConnection } = require('./controllers/socketController.js');

// const Contest = new Schema({
//     ID1: String,
//     ID2: String,
//     q1: String,
//     q2: String,
//     q3: String,
//     time: String,
//     q1_status: String,
//     q2_status: String,
//     q3_status: String,
// });

app.use(bodyParser.json());
// const contest = mongoose.model('contest', Contest);

app.use(express.static(path.join(__dirname, 'Public')));
// app.use(session({ secret: "Key", resave: false, saveUninitialized: false }));
// app.use(multer({ storage: fileStorage }).single('codefile'));
// app.use(cors());
// app.use()

// app.use('/my_contest', (req, res) => {
//     contest.find({ id1: req.session.user.user } || { id2: req.session.user.user }).then(result => {
//         console.log(result);
//         for (let i = 0; i < result.length; i++) {
//             const co_date = new Date(result[i].time);
//             const hour = (Date.now() - co_date) / (1000 * 60 * 60);
//             console.log(hour);
//             if (hour >= 24) {
//                 contest.findByIdAndDelete(result[i]._id).then(ans => {
//                     console.log("deleted");
//                 });
//             }
//             result[i]._id = String(result[i]._id);
//         }
//         res.render('mycontest.pug', { user: req.session.user, arr: result });
//     })
// })


app.post('/postques', addQuesPostController);
app.use('/subques', quesSubmitController);
app.use('/ques/:quesname', questionRenderController);

// app.use('/signin', SignInController);

// app.post('/login', loginController);

// app.use('/logout', logOutController);

app.use('/', (req, res) => {
    const filePath = path.join('public', 'build', 'index.html');
    const absolutePath = path.resolve(__dirname, filePath);
    res.sendFile(absolutePath);
});

mongoose.connect('mongodb+srv://Mohd_Adil:Mishrapur@onlineide.5fsk0pr.mongodb.net/ide').then(result => {
    console.log("Connected");
    const server = app.listen(3000);
    // makeConnection(server);
})
