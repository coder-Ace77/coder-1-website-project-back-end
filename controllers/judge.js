const { questions } = require("../models/question");
const { user } = require("../models/user");
const { submissions } = require("../models/submissions");
const cp = require("child_process");
const fs = require("fs");
const path = require("path");
const runners = {}
runners.cpp = require("../judges/cpp").main;
runners.python = require("../judges/python").main;

let ID = 1000;

const languageToExtension = (lang) => {
    switch (lang) {
        case "cpp":
            return "cpp";
        case "python":
            return "py";
        default:
            return "cpp";
    }
};

exports.quesSubmitController = async (req, res) => {
    if (req.session.isLoggedIn === false || req.session.isLoggedIn === undefined) {
        return res.json({ status: false, message: "Not logged in" });
    }
    const username = req.session.user.user;
    const { name, lang, code } = req.body;
    const quesName = name;
    ID++;
    const questionData = await questions.findOne({ name: quesName });
    if (!questionData) {
        return res.status(404).json({ message: "Question not found" });
    }

    let status;
    try {
        switch (lang) {
            case "c++":
                status = await runners.cpp(code, questionData, ID);
                break;
            case "python":
                status = await runners.python(code, questionData, ID);
                break;
            default:
                status = await runners.cpp(code, questionData, ID);
        }

        await saveSubmission(username, quesName, status.message, code, status.verdict, status.totalTime);

        await updateSubmissionCount(quesName);
        
        if (status.status) {
            await updateUserSolvedQuestions(username, quesName);
            return res.status(200).json({ status: true, message: status.message });
        } else {
            return res.status(200).json({ status: true, message: status.message });
        }
    } catch (err) {
        await saveSubmission(username, quesName, err.message, code, null, 0);
        return res.json({ status: false, message: err.message });
    }
};

async function updateUserSolvedQuestions(username, quesName) {
    const userData = await user.findOne({ user: username });
    if (!userData) {
        throw new Error("User not found");
    }
    if (!userData.solved_ques.includes(quesName)) {
        userData.solved_ques.push(quesName);
    }
    await userData.save();
}

async function saveSubmission(username, name, status, code, verdict, time_taken) {
    time_taken = time_taken ? `${time_taken}ms` : "0ms"; // Ensure time_taken is a string with ms
    const sub = new submissions({
        user: username,
        name: name,
        status: status,
        code: code,
        message: verdict || "No verdict provided",
        time_taken: time_taken
    });
    await sub.save();
}

async function updateSubmissionCount(quesName) {
    await questions.updateOne(
        { name: quesName },
        { $inc: { submissionCount: 1 }} 
    );
}
