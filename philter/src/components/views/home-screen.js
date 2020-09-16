import React from 'react';
import '../../styles/views/home-screen.scss';
import ImagePicker from '../atoms/image-picker'

function HomeScreen() {
  return (
    <main className="home-main">
        <header>
            <h1 className="main-title">Philter</h1>
            <h5 className="about">About</h5>
        </header>

        <ImagePicker></ImagePicker>
    </main>
  );
}

export default HomeScreen;
