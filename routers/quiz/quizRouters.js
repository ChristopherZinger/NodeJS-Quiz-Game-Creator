const QuestionModel = require('../../models/quiz/quizModel').QuestionModel;
const QuizModel = require('../../models/quiz/quizModel').QuizModel;
const mongoose = require('mongoose');

module.exports = function(app){
    // POPULATE QUESTIONS - DEV ONLY
    app.get('/quiz/populate/questions/$', function(req, res){
        // populate db
        const popQuiz = require('../models/quiz/populateQuizModel');
        popQuiz(db);
        // redirect home
        res.redirect('/');
    })

    // REMOVE QUIZLESS QUESTIONS - DEV ONLY
    app.get('/quiz/questions/remove-quizless-questions/$', function(req, res){
        const questions = QuestionModel.find()
            .catch(err=> console.log('error while removing quizless questions. ', err))
            .then(questions => {
                Array.from(questions).forEach(q=>{
                    if(q.quiz === undefined){
                        // delete question without quiz
                        QuestionModel.findOneAndDelete({ _id : q.id})
                            .catch(err=> console.log('error while removeing', err))
                            .then(x=> console.log('item removed'))
                    }
                })
            })
        res.redirect('/')
    })
    
    // CREATE NEW QUIZ - GET
    app.get('/quiz/create/$', function(req, res){
        res.render('../views/quiz/quizCreate.ejs');
    })

    // CREATE NEW QUIZ - POST
    app.post('/quiz/create/$', function(req, res){
        // create slug
        const slug = Array.from(req.body.title)
            .map(item => item.replace(' ', '-')).join('').toString().toLowerCase();

        // presave quiz model
        const quiz = new QuizModel({
            title : req.body.title,
            slug : slug,
         })
        quiz.save(function(err, data){
            if(err){
                return console.log("error while saving quiz to db : ", err);
            } else {
                res.redirect('/quiz/create/question/?quiz=' + data.id);
            }
        })        
    })

    //  DELETE QUIZ 
    app.get('/quiz/delete/', function(req, res){
        // find quiz in db
        const quiz = QuizModel.findOne({slug: req.query.quizslug })
            .catch(err=>console.log('Error while looking for quiz to delete. ', err))
            .then(quiz=>{
                console.log('quiz questions to remove : ', quiz.questions)
                // find questions that belong to the quiz
                const questions = QuestionModel.find({quiz: quiz.id})
                .catch(err=> console.log('error :', err))
                .then(questions=>{
                    Array.from(questions).forEach(q=>{
                    // delete question that belong to this quiz
                    QuestionModel.findOneAndDelete({ _id : q.id})
                        .catch(err=> console.log('error while removeing', err))
                        .then(x=>{ console.log(`Question that belong the the quiz "${quiz.title}", was removed`) })          
                    });
                });
                // delete the quiz
                QuizModel.findOneAndDelete({_id : quiz.id})
                    .catch(err=> console.log('Error while removig quiz from db.', err))
                    .then(x=> console.log('Quiz was removed from db.')); 
            })        
        res.redirect('/quiz/list/')
    })

    // CREATE NEW QUESTION - GET
    app.get('/quiz/create/question', function(req, res){
        const quizId = req.query.quiz;
        var result;
        QuizModel.findById(quizId)
            .catch(err=> {throw err})
            .then(quiz => {
                // find questions that belong to the quiz
                if(quiz.questions.length > 0 ){
                    // create query array
                    const queryArr = quiz.questions
                        .map(id=> mongoose.Types.ObjectId(id));

                    // pull questions out of the db
                    QuestionModel.find({
                        '_id': { $in : queryArr }
                    })
                    .catch(err => { throw err})
                    .then(quizzes => {
                        res.render('../views/quiz/questionCreate', 
                        { quizId : quizId, quizTitle : quiz.title , quizQuestions : quizzes});
                    })
                }else {
                    // no quizes to return
                    res.render('../views/quiz/questionCreate', 
                    { quizId : quizId, quizTitle : quiz.title , quizQuestions : []});
                }
            });
    })

    // CREATE NEW QUESTION - POST
    app.post('/quiz/create/question/', function(req, res){

        // find quiz in db
        const quiz = QuizModel.findById({_id: req.query.quiz})  
            .catch(err=> console.log('Error :', err))
            .then(quiz => {

                // pre save question
                const question = new QuestionModel({
                    question : req.body.question,
                    answers : {
                        a : req.body.answerA,
                        b : req.body.answerB,
                        c : req.body.answerC,
                        d : req.body.answerD,
                    },
                    correctAnswer : req.body.correctAnswer,
                    quiz : quiz
                })
                // save question
                question.save(function(err, data){
                    if(err){
                        return console.log('error whils saving the question : ', err);
                    } else {
                        // save new question to the quiz 
                        quiz.questions.push(question);
                        quiz.save();

                        // response
                        res.redirect('/quiz/create/question/?quiz=' + req.query.quiz);
                    }
                })

            } ); 
    })

    // PUBLISH QUIZ
    app.post('/quiz/create/publish/', function(req, res){
        const quizId = req.query.quiz;
        QuizModel.findById(quizId)
            .catch(err => next(err))
            .then(quiz => {
                quiz.isPublished = true;
                quiz.save(function(err, data){
                    if(err){
                        console.log('error while updating the item.', err)
                        res.status.send(500);   
                    }
                })
            })
        res.redirect('/quiz/list/');
    })

    // QUIZ LIST - GET
    app.get('/quiz/list/$', function(req, res){
        const data = QuizModel.find( {isPublished : true},
            function(err, data){
                if(err){
                    return console.log('error while quering for all quizes. ', err);
                } else {
                    res.render('../views/quiz/quizList.ejs', {data: data})
                }
        })
    })
}