const cp = require("child_process");
const fs = require("fs");
const path = require("path");

const check = (output, expectedOutput) => {
    output = output.split("\n");
    expectedOutput = expectedOutput.split("\n");
    for (let i = 0; i < expectedOutput.length; i++) {
        if (output[i].trim() !== expectedOutput[i].trim()) {
            return false;
        }
    }
    for (let i = expectedOutput.length; i < output.length; i++) {
        if (output[i].trim() !== "") return false;
    }
    return true;
};

const runTestCase = (outfile, input, expectedOutput, timeLimit) => {
    return new Promise((resolve, reject) => {
        if (!fs.existsSync(outfile)) {
            reject(new Error("File not found"));
        }
        const runCommand = `python3 ${outfile}`;
        const child = cp.spawn(runCommand, { stdio: ["pipe", "pipe", "pipe"], shell: true });
        let output = "";
        let timeout;
        let startTime = Date.now();

        child.stdout.on("data", (data) => {
            output += data.toString();
        });

        child.on("error", (err) => {
            reject(new Error("Child process error"));
        });

        child.on("exit", (code) => {
            clearTimeout(timeout);
            const totalTime = (Date.now() - startTime) / 1000; // Convert to seconds
            if (code !== 0) {
                reject(new Error("Runtime error"));
            } else {
                if (check(output, expectedOutput)) {
                    resolve({ status: "Test case passed", totalTime });
                } else {
                    reject(new Error("Wrong answer"));
                }
            }
        });

        timeout = setTimeout(() => {
            child.kill("SIGTERM");
            reject(new Error("Time limit exceeded"));
        }, timeLimit * 1000);

        child.stdin.write(input);
        child.stdin.end();
    });
};

const main = async (code, question, id) => {
    const filename = `${id}.py`;
    const filePath = path.join(__dirname, "../", "codes", filename);
    fs.writeFileSync(filePath, code);

    const testCases = question.testCases;
    const totalCases = testCases.length;
    let passed = 0;

    for (let i = 0; i < testCases.length; i++) {
        const testCase = testCases[i];

        try {
            const result = await runTestCase(
                filePath,
                testCase.input,
                testCase.output,
                question.timeLimit
            );
            if (result.status === 'Test case passed') {
                passed++;
            }
            if (passed >= totalCases) {
                return { status: true, message: `Accepted`, verdict: `${passed}/${totalCases} passed.` };
            }
        } catch (err) {
            let message;
            let verdict;
            
            if (err.message === "Time limit exceeded") {
                message = `TLE`;
                verdict = `Time limit exceeded on test case ${i + 1}`;
            } else if (err.message === "Wrong answer") {
                message = `Wrong ans`;
                verdict = `Wrong answer on test case ${i + 1}`;
            } else {
                message = "Run time error";
                verdict = `Run time error on test case ${i + 1}`;
            }

            return {
                status: false,
                message: message,
                verdict: verdict
            };
        }
    }
};

module.exports = { check, runTestCase, main };
