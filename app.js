const express = require("express");
const path = require("path");
const body1 = require("body-parser");
const bcrypt = require("bcryptjs");
const fs = require("fs");
const cp = require("child_process");
const mongoose = require("mongoose");
const session = require("express-session");
const mongosession = require("connect-mongodb-session")(session);
const Schema = mongoose.Schema;
const app = express();
const cors = require("cors");

app.use(cors());

const controllers = {};

const bodyParser = require('body-parser');
const { loginController, logOutController } = require('./controllers/login.js');
const { SignInController } = require('./controllers/signIn.js');
controllers.addquestion=require('./controllers/addQuestion.js').addquestion;
controllers.questionRenderController = require('./controllers/question_render.js').questionRenderController;
controllers.quesSubmitController=require('./controllers/judge.js').quesSubmitController;
controllers.customJudge= require('./controllers/testCaseRunner.js').customJudge;
const { questions } = require('./modals/question');

app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, "Public")));
app.use(session({ secret: "Key", resave: false, saveUninitialized: false }));
app.use(cors());

app.get("/rat", (req, res) => {
    res.json({ rat: "Hello" });
});
app.post('/addquestion', controllers.addquestion);
app.use('/submit', controllers.quesSubmitController);
app.use('/ques/:quesname', controllers.questionRenderController);
app.use('/testcase', controllers.customJudge);

app.post("/signin", SignInController);

app.post("/login", loginController);

app.use('/logout', logOutController);

app.get('/questionlist', async (req, res) => {
    try {
        questions.find().then(
            result => {
                res.json(result);
            }
        );
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.use("/", (req, res) => {
  const filePath = path.join("public", "build", "index.html");
  const absolutePath = path.resolve(__dirname, filePath);
  res.sendFile(absolutePath);
});

mongoose
  .connect(
    "mongodb+srv://Mohd_Adil:Mishrapur@onlineide.5fsk0pr.mongodb.net/ide"
  )
  .then((result) => {
    console.log("Connected");
    const server = app.listen(5000);
})
