function myfun (){
    console.log('asdf   ')
}


$(document).ready(()=>{




    $('#quizTitleInput').on('input', (e)=>{
        const query = e.target.value;
        if(query.length > 2){

            $.post({
                type:'POST',
                url: '/api/quiz/list/',
                data: {query:query},
                success : (data)=>{
                    const node  = document.getElementById('resultsList');
                    node.innerHTML = '';

                    data.forEach(quiz=>{
                        const a = document.createElement('a')
                        const link = document.createTextNode(quiz.title);
                        a.appendChild(link);
                        a.title = 'my title';
                        a.href = `/${quiz.slug}/gameplay/`;  
                        node.append( a );

                        console.log('from server :', quiz.title)
                    })
                    
                },
            })
            .fail(data=>{
                console.log('error while ajax call.', data);
            })
        }
    })



})