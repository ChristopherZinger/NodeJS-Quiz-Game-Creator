const QuestionModel = require('../../models/quiz/quizModel').QuestionModel;
const QuizModel = require('../../models/quiz/quizModel').QuizModel;
const mongoose = require('mongoose');
const findQuizAndQuestions = require('../../myUtils/dbUtils').findQuizAndQuestions;
const findQuiz = require('../../myUtils/dbUtils').findQuiz;


/*

/quiz/create/
/:quiz_slug/edit/id
/:quiz_slug/delte

/:quiz_slug/question/list
/:quiz_slug/question/create/
/:quiz_slug/question/update/id
/:quiz_slug/question/delete/id

*/

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
                    .then( quiz => { 
                        res.redirect(`/${quiz.slug}/question/create/`);
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
    app.get('/:quizSlug/delete/', function(req, res){
        // find quiz in db
        const quizSlug = req.params.quizSlug;
        findQuizAndQuestions(quizSlug, (quiz, questions)=>{
            if( Array.isArray(questions)){
                questions.forEach((q, i)=>{
                    // delete question that belong to this quiz
                    QuestionModel.findOneAndDelete({ _id : q.id})
                    .catch(err=> err)
                    .then(()=>{ 
                        console.log(`Question that belong the the quiz "${quiz.title}", was removed`)
                    }) 
                });
            }
            // delete quiz from db
            QuizModel.findOneAndDelete({ slug : quizSlug })
            .catch(err=> {
                console.log('Error while removing quiz from db. ', err);
                return err;
            })
            // return
            res.redirect('/quiz/list/')
        })
    })

    // QUIZ QUESTIONS LIST - GET
    app.get('/:quizSlug/question/list',(req, res)=>{
        const quizSlug = req.params.quizSlug;
        findQuizAndQuestions(quizSlug, (quiz, questions)=>{
            questions  === null ? questions = [] : null;
            res.render('../views/quiz/questionList', { quiz : quiz, questions : questions })
        })
    })


    // CREATE QUESTION - GET
    app.get('/:quizSlug/question/create/', function(req, res){
        const quizSlug = req.params.quizSlug;
        findQuizAndQuestions(quizSlug, (quiz, questions)=>{      
            questions === null ? questions = [] : null;
            res.render('../views/quiz/questionCreate',
            {   
                quiz : quiz, 
                questions : questions
            });  
        })
    })

    //  CREATE QUESTION - POST
    app.post('/:quizSlug/question/create/', function(req, res){
        // create new question
        // find quiz in db
        const quizSlug = req.params.quizSlug;
        findQuiz(quizSlug, quiz => {
            // pre-save question
            const question = new QuestionModel({
                question : req.body.question,
                answers : {
                    a : req.body.answerA,
                    b : req.body.answerB,
                    c : req.body.answerC,
                    d : req.body.answerD,
                },
                correctAnswer : req.body.correctAnswer,
                quiz : quiz.id,
            })
            question.save()
            .then(question => {
                // save new question to the quiz 
                quiz.questions.push(question);
                quiz.save();

                // response
                res.redirect(`/${quiz.slug}/question/list`);
            })
            .catch(err =>{ 
                console.log('Error while adding new question to the quiz. ', err);
                res.redirect(`/${quiz.slug}/question/list/`)
            })
        });
       
    })


    // EDIT QUIZ - GET
    app.get('/:quizSlug/question/edit/:questionId', function(req, res){

        const questionId = req.params.questionId;
        const quizSlug = req.params.quizSlug;

        findQuizAndQuestions(quizSlug, (quiz, questions)=>{
            questions === null ? questions = [] : null;
            const question = questions.filter(q => q.id === questionId )[0];

            if(question === undefined){
                console.log('Can not find question to edit')
                res.redirect(`/${quiz.slug}/question/list/`)
            }else{
                // populate form with question data
                res.render('../views/quiz/questionCreate', 
                {   quiz : quiz, 
                    questions : questions,
                    question : question
                }); 
            }
        })
    });

    // EDIT QUESTION - POST
    app.post('/:quizSlug/question/edit/:questionId', function(req, res){
        const quizSlug = req.params.quizSlug;
        const questionId = req.params.questionId;
        QuestionModel.findById(questionId)
        .then(question => {
            if(question !== null ){
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


    // PUBLISH QUIZ
    app.post('/:quizSlug/publish/', function(req, res){
        const quizId = req.params.quizSlug;
        findQuiz(quizId, (quiz)=>{
            quiz.isPublished = true;
            quiz.save()
            .catch(err=>{
                console.log('error while updating the item.', err)
                res.status.send(500); 
            })
            .then(()=>{
                res.redirect(`/${quiz.slug}/question/list`);
            }) 
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

