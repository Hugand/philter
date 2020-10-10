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
      blur
    } = imageFilters
    // apply(img, imageFilters, wasm, canvasWidth)
    const arrayRelWidth = (Math.floor(canvasWidth)-2)*4

    let color_enhanced = apply_filters(
        img,
        exposure / 10,
        contrast,
        highlights / 20,
        shadows / 10,
        hue / 2,
        saturation / 2,
        arrayRelWidth
    )

    let fft_filtered = apply_FFT_filter(color_enhanced, [canvasWidth, canvasHeight], blur)

    const histogram_data = getHistogramData(fft_filtered)
    console.log(histogram_data)

    postMessage({
      exp: exposure,
      filtered: fft_filtered,
      histogram_data
    });
  };
})

function apply_FFT_filter(imageData, dims, sigma) {
  var [nCols, nRows] = dims

  let rData = []
  let gData = []
  let bData = []

  // Split color channel
  for(let i = 0, h = 0; i < imageData.length; i+=4, h++){
    rData.push(imageData[i])
    gData.push(imageData[i+1])
    bData.push(imageData[i+2])
  }

  // Create margins to have Radix2 image sizes
  let rDataBuff = FFTUtils.toRadix2(rData, nRows, nCols);
  let gDataBuff = FFTUtils.toRadix2(gData, nRows, nCols);
  let bDataBuff = FFTUtils.toRadix2(bData, nRows, nCols);

  rData = rDataBuff.data
  gData = gDataBuff.data
  bData = bDataBuff.data

  nRows = rDataBuff.rows
  nCols = rDataBuff.cols

  const kernel = generateGaussianKernel(5, sigma)

  // CONVOLVE IMAGE WITH KERNEL
  var iftDataR =  FFTUtils.convolute(rData, kernel, nRows, nCols);
  var iftDataG =  FFTUtils.convolute(gData, kernel, nRows, nCols);
  var iftDataB =  FFTUtils.convolute(bData, kernel, nRows, nCols);

  // CROP THE IMAGE TO REMOVE PADDING
  iftDataR = FFTUtils.crop(iftDataR, nRows, nCols, dims[1], dims[0])
  iftDataG = FFTUtils.crop(iftDataG, nRows, nCols, dims[1], dims[0])
  iftDataB = FFTUtils.crop(iftDataB, nRows, nCols, dims[1], dims[0])

  // APPLY CHANGES TO NEWIMAGEDATA
  for(let i = 0, h = 0; i < imageData.length; i+=4, h++) {
    imageData[i] = Math.round(iftDataR[h])
    imageData[i+1] = Math.round(iftDataG[h])
    imageData[i+2] = Math.round(iftDataB[h])
    imageData[i+3] = 255
  }

  return imageData
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
  console.log(imgData)
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