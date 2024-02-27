const { questions } = require('../modals/question');

exports.questionRenderController = (req, res) => {
    const ques_name = req.params.quesname;
    questions.findOne({ ques_name: ques_name }).then(result => {
        res.json(result);
    })
}
