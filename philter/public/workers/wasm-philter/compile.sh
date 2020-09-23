cargo build --release --target wasm32-unknown-unknown
wasm-bindgen target/wasm32-unknown-unknown/release/wasm_philter.wasm \
    --no-modules \
    --no-modules-global wasmPhilter \
    --no-typescript \
    --out-dir js