import React, { useEffect, useRef, useState } from 'react';
import { applyExposure, applyContrast, applyShadowHighlightCorrection } from '../../helpers/filters';
import { useStateValue } from  '../../state'
import { loadWasm } from '../../helpers/wasm';

function Canvas(props) {
    const [ { wasm, imageFilters, image }, dispatch ] = useStateValue()
    const [ w, setW ] = useState(null)
    const canvasRef = useRef(null)
    const imageObject = new Image()

    const [imageData, setImageData] = useState()
    

    const [ canvasWidth, setCanvasWidth ] = useState(window.innerWidth)
    const [ canvasHeight, setCanvasHeight ] = useState(window.innerHeight)

    const [ canvas, setCanvas ] = useState(null)
    const [ ctx, setCtx ] = useState(null)

    useEffect(() => {
        loadWasm().then(wasm => {
          dispatch({
            type: "changeWasm",
            newWasm: wasm
          })
          console.log(wasm)
          setW(wasm)
        })
    }, [])

    useEffect(() => {
        const canvas = canvasRef.current
        const ctx = canvas.getContext('2d')
        setCanvas(canvas)
        setCtx(ctx)
        imageObject.onload = () => {
            const [ newCanvasWidth, newCanvasHeight ] = scaleToFit(imageObject, canvas, ctx)

            setCanvasWidth(newCanvasWidth)
            setCanvasHeight(newCanvasHeight)
            ctx.drawImage(imageObject, 1, 1, newCanvasWidth-2, newCanvasHeight-2);
            setImageData(ctx.getImageData(0, 0, newCanvasWidth, newCanvasHeight))
        }
        imageObject.src = URL.createObjectURL(image)
    }, [])

    useEffect(() => {
        if(canvas && ctx && imageData) {
            let img = new ImageData(imageData.data, canvasWidth, canvasHeight)
            // const  = imageFilters
            ctx.putImageData(img, 0, 0) 

            apply(img, imageFilters)
             
        }
    }, [imageFilters])

    const apply = async (
        img,
        { exposure, contrast, highlights, shadows }
    ) => {
        let a = w.apply_filters(
            img.data,
            exposure,
            contrast,
            highlights,
            shadows,
            getArrayRelSize(canvasWidth)
        )
        ctx.putImageData(new ImageData(new Uint8ClampedArray(a), canvasWidth, canvasHeight), 0, 0)
    }

    return <canvas
        ref={canvasRef}
        width={canvasWidth}
        height={canvasHeight}
        {...props} />;
}

function getArrayRelSize(size) {
    return (Math.floor(size)-2)*4
}



function applyFilters(ctx, canvasWidth, canvasHeight, imageFilters){
    const imageData = ctx.getImageData(0, 0, canvasWidth, canvasHeight)

    const { exposure, contrast, shadows, highlights } = imageFilters
    const contrastFactor = (259*(contrast + 255))/(255*(259 - contrast))
    
    for(let i = 0; i < imageData.data.length; i += 4){
        applyExposure(imageData.data, i, exposure)
        applyContrast(imageData.data, i, contrastFactor)
        // if(shadows !== 0 || highlights !== 0)
            applyShadowHighlightCorrection(imageData.data, canvasWidth-2, canvasHeight-2)
    }

    ctx.putImageData(imageData, 0, 0) 
}

function scaleToFit(img, canvas, ctx){
    // get the scale
    var scale = Math.min(canvas.width / img.width, canvas.height / img.height);
    // get the top left position of the image
    var x = (canvas.width / 2) - (img.width / 2) * scale;
    var y = (canvas.height / 2) - (img.height / 2) * scale;

    const canvasWidth = img.width * scale
    const canvasHeight = img.height * scale

    return [ canvasWidth+2, canvasHeight+2 ]
}

export default Canvas;