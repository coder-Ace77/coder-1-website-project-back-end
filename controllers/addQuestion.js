const { questions } = require('../modals/question');

exports.addQuesPostController = (req, res) => {

    const new_ques = new questions({
        ques_name: req.body.ques_name,
        problem_statement: req.body.problem_statement,
        input_format: req.body.input_format,
        output_format: req.body.output_format,
        sample_tests_count: req.body.sample_tests_count,
        sample_input: req.body.sample_input,
        sample_output: req.body.sample_output,
        validate_by_code: req.body.validate_by_code,
        test_cases_count: req.body.test_cases_count,
        test_case_input: req.body.test_case_input,
        test_case_output: req.body.test_case_output,
        code: req.body.code,
        constraints: req.body.constraints,
        difficulty: req.body.difficulty,
        tags: req.body.tags,
    });
    new_ques.save().then((result) => {
        res.json({ message: "Question added", code: 100 });
    }).catch(err => {
        res.json({ message: err, code: 200 });
    });

};
