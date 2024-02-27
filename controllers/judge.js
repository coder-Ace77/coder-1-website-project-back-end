const { questions } = require('../modals/question');
const cp = require('child_process');
const fs = require('fs');
const path = require('path');

exports.quesSubmitController = (req, res) => {
    const filename = req.body.user_name + '_' + req.body.ques_name + '.' + req.body.lang;
    const ques_name = req.body.ques_name;
    questions.findOne({ ques_name: ques_name }).then(result => {
        const input_path = path.join(__dirname, '../', 'codes', filename);
        const output_path = path.join(__dirname, '../', 'compiled_codes', filename.split('.')[0]);
        const test_input = path.join('test_input', filename.split('.')[0] + '.txt');
        const test_output = path.join('test_output', filename.split('.')[0] + '.txt');

        // write files test_input and test_output

        fs.writeFileSync(input_path, req.body.code);

        // ! bug result not working
        fs.writeFileSync(test_input, "1,2,4");
        fs.writeFileSync(test_output, "1,2,3");

        cp.exec(`g++ "${input_path}" -o "${output_path}"`, (err) => {
            const input_file = fs.openSync(test_input, "r");
            const output_file = fs.openSync(test_output, "w");
            var child = cp.spawn(output_path, { stdio: [input_file, output_file] });
            child.on('exit', (code, signal) => {
                fs.readFile(test_output, 'utf8', (err, content) => {
                    if (content == result.output_test) {
                        res.json({ code: 400, message: "CA" });
                    }
                    else {
                        res.json({ code: 400, message: "WA" });
                    }
                });
            });
        });
    });
}
