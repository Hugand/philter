import React, { useState } from 'react';
import '../../styles/blocks/edit-photo-sidebar-mobile.scss';
import SliderComponent from '../atoms/slider';
import Checkbox from '../atoms/checkbox';
import { useStateValue } from '../../state'
import HistogramComponent from '../atoms/histogram';

function EditPhotoSidebarMobile(props) {
  const [ {imageFilters}, dispatch ] = useStateValue()
  const [ selectedFilter, setSelectedFilter ] = useState(null);
  const filters = [
      { label: "Exposure", id: "exposure" },
      { label: "Contrast", id: "contrast" },
      { label: "Highlights", id: "highlights" },
      { label: "Shadows", id: "shadows" },
      { label: "Hue", id: "hue" },
      { label: "Saturation", id: "saturation" },
      { label: "Blur", id: "blur" },
      { label: "Noise", id: "noise" },
      { label: "Hue", id: "hue" },
      { label: "B/W", id: "b_w" },
      { label: "Invert", id: "invert" }
  ]

  return (
    
    <section>

        <section className={ props.class } >
            {
                filters.map(filter =>
                    <label
                        className={
                            'sidebar-item ' +
                            (selectedFilter === filter.id && 'selected') 
                        }
                        
                        onClick={() => setSelectedFilter(filter.id)} >
                            { filter.label }</label>
                )
            }
            {/* <label className="sidebar-item">Exposure</label>
            <label className="sidebar-item">Contrast</label>
            <label className="sidebar-item">Highlights</label>
            <label className="sidebar-item">Shadows</label>
            <label className="sidebar-item">Hue</label>
            <label className="sidebar-item">Saturation</label>
            <label className="sidebar-item">Blur</label>
            <label className="sidebar-item">Noise</label>
            <label className="sidebar-item">B/W</label>
            <label className="sidebar-item">Invert</label> */}

            {/* 
            <HistogramComponent></HistogramComponent>

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
                min={-10}
                max={10}
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
                label="Blur"
                min={0}
                max={5}
                value={imageFilters.blur}
                setValue={({x}) => dispatch({
                type: 'changeFilter',
                filterType: 'blur',
                newFilterValue: x})}
            ></SliderComponent>

            <SliderComponent
                label="Noise"
                min={0}
                max={100}
                value={imageFilters.noise}
                setValue={({x}) => dispatch({
                type: 'changeFilter',
                filterType: 'noise',
                newFilterValue: x})}
            ></SliderComponent>

            <SliderComponent
                label="Black and White"
                min={0}
                max={3}
                value={imageFilters.b_w}
                setValue={({x}) => dispatch({
                type: 'changeFilter',
                filterType: 'b_w',
                newFilterValue: x})}
            ></SliderComponent>

            <Checkbox
                label="Invert colors"
                value={imageFilters.invert_colors}
                setValue={({x}) => dispatch({
                type: 'changeFilter',
                filterType: 'invert_colors',
                newFilterValue: x})}
            ></Checkbox> */}
        </section>
    </section>

  );
}

export default EditPhotoSidebarMobile;
