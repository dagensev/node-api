const quizModel = require('../models/quizModel');

exports.getLatestQuiz = async (req, res) => {
    try {
        const quiz = await quizModel.getLatestQuiz();
        res.json(quiz);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch quiz' });
    }
};
