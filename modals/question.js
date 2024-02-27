const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Questions = new Schema({
    ques_name: String,
    problem_statement: String,
    input_format: String,
    output_format: String,
    sample_tests_count: Number,
    sample_input: [String],
    sample_output: [String],
    validate_by_code: Boolean,
    test_cases_count: Number,
    test_case_input: [String],
    test_case_output: [String],
    code: String,
    constraints: String,
    difficulty: Number,
    tags: String,
});

const questions = mongoose.model('questions', Questions);
exports.questions = questions;
