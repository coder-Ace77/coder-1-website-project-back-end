const { questions } = require('../modals/question');

exports.questionRenderController = (req, res) => {
    const quesname = req.params.quesname;
    questions.findOne({name:quesname}).then(result => {
        res.json(result);
    })
}
