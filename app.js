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

const { loginController, logOutController } = require('./controllers/login.js');
const { SignInController } = require('./controllers/signIn.js');
const { addQuesPostController } = require('./controllers/addQuestion.js');
const bodyParser = require('body-parser');
const { questionRenderController } = require('./controllers/question_render.js');
const { quesSubmitController } = require('./controllers/judge.js');
// const { makeConnection } = require('./controllers/socketController.js');

app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, 'Public')));
app.use(session({ secret: "Key", resave: false, saveUninitialized: false }));
// app.use(cors());

app.get("/rat", (req, res) => {
    res.json({ rat: "Hello" });
})

app.post('/postques', addQuesPostController);
app.use('/subques', quesSubmitController);
app.use('/ques/:quesname', questionRenderController);

app.post('/signin', SignInController);

app.post('/login', loginController);

app.use('/logout', logOutController);

app.use('/', (req, res) => {
    const filePath = path.join('public', 'build', 'index.html');
    const absolutePath = path.resolve(__dirname, filePath);
    res.sendFile(absolutePath);
});

mongoose.connect('mongodb+srv://Mohd_Adil:Mishrapur@onlineide.5fsk0pr.mongodb.net/ide').then(result => {
    console.log("Connected");
    const server = app.listen(5000);
    // makeConnection(server);
})
