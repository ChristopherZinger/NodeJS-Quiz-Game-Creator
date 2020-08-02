const QuizModel = require('../models/quiz/quizModel').QuizModel;
const QuestionModel = require('../models/quiz/quizModel').QuestionModel;
const mongoose = require('mongoose');


const findQuizByIdOrSlug = async function(quizQuery){
    QuizModel.findOne({ slug : quizQuery })
    .then(data => {
        if(data === null ){
            // find by id
            return QuizModel.findById(quizQuery)
            .then(data =>{
                return data !== null ? data : null;
            })
        }
        return data
    })
}


module.exports = {
    findQuizAndQuestions : (quizQuery, callback)=>{
        /*
        Try to find quiz and related questions by id or slug
        returns quiz as object and questions as list
        or quiz as null or questions as null if not found in db
        */

        // try to find quiz by slug
        const quiz = QuizModel.findOne({ slug : quizQuery })
        .then(data => {
            if(data === null ){
                // try to find quiz id
                return QuizModel.findById(quizQuery)
                .then(data =>{
                    return data !== null ? data : null;
                })
                // .then(data => {
                //     //try to find quiz by question ID
                //     return QuestionModel.findById(quizQuery)
                // })
                // .then(data=>{

                // })
            }
            return data
        })

        const questions = quiz.then(quiz => {
            // return null if no quiz was found
            if(quiz === null){return null;}
            // find questions
            if(quiz.questions.length > 0 ){
                // create query array
                const queryArr = quiz.questions
                    .map(id=> mongoose.Types.ObjectId(id));

                // pull questions out of the db
                return QuestionModel.find({
                        '_id': { $in : queryArr }
                    })
            }
            // there are no questions in this quiz
            return null; 
        })
        .catch(err=> { 
            console.log('dbUtils.js Error while looking for quiz.');
            return err;
        })

        Promise.all([quiz, questions])
        .then(data => {
            var quiz, questions;
            data[0] !== null ? quiz = data[0] : quiz = null;
            data[0] !== null ? questions = data[1] : questions = null;
            callback(quiz, questions);
        })
        .catch(err =>  err)
    },

    findQuiz : (quizQuery, callback)=>{
        QuizModel.findOne({ slug : quizQuery })
        .then(data => {
            if(data === null ){
                // find by id
                return QuizModel.findById(quizQuery)
                .then(data =>{
                    return data !== null ? data : null;
                })
            }
            return data
        })
        .then(quiz => {
            console.log('my callback')
            callback(quiz);
        })
        .catch(err=> {
            console.log('Error while looking for the quiz. ', err);
            return err;
        })
    }
}