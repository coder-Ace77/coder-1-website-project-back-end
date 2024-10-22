const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const session = require("express-session");
const cors = require("cors");
const MongoDBStore = require("connect-mongodb-session")(session);
require('dotenv').config();

const port = process.env.PORT || 5000;
const dbUrl = process.env.DATABASE_URL;

const tags = require("./support/tags.js");
const { loginController, logOutController, checkLoginController } = require("./controllers/login.js");
const { SignInController } = require("./controllers/signIn.js");
const { questions } = require("./models/question");
const { constrainedMemory } = require("process");

const app = express();
console.log("HI");
app.use(express.json());
const store = new MongoDBStore({
  uri: dbUrl,
  collection: "sessions",
});


app.use(
  session({
    secret: "yourSecretKey",
    resave: false,
    saveUninitialized: false,
    store: store,
    cookie: {
      sameSite:'lax',
      maxAge: 1000 * 60 * 60 * 24 * 7,
    },
  })
);

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

store.on("error", function (error) {
  console.log(error);
});

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "Public")));

app.use((req, res, next) => {
  next();
});

const controllers = {};
controllers.addquestion = require("./controllers/addQuestion.js").addquestion;
controllers.questionRenderController =
  require("./controllers/question_render.js").questionRenderController;
controllers.quesSubmitController =
  require("./controllers/judge.js").quesSubmitController;
controllers.customJudge =
  require("./controllers/testCaseRunner.js").customJudge;
controllers.checkLoginController = require("./controllers/login.js").checkLoginController;
controllers.getSubmissionsController = require("./controllers/getSubmissions.js").getSubmissionsController;
controllers.submissionViewController = require("./controllers/getSubmissions.js").submissionViewController;
controllers.getTaggedDataController = require("./controllers/getTaggedData.js").getTaggedDataController;

app.post("/addquestion", controllers.addquestion);
app.use("/submissions/:ques?", controllers.getSubmissionsController);
app.use("/submission/view/:id", controllers.submissionViewController);
app.use("/submit", controllers.quesSubmitController);
app.use("/ques/:quesname", controllers.questionRenderController);
app.use("/testcase", controllers.customJudge);
app.use("/tagdata", controllers.getTaggedDataController);
app.post("/signin", SignInController);
app.post("/login", loginController);
app.use("/logout", logOutController);
app.get("/checklogin",checkLoginController);
app.get("/gettaglist", (req, res) => {
  res.json({tags: tags});
});
  


app.get("/questionlist", async (req, res) => {
  try {
    const result = (await questions.find({}, { name: 1, tags: 1, _id: 0 })).reverse();
    res.json(result);
  }catch (error){
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});


app.get("/", (req, res) => {
  console.log("API hit");
  res.json({msg:"Hi there"});
});


mongoose
  .connect(dbUrl)
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(port,() => {
      console.log(`Server is running on port ${port}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });
