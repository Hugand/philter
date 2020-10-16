import React from 'react'
import './../../styles/atoms/checkbox.scss'

function Checkbox({ label, value, setValue }) {
    return (
        <label className="checkbox-container" htmlFor={'cb-'+label} >
            <input type="checkbox" id={'cb-'+label} onClick={() => {setValue({x: -1 * value})}}/>
            <div className="checkable">
                { value === 1 && <div className="checkable-fill"></div> }
            </div>
            <p>{ label }</p>
        </label>
    )
}

export default Checkbox;
