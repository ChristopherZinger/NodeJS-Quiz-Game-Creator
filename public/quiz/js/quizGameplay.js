$(document).ready(function(){

    (function(){
        const myDOM = {
            gameplayKeyInput : document.getElementById('gameplayKeyInput'),
            quizform : $('#quizform'),
            quizSubmitBtn : $('#quizSubmit'),
            quizQuestionIdInput : document.getElementById('questionIdInput'),
            quizSlugInput : document.getElementById('quizSlugInput')
        }

        function populateQuestionForm(q){
            newQuestionData = `
            <div id="questionInputWrapper">
                <h4>${q.question}</h4>
                <input type="radio" id="a" name="q" value="A">
                <label for="a">${q.answers.a}</label><br>
                <input type="radio" id="b" name="q" value="B">
                <label for="b">${q.answers.b}</label><br>
                <input type="radio" id="c" name="q" value="C">
                <label for="c">${q.answers.c}</label><br>
                <input type="radio" id="d" name="q" value="D">
                <label for="d">${q.answers.d}</label><br>
            </div>
            `
            // remove old question data
            let questionInputWrapper = document.getElementById('questionInputWrapper');
            if(questionInputWrapper !== null){
                $('#questionInputWrapper').replaceWith(newQuestionData)
            }else{
                // create new questions
                myDOM.quizform.append(newQuestionData);
            }

        }

        const addEvents = function(){
            document.addEventListener('click', (e)=>{

                const data = {
                    question : {
                        id : null,
                        answer : null,

                    },
                };
                
                // submit button click
                if(e.target.id === 'quizSubmit'){
                    // get quiz data from form
                    const quizSlug = myDOM.quizSlugInput.value;
                    let url = `/api/${quizSlug}`; 
   
                    // get gameplay key from form
                    const gameplayKey = myDOM.gameplayKeyInput.value;
                    if( typeof gameplayKey !== undefined ){
                        // create url query
                        const urlquery = `gameplayKey=${gameplayKey}`;
                        url = url + `?gameplayKey=${gameplayKey}`;
                    }
                    console.log( 'key taken from hidden input :' , gameplayKey ,', ',typeof gameplayKey);

                    data.question.id = myDOM.quizQuestionIdInput.value;
                    data.question.answer = $("input[type='radio'][name='q']:checked").val();

                    // create ajax call
                    $.post({
                        url: url,
                        data : data,
                        success : (data)=>{
                            console.log('data from the server :', data.gameplayKey)
                            if (data.gameplayKey !== undefined ){
                                (console.log('key received on client side : ', data.gameplayKey))
                                // update gameplay key
                                myDOM.gameplayKeyInput.value = data.gameplayKey;

                                // populate form with questions 
                                populateQuestionForm(data.question);

                                // update question id input
                                for(key in data.question){
                                    console.log('->', key)
                                }
                                myDOM.quizQuestionIdInput.value = data.question._id;
                            }
                        }
                    })
                    .fail(data=>{
                        console.log('error while ajax call.', data);
                    })
                }

            })
        }

        const init = function(){
            // prevent form from reloading the page
            myDOM.quizform.submit(function(e){
                return false;
            });

            // add event listeners 
            addEvents();
        }

        init()


    })();

})
