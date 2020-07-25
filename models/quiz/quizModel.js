const mongoose = require('mongoose');

const Schema = mongoose.Schema;


let Quiz = new Schema({
        title : {
            type: String,
            required: true,
            unique: true
        },
        slug : {
            type : String,
            unique: true,
            required: true
        },
        questions : [{
            type : Schema.Types.ObjectId,
            ref: "quizQuestions"
        }]

    },
    { collection : "quizes"}
)

let Question = new Schema({
        question : { type : String },
        answers: {
            a : String,
            b : String,
            c : String,
            d : String
        },
        correctAnswer : String,
        quiz : {
            type : Schema.Types.ObjectId,
            ref : "quizes"
        }
    },
    { collection : 'quizQuestions'}
)

// const QuizModel = mongoose.model("Quiz", Quiz);
const QuestionModel = mongoose.model("Question", Question);

// module.exports.QuizModel = Quiz;
module.exports.QuestionModel = QuestionModel ;




