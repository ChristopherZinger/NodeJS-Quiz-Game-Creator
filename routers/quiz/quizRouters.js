const QuestionModel = require('../../models/quiz/quizModel').QuestionModel;



module.exports = function(app){
    app.get('/quiz/populate/questions', function(req, res){
        // populate db
        const popQuiz = require('../models/quiz/populateQuizModel');
        popQuiz(db);
        // redirect home
        res.redirect('/')
    })
    

    app.get('/quiz/create', function(req, res){
        res.render('../views/quiz/quizCreate.ejs');
    })

    app.get('/quiz/list', function(req, res){
        // create new question
        const Question = new QuestionModel({
            question: 'Does it work?',
            answers : {
                a : 'Yes',
                b : 'No',
                c : 'Not yet',
                d : 'all above'
            },
            correctAnswer : 'a'
        });

        console.log(
           'all models : ',  QuestionModel.find({})
        )
        res.render('../views/quiz/quizList.ejs')
    })
}