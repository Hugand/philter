import React, { useEffect, useRef, useState } from 'react';
import { useStateValue } from  '../../state'

function Canvas(props) {
    const [ { imageFilters, image }, dispatch ] = useStateValue()
    const imageObject = new Image()
    const [imageData, setImageData] = useState()

    const canvasRef = useRef(null)
    const [ canvas, setCanvas ] = useState(null)
    const [ ctx, setCtx ] = useState(null)
    const [ canvasWidth, setCanvasWidth ] = useState(window.innerWidth)
    const [ canvasHeight, setCanvasHeight ] = useState(window.innerHeight)

    const [ worker, setWorker ] = useState()
    const [ applyFilterTimeout, setApplyFilterTimeout ] = useState()

    useEffect(() => {
        const canvas = canvasRef.current
        const ctx = canvas.getContext('2d')
        setCanvas(canvas)
        setCtx(ctx)
        imageObject.onload = () => {
            const [ newCanvasWidth, newCanvasHeight ] = scaleToFit(imageObject, canvas)

            setCanvasWidth(newCanvasWidth)
            setCanvasHeight(newCanvasHeight)

            ctx.drawImage(imageObject, 1, 1, newCanvasWidth-2, newCanvasHeight-2);
            setImageData(ctx.getImageData(0, 0, newCanvasWidth, newCanvasHeight))

            setWorkerObject(ctx, newCanvasWidth, newCanvasHeight)
        }
        imageObject.src = URL.createObjectURL(image)
    }, [])

    const setWorkerObject = (ctx, canvasWidth, canvasHeight) => {
        const workerBuf = new Worker('./workers/worker.js')

        workerBuf.onmessage = e => {
            if(e.data.filtered)
                ctx.putImageData(new ImageData(new Uint8ClampedArray(e.data.filtered), canvasWidth, canvasHeight), 0, 0)
        };
        setWorker(workerBuf)
    }

    // Using timeouts here to avoid web worker overload
    useEffect(() => {
        clearTimeout(applyFilterTimeout)
        setApplyFilterTimeout(
            setTimeout(() => {
                if(canvas && ctx && imageData)
                    worker.postMessage({
                        img: imageData.data,
                        imageFilters,
                        canvasWidth,
                    });
            }, 300))
    }, [imageFilters])

    return <canvas
        ref={canvasRef}
        width={canvasWidth}
        height={canvasHeight}
        {...props} />;
}

function scaleToFit(img, canvas){
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