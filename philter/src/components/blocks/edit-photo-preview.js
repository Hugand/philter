import React from 'react';
import '../../styles/blocks/edit-photo-preview.scss';

function EditPhotoPreview(props) {
  return (
    <section className={ props.class }>
        <header>
            <button>Save as</button>
        </header>

        <article className="image-container">
            <img src={require("../../assets/images/photo_unavailable.png")}/>
            <h4 className="image-name">Photo name.jpg</h4>
        </article>
    </section>
  );
}

export default EditPhotoPreview;
