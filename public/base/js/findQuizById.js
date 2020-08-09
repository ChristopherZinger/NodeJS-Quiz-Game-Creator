function myfun (){
    console.log('asdf   ')
}


$(document).ready(()=>{




    $('#quizTitleInput').on('input', (e)=>{
        console.log(e.target.value)

        $.post({
            url: '',
            data: '',
        }

        )
    })



})