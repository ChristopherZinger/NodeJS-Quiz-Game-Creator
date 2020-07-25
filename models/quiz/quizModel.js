const mongoose = require('mongoose');

const Schema = mongoose.Schema;


// let Quiz = new Schema({

//     },
//     { collection : "Quizes"}
// )

let Question = new Schema({
        question : { type : String },
        answers: {
            a : String,
            b : String,
            c : String,
            d : String
        },
        correctAnswer : String,
    },
    { collection : 'QuizQuestions'}
)

// const QuizModel = mongoose.model("Quiz", Quiz);
const QuestionModel = mongoose.model("Quesion", Question);

// module.exports.QuizModel = Quiz;
module.exports.QuestionModel = QuestionModel ;



