const { questions } = require('../modals/question');
const cp = require('child_process');
const fs = require('fs');
const path = require('path');

const validate = (test_input, test_output, output_path, correct_ans) => {
    const input_file = fs.openSync(test_input, "r");
    const output_file = fs.openSync(test_output, "w");
    var child = cp.spawn(output_path, { stdio: [input_file, output_file] });
    child.on('exit', (code, signal) => {
        fs.readFile(test_output, 'utf8', (err, content) => {
            if (content === correct_ans) {
                return true;
            }
            else {
                return false;
            }
        });
    });
}

const validate_by_code = (test_input, test_output, output_path, input, validator) => {
    const input_file = fs.openSync(test_input, "r");
    const output_file = fs.openSync(test_output, "w");
    var child = cp.spawn(output_path, { stdio: [input_file, output_file] });
    child.on('exit', (code, signal) => {
        fs.readFile(test_output, 'utf8', (err, content) => {
            if (validator(input, content) == true) {
                return true;
            }
            else {
                return false;
            }
        });
    });
}

exports.quesSubmitController = (req, res) => {
    const filename = req.body.user_name + '_' + req.body.ques_name + '.' + req.body.lang;
    const ques_name = req.body.ques_name;
    console.log(req.body);
    questions.findOne({ ques_name: ques_name }).then(result => {
        if (result == null) {
            res.json({ status: "Question not found" });
            return;
        }
        const input_path = path.join(__dirname, '../', 'codes', filename);
        const output_path = path.join(__dirname, '../', 'compiled_codes', filename.split('.')[0]);
        const test_input = path.join('test_input', filename.split('.')[0] + '.txt');
        const test_output = path.join('test_output', filename.split('.')[0] + '.txt');
        fs.writeFileSync(input_path, req.body.code);
        cp.exec(`g++ "${input_path}" -o "${output_path}"`, (err) => {
            if (result.validate_by_code == false) {
                for (let i = 0; i < result.test_cases_count; i++) {
                    fs.writeFileSync(test_input, result.test_case_input[i]);
                    fs.writeFileSync(test_output, result.test_case_output[i]);
                    if (validate(test_input, test_output, output_path, result.test_case_output[i]) == false) {
                        res.json({ status: `Wrong Answer on test case ${i + 1}` });
                        return;
                    }
                }
                res.json({ status: "Correct Answer" });
            }
            else {
                for (let i = 0; i < result.test_cases_count; i++) {
                    fs.writeFileSync(test_input, result.test_case_input[i]);
                    if (validate_by_code(test_input, test_output, output_path, result.test_case_input[i], result.code) == false) {
                        res.json({ status: `Wrong Answer on test case ${i + 1}` });
                        return;
                    }
                }
                res.json({ status: "Correct Answer" });
            }
        });
    });
}
