mod utils;

extern crate wasm_bindgen;

use wasm_bindgen::prelude::*;

// When the `wee_alloc` feature is enabled, use `wee_alloc` as the global
// allocator.
#[cfg(feature = "wee_alloc")]
#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

#[wasm_bindgen]
extern {
    fn alert(s: &str);
}

#[wasm_bindgen]
extern "C" {
    // Use `js_namespace` here to bind `console.log(..)` instead of just
    // `log(..)`
    #[wasm_bindgen(js_namespace = console)]
    fn log(s: &str);

    // The `console.log` is quite polymorphic, so we can bind it with multiple
    // signatures. Note that we need to use `js_name` to ensure we always call
    // `log` in JS.
    #[wasm_bindgen(js_namespace = console, js_name = log)]
    fn log_u32(a: u32);

    // Multiple arguments too!
    #[wasm_bindgen(js_namespace = console, js_name = log)]
    fn log_many(a: &str, b: &str);
}

#[wasm_bindgen]
pub fn greet() {
    alert("Hello, wasm-philter!");
}

#[wasm_bindgen]
pub fn test(mut array: Vec<i32>) -> Vec<i32> {
    test_num(&mut array, 1);
    return array;
}

pub fn test_num(n: &mut Vec<i32>, i: usize) {
    n[i] = 1000;
    n[i+1] = 2000;
    n[i+2] = 3000;
}

#[wasm_bindgen]
pub fn apply_filters(
    mut elements: Vec<u8>,
    exposure: i16,
    contrast: f32,
    highlights: f32,
    shadows: f32,
    canvas_width: i32
) -> Vec<u8> {
    let mut i;
    let step = 4;
    
    let contrast_factor: f32 = (259.0*(contrast + 255.0))/(255.0*(259.0 - contrast));
    let highlight_factor: f32 = (259.0*((-1.0 * highlights) + 255.0))/(255.0*(259.0 - (-1.0 * highlights)));
    let shadow_factor: f32 = (259.0*((-1.0 * shadows) + 255.0))/(255.0*(259.0 - (-1.0 * shadows)));

    let initial_img_pos = canvas_width+(step*3);
    let final_img_pos = elements.len() as i32 - canvas_width - (step*3);
    let mut initial_row_pos = initial_img_pos;
    let mut final_row_pos = initial_row_pos + canvas_width - step;

    i = initial_img_pos;
    
    while i <= final_img_pos as i32 {
        apply_exposure(&mut elements, i as usize, exposure);
        apply_contrast(&mut elements, i as usize, contrast_factor);
        if highlight_factor != 1.0 || shadow_factor != 1.0 {
            apply_shadow_high_correction(
                &mut elements,
                i as usize,
                canvas_width,
                highlight_factor,
                shadow_factor,
                highlights as i16,
                shadows as i16
            );
        }

        if i == final_row_pos {
            initial_row_pos = i + step*3;
            final_row_pos = initial_row_pos + canvas_width - step;
            i = initial_row_pos;
        } else {
            i += step;
        }
    }

    return elements;
}

pub fn apply_exposure(pixel: &mut Vec<u8>, pos: usize, exposure: i16) {
    pixel[pos] = clamp(0, 255, pixel[pos] as i16 + exposure);
    pixel[pos+1] = clamp(0, 255, pixel[pos+1] as i16 + exposure);
    pixel[pos+2] = clamp(0, 255, pixel[pos+2] as i16 + exposure);
}

pub fn apply_contrast(pixel: &mut Vec<u8>, pos: usize, factor: f32){
    pixel[pos] = clamp(0, 255, (factor * (pixel[pos] as f32 - 128.0) + 128.0).round() as i16);
    pixel[pos+1] = clamp(0, 255, (factor * (pixel[pos+1] as f32 - 128.0) + 128.0).round() as i16);
    pixel[pos+2] = clamp(0, 255, (factor * (pixel[pos+2] as f32 - 128.0) + 128.0).round() as i16);
}

pub fn clamp(min: u8, max: u8, val: i16) -> u8 {
    if val < min as i16 {
        return min;
    } else if val > max as i16 {
        return max;
    } else {
        return val as u8;
    }
}

pub fn apply_shadow_high_correction(
    mut pixel: &mut Vec<u8>,
    pos: usize,
    canvas_width: i32,
    highlight_factor: f32,
    shadow_factor: f32,
    highlights: i16,
    shadows: i16,
){
    let SHADOW_THRESHOLD = 45;
    let HIGHLIGHT_THRESHOLD = 75;
    let mean: i16 = calculate_statistics(pixel, pos, canvas_width);

    let is_shadow = mean < SHADOW_THRESHOLD;
    let is_highlight = mean > HIGHLIGHT_THRESHOLD;

    if is_highlight && highlight_factor != 1.0 {
        apply_contrast(&mut pixel, pos, highlight_factor);
        // apply_exposure(&mut pixel, pos, -1 * highlights)
    } else if is_shadow && shadow_factor != 1.0 {
        apply_contrast(&mut pixel, pos, shadow_factor);
        // apply_exposure(&mut pixel, pos, -1 * shadows)
    }
}

pub fn calculate_statistics(mut pixel: &mut Vec<u8>, pos: usize, canvas_width: i32) -> i16 {
    let init_index: i32 = pos as i32 - canvas_width - 4;
    let final_index: i32 = pos as i32 + canvas_width + 4;
    let value_list: [u8; 9] = [
        get_rgb_to_hsv_value(&mut pixel, init_index as usize),
        get_rgb_to_hsv_value(&mut pixel, (pos as i32 - canvas_width) as usize),
        get_rgb_to_hsv_value(&mut pixel, (pos as i32 - canvas_width + 4) as usize),
        get_rgb_to_hsv_value(&mut pixel, (pos as i32 - 4) as usize),
        get_rgb_to_hsv_value(&mut pixel, pos as usize),
        get_rgb_to_hsv_value(&mut pixel, (pos as i32 + 4) as usize),
        get_rgb_to_hsv_value(&mut pixel, (pos as i32 + canvas_width - 4) as usize),
        get_rgb_to_hsv_value(&mut pixel, (pos as i32 + canvas_width) as usize),
        get_rgb_to_hsv_value(&mut pixel, final_index as usize),
    ];
    let mut mean: i16 = 0;
    // let mut variance: i16 = 0;

    for val in value_list.iter() {
        mean += *val as i16;
    }

    mean /= 9;

    // for val in value_list.iter() {
    //     variance += (mean - (*val as i16)) * (mean - (*val as i16));
    // }

    // variance /= 9;
    
    return mean;
}

pub fn get_rgb_to_hsv_value(pixel: &mut Vec<u8>, pos: usize) -> u8 {
    if pixel[pos] > pixel[pos+1] &&  pixel[pos] > pixel[pos+2] {
        return (100.0 * (pixel[pos] as f32 / 255.0)) as u8;
    } else if pixel[pos+1] > pixel[pos] &&  pixel[pos+1] > pixel[pos+2] {
        return (100.0 * (pixel[pos+1] as f32 / 255.0)) as u8;
    } else {
        return (100.0 * (pixel[pos+2] as f32 / 255.0)) as u8;
    }
}