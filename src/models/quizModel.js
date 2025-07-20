const db = require('./db');

const getLatestQuiz = async () => {
    const [rows] = await db.query(`SELECT JSON_OBJECT(
                                    'quiz_id', q.id,
                                    'title', q.title,
                                    'date', q.date,
                                    'questions', JSON_ARRAYAGG(
                                        JSON_OBJECT(
                                        'question_id', qt.id,
                                        'question_text', qt.question_text,
                                        'question_type', qt.question_type,
                                        'question_position', qt.position,
                                        'choices', (
                                            SELECT JSON_ARRAYAGG(
                                            JSON_OBJECT(
                                                'choice_text', c.choice_text,
                                                'is_correct', c.is_correct,
                                                'choice_position', c.position,
                                                'choice_explanation', c.explanation
                                            )
                                            )
                                            FROM choices c
                                            WHERE c.question_id = qt.id
                                        )
                                        )
                                    )
                                    ) AS quiz_json
                                    FROM quizzes q
                                    JOIN questions qt ON qt.quiz_id = q.id
                                    WHERE q.id = (
                                    SELECT id FROM quizzes ORDER BY id DESC LIMIT 1
                                    )
                                    GROUP BY q.id`);
    return rows;
};

const insertQuiz = async (quizData) => {
    const conn = await db.getConnection();

    try {
        await conn.beginTransaction();

        const { quiz_name, format, questions } = quizData;

        // Insert quiz
        const [quizResult] = await conn.query('INSERT INTO quizzes (title, date) VALUES (?, CURDATE())', [quiz_name]);
        const quizId = quizResult.insertId;

        // Insert questions and answers
        for (const q in questions) {
            const { position, question, choices, correct_answer, explanation } = questions[q];

            const [questionResult] = await conn.query('INSERT INTO questions (quiz_id, question_text, question_type, position) VALUES (?, ?, ?, ?)', [
                quizId,
                question,
                format,
                +position - 1, // Comes in as 1-based index, but we want 0-based index
            ]);
            const questionId = questionResult.insertId;

            for (const c in choices) {
                const choiceText = choices[c];

                const isCorrectAnswer = correct_answer === choiceText;

                await conn.query('INSERT INTO choices (question_id, choice_text, is_correct, explanation, position) VALUES (?, ?, ?, ?, ?)', [
                    questionId,
                    choiceText,
                    isCorrectAnswer,
                    isCorrectAnswer ? explanation : null,
                    c,
                ]);
            }
        }

        await conn.commit();
    } catch (err) {
        await conn.rollback();
        throw err;
    } finally {
        conn.release();
    }
};

module.exports = { getLatestQuiz, insertQuiz };
