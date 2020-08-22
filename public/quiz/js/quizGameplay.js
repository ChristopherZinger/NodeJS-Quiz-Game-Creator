$(document).ready(function () {

    (function () {
        const myDOM = {
            gameplayKeyInput: document.getElementById('gameplayKeyInput'),
            quizform: $('#quizform'),
            quizSubmitBtn: $('#quizSubmit'),
            quizQuestionIdInput: document.getElementById('questionIdInput'),
            quizSlugInput: document.getElementById('quizSlugInput')
        }

        function populateQuestionForm(q) {
            newQuestionData = `
            <div id="questionInputWrapper">
            <h4 class="questionInput textInput myButton">${q.question}</h4>

            <div>
            <input type="radio" id="a" name="q" value="A">
            <label class="myButton textInput answerBtn" for="a">${q.answers.a}</label>
            </div>

            <div>
            <input type="radio" id="b" name="q" value="B">
            <label class="myButton textInput answerBtn" for="b">${q.answers.b}</label>
            </div>

            <div>
            <input type="radio" id="c" name="q" value="C">
            <label class="myButton textInput answerBtn" for="c">${q.answers.c}</label>
            </div>

            <div>
            <input type="radio" id="d" name="q" value="D">
            <label class="myButton textInput answerBtn" for="d">${q.answers.d}</label>
            </div>
    
            </div>
            `
            // remove old question data
            let questionInputWrapper = document.getElementById('questionInputWrapper');
            if (questionInputWrapper !== null) {
                $('#questionInputWrapper').replaceWith(newQuestionData)
            } else {
                // create new questions
                $('#quizSubmit').before(newQuestionData)
            }

        }

        const addEvents = function () {
            document.addEventListener('click', (e) => {

                const data = {
                    question: {
                        id: null,
                        answer: null,
                    },
                };

                // submit button click
                if (e.target.id === 'quizSubmit') {

                    // get quiz data from form
                    const quizSlug = myDOM.quizSlugInput.value;
                    let url = `/api/${quizSlug}`;

                    // get gameplay key from form
                    const gameplayKey = myDOM.gameplayKeyInput.value;
                    if (typeof gameplayKey !== undefined) {
                        // create url query
                        const urlquery = `gameplayKey=${gameplayKey}`;
                        url = url + `?gameplayKey=${gameplayKey}`;
                    }
                    data.question.id = myDOM.quizQuestionIdInput.value;
                    data.question.answer = $("input[type='radio'][name='q']:checked").val();

                    // create ajax call
                    $.post({
                        url: url,
                        data: data,
                        success: (data) => {
                            if (data.isOver) {
                                //redirect to results page
                                const gameplayId = data.gameplayId;
                                window.location.replace(`/${gameplayId}/results/`);
                            } else {
                                if (data.gameplayKey !== undefined) {
                                    // update gameplay key
                                    myDOM.gameplayKeyInput.value = data.gameplayKey;

                                    // populate form with questions 
                                    populateQuestionForm(data.question);

                                    // update question id input
                                    myDOM.quizQuestionIdInput.value = data.question._id;
                                    $('#quizSubmit').val('Next')
                                }

                            }
                        }
                    })
                        .fail(data => {
                            console.log('error while ajax call.', data);
                        })
                }

            })
        }

        const init = function () {
            // prevent form from reloading the page
            myDOM.quizform.submit(function (e) {
                return false;
            });

            // add event listeners 
            addEvents();
        }

        init()


    })();

})
