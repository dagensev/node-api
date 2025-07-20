const express = require('express');
const router = express.Router();

const quizRoutes = require('./quizRoutes');
router.use('/quiz', quizRoutes);

module.exports = router;
