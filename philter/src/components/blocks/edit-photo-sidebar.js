import React, { useState } from 'react';
import '../../styles/blocks/edit-photo-sidebar.scss';
import SliderComponent from '../atoms/slider';

function EditPhotoSidebar(props) {
  const [state, setState] = useState({
    exposure: 0,
    contrast: 0,
    hue: 0,
    saturatiion: 0,
    sharpness: 0,
    highlights: 0,
    shadows: 0,
    tone: 0,
    noise: 0
  })

  return (
    <section className={ props.class } >

      <SliderComponent
        label="Exposure"
        value={state.exposure}
        setValue={({x}) => setState({...state, exposure: x})}
      ></SliderComponent>

      <SliderComponent
        label="Contrast"
        value={state.contrast}
        setValue={({x}) => setState({...state, contrast: x})}
      ></SliderComponent>

      <SliderComponent
        label="Hue"
        value={state.hue}
        setValue={({x}) => setState({...state, hue: x})}
      ></SliderComponent>

      <SliderComponent
        label="Saturation"
        value={state.saturation}
        setValue={({x}) => setState({...state, saturation: x})}
      ></SliderComponent>

      <SliderComponent
        label="Sharpness"
        value={state.sharpness}
        setValue={({x}) => setState({...state, sharpness: x})}
      ></SliderComponent>

      <SliderComponent
        label="Highlights"
        value={state.highlights}
        setValue={({x}) => setState({...state, highlights: x})}
      ></SliderComponent>

      <SliderComponent
        label="Shadows"
        value={state.shadows}
        setValue={({x}) => setState({...state, shadows: x})}
      ></SliderComponent>

      <SliderComponent
        label="Tone"
        value={state.tone}
        setValue={({x}) => setState({...state, tone: x})}
      ></SliderComponent>

      <SliderComponent
        label="Noise"
        value={state.noise}
        setValue={({x}) => setState({...state, noise: x})}
      ></SliderComponent>

    </section>
  );
}

export default EditPhotoSidebar;
