const { questions } = require("../models/question");
const { user } = require("../models/user"); 
const {submissions} = require("../models/submissions");
const cp = require("child_process");
const fs = require("fs");
const path = require("path");

const languageToExtension = (lang) => {
  switch (lang) {
    case "C++":
      return "cpp";
    case "c":
      return "c";
    case "python":
      return "py";
    case "javascript":
      return "js";
    default:
      return "cpp";
  }
};

const compileCode = (inputPath, outputPath, lang) => {
  return new Promise((resolve, reject) => {
    let compileCommand;
    switch (lang) {
      case 'C++':
        compileCommand = `g++ "${inputPath}" -o "${outputPath}"`;
        break;
      case 'C':
        compileCommand = `gcc "${inputPath}" -o "${outputPath}"`;
        break;
      case 'Python':
      case 'Javascript':
        resolve();
        return;
      default:
        compileCommand = `g++ "${inputPath}" -o "${outputPath}"`;
    }
    
    if (compileCommand) {
      cp.exec(compileCommand, (err, stdout, stderr) => {
        if (err) {
          reject(new Error(stderr || stdout));
        } else {
          resolve();
        }
      });
    }
  });
};

const runTestCase = (inputPath, outputPath, input, expectedOutput, timeLimit, lang) => {
  return new Promise((resolve, reject) => {
    let runCommand;
    if (lang === 'Python') {
      runCommand = `python3 "${inputPath}"`;
    } else if (lang === 'Javascript') {
      runCommand = `node "${inputPath}"`;
    } else {
      runCommand = outputPath;
    }

    const child = cp.spawn(runCommand, { stdio: ["pipe", "pipe", "pipe"], shell: true });

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
        if (output.trim() === expectedOutput.trim()){
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
};

exports.quesSubmitController = async (req, res) => {
  username = req.session.user.user;
  const { name, lang, code } = req.body;
  const filename = `${username}_${name}.${languageToExtension(lang)}`;
  const quesName = name;
  console.log("Req get", req.body);

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
      await compileCode(inputPath, outputPath, lang);
    } catch (compileErr) {
      console.error("Compilation error:", compileErr);
      await saveSubmission(username, name, "Compilation error", code);
      return res.json({
        status: false,
        message: "Compilation error",
        error: compileErr.message,
      });
    }

    const testCases = result.testCases;
    let allPassed = true;

    for (let i = 0; i < testCases.length; i++) {
      const testCase = testCases[i];
      try {
        await runTestCase(
          inputPath,
          outputPath,
          testCase.input,
          testCase.output,
          result.timeLimit,
          lang
        );
      } catch (testErr) {
        allPassed = false;
        let message;
        if (testErr.message === "TLE") {
          message = `Time Limit Exceeded on test case ${i + 1}`;
        } else {
          message = `Test case ${i + 1} failed`;
        }
        console.error(message, testErr);
        await saveSubmission(username, name, message, code);
        return res.json({
          status: false,
          message: message,
          error: testErr.message,
        });
      }
    }

    if (allPassed) {
      try {
        await updateUserSolvedQuestions(username, quesName);
        console.log("User solved questions updated");
        await saveSubmission(username, name, "All test cases passed", code);
        return res.json({
          status: true,
          message: `All test cases passed.`,
        });
      } catch (updateErr) {
        await saveSubmission(username, name, "Internal server error during update", code);
        return res.status(500).json({ status: false, message: "Internal server error" });
      }
    } else {
      return res.json({ status: false, message: "Some test cases failed" });
    }
  } catch (error) {
    console.error("Error submitting question:", error);
    await saveSubmission(username, name, "Internal server error", code);
    return res
      .status(500)
      .json({ status: false, message: "Internal server error" });
  }
};

async function updateUserSolvedQuestions(username, quesName) {
  const userData = await user.findOne({ user: username });
  console.log("User data:", userData);
  if (!userData){
    throw new Error("User not found");
  }
  if (!userData.solved_ques.includes(quesName)) {
    userData.solved_ques.push(quesName);
  }
  await userData.save();
}

async function saveSubmission(username, name, status, code) {
  const sub = new submissions({
    user: username,
    name: name,
    status: status,
    code: code
  });
  await sub.save();
  console.log("Saved submission");
}

