import React, { useEffect, useRef, useState } from 'react';
import { useStateValue } from  '../../state'
import { scaleToFit, resizeImageData } from '../../helpers/imageHelpers'

function Canvas(props) {
    const [ { imageFilters, image }, dispatch ] = useStateValue()
    const [ worker, setWorker ] = useState()
    const [ applyFilterTimeout, setApplyFilterTimeout ] = useState()
    const [ realSizedImageData, setRealSizedImageData ] = useState()
    const adjustedCanvasRef = useRef(null)
    const realCanvasRef = useRef(null)
    
    const [ realCanvas, setRealCanvas ] = useState({
        canvas: null,
        ctx: null,
        dims: [0, 0]
    })

    const [ adjustedCanvas, setAdjustedCanvas ] = useState({
        canvas: null,
        ctx: null,
        dims: [window.innerWidth, window.innerHeight]
    })

    useEffect(() => {
        const imageObject = new Image()
        const adjustedCanv = adjustedCanvasRef.current
        const realCanv = realCanvasRef.current
        const adjustedCtx = adjustedCanv.getContext('2d')
        const realCtx = realCanv.getContext('2d')
        
        setAdjustedCanvas({
            ...adjustedCanvas,
            canvas: adjustedCanv,
            ctx: adjustedCtx
        })
        setRealCanvas({
            ...realCanvas,
            canvas: realCanv,
            ctx: realCtx
        })

        imageObject.onload = () => {
            const [ newCanvasWidth, newCanvasHeight ] = scaleToFit(imageObject, adjustedCanv)

            setAdjustedCanvas({
                ...adjustedCanvas,
                dims: [ newCanvasWidth, newCanvasHeight ]
            })
            setRealCanvas({
                ...realCanvas,
                dims: [ imageObject.width, imageObject.height ]
            })

            realCtx.drawImage(imageObject, 0, 0, imageObject.width, imageObject.height);
            adjustedCtx.drawImage(imageObject, 1, 1, newCanvasWidth-2, newCanvasHeight-2);
            
            const newRealSizedImageData = realCtx.getImageData(0, 0, imageObject.width, imageObject.height)

            setRealSizedImageData(newRealSizedImageData)
            getHistogramData(newRealSizedImageData)
            setWorkerObject(
                realCtx,
                [ imageObject.width, imageObject.height ],
                adjustedCtx,
                [ newCanvasWidth, newCanvasHeight ],
                realCanvasRef
            )
        }
        imageObject.src = URL.createObjectURL(image)
    }, [])
    
    // Using timeouts here to avoid web worker overload
    useEffect(() => {
        clearTimeout(applyFilterTimeout)
        setApplyFilterTimeout(
            setTimeout(() => {
                if(realCanvas && realSizedImageData)
                    worker.postMessage({
                        img: realSizedImageData.data,
                        imageFilters,
                        canvasWidth: realCanvas.dims[0],
                        canvasHeight: realCanvas.dims[1]
                    });
            }, 300))
    }, [ imageFilters ])

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

    const setWorkerObject = (realCtx, realDims, adjustedCtx, adjustedDims, realCanvasRef) => {
        const workerBuf = new Worker('./workers/worker.js')

        workerBuf.onmessage = async e => {
            const newImageData = new ImageData(new Uint8ClampedArray(e.data.filtered), realDims[0], realDims[1])
            realCtx.putImageData(newImageData, 0, 0)
            adjustedCtx.putImageData(await resizeImageData(newImageData, adjustedDims[0], adjustedDims[1]), 0, 0)
            dispatch({
                type: 'updateHistogramData',
                newHistogramData: e.data.histogram_data
            })
            dispatch({
                type: 'updateNewImageData',
                newImageData: realCanvasRef.current
            })
        };
        setWorker(workerBuf)
    }


    return <>
        <canvas
            ref={realCanvasRef}
            width={realCanvas.dims ? realCanvas.dims[0] : 0}
            height={realCanvas.dims ? realCanvas.dims[1] : 0}
            style={{display: 'none'}} />
            
        <canvas
            ref={adjustedCanvasRef}
            width={adjustedCanvas.dims ? adjustedCanvas.dims[0] : window.innerWidth}
            height={adjustedCanvas.dims ? adjustedCanvas.dims[1] : window.innerHeight}
            {...props} />
    </>;
}

export default Canvas;