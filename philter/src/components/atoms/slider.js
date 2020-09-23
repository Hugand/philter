import React from 'react'
import Slider from 'react-input-slider';

function SliderComponent({ label, value, setValue, min, max, step }) {
    return (
        <div className="slider-container">
            <label className="slider-label">{ label } - { value }</label>
            <Slider
                x={ value }
                xmin={min}
                xmax={max}
                onChange={ setValue }
                styles={{
                    track: {
                    backgroundColor: 'white',
                    height: 2,
                    },
                    active: {
                    backgroundColor: 'white',
                    height: 2,
                    },
                    thumb: {
                    width: 15,
                    height: 15
                    }
                }}
                />
        </div>
    )
}

export default SliderComponent;
