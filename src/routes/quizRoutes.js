const express = require('express');
const router = express.Router();
const quizController = require('../controllers/quizController');

router.get('/latest', quizController.getLatestQuiz);

module.exports = router;
