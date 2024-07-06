const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const session = require("express-session");
const cors = require("cors");
const MongoDBStore = require("connect-mongodb-session")(session);
// const cookieParser = require("cookie-parser");

const { loginController, logOutController } = require("./controllers/login.js");
const { SignInController } = require("./controllers/signIn.js");
const { questions } = require("./models/question");

const app = express();
app.use(express.json());
const store = new MongoDBStore({
  uri: "mongodb+srv://Mohd_Adil:Mishrapur@onlineide.5fsk0pr.mongodb.net/ide",
  collection: "sessions",
});
// app.use(cookieParser());

app.use(
  session({
    secret: "yourSecretKey",
    resave: false,
    saveUninitialized: false,
    store: store,
    cookie: {
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
  // console.log("Session data before handling request:", req.session);
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

app.post("/addquestion", controllers.addquestion);
app.use("/submit", controllers.quesSubmitController);
app.use("/ques/:quesname", controllers.questionRenderController);
app.use("/testcase", controllers.customJudge);
app.post("/signin", SignInController);
app.post("/login", loginController);
app.use("/logout", logOutController);

app.get("/checklogin", (req, res) => {
  console.log("req Session: ", req.session);
  console.log("req session ID: ", req.session.id);
  if (req.session.isLoggedIn) {
    res.json({ isLoggedIn: true, username: req.session.user.username });
    // res.json({ isLoggedIn: true });
  } else {
    res.json({ isLoggedIn: false });
  }
});

app.get("/", (req, res) => {
  console.log(req.session);
  console.log(req.session.id);
  console.log("API is working.");
  // if (!req.session.isLoggedIn) {
  //   req.session.isLoggedIn = true;
  // }
  res.send({
    status: true,
    msg: "API is working",
  });
});

app.get("/questionlist", async (req, res) => {
  try {
    const result = await questions.find();
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
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
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(5000, () => {
      console.log("Server is running on port 5000");
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });
