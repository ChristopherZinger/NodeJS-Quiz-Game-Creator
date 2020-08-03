$(document).ready(function(){

    (function(){
        

        const myDOM = {
            gameplayKeyInput : document.getElementById('gameplayKeyInput'),
            quizform : $('#quizform'),
            quizSubmitBtn : $('#quizSubmit'),
            quizSlugInput : document.getElementById('quizSlugInput')
        }

        const addEvents = function(){
            document.addEventListener('click', (e)=>{
                
                // submit button click
                if(e.target.id === 'quizSubmit'){
                    // get quiz data from form
                    const quizSlug = myDOM.quizSlugInput.value;
                    let url = `/api/${quizSlug}`; 
   
                    // get gameplay key from form
                    const gameplayKey = myDOM.gameplayKeyInput.value;
                    if( typeof gameplayKey !== undefined ){
                        // create url query
                        console.log(typeof gameplayKey)
                        const urlquery = `gameplayKey=${gameplayKey}`;
                        url = url + `?gameplayKey=${gameplayKey}`;
                    }

                    // create ajax call
                    
                    $.get({
                        url: url,
                        data : '',
                        success : (data)=>{
                            console.log('jej i did the ajax call!')
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
