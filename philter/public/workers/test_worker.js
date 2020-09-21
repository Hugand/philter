
onmessage = e => {
    console.log("FROM MAIN: "+e.data.t+' '+e.data.max)
    let sum = 0
    for(let i = 0; i < e.data.max; i++){
        // console.log("RUNNING")
        sum += i
    }

    postMessage("DONE "+sum)
}