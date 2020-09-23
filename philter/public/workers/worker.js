importScripts("./wasm-philter/js/wasm_philter.js");
// loadWasm().then(w => {wasm = w}); 
delete WebAssembly.instantiateStreaming;
wasmPhilter("./wasm-philter/js/wasm_philter_bg.wasm")
.then(wasm => {
  const { apply_filters } = wasmPhilter

  onmessage = async e => {
    const { img, imageFilters, canvasWidth } = e.data;
    const { exposure, contrast, highlights, shadows } = imageFilters
console.log(exposure/10)
    // apply(img, imageFilters, wasm, canvasWidth)
    const arrayRelWidth = (Math.floor(canvasWidth)-2)*4
    let filtered = apply_filters(
        img,
        exposure / 10,
        contrast,
        highlights,
        shadows / 10,
        arrayRelWidth
    )
    postMessage({
      exp: exposure,
      filtered
    });
  };
})

async function loadWasm(){
  try {
      return await import("external-wasm-philter");
  } catch (err) {
      console.error(`Unexpected error in loadWasm. [Message: ${err.message}]`);
      return null
  }
};