const QuestionModel = require('../../models/quiz/quizModel').QuestionModel;
const QuizModel = require('../../models/quiz/quizModel').QuizModel;
const mongoose = require('mongoose');
const findQuizAndQuestions = require('../../myUtils/dbUtils').findQuizAndQuestions;
const findQuiz = require('../../myUtils/dbUtils').findQuiz;

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
        let slug = Array.from(req.body.title)
            .map(item => item.replace(' ', '-')).join('').toString().toLowerCase();
        
        // check if slug already exists in db 
        function tryNewSlug(slug, i){
            let trySlug;
            typeof i === 'number' ? trySlug = `${slug}_${i}` : trySlug = slug;
            QuizModel.findOne({ slug : trySlug })
            .then(data=>{
                if(data === null){
                    console.log('saving quiz with slug: ', trySlug)
                    // presave quiz model
                    const quiz = new QuizModel({
                        title : req.body.title,
                        slug : trySlug,
                    })
                    // save quiz model
                    quiz.save()
                    .then( data => { 
                        res.redirect(`/quiz/create/question/${data.id}/`);
                    })
                    .catch(err => {
                        console.log('Problem when saving quiz model. ', err);
                        return err;
                    });
                    console.log('Error, quiz exists', err);
                    //return err;
                } else {
                    // generate radom slug id 
                    let id = '';
                    for(let i=0; i < 15; i++){
                        id += Math.floor(Math.random() * 10);
                    }
                    console.log('try again ', slug, '_', Number(id));
                    console.log('data :', data)
                    tryNewSlug(slug, Number(id));
                }
            })
            .catch(err => {

            })
        }
        tryNewSlug(slug, null)
    })


    //  DELETE QUIZ 
    app.get('/quiz/delete/', function(req, res){
        // find quiz in db
        const quizSlug = req.query.quizslug;
        findQuizAndQuestions(quizSlug, (quiz, questions)=>{

        })
        const quiz = QuizModel.findOne({slug: req.query.quizslug })
            .catch(err=>console.log('Error while looking for quiz to delete. ', err))
            .then(quiz=>{
                console.log('quiz questions to remove : ', quiz.questions)
                // find questions that belong to the quiz
                const questions = QuestionModel.find({quiz: quiz.id})
                .catch(err=> err)
                .then(questions=>{
                    Array.from(questions).forEach(q=>{
                    // delete question that belong to this quiz
                    QuestionModel.findOneAndDelete({ _id : q.id})
                    .catch(err=> err)
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


    // CREATE QUESTION - GET
    app.get('/quiz/create/question/:quizId', function(req, res){
        const quizId = req.params.quizId;
        
        findQuizAndQuestions(quizId, (quiz, questions)=>{      
            questions === null ? questions = [] : null;
            console.log('here', quiz, 'questions: ', questions)
            res.render('../views/quiz/questionCreate',
            {   
                quiz : quiz, 
                questions : questions
            });  
        })
    })


    // EDIT QUIZ - GET
    app.get('/quiz/edit/', function(req, res){
        // get query data
        const quizSlug = req.query.quizslug;
        findQuizAndQuestions(quizSlug, (quiz, questions)=>{
            if( quiz!== null ){
                if(questions !== null){
                    
                    // find question data to populate with
                    let question = questions.filter(q => q._id == req.query.question);
                    if( question.length > 0 ){
                        question = question[0];
                    } else {
                        question = questions[0];
                    }

                    // populate form with question data
                    res.render('../views/quiz/questionCreate', 
                    {   quiz : quiz, 
                        questions : questions,
                        question : question
                    }); 
                } else {
                    // there are no quesitons in this quiz yet
                    res.render('../views/quiz/questionCreate', { quiz : quiz, questions : [] });     
                }
            } else{
            // quiz could not be found in db
            res.redirect('/quiz/list/');
            }
        })
    });

    // UPDATE QUESTION - POST
    app.get('/quiz/update/question/:questionId', function(req, res){
        
    })


    // CREATE UPDATE QUESTION - POST
    app.post('/quiz/create/question/:quizId/', function(req, res){
        // if query consist of 'question' update existing Question
        if( typeof req.query.question !== 'undefined' ){

            // find question
            const questionId = req.query.question;
            QuestionModel.findById(questionId)
            .catch(err => {throw err})
            .then(question => {
                question.question = req.body.question;
                question.answers.a = req.body.answerA;
                question.answers.b = req.body.answerB;
                question.answers.c = req.body.answerC;
                question.answers.d = req.body.answerD;
                question.correctAnswer = req.body.correctAnswer;
                question.save();
                res.redirect('/quiz/list/');
                res.end()
                return;
            })     
        } else {
            // create new question
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
                    quiz : quiz,

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

            }); 
        }
    })


    // PUBLISH QUIZ
    app.post('/quiz/create/publish/', function(req, res){
        const quizId = req.query.quiz;
        findQuiz(quizId, (quiz,questions)=>{
            quiz.isPublished = true;
            quiz.save(function(err, data){
                if(err){
                    console.log('error while updating the item.', err)
                    res.status.send(500);   
                }
            })
            res.redirect('/quiz/list/');
        })

    });


    // QUIZ LIST - GET
    app.get('/quiz/list/$', function(req, res){
        QuizModel.find({})
        .then(quizes=>{
            res.render('../views/quiz/quizList.ejs', {quizes: quizes})
        })
        .catch( err =>{
            res.status(500);
            return err;
        });

    })
}