import React from 'react';
import '../../styles/atoms/image-picker.scss';

function ImagePicker({ setImage }) {
  return (
    <label htmlFor="image-picker" className="image-picker-container">
        <input
          type="file"
          id="image-picker"
          className="image-picker-input"
          onChange={e => setImage(e.target.files[0])}/>

        <h4 className="image-picker-label">Drag a photo <br/> or <br/> click here</h4>
    </label>
  );
}

export default ImagePicker;
