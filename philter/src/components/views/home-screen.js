import React, { useState } from 'react';
import '../../styles/views/home-screen.scss';
import ImagePicker from '../atoms/image-picker'
import { useStateValue } from  '../../state'

function HomeScreen(props) {
  const [ { image }, dispatchImage ] = useStateValue()

  const handlePhotoSelection = (img) => {
    dispatchImage({
      type: 'changeImage',
      newImage: img
    })
    props.history.push('/edit')
  }

  return (
    <main className="home-main">
        <header>
            <h1 className="main-title">Philter</h1>
            <h5 className="about">About</h5>
        </header>

        <ImagePicker setImage={handlePhotoSelection}></ImagePicker>
    </main>
  );
}

export default HomeScreen;
