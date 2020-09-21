importScripts("./wasm/wasm_philter.js");
// loadWasm().then(w => {wasm = w}); 
delete WebAssembly.instantiateStreaming;
wasmPhilter("./wasm/wasm_philter_bg.wasm")
.then(wasm => {
  const { apply_filters } = wasmPhilter
  // postMessage("BACK TO YOU BITCH!");
  onmessage = async e => {
    const { img, imageFilters, canvasWidth } = e.data;
    
    const { exposure, contrast, highlights, shadows } = imageFilters

    // apply(img, imageFilters, wasm, canvasWidth)
    const arrayRelWidth = (Math.floor(canvasWidth)-2)*4
    let filtered = apply_filters(
        img,
        exposure,
        contrast,
        highlights,
        shadows,
        arrayRelWidth
    )
    postMessage({
      t: "BACK TO YOU BITCH!",
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