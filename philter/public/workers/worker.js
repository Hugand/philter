importScripts("./wasm-philter/js/wasm_philter.js");
// loadWasm().then(w => {wasm = w}); 
delete WebAssembly.instantiateStreaming;
wasmPhilter("./wasm-philter/js/wasm_philter_bg.wasm")
.then(wasm => {
  const { apply_filters, get_histogram_data } = wasmPhilter

  onmessage = async e => {
    const { img, imageFilters, canvasWidth } = e.data;
    const { exposure, contrast, highlights, shadows, saturation, hue } = imageFilters
    console.log(exposure/10)
    // apply(img, imageFilters, wasm, canvasWidth)
    const arrayRelWidth = (Math.floor(canvasWidth)-2)*4

    let filtered = apply_filters(
        img,
        exposure / 10,
        contrast,
        highlights / 20,
        shadows / 10,
        hue / 2,
        saturation / 2,
        arrayRelWidth
    )

    // const histogram_data_buff = get_histogram_data(filtered);

    const histogram_data = getHistogramData(filtered)
    console.log(histogram_data)

    postMessage({
      exp: exposure,
      filtered,
      histogram_data
    });
  };
})


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