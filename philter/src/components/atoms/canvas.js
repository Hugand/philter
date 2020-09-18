import React, { useEffect, useRef, useState } from 'react';
import { useStateValue } from  '../../state'

function Canvas(props) {
    const [ { canvasCtx, imageFilters, image }, dispatch ] = useStateValue()
    const canvasRef = useRef(null)
    const imageObject = new Image()
    imageObject.src = URL.createObjectURL(image)

    const [ canvasWidth, setCanvasWidth ] = useState(window.innerWidth)
    const [ canvasHeight, setCanvasHeight ] = useState(window.innerHeight)

    const [ canvas, setCanvas ] = useState(null)
    const [ ctx, setCtx ] = useState(null)

    useEffect(() => {
        console.log("useEffect canvas")
        // console.log(props.image)
        setCanvas(canvasRef.current)
        if(canvas)
            setCtx(canvas.getContext('2d'))

        if(canvas && ctx)
            imageObject.onload = () => {
                const [ newCanvasWidth, newCanvasHeight ] = scaleToFit(imageObject, canvas, ctx)
                ctx.drawImage(imageObject, 0, 0, canvasWidth, canvasHeight);

                setCanvasWidth(newCanvasWidth)
                setCanvasHeight(newCanvasHeight)


                applyExposure(ctx, canvasWidth, canvasHeight, imageFilters)
            }
    }, [imageObject])

    /*
        TODO: Try to find a way to fix this ;)
    */
    // useEffect(() => {
    //     if(canvas && ctx && imageObject) {
            
    //     }
    // }, [imageFilters])

    return <canvas
        ref={canvasRef}
        width={canvasWidth}
        height={canvasHeight}
        {...props} />;
}

function applyExposure(ctx, canvasWidth, canvasHeight, imageFilters){
    const imageData = ctx.getImageData(0, 0, canvasWidth, canvasHeight)
    
    for(let i = 0; i < imageData.data.length; i += 4){
        imageData.data[i] += 1 * imageFilters.exposure
        imageData.data[i+1] += 1 * imageFilters.exposure
        imageData.data[i+2] += 1 * imageFilters.exposure
        imageData.data[i+3] = 255
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

    // ctx.drawImage(img, x, y, canvasWidth, canvasHeight);
    return [ canvasWidth, canvasHeight ]
}

export default Canvas;