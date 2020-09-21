import React, { useEffect, useState } from 'react';
import '../../styles/views/home-screen.scss';
import ImagePicker from '../atoms/image-picker'
import { useStateValue } from  '../../state'
import { loadWasm } from '../../helpers/wasm';

function HomeScreen(props) {
  const [ { image }, dispatch ] = useStateValue()
  const handlePhotoSelection = (img) => {
    dispatch({
      type: 'changeImage',
      newImage: img,
      newImageName: img.name
    })
    props.history.push('/edit')
  }

  useEffect(() => {


    loadWasm().then(wasm => {
      dispatch({
        type: "changeWasm",
        newWasm: wasm
      })
      console.log(wasm)
      // let arr = [1, 2, 3, 4]
      // let a = wasm.test(Array(200000).fill(15))
      // // let a = wasm.test_num(2)
      // console.log(a, arr)

      // let worker = new Worker('./workers/test_worker.js')
      // worker.onmessage = e => console.log("FROM WORKER: "+e.data)

      // startWorker(worker)
      // terminateWorkerIn2S(worker)
    })
  }, [])

  return (
    <main className="home-main">
        <header>
            <h1 className="main-title" onClick={() => {

            }}>Philter</h1>
            <h5 className="about">About</h5>
        </header>

        <ImagePicker setImage={handlePhotoSelection}></ImagePicker>
    </main>
  );
}

function startWorker(worker) {
  worker.postMessage({t: "STARTING BITCH", max: 9999900000000})
}

function terminateWorkerIn2S(worker){
  setTimeout(() => {
    worker.terminate();
    console.log("TERMINATED")
    setTimeout(() => {
      worker.postMessage({t: "STARTING BITCH", max: 1000})
    }, 1000)
  }, 2000)
}

// function whenActive(event){
//   var functionName=e.data.action;

//   switch(functionName){
//      case 'stopWW':
//        self.removeEventListener("message", whenActive);
//        self.addEventListener("message", whenNotActive);
//        //do other stopping actions
//        break;
//      [...]//your other cases, but not "restartWW"
//   }
// }
// function whenNotActive(event){
//   var functionName=e.data.action;

//   if(functionName === 'reStartWW'){
//        self.addEventListener("message", whenActive);
//        self.removeEventListener("message", whenNotActive);

//       [...]//do other re-startup actions
//   }
// }


export default HomeScreen;
