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

    const histogram_data_buff = get_histogram_data(filtered);

    const histogram_data = {
      r: histogram_data_buff.slice(0, 255),
      g: histogram_data_buff.slice(255, 510),
      b: histogram_data_buff.slice(510, 765),
    }

    postMessage({
      exp: exposure,
      filtered,
      histogram_data
    });
  };
})

async function loadWasm() {
  try {
      return await import("external-wasm-philter");
  } catch (err) {
      console.error(`Unexpected error in loadWasm. [Message: ${err.message}]`);
      return null
  }
};