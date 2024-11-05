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
            reject({ code: 100, totalTime: 0 }); 
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
            reject({ code: 100, totalTime:(Date.now()-startTime)}); 
        });

        child.on("exit", (code) => {
            clearTimeout(timeout);
            const timeTaken = (Date.now() - startTime);
            if (code !== 0) {
                reject({ code: 300, timeTaken });
            } else {
                if (check(output, expectedOutput)) {
                    resolve({ result: "Test case passed", timeTaken });
                } else {
                    reject({ code: 200, totalTime: timeTaken }); 
                }
            }
        });

        timeout = setTimeout(() => {
            child.kill("SIGTERM");
            reject({ code: 400, totalTime: (Date.now() - startTime)});
        }, timeLimit * 1000*10);

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
    let totalTime = 0;

    for (let i = 0; i < testCases.length; i++) {
        const testCase = testCases[i];

        try {
            const { result, timeTaken} = await runTestCase(
                filePath,
                testCase.input,
                testCase.output,
                question.timeLimit
            );
            totalTime = Math.max(totalTime, timeTaken);
            if (result === "Test case passed") {
                passed++;
            }
            if (passed >= totalCases) {
                return { status: true, message: "Accepted", verdict: `${passed}/${totalCases} passed.`, totalTime };
            }
        } catch (err) {
            let message;
            let verdict;
            totalTime = Math.max(totalTime,err.totalTime);            

            if (err.code === 400) {
                message = "TLE";
                verdict = `Time limit exceeded on test case ${i + 1}`;
            } else if (err.code === 200) {
                message = "Wrong ans";
                verdict = `Wrong answer on test case ${i + 1}`;
            } else {
                message = "Run time error";
                verdict = `Run time error on test case ${i + 1}`;
            }

            return {
                status: false,
                message: message,
                verdict: verdict,
                totalTime
            };
        }
    }

    return { status: true, message: "All test cases executed", verdict: `${passed}/${totalCases} passed.`, totalTime };
};

module.exports = { check, runTestCase, main };
