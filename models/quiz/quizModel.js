const mongoose = require('mongoose');

const Schema = mongoose.Schema;

// Create Quiz Model
let Quiz = new Schema({
        title : {
            type: String,
            required: true,
            unique: false
        },
        slug : {
            type : String,
            unique: true,
            required: true
        },
        isPublished : {
            type : Boolean,
            default : false
        },
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
            a : {type : String, required : true },
            b : {type : String, required : true},
            c : {type : String, required : true},
            d : {type : String, required : true}
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


// Create GameplayModel
const Gameplay = new Schema({
    score : {
        type : Number,
        default : 0,
    },
    quiz : {
        type : Schema.Types.ObjectId,
        ref : "gameplays"
    },
    createdAt : {
        type : Date,
        default : Date.now,
    },
    isCompleted : {
        type : Boolean,
        default : false
    },
    answers : [{
        question : {
            type : Schema.Types.ObjectId,
            ref : "question"
        },
        answer : String,
    }]
})
const GameplayModel = mongoose.model("Gameplay", Gameplay);


// export models
module.exports.QuizModel = QuizModel;
module.exports.QuestionModel = QuestionModel;
module.exports.GameplayModel = GameplayModel;




