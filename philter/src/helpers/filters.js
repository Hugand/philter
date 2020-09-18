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

function clamp(min, max, num) { 
    if(num < min)
        return min
    else if(num > max)
        return max
    else return num
}
