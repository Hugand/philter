import React from 'react';
import '../../styles/blocks/edit-photo-preview.scss';
import Canvas from '../atoms/canvas';

function EditPhotoPreview(props) {
  return (
    <section className={ props.class }>
      <header>
          <button className="btn-secondary" onClick={props.goBack}>back</button>
          <button className="btn-primary">Save as</button>
      </header>

      {
        props.image &&
        <article className="image-container">
          <Canvas image={props.image} className="image"></Canvas>
          <h4 className="image-name">{props.imageName}</h4>
        </article>
      }
    </section>
  );
}

export default EditPhotoPreview;