import React, { useEffect, useRef, useState } from 'react';
// import '../../styles/blocks/edit-photo-preview.scss';

function Canvas(props) {
    const canvasRef = useRef(null)
    const image = new Image()

    const [ canvasWidth, setCanvasWidth ] = useState(window.innerWidth)
    const [ canvasHeight, setCanvasHeight ] = useState(window.innerHeight)
    
    let offsetX, offsetY

    useEffect(() => {
        const canvas = canvasRef.current
        const ctx = canvas.getContext('2d')
        image.src = URL.createObjectURL(props.image)
        image.onload = () => {
            const [ newCanvasWidth, newCanvasHeight, offsetX, offsetY ] = scaleToFit(image, canvas, ctx)

            setCanvasWidth(newCanvasWidth)
            setCanvasHeight(newCanvasHeight)
            
            const id = ctx.getImageData(0, 0, canvasWidth, canvasHeight)
            
            for(let i = 0; i < id.data.length; i += 4){
                id.data[i] = 255
                id.data[i+1] = 0
                id.data[i+2] = 0
                id.data[i+3] = 255
            }
            
            ctx.putImageData(id, 0, 0) 
        }
    }, null)

    return <canvas
        ref={canvasRef}
        width={canvasWidth}
        height={canvasHeight}
        {...props} />;
}

function scaleToFit(img, canvas, ctx){
    // get the scale
    var scale = Math.min(canvas.width / img.width, canvas.height / img.height);
    // get the top left position of the image
    var x = (canvas.width / 2) - (img.width / 2) * scale;
    var y = (canvas.height / 2) - (img.height / 2) * scale;

    const canvasWidth = img.width * scale
    const canvasHeight = img.height * scale

    console.log(canvasWidth, canvasHeight)

    ctx.drawImage(img, x, y, canvasWidth, canvasHeight);
    return [ canvasWidth, canvasHeight, x, y ]
}

export default Canvas;