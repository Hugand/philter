import React, { useEffect, useState, useRef } from 'react'
import "../../styles/atoms/histogram.scss"
import { useStateValue } from  '../../state'

function HistogramComponent() {
    const [ { histogramData } ] = useStateValue()
    const [ ctx, setCtx ] = useState()
    const canvasRef = useRef(null)

    useEffect(() => {
        const canvas = canvasRef.current
        const newCtx = canvas.getContext('2d')
        setCtx(newCtx)
    }, [])

    useEffect(() => {
        if(ctx && histogramData) {
            const canvas = canvasRef.current
            let maxHeightPixelValue = 0;
            const meanHistogram = Array(255).fill(0)

            histogramData.r.forEach((pixel, i) => { 
                if(pixel > maxHeightPixelValue) maxHeightPixelValue = pixel
                meanHistogram[i] += pixel / 3
            })
            histogramData.g.forEach((pixel, i) => { 
                if(pixel > maxHeightPixelValue) maxHeightPixelValue = pixel
                meanHistogram[i] += pixel / 3
            })
            histogramData.b.forEach((pixel, i) => { 
                if(pixel > maxHeightPixelValue) maxHeightPixelValue = pixel
                meanHistogram[i] += pixel / 3
            })

            ctx.clearRect(0, 0, canvas.width, canvas.height)

            paintColorGraphLine(histogramData.r, '#eb4034', maxHeightPixelValue)
            paintColorGraphLine(histogramData.g, '#3cc94d', maxHeightPixelValue)
            paintColorGraphLine(histogramData.b, '#3598e8', maxHeightPixelValue)
            paintColorGraphLine(meanHistogram, '#ffffff', maxHeightPixelValue)
        }
    })

    const paintColorGraphLine = (colorData, graphColor, maxHeightPixelValue) => {
        const canvas = canvasRef.current
        const prevPixelPos = {
            x: 0,
            y: maxHeightPixelValue
        }
        const step = {
            x: canvas.width / 255,
            y: canvas.height / maxHeightPixelValue
        }
        ctx.beginPath()

        // ctx.lineWidth = 0.5;
        ctx.strokeStyle = graphColor;
        colorData.forEach((pixel, i) => {
            if( i % 3 === 0){
                ctx.moveTo(prevPixelPos.x, prevPixelPos.y)
                ctx.lineTo(step.x * i, canvas.height - step.y * pixel)
                
                prevPixelPos.x = step.x * i
                prevPixelPos.y = canvas.height - step.y * pixel
            }
        })
        ctx.stroke();
    }

    return (
        <div className="histogram-container">
            <canvas ref={canvasRef} className="histogram-canvas"></canvas>
        </div>
    )
}

export default HistogramComponent;
