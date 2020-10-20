import React, { useState } from 'react';
import '../../styles/blocks/edit-photo-sidebar-mobile.scss';
import SliderComponent from '../atoms/slider';
import Checkbox from '../atoms/checkbox';
import { useStateValue } from '../../state'

function EditPhotoSidebarMobile(props) {
  const [ {imageFilters}, dispatch ] = useStateValue()
  const [ selectedFilter, setSelectedFilter ] = useState(null);
  const filters = [
      { label: "Exposure", id: "exposure", min: -50, max: 50 },
      { label: "Contrast", id: "contrast", min: -100, max: 100 },
      { label: "Highlights", id: "highlights", min: -10, max: 10 },
      { label: "Shadows", id: "shadows", min: -10, max: 10 },
      { label: "Hue", id: "hue", min: -100, max: 100 },
      { label: "Saturation", id: "saturation", min: -100, max: 100 },
      { label: "Blur", id: "blur", min: 0, max: 5 },
      { label: "Noise", id: "noise", min: 0, max: 100 },
      { label: "B/W", id: "b_w", min: -0, max: 3 },
      { label: "Invert", id: "invert_colors", isCheckbox: true, cbLabel: "Invert colors" }
  ]

  return (
    
    <section className="bottom-bar">

        { selectedFilter && 
            <section className="bottom-bar-slider-container">

                { selectedFilter.isCheckbox ? 
                    <Checkbox
                        label={selectedFilter.cbLabel}
                        value={imageFilters[selectedFilter.id]}
                        setValue={({x}) => dispatch({
                            type: 'changeFilter',
                            filterType: selectedFilter.id,
                            newFilterValue: x})}
                    ></Checkbox>
                : 
                    <SliderComponent
                        label={selectedFilter.label}
                        showLabel={false}
                        min={selectedFilter.min}
                        max={selectedFilter.max}
                        value={imageFilters[selectedFilter.id]}
                        setValue={({x}) => dispatch({
                            type: 'changeFilter',
                            filterType: selectedFilter.id,
                            newFilterValue: x})}
                    ></SliderComponent>}

            </section>}

        <section className={ props.class } >
            {
                filters.map(filter =>
                    <label
                        className={
                            'bottom-item ' +
                            (selectedFilter && selectedFilter.id === filter.id && 'selected') 
                        }
                        
                        onClick={() => !selectedFilter || (selectedFilter && filter.id !== selectedFilter.id)
                            ? setSelectedFilter(filter)
                            : setSelectedFilter(null)} >
                            { filter.label }</label>
                )
            }
        </section>
    </section>

  );
}

export default EditPhotoSidebarMobile;
