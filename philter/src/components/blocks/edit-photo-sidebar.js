import React from 'react';
import '../../styles/blocks/edit-photo-sidebar.scss';
import SliderComponent from '../atoms/slider';
import { useStateValue } from '../../state'

function EditPhotoSidebar(props) {
  const [ {imageFilters}, dispatch ] = useStateValue()

  return (
    <section className={ props.class } >

      <SliderComponent
        label="Exposure"
        min={-50}
        max={50}
        value={imageFilters.exposure}
        setValue={({x}) => dispatch({
          type: 'changeFilter',
          filterType: 'exposure',
          newFilterValue: x})}
      ></SliderComponent>

      <SliderComponent
        label="Contrast"
        min={-100}
        max={100}
        value={imageFilters.contrast}
        setValue={({x}) => dispatch({
          type: 'changeFilter',
          filterType: 'contrast',
          newFilterValue: x})}
      ></SliderComponent>

      <SliderComponent
        label="Highlights"
        min={-100}
        max={100}
        value={imageFilters.highlights}
        setValue={({x}) => dispatch({
          type: 'changeFilter',
          filterType: 'highlights',
          newFilterValue: x})}
      ></SliderComponent>

      <SliderComponent
        label="Shadows"
        min={-10}
        max={10}
        value={imageFilters.shadows}
        setValue={({x}) => dispatch({
          type: 'changeFilter',
          filterType: 'shadows',
          newFilterValue: x})}
      ></SliderComponent>

      <SliderComponent
        label="Hue"
        min={-100}
        max={100}
        value={imageFilters.hue}
        setValue={({x}) => dispatch({
          type: 'changeFilter',
          filterType: 'hue',
          newFilterValue: x})}
      ></SliderComponent>

      <SliderComponent
        label="Saturation"
        min={-100}
        max={100}
        value={imageFilters.saturation}
        setValue={({x}) => dispatch({
          type: 'changeFilter',
          filterType: 'saturation',
          newFilterValue: x})}
      ></SliderComponent>

      <SliderComponent
        label="Tone"
        min={-100}
        max={100}
        value={imageFilters.tone}
        setValue={({x}) => dispatch({
          type: 'changeFilter',
          filterType: 'tone',
          newFilterValue: x})}
      ></SliderComponent>

      <SliderComponent
        label="Sharpness"
        min={-100}
        max={100}
        value={imageFilters.sharpness}
        setValue={({x}) => dispatch({
          type: 'changeFilter',
          filterType: 'sharpness',
          newFilterValue: x})}
      ></SliderComponent>

      <SliderComponent
        label="Noise"
        min={-100}
        max={100}
        value={imageFilters.noise}
        setValue={({x}) => dispatch({
          type: 'changeFilter',
          filterType: 'noise',
          newFilterValue: x})}
      ></SliderComponent>

    </section>
  );
}

export default EditPhotoSidebar;
