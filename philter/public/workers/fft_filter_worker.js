
importScripts('./ml-fft/index.js')
const { convolute, toRadix2, crop } = FFTUtils

onmessage = async e => {
    let { nRows, nCols, dims, channelData, kernel } = e.data

    let channelDataBuff = FFTUtils.toRadix2(channelData, nRows, nCols);
    channelData = channelDataBuff.data
    nRows = channelDataBuff.rows
    nCols = channelDataBuff.cols
  

    let convolvedChannelData =  FFTUtils.convolute(channelData, kernel, nRows, nCols);
    convolvedChannelData = FFTUtils.crop(convolvedChannelData, nRows, nCols, dims[1], dims[0])

    postMessage({
        channelData: convolvedChannelData
    })
}