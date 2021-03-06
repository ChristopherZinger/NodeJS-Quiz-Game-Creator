const express = require('express');
const app = express();
const path = require('path');

// set up mongoDB 
if( process.env.NODE_ENV !== "production" ){
    require('dotenv').config();
}
const mongoose = require('mongoose');
mongoose.connect( process.env.DATABASE_URL, {
    useNewUrlParser : true,
    useUnifiedTopology: true
})
const db = mongoose.connection;
db.on('error', err=> console.log(err));
db.once('open', ()=> console.log('Connection with mongoDG ready!'));

// Middleware
app.set('view engine', 'ejs');
// app.use('/static', express.static(__dirname + '/public'));
app.use('/assets', express.static('public'));
app.use(express.urlencoded( { extended:true } ));


// init routers
const baseRouters = require('./routers/base/baseRouters');
baseRouters(app);
const quizRouters = require('./routers/quiz/quizRouters');
quizRouters(app);
const apiQuizRouters = require('./routers/quiz/apiQuizRouters');
apiQuizRouters(app);


app.listen(3000)





