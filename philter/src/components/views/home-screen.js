import React from 'react';
import '../../styles/views/home-screen.scss';
import ImagePicker from '../atoms/image-picker'
import { useStateValue } from  '../../state'

function HomeScreen(props) {
  const dispatch = useStateValue()[1]
  const handlePhotoSelection = (img) => {
    dispatch({
      type: 'changeImage',
      newImage: img,
      newImageName: img.name
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
