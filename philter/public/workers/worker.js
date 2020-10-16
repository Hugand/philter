importScripts("./wasm-philter/js/wasm_philter.js");
importScripts('./ml-fft/index.js')
const { convolute, toRadix2, crop } = FFTUtils

delete WebAssembly.instantiateStreaming;
wasmPhilter("./wasm-philter/js/wasm_philter_bg.wasm")
.then(wasm => {
  const { apply_filters } = wasmPhilter

  onmessage = async e => {
    const { img, imageFilters, canvasWidth, canvasHeight } = e.data;
    const {
      exposure,
      contrast,
      highlights,
      shadows,
      saturation,
      hue,
      blur,
      noise
    } = imageFilters

    const arrayRelWidth = (Math.floor(canvasWidth)-2)*4

    let color_enhanced = apply_filters(
        img,
        exposure / 10,
        contrast,
        highlights / 20,
        shadows / 10,
        hue / 2,
        saturation / 2,
        noise,
        arrayRelWidth
    )

    if(blur > 0)
      apply_FFT_filter(color_enhanced, canvasWidth, canvasHeight, blur)
    else {
      const histogram_data = getHistogramData(color_enhanced)

      postMessage({
        filtered: color_enhanced,
        histogram_data
      })
    }
  };
})

function apply_FFT_filter(imageData, cw, ch, blur) {
  const [ rData, gData, bData ] = splitColorChannels(imageData)
  const KERNEl_SIZE = blur + 4
  const SIGMA = blur + 1
  const kernel = generateGaussianKernel(KERNEl_SIZE, SIGMA)
  let channelState = [ false, false, false ]
  const [ rWorker, gWorker, bWorker ] = setupWorkers(imageData, channelState)
  const fftFilterData = {
    nRows: ch,
    nCols: cw,
    dims: [cw, ch],
    blur,
    kernel
  }
  rWorker.postMessage({
    ...fftFilterData,
    channelData: rData
  })
  gWorker.postMessage({
    ...fftFilterData,
    channelData: gData
  })
  bWorker.postMessage({
    ...fftFilterData,
    channelData: bData
  })

  for(let i = 3, h = 0; i < imageData.length; i+=4, h++) {
    imageData[i] = 255
  }
}

function splitColorChannels(imageData) {
  let rData = []
  let gData = []
  let bData = []

  for(let i = 0, h = 0; i < imageData.length; i+=4, h++){
    rData.push(imageData[i])
    gData.push(imageData[i+1])
    bData.push(imageData[i+2])
  }

  return [ rData, gData, bData ]
}

function setupWorkers(imageData, channelState) {
  let rWorker = new Worker('./fft_filter_worker.js')
  let gWorker = new Worker('./fft_filter_worker.js')
  let bWorker = new Worker('./fft_filter_worker.js')

  rWorker.onmessage = e => replaceColorChannel(e, imageData, 0, channelState);
  gWorker.onmessage = e => replaceColorChannel(e, imageData, 1, channelState);
  bWorker.onmessage = e => replaceColorChannel(e, imageData, 2, channelState);

  return [ rWorker, gWorker, bWorker ]
}

function replaceColorChannel(e, data, initialPosition, channelState) {
  let { channelData } = e.data

  for(let i = initialPosition, h = 0; i < data.length; i+=4, h++) {
    data[i] = Math.round(channelData[h])
  }

  channelState[initialPosition] = true

  // If all channels were convuluted, then get the histogram data and postMessage
  if(channelState[0] && channelState[1] && channelState[2]) {
    const histogram_data = getHistogramData(data)

    postMessage({
      filtered: data,
      histogram_data
    })
  }
}

function generateGaussianKernel(size, sigma) {
  const half = Math.floor(size/2)
  let kernel = Array(size)
  let sum = 0

  for(let x = -half; x <= half; x++){
    kernel[x+half] = Array(size).fill(0)
    for(let y = -half; y <= half; y++){
      let f_part = 1 / (2 * Math.PI * Math.pow(sigma, 2))
      let exp = Math.exp(- (Math.pow(x, 2) + Math.pow(y, 2)) / (2 * Math.pow(sigma, 2)) )
      kernel[x+half][y+half] = f_part * exp
      sum += kernel[x+half][y+half]
    }
  }

  kernel = kernel.map(arr => arr.map(v => v / sum))

  return kernel
}

const getHistogramData = (imgData) => {
  const histogramData =  {
      r: Array(255).fill(0),
      g: Array(255).fill(0),
      b: Array(255).fill(0)
  }

  let meanR = 0;
  let meanG = 0;
  let meanB = 0;

  for(let i = 0; i < imgData.length; i += 4 * 3) {
    meanR = Math.round((imgData[i] + imgData[i+4] + imgData[i+8]) / 3)
    meanG = Math.round((imgData[i+1] + imgData[i+5] + imgData[i+9]) / 3)
    meanB = Math.round((imgData[i+2] + imgData[i+6] + imgData[i+10]) / 3)
    histogramData.r[meanR] += 1
    histogramData.g[meanG] += 1
    histogramData.b[meanB] += 1
  }

  return histogramData
}


async function loadWasm() {
  try {
      return await import("external-wasm-philter");
  } catch (err) {
      console.error(`Unexpected error in loadWasm. [Message: ${err.message}]`);
      return null
  }
};