const someFun = ()=>{
    return new Promise ((resolve, reject)=>{
        if(true){
            setTimeout(()=>{
                resolve('resolve');
            }, 3000)
            
        } else{
            reject();
        }
    })
}

const anotherFun = ()=>{
    return new Promise((resolve, reject)=>{
        if(true){
            setTimeout(()=>{
                resolve('another fun resolved');
            }, 3000)
        } else {
            reject();
        }
    })
}

someFun()
    .then(data=>{
        console.log(data)
        return anotherFun();
    })
    .then(data=>{
        console.log(data)
    })
    .catch(err => { throw err });