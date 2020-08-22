


$(document).ready(() => {
    $('#quizTitleInput').on('input', (e) => {
        const query = e.target.value;
        if (query.length > 2) {
            $.post({
                type: 'POST',
                url: '/api/quiz/list/',
                data: { query: query },
                success: (data) => {
                    const node = document.getElementById('resultsList');
                    node.innerHTML = '';

                    // populate quiz with new results
                    data.forEach(quiz => {
                        const tr = document.createElement('tr');
                        const td = document.createElement('td');
                        const a = document.createElement('a');
                        const link = document.createTextNode(quiz.title);

                        a.title = 'my title';
                        a.href = `/${quiz.slug}/gameplay/`;
                        a.appendChild(link);
                        td.appendChild(a);
                        tr.appendChild(td);
                        node.appendChild(tr);
                        a.classList.add('resultListItem');
                    })

                    // display div with results 
                    if (data.length > 0) {
                        document.getElementById('resultsContainer').style.display = 'block';
                    }
                },
            })
                .fail(data => {
                    console.log('error while ajax call.', data);
                })
        } else {
            // hide result div
            document.getElementById('resultsContainer').style.display = 'none';

        }
    })
})