const cp = require("child_process");
const fs = require("fs");
const path = require("path");
const exp = require("constants");

const compileCode = (inputPath, outputPath)=>{
    return new Promise((resolve, reject)=>{
        let compileCommand=`g++ "${inputPath}" -o "${outputPath}"`;
        cp.exec(compileCommand, (err, stdout, stderr) => {
            if (err)reject(new Error(stderr || stdout));
            else resolve();
        });
    });
};

const check=(output, expectedOutput)=>{
    output = output.split("\n");
    expectedOutput = expectedOutput.split("\n");
    for (let i = 0; i < expectedOutput.length; i++){
        if (output[i].trim() !== expectedOutput[i].trim()){
        return false;
        }
    }
    for(let i=expectedOutput.length; i<output.length; i++){
        if(output[i].trim() !== "")return false;
    }
    return true;
}

const runTestCase = (outfile,input,expectedOutput,timeLimit)=>{
    return new Promise((resolve, reject) => {
        let runCommand = outfile;
        const child = cp.spawn(runCommand, { stdio: ["pipe", "pipe", "pipe"]});
        let output = "";
        let timeout;
        child.stdout.on("data", (data) => {
            output += data.toString();
        });

        child.on("error",(err)=>{
            reject(err);
        });
        child.on("exit", (code, signal) => {
            clearTimeout(timeout);
            if (code !== 0) {
                reject(new Error(`Child process exited with code ${code}`));
            } else{
                if (check(output, expectedOutput)){
                    resolve("Test case passed");
                } else {
                    reject(new Error(`Test case failed`));
                }
            }
        });

        timeout = setTimeout(() => {
            child.kill("SIGTERM");
            reject(new Error(`TLE`));
        }, timeLimit * 1000);
        child.stdin.write(input);
        child.stdin.end();
    });
};

const main = async(code,question,id)=>{
    const filename = `${id}.cpp`;
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
    } catch (compileErr){
        return {
            status: false,
            message: "Compilation error",
            error: compileErr.message,
        };
    }
    const testCases = question.testCases;
    let tot_cases = testCases.length , passed=0;
    for (let i = 0; i < testCases.length; i++){
        const testCase = testCases[i];
        runTestCase(
            outputPath,
            testCase.input,
            testCase.output,result.timeLimit).then(()=>{
                passed++;
                if(passed===tot_cases){
                    return {status: true,message: `All ${passed} test cases passed.`}
                }
        }).catch(()=>{
            let message;
            if (testErr.message === "TLE"){
                message = `Time Limit Exceeded on test case ${i + 1}`;
            }else{
                message = `Test case ${i + 1} failed`;
            }
            return {
                status: false,
                message: message,
                error: testErr.message,
            };
        })      
    }
}

module.exports = {check,runTestCase,main};

