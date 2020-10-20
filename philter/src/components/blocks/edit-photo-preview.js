import React from 'react';
import '../../styles/blocks/edit-photo-preview.scss';
import Canvas from '../atoms/canvas';
import { useStateValue } from  '../../state'
import HistogramComponent from '../atoms/histogram';

function EditPhotoPreview(props) {
  const [ { imageData, image } ] = useStateValue()


  const saveImage = () => {
    var link = document.createElement('a')
    link.download = image.name
    link.href = imageData.toDataURL(image.type, 1.0).replace("image/png", "image/octet-stream");
    link.click()
  }

  return (
    <section className={ props.class }>
      <header>
        <button className="btn-secondary" onClick={props.goBack}>back</button>
        <button className="btn-primary" onClick={saveImage}>Save as</button>

        <HistogramComponent></HistogramComponent>

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