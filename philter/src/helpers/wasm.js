export async function loadWasm() {
    try {
        return await import("external-wasm-philter");
    } catch (err) {
        console.error(`Unexpected error in loadWasm. [Message: ${err.message}]`);
        return null
    }
};