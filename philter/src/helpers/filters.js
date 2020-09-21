export function applyExposure(data, i, exposure){
    data[i] += 1 * exposure
    data[i+1] += 1 * exposure
    data[i+2] += 1 * exposure
}

export function applyContrast(data, i, factor){
    const r = factor * (data[i]  - 128) + 128
    const g = factor * (data[i+1]  - 128) + 128
    const b = factor * (data[i+2]  - 128) + 128
    data[i] = clamp(0, 255, r)
    data[i+1] = clamp(0, 255, g)
    data[i+2] = clamp(0, 255, b)
}

export async function applyShadowHighlightCorrection(data, pos, canvasWidth){
    const SHADOW_THRESHOLD = 35
    const HIGHLIGHT_THRESHOLD = 75
    const { mean, variance } = calculateStatistics(data, pos, canvasWidth)
    // const { v } = rgb2hsv(
    //     data[i],
    //     data[i+1],
    //     data[i+2]
    // )

    const isShadow = mean < SHADOW_THRESHOLD
    const isHighlight = mean > HIGHLIGHT_THRESHOLD

    // console.log(pos, mean, variance, isShadow, isHighlight)

}

export function calculateStatistics(data, pos, canvasWidth) {
    const initialIndex = pos - canvasWidth - 4
    const finalIndex = pos + canvasWidth + 4
    const valueList = []
    let mean = 0;
    let variance = 0

    for(let i = initialIndex; i < finalIndex; i += 4){
        const { v } = rgb2hsv(
            data[i],
            data[i+1],
            data[i+2]
        )
        valueList.push(v)

        mean += v
    }

    mean /= 9

    for(let i = 0; i < valueList.length; i++){
        variance += (mean - valueList[i])
    }

    variance /= 9

    return { mean, variance }
}

// function calculateStatistics()

export function rgb2hsv(r, g, b) {
    const newR = r/255
    const newG = g/255
    const newB = b/255

    const cMax = max(newR, newG, newB)
    const cMin = min(newR, newG, newB)

    const delta = cMax - cMin

    const hue = Math.round(calculateHue(delta, newR, newG, newB, cMax))
    const saturation = (delta !== 0) 
        ? Math.round(100 * delta/cMax)
        : 0
    const value = Math.round(cMax * 100)

    return { h: hue, s: saturation, v: value }
}

function calculateHue(delta, r, g, b, cMax) {
    if(delta === 0) return 0
    switch(cMax){
        case r:
            return 60 * (((g-b)/delta)%6)
        case g:
            return 60 * ((b-r)/delta + 2)
        case b:
            return 60 * ((r - g)/delta + 4)
        default: return 0
    }
}

function max(r, g, b) {
    if(r > g && r > b)
        return r
    else if(g > r && g > b)
        return g
    else return b
}

function min(r, g, b) {
    if(r < g && r < b)
        return r
    else if(g < r && g < b)
        return g
    else return b
}

function clamp(min, max, num) { 
    if(num < min)
        return min
    else if(num > max)
        return max
    else return num
}
 