const QuestionModel = require('../../models/quiz/quizModel').QuestionModel;
const QuizModel = require('../../models/quiz/quizModel').QuizModel;
const GameplayModel = require('../../models/quiz/quizModel').GameplayModel;
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
    app.post('/api/:quizSlug/', async (req, res)=>{
       
        const   quizSlug = req.params.quizSlug,
                gameplayKey = req.query.gameplayKey,
                data = {
                    isOver : false, // this will be true when last question was asked
                };
        let gameplay, 
            quiz;

        //find QuizModel
        try {
            // console.log('quizSlug : ', quizSlug)
            quiz = await QuizModel.findOne({slug : quizSlug}); 
            // console.log('quiz : ', quiz)  
        } catch (err){
            console.log('Error while looking for QuizModel : ', err);
        }

        // can NOT find quizModel with requested slug
        if(typeof quiz === "undefined" || quiz ===null ){ console.log('Error, quiz is undefined or null')};

        // save gameplay to db if no key or find GameplayModel
        if( !gameplayKey ){
            // create gameplay 
            try{        
                gameplay = await new GameplayModel({
                    quiz : quiz.id,
                })
                await gameplay.save();
            } catch (err){
                console.log('Error while saving new gameplay : ', err)
            }
            data.gameplayKey = gameplay.id; // set gameplay key for response
        } else {
            // find and set gameplay and key if we are in the middle of the game
            data.gameplayKey = gameplayKey;
            try {
                gameplay = await GameplayModel.findById(gameplayKey);
            } catch (err){
                console.log( 'Error while looking for gameplay. ', err)
            }
        }
        // abort if can't find gameplay
        if(typeof gameplay !== 'object' ){
            // abort
        }

        // Find next question
        let newQuestion;
        quiz.questions.some(q =>{       
            // check if this is first question to ask
            if (gameplay.answers.length < 1 ){
                newQuestion = q;
                return true;
            }
            // check for next question
            const wasAsked = gameplay.answers.find(a => a.question.equals(q) );
            if ( wasAsked === undefined){
                newQuestion = q;
                return true;
            }
        })

        // abourt if all questions were already asked
        if (newQuestion === undefined){
            // redirect to results
            console.log('All question were asked. this is the end of the game \n ',
                newQuestion, ' ', typeof newQuestion )

                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify(data.isOver = True));
                return;
        }

        // push new question to gameplay answer list
        if( newQuestion != null ){
            gameplay.answers.push({question : newQuestion})
            try{
                await gameplay.save()
            } catch (err){
                console.log('Error while saving GameplayModel after pushing new questions. ', err)
            }
            data.question = await QuestionModel.findById(newQuestion);
        } 

        // evaluate answer from request
        if (typeof req.body.question.id === 'string' && req.body.question.id.length > 0){ // validate id
            const questioIdQuery = req.body.question.id;

            //find question to evaluate in db
            let question;
            try{
                question = await QuestionModel.findById(questioIdQuery)
            } catch (err){
                console.log('Error while quering for QuestionModel for answer evaluation. \n ',
                    err)
            }
            
            //if question model found in db
            if(typeof question == 'object' && question !== null ){
                // check user answer
                const userAnswer = req.body.question.answer;
                const gameplayAnswerObj = gameplay.answers.find(a => a.question.equals(questioIdQuery));
                if( ['A', 'B', 'C', 'D'].includes(userAnswer) ){
                        // save the valid answer
                        gameplayAnswerObj.answer = userAnswer; 
                        // update score
                        if( question.correctAnswer === userAnswer){
                            gameplay.score += 1;
                        }
                    } else {
                        // user did not submited any valid answer
                        gameplayAnswerObj.answer = null; 
                    }
                    // save model
                    try{
                        await gameplay.save()
                    } catch (err){
                        console.log('Error while saving user answer to the GameplayModel. ', err)
                    }

            } else {
                // cant find QuestionModel in db to compare with user Answer.
                consolg.log('can\'t find question with this id. ')
                //res.status(500);
            }
        } else if (typeof req.body.question.id === 'string' 
            && req.body.question.id.length === 0) {
            // this is first questino to be saved
            console.log('First question in this game will be send.')
        } else {
                // client provided incorrect data for quiz id orthis is first question
                console.log('client provided incorrect data for quiz id')
                res.status(500);
        }
        


        
        console.log(`This was game : ${data.gameplayKey} , with quiz : ${quizSlug}`)
        console.log('score : ', gameplay.score)
        console.log('-------------------------------------------');


        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(data));

    })
}