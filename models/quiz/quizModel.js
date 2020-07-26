const mongoose = require('mongoose');

const Schema = mongoose.Schema;

// Create Quiz Model
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
        isPublished : Boolean,
        questions : [{
            type : Schema.Types.ObjectId,
            ref: "quizQuestions"
        }]

    },
    { collection : "quizes"}
)
const QuizModel = mongoose.model("Quiz", Quiz);

// Create Question Model
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
const QuestionModel = mongoose.model("Question", Question);


// export models
module.exports.QuizModel = QuizModel;
module.exports.QuestionModel = QuestionModel ;




