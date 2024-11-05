const cp = require("child_process");
const fs = require("fs");
const path = require("path");
const execPromise = require("util").promisify(cp.exec);

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
}

const runTestCase = (outfile, input, expectedOutput, timeLimit) => {
    return new Promise((resolve, reject) => {
        let runCommand = outfile;
        const child = cp.spawn(runCommand, { stdio: ["pipe", "pipe", "pipe"] });
        let output = "";
        let timeout;
        let startTime = Date.now();

        child.stdout.on("data", (data) => {
            output += data.toString();
        });

        child.on("error", (err) => {
            reject({ code: 100, totalTime: (Date.now() - startTime) / 1000 });
        });
        child.on("exit", (code, signal) => {
            clearTimeout(timeout);
            const timeTaken = (Date.now() - startTime) / 1000; 
            if (code !== 0) {
                reject({ code: 100, totalTime:timeTaken });
            } else {
                if (check(output, expectedOutput)) {
                    resolve({ result: "Test case passed", timeTaken });
                } else {
                    reject({ code: 200, totalTime });
                }
            }
        });

        timeout = setTimeout(() => {
            child.kill("SIGTERM");
            reject({ code: 300, totalTime: (Date.now() - startTime) / 1000 });
        }, timeLimit * 1000);
        child.stdin.write(input);
        child.stdin.end();
    });
};

const main = async (code, question, id) => {
    const filename = `${id}.cpp`;
    const inputPath = path.join(__dirname, "../", "codes", filename);
    const outputPath = path.join(
        __dirname,
        "../",
        "compiled_codes",
        filename.split(".")[0]
    );
    fs.writeFileSync(inputPath, code);

    let compileCommand = `g++ "${inputPath}" -o "${outputPath}"`;
    let totalTime = 0;

    try {
        const { stdout, stderr } = await execPromise(compileCommand);
    } catch (error) {
        return {
            status: false,
            message: "Compilation error",
            verdict: "",
            totalTime: (totalTime += (Date.now() - startTime) / 1000)
        };
    }

    const testCases = question.testCases;
    let tot_cases = testCases.length, passed = 0;

    for (let i = 0; i < testCases.length; i++) {
        const testCase = testCases[i];
        try {
            const { result, timeTaken } = await runTestCase(
                outputPath,
                testCase.input,
                testCase.output,
                question.timeLimit
            );
            totalTime += timeTaken;
            if (result === 'Test case passed') {
                passed++;
            }
            if (passed >= tot_cases) {
                return { status: true, message: `Accepted`, verdict: `${passed}/${tot_cases} passed.`, totalTime };
            }
        } catch (err) {
            let message;
            let verdict;
            if (err.code === 300) {
                message = `TLE`;
                verdict = `Time limit exceeded on test case ${i + 1}`;
            } else if (err.code === 200) {
                message = `Wrong ans`;
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

    return { status: true, message: "All test cases executed", verdict: `${passed}/${tot_cases} passed.`, totalTime };
}

module.exports = { check, runTestCase, main };
