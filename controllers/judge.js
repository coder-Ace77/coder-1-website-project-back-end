const { questions } = require("../models/question");
const { user } = require("../models/user"); 
const cp = require("child_process");
const fs = require("fs");
const path = require("path");

const languageToExtension = (lang) => {
  switch (lang) {
    case "C++":
      return "cpp";
    case "C":
      return "c";
    case "Python":
      return "py";
    default:
      return "cpp";
  }
};

exports.quesSubmitController = async (req, res) => {
  username = req.session.user.user;
  const {name, lang, code } = req.body; 
  const filename = `${username}_${name}.${languageToExtension(lang)}`;
  const quesName = name;
  let passed = 0;
  try {
    const result = await questions.findOne({ name: quesName });
    if (!result) {
      return res.json({ status: "Question not found" });
    }

    const inputPath = path.join(__dirname, "../", "codes", filename);
    const outputPath = path.join(
      __dirname,
      "../",
      "compiled_codes",
      filename.split(".")[0]
    );

    fs.writeFileSync(inputPath, code);

    try {
      await compileCode(inputPath, outputPath);
    } catch (compileErr) {
      console.error("Compilation error:", compileErr);
      return res.json({
        status: false,
        message: "Compilation error",
        error: compileErr.message,
      });
    }

    const testCases = result.testCases;

    for (let i = 0; i < testCases.length; i++) {
      const testCase = testCases[i];
      try {
        await runTestCase(
          outputPath,
          testCase.input,
          testCase.output,
          result.timeLimit
        );
        passed++;
      } catch (testErr) {
        if (testErr.message === "TLE") {
          return res.json({
            status: false,
            message: `Time Limit Exceeded on test case ${passed + 1}`,
          });
        }
        console.error("Test case failed:", testErr);
        return res.json({
          status: false,
          message: `Test case ${passed + 1} failed`,
          error: testErr.message,
        });
      }
    }

    if (passed === testCases.length) {
      try {
        await updateUserSolvedQuestions(username, quesName);
        return res.json({
          status: true,
          message: `All ${passed} test cases passed.`,
        });
      } catch (updateErr) {
        return true;
      }
    }

    return res.json({ status: false, message: "Some test cases failed" });
  } catch (error) {
    console.error("Error submitting question:", error);
    return res
      .status(500)
      .json({ status: false, message: "Internal server error" });
  }
};

function compileCode(inputPath, outputPath) {
  return new Promise((resolve, reject) => {
    cp.exec(`g++ "${inputPath}" -o "${outputPath}"`, (err, stdout, stderr) => {
      if (err) {
        reject(new Error(stderr || stdout));
      } else {
        resolve();
      }
    });
  });
}

function runTestCase(outputPath, input, expectedOutput, timeLimit) {
  return new Promise((resolve, reject) => {
    const child = cp.spawn(outputPath, { stdio: ["pipe", "pipe", "pipe"] });

    let output = "";
    let timeout;

    child.stdout.on("data", (data) => {
      output += data.toString();
    });

    child.on("error", (err) => {
      reject(err);
    });

    child.on("exit", (code, signal) => {
      clearTimeout(timeout);
      if (code !== 0) {
        reject(new Error(`Child process exited with code ${code}`));
      } else {
        if (output.trim() === expectedOutput.trim()) {
          resolve();
        } else {
          reject(new Error("Test case failed"));
        }
      }
    });

    timeout = setTimeout(() => {
      child.kill("SIGTERM");
      console.log("Time Limit Exceeded");
      reject(new Error(`TLE`));
    }, timeLimit * 1000);
    child.stdin.write(input);
    child.stdin.end();
  });
}

async function updateUserSolvedQuestions(username, quesName) {
  const userData = await user.findOne({ user: username });
  console.log("User data:", userData);
  if (!userData) {
    throw new Error("User not found");
  }

  if (!userData.solved_ques.includes(quesName)) {
    userData.solved_ques.push(quesName);
  }

  await userData.save();
  req.session.user = userData;
}
