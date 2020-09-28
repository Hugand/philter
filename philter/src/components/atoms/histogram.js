import React, { useEffect, useState, useRef } from 'react'
import "../../styles/atoms/histogram.scss"
import { useStateValue } from  '../../state'

function HistogramComponent() {
    const [ { histogramData }, dispatch ] = useStateValue()
    const [ ctx, setCtx ] = useState()
    const canvasRef = useRef(null)

    useEffect(() => {
        const canvas = canvasRef.current
        const newCtx = canvas.getContext('2d')
        setCtx(newCtx)
    }, [])

    useEffect(() => {
        if(ctx) {
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

            const step = {
                x: canvas.width / 255,
                y: canvas.height / maxHeightPixelValue
            }

            ctx.clearRect(0, 0, canvas.width, canvas.height)

            paintColorGraphLine(histogramData.r, '#eb4034', maxHeightPixelValue, step)
            paintColorGraphLine(histogramData.g, '#3cc94d', maxHeightPixelValue, step)
            paintColorGraphLine(histogramData.b, '#3598e8', maxHeightPixelValue, step)
            paintColorGraphLine(meanHistogram, '#ffffff', maxHeightPixelValue, step)

        }
    }, [histogramData])

    const paintColorGraphLine = (colorData, graphColor, maxHeightPixelValue, step) => {
        const canvas = canvasRef.current
        const prevPixelPos = {
            x: 0,
            y: maxHeightPixelValue
        }
        ctx.beginPath()

        // ctx.lineWidth = 0.5;
        ctx.strokeStyle = graphColor;
        colorData.forEach((pixel, i) => {
            // if( i % 3 === 0){
                ctx.moveTo(prevPixelPos.x, prevPixelPos.y)
                ctx.lineTo(step.x * i, canvas.height - step.y * pixel)
                
                prevPixelPos.x = step.x * i
                prevPixelPos.y = canvas.height - step.y * pixel
            // }
        })
        console.log(canvas.height, canvas.height - step.y * 100, maxHeightPixelValue)
        ctx.stroke();

    }

    return (
        <div className="histogram-container">
            <canvas ref={canvasRef} className="histogram-canvas"></canvas>
        </div>
    )
}

export default HistogramComponent;
