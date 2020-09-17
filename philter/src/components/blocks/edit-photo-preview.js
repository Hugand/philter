import React from 'react';
import '../../styles/blocks/edit-photo-preview.scss';
import Canvas from '../atoms/canvas';

function EditPhotoPreview(props) {
  return (
    <section className={ props.class }>
      <header>
          <button>Save as</button>
      </header>

      {
        props.image &&
        <article className="image-container">
          {/* <img src={URL.createObjectURL(props.image)}/> */}
          <Canvas image={props.image} className="image"></Canvas>
          <h4 className="image-name">{props.image.name}</h4>
        </article>
      }
    </section>
  );
}

export default EditPhotoPreview;