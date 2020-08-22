const QuestionModel = require('../../models/quiz/quizModel').QuestionModel;
const QuizModel = require('../../models/quiz/quizModel').QuizModel;
const mongoose = require('mongoose');
const { GameplayModel } = require('../../models/quiz/quizModel');
const findQuizAndQuestions = require('../../myUtils/dbUtils').findQuizAndQuestions;
const findQuiz = require('../../myUtils/dbUtils').findQuiz;
const slugify = require('slugify');

/*

/quiz/create/
/:quiz_slug/edit/id
/:quiz_slug/delte

/:quiz_slug/question/list
/:quiz_slug/question/create/
/:quiz_slug/question/update/id
/:quiz_slug/question/delete/id

*/

// check if slug already exists in db 
const slugIsValid = async (slug, i) => {
    let iter = i || 0;
    let trySlug;
    i !== undefined && i !== 0 ? trySlug = slug + '_' + iter : trySlug = slug;

    try {
        const quiz = await QuizModel.findOne({ slug: trySlug });
    } catch (err) {
        console.log("Error while trying new slug", err);
    }

    if (typeof quiz === 'undefined') {
        return trySlug;
    } else {
        console.log(iter++)
        return slugIsValid(slug, iter++);
    }
}


module.exports = function (app) {
    // POPULATE QUESTIONS - DEV ONLY
    app.get('/quiz/populate/questions/$', function (req, res) {
        // populate db
        const popQuiz = require('../models/quiz/populateQuizModel');
        popQuiz(db);
        // redirect home
        res.redirect('/');
    })


    // REMOVE QUIZLESS QUESTIONS - DEV ONLY
    app.get('/quiz/questions/remove-quizless-questions/$', function (req, res) {
        const questions = QuestionModel.find()
            .catch(err => console.log('error while removing quizless questions. ', err))
            .then(questions => {
                Array.from(questions).forEach(q => {
                    if (q.quiz === undefined) {
                        // delete question without quiz
                        QuestionModel.findOneAndDelete({ _id: q.id })
                            .catch(err => console.log('error while removeing', err))
                            .then(x => console.log('item removed'))
                    }
                })
            })
        res.redirect('/')
    })


    // CREATE NEW QUIZ - GET
    app.get('/quiz/create/$', function (req, res) {
        res.render('../views/quiz/quizCreate.ejs');
    })

    // UPDATE QUIZ NAME - GET
    app.get('/:quizSlug/edit-title/$', async (req, res) => {
        const quizSlug = req.params.quizSlug;
        let quiz;

        try {
            quiz = await QuizModel.findOne({ slug: quizSlug });
        } catch (err) {
            console.log('Error while looking for quiz to update the title. \n ', err)
        }

        if (typeof quiz !== 'undefined') {
            res.render('../views/quiz/quizEditTitle.ejs', { quiz: quiz });
        } else {
            res.redirect(`/${quizSlug}/question/list/`)
        }

    })

    // UPDATE QUIZ NAME - POST 
    app.post('/:quizSlug/edit-title/$', async (req, res) => {
        const quizSlug = req.params.quizSlug;
        const newTitle = req.body.newTitle;

        // check if title already exists
        const quizExists = await QuizModel.findOne({ title: newTitle });
        if (quizExists !== null) {
            console.log('Quiz with this title already exists.')
            res.redirect(`/${quizSlug}/question/list/`)
            return;
        }

        // slugify
        const newSlug = await slugIsValid(
            slugify(newTitle, {
                lower: true,
            }));


        // find quiz in db
        let quiz;
        try {
            // try to update title and save
            quiz = await QuizModel.findOne({ slug: quizSlug });
            quiz.title = newTitle;
            quiz.slug = newSlug;

            await quiz.save();
        } catch (err) {
            console.log('Error while trying to update quiz name. \n ', err)
        }
        res.redirect(`/${quiz.slug}/question/list/`);
    })

    // CREATE NEW QUIZ - POST
    app.post('/quiz/create/$', async (req, res) => {
        // create slug
        let slug = slugify(req.body.title, {
            lower: true,
        });
        slug = await slugIsValid(slug);

        // presave quiz model
        const quiz = new QuizModel({
            title: req.body.title,
            slug: slug,
        })
        // save quiz model
        await quiz.save();
        res.redirect(`/${quiz.slug}/question/create/`);
    });


    //  DELETE QUIZ 
    app.get('/:quizSlug/delete/', function (req, res) {
        // find quiz in db
        const quizSlug = req.params.quizSlug;
        findQuizAndQuestions(quizSlug, (quiz, questions) => {
            if (Array.isArray(questions)) {
                questions.forEach((q, i) => {
                    // delete question that belong to this quiz
                    QuestionModel.findOneAndDelete({ _id: q.id })
                        .catch(err => err)
                        .then(() => {
                            console.log(`Question that belong the the quiz "${quiz.title}", was removed`)
                        })
                });
            }
            // delete quiz from db
            QuizModel.findOneAndDelete({ slug: quizSlug })
                .catch(err => {
                    console.log('Error while removing quiz from db. ', err);
                    return err;
                })
            // return
            res.redirect('/')
        })
    })

    // QUIZ QUESTIONS LIST - GET
    app.get('/:quizSlug/question/list', (req, res) => {
        const quizSlug = req.params.quizSlug;
        findQuizAndQuestions(quizSlug, (quiz, questions) => {
            questions === null ? questions = [] : null;
            res.render('../views/quiz/questionList', { quiz: quiz, questions: questions })
        })
    })


    // CREATE QUESTION - GET
    app.get('/:quizSlug/question/create/', function (req, res) {
        const quizSlug = req.params.quizSlug;
        findQuizAndQuestions(quizSlug, (quiz, questions) => {
            questions === null ? questions = [] : null;
            res.render('../views/quiz/questionCreate',
                {
                    quiz: quiz,
                    questions: questions
                });
        })
    })

    //  CREATE QUESTION - POST
    app.post('/:quizSlug/question/create/', async (req, res) => {
        // create new question
        // find quiz in db
        const quizSlug = req.params.quizSlug;
        let quiz;
        try {
            quiz = await QuizModel.findOne({ slug: quizSlug });
        } catch (err) {
            console.log('Error while searching quiz for new question create', err)
            res.redirect(`/${quiz.slug}/question/list/`)
        }
        if (quiz !== undefined) {
            try {

                console.log(
                    'question: ', req.body.question,
                    'A : ', req.body.answerA,
                    'B : ', req.body.answerB,
                    'C : ', req.body.answerC,
                    'D : ', req.body.answerD,
                    'correct : ', req.body.correctAnswer

                )
                // pre-save question
                const question = new QuestionModel({
                    question: req.body.question,
                    answers: {
                        a: req.body.answerA,
                        b: req.body.answerB,
                        c: req.body.answerC,
                        d: req.body.answerD,
                    },
                    correctAnswer: req.body.correctAnswer,
                    quiz: quiz.id,
                })
                await question.save()
                // save questio to the quiz
                try {
                    // save new question to the quiz 
                    quiz.questions.push(question);
                    await quiz.save();
                } catch (err) {
                    console.log('error while adding question to the quiz', err);
                    //res.status(500)
                }
            } catch (err) {
                console.log('Error while saving question for the quiz. ', err)
            }


        }
        // response
        res.redirect(`/${quiz.slug}/question/list`);
    })


    // EDIT QUIZ - GET
    app.get('/:quizSlug/question/edit/:questionId', function (req, res) {

        const questionId = req.params.questionId;
        const quizSlug = req.params.quizSlug;

        findQuizAndQuestions(quizSlug, (quiz, questions) => {
            questions === null ? questions = [] : null;
            const question = questions.filter(q => q.id === questionId)[0];

            if (question === undefined) {
                console.log('Can not find question to edit')
                res.redirect(`/${quiz.slug}/question/list/`)
            } else {
                // populate form with question data
                res.render('../views/quiz/questionCreate',
                    {
                        quiz: quiz,
                        questions: questions,
                        question: question
                    });
            }
        })
    });

    // EDIT QUESTION - POST
    app.post('/:quizSlug/question/edit/:questionId', function (req, res) {
        const quizSlug = req.params.quizSlug;
        const questionId = req.params.questionId;
        QuestionModel.findById(questionId)
            .then(question => {
                if (question !== null) {
                    question.question = req.body.question;
                    question.answers.a = req.body.answerA;
                    question.answers.b = req.body.answerB;
                    question.answers.c = req.body.answerC;
                    question.answers.d = req.body.answerD;
                    question.correctAnswer = req.body.correctAnswer;
                    question.save();
                    res.redirect(`/${quizSlug}/question/list/`);
                    res.end()
                }
            })
            .catch(err => {
                console.log('Error while editing the question. ', err);
                return err;
            })
    })


    // DELETE QUESTION - POST
    app.post(`/:quizSlug/question/delete/:questionId/$`, (req, res) => {
        const quizSlug = req.params.quizSlug;
        const questionId = req.params.questionId;

        QuestionModel.findOneAndDelete({ _id: questionId })
            .then(() => {
                return QuizModel.findOne({ slug: quizSlug });
            })
            .then(quiz => {
                quiz.questions = quiz.questions.filter(id => id != questionId);
                quiz.save();
                res.redirect(`/${quiz.slug}/question/list/`)
            })
    })


    // PUBLISH QUIZ
    app.post('/:quizSlug/publish/', function (req, res) {
        const quizId = req.params.quizSlug;
        findQuiz(quizId, (quiz) => {
            quiz.isPublished = true;
            quiz.save()
                .catch(err => {
                    console.log('error while updating the item.', err)
                    res.status.send(500);
                })
                .then(() => {
                    res.redirect(`/${quiz.slug}/question/list`);
                })
        })
    });


    // QUIZ LIST - GET
    app.get('/quiz/list/$', function (req, res) {
        QuizModel.find({})
            .then(quizes => {
                res.render('../views/quiz/quizList.ejs', { quizes: quizes })
            })
            .catch(err => {
                res.status(500);
                return err;
            });

    })

    // QUIZ GAMEPLAY - GET
    app.get('/:quizSlug/gameplay/', async (req, res) => {
        const slug = req.params.quizSlug;
        const quiz = await QuizModel.findOne({ slug: slug })

        res.render('../views/quiz/quizGameplay', { quiz: quiz })
    })

    // GAMEPLAY RESULTS - GET 
    app.get('/:gameplayId/results/$', async (req, res) => {
        const gameplayId = req.params.gameplayId;
        const gameplay = await GameplayModel.findById(gameplayId);
        res.render('../views/quiz/gameplayResults.ejs', { gameplay: gameplay })
    })
}

