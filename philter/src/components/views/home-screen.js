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

export default HomeScreen;
