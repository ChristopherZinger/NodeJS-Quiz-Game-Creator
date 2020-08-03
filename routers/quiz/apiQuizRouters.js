const QuestionModel = require('../../models/quiz/quizModel').QuestionModel;
const QuizModel = require('../../models/quiz/quizModel').QuizModel;
const mongoose = require('mongoose');
const findQuizAndQuestions = require('../../myUtils/dbUtils').findQuizAndQuestions;
const findQuiz = require('../../myUtils/dbUtils').findQuiz;


/* 

client : click start button on quizGameplay html;
server : send ajax call and create gameplay object;
server : send back gamepaly key and first question;
client : script gets data and puts gmeplay key to hidden input and questions to other inputs;
client : answer the question;
server : find the gameplay in database, evaluate answer;
server : send next question or final page;

*/


module.exports = function(app){

    app.get('/api/:quizSlug/', (req, res)=>{
       
        const   quizSlug = req.params.quizSlug,
                gameplayKey = req.query.gameplayKey;
            

        
        console.log(`this is game : ${gameplayKey} , with quiz : ${quizSlug}`)

        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ a: 1 }));


        

    })
}