const Question = require('./quizModel').QuestionModel;


// create new question
const questions = [
    {
        question: 'Does it work?',
        answers : {
            a : 'Yes',
            b : 'No',
            c : 'Not yet',
            d : 'all above'
        },
        correctAnswer : 'a'
    },
    {
        question: 'How deep is your love?',
        answers : {
            a : 'Like a ocean',
            b : 'Not that deep',
            c : 'Like a dirt pit',
            d : 'Like a something'
        },
        correctAnswer : 'c'
    },
    {
        question: 'Is Hamilton the grates musical?',
        answers : {
            a : 'Yes',
            b : 'No',
            c : 'What is Hamilton?',
            d : 'I don\'t like musicals'
        },
        correctAnswer : 'b'
    }
];


// save multiple documents
const  saveQ = function(db){
    setTimeout(()=>{
    // db.quizQuestions.insertMany(questions)
    // const newQ = new Question(questions);
    // newQ.save((err, record)=>{
    //     if(err){
    //         return console.log('error while saving : ', err)
    //     }else{
    //         console.log('added new obj: ')
    //     }
    // });

    Question.collection.insert(questions, function(err, docs){
        if(err){
            return console.log(err);
        } else {
            console.log('succesfully populated.')
        }
    })
    setTimeout(() => {
        console.log('find questions : ', Question.find( function(err, data){
            if(err){
                return console.log('error while looking for items : ', err);
            } else {
                console.log('Data : ', data);
            }
        } ))
    }, 2000);


    },2000)

}

module.exports = saveQ;