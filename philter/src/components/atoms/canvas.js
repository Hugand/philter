import React, { useEffect, useRef, useState } from 'react';
import { useStateValue } from  '../../state'

function Canvas(props) {
    const [ { imageFilters, image }, dispatch ] = useStateValue()
    const imageObject = new Image()
    const [imageData, setImageData] = useState()

    const canvasRef = useRef(null)
    const realSizeCanvasRef = useRef(null)

    const [ realDims, setRealDims ] = useState([0, 0])

    const [ canvas, setCanvas ] = useState(null)
    const [ ctx, setCtx ] = useState(null)
    const [ canvasWidth, setCanvasWidth ] = useState(window.innerWidth)
    const [ canvasHeight, setCanvasHeight ] = useState(window.innerHeight)

    const [ worker, setWorker ] = useState()
    const [ applyFilterTimeout, setApplyFilterTimeout ] = useState()

    useEffect(() => {
        const canvas = canvasRef.current
        const ctx = canvas.getContext('2d')
        const realSizeCtx = realSizeCanvasRef.current.getContext('2d')
        setCanvas(canvas)
        setCtx(ctx)
        imageObject.onload = () => {
            const [ newCanvasWidth, newCanvasHeight ] = scaleToFit(imageObject, canvas)

            setCanvasWidth(newCanvasWidth)
            setCanvasHeight(newCanvasHeight)

            setRealDims([imageObject.width, imageObject.height])

            realSizeCtx
                .drawImage(imageObject, 0, 0, imageObject.width, imageObject.height);
            ctx.drawImage(imageObject, 1, 1, newCanvasWidth-2, newCanvasHeight-2);
            
            const newImageData = realSizeCtx.getImageData(0, 0, imageObject.width, imageObject.height)

            setImageData(newImageData)
            getHistogramData(newImageData)
            setWorkerObject(ctx, newCanvasWidth, newCanvasHeight, newImageData)

        }
        imageObject.src = URL.createObjectURL(image)
    }, [])

    const getHistogramData = (imgData) => {
        const histogramData =  {
            r: Array(255).fill(0),
            g: Array(255).fill(0),
            b: Array(255).fill(0)
        }
        let meanR = 0;
        let meanG = 0;
        let meanB = 0;
      
        for(let i = 0; i < imgData.data.length; i += 4 * 3) {
          meanR = Math.round((imgData.data[i] + imgData.data[i+4] + imgData.data[i+8]) / 3)
          meanG = Math.round((imgData.data[i+1] + imgData.data[i+5] + imgData.data[i+9]) / 3)
          meanB = Math.round((imgData.data[i+2] + imgData.data[i+6] + imgData.data[i+10]) / 3)
          histogramData.r[meanR] += 1
          histogramData.g[meanG] += 1
          histogramData.b[meanB] += 1
        }

        dispatch({
            type: 'updateHistogramData',
            newHistogramData: histogramData
        })
    }

    const setWorkerObject = (ctx, canvasWidth, canvasHeight, imgData) => {
        const workerBuf = new Worker('./workers/worker.js')

        workerBuf.onmessage = async e => {
            const realSizeCtx = realSizeCanvasRef.current.getContext('2d')
            const newImageData = new ImageData(new Uint8ClampedArray(e.data.filtered), imageObject.width, imageObject.height)
            realSizeCtx.putImageData(newImageData, 0, 0)
            ctx.putImageData(await resizeImageData(newImageData, canvasWidth, canvasHeight), 0, 0)
            dispatch({
                type: 'updateHistogramData',
                newHistogramData: e.data.histogram_data
            })
            dispatch({
                type: 'updateNewImageData',
                newImageData: realSizeCanvasRef.current
            })
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
                        canvasHeight
                    });
            }, 300))
    }, [imageFilters])

    return <>
        <canvas
            ref={realSizeCanvasRef}
            width={realDims[0]}
            height={realDims[1]}
            style={{display: 'none'}} />
        <canvas
            ref={canvasRef}
            width={canvasWidth}
            height={canvasHeight}
            {...props} />;
    </>
}

function scaleToFit(img, canvas){
    // get the scale
    var scale = Math.min(canvas.width / img.width, canvas.height / img.height);
    // get the top left position of the image
    var x = (canvas.width / 2) - (img.width / 2) * scale;
    var y = (canvas.height / 2) - (img.height / 2) * scale;

    const canvasWidth = img.width * scale
    const canvasHeight = img.height * scale

    return [ parseInt(canvasWidth+2), parseInt(canvasHeight+2) ]
}

async function resizeImageData (imageData, width, height) {
    const resizeWidth = width >> 0
    const resizeHeight = height >> 0
    const ibm = await window.createImageBitmap(imageData, 0, 0, imageData.width, imageData.height, {
      resizeWidth, resizeHeight
    })
    const canvas = document.createElement('canvas')
    canvas.width = resizeWidth
    canvas.height = resizeHeight
    const ctx = canvas.getContext('2d')
    ctx.scale(resizeWidth / imageData.width, resizeHeight / imageData.height)
    ctx.drawImage(ibm, 0, 0)
    return ctx.getImageData(0, 0, resizeWidth, resizeHeight)
  }

export default Canvas;