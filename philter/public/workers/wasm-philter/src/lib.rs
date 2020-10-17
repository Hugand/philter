mod utils;
extern crate wasm_bindgen;
use crate::utils::set_panic_hook;
use wasm_bindgen::prelude::*;
use num_traits::pow;
use js_sys::Math::random;
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
pub fn get_histogram_data(elements: Vec<u8>) -> Vec<i16>{
    let mut histogram_data: [i16; 766] = [0; 766];

    let mut r;
    let mut g;
    let mut b;

    let mut i = 0;

    while i < elements.len() {
        r = elements[i];
        g = elements[i+1];
        b = elements[i+2];

        histogram_data[r as usize] += 1;
        histogram_data[255 + g as usize] += 1;
        histogram_data[510 + b as usize] += 1;

        i += 4;
    }

    return histogram_data.to_vec();
}

#[wasm_bindgen]
pub fn apply_filters(
    mut elements: Vec<u8>,
    exposure: f32,
    contrast: f32,
    highlights: f32,
    shadows: f32,
    hue: i16,
    saturation: i16,
    noise: i16,
    invert_colors: u8,
    b_w: u8,
    canvas_width: i32
) -> Vec<u8> {
    set_panic_hook();

    let mut i;
    let step = 4;
    
    let contrast_factor: f32 = (259.0*(contrast + 255.0))/(255.0*(259.0 - contrast));

    let initial_img_pos = canvas_width+(step*3);
    let final_img_pos = elements.len() as i32 - canvas_width - (step*3);
    let mut initial_row_pos = initial_img_pos;
    let mut final_row_pos = initial_row_pos + canvas_width - step;

    i = initial_img_pos;
    
    while i <= final_img_pos as i32 {
        if exposure != 0.0 {
            apply_exposure(&mut elements, i as usize, exposure);
        }
        
        if contrast != 0.0 {
            apply_contrast(&mut elements, i as usize, contrast_factor);
        }

        if highlights != 0.0 || shadows != 0.0 {
            apply_shadow_high_correction(
                &mut elements,
                i as usize,
                canvas_width,
                highlights,
                shadows
            );
        }

        if hue != 0 || saturation != 0 {
            apply_hsv_adjustments(&mut elements, i as usize, hue, saturation);
        }

        if noise != 0 {
            apply_noise(&mut elements, i as usize, noise as usize);
        }

        if invert_colors == 1 {
            apply_color_invert(&mut elements, i as usize);
        }

        if b_w > 0 {
            apply_black_white(&mut elements, i as usize, b_w as usize);
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

pub fn apply_exposure(pixel: &mut Vec<u8>, pos: usize, exposure: f32) {
    pixel[pos] = clamp(0, 255, (pixel[pos] as f32 * (exposure + 1.0)) as i16) as u8;
    pixel[pos+1] = clamp(0, 255, (pixel[pos+1] as f32 * (exposure + 1.0)) as i16) as u8;
    pixel[pos+2] = clamp(0, 255, (pixel[pos+2] as f32 * (exposure + 1.0)) as i16) as u8;
}

pub fn apply_contrast(pixel: &mut Vec<u8>, pos: usize, factor: f32){
    pixel[pos] = clamp(0, 255, (factor * (pixel[pos] as f32 - 128.0) + 128.0).round() as i16) as u8;
    pixel[pos+1] = clamp(0, 255, (factor * (pixel[pos+1] as f32 - 128.0) + 128.0).round() as i16) as u8;
    pixel[pos+2] = clamp(0, 255, (factor * (pixel[pos+2] as f32 - 128.0) + 128.0).round() as i16) as u8;
}
pub fn apply_shadow_high_correction(
    mut pixel: &mut Vec<u8>,
    pos: usize,
    canvas_width: i32,
    highlights: f32,
    shadows: f32,
){
    let stats: [f32; 2] = calculate_statistics(pixel, pos, canvas_width);
    let mean = stats[0];
    // let variance = stats[1];
    // let v: f32 = calculate_v(&mut pixel, pos as usize) as f32;

    let shadow_exposure: f32 = calculate_shadow_exposure(mean, shadows);
    let highlight_exposure: f32 = calculate_highlight_exposure(mean, highlights);
    
    // Adjust shadows
    if shadows != 0.0{
        apply_exposure(&mut pixel, pos, shadow_exposure);
    }

    // Adjust highlights
    if highlights != 0.0 {
        apply_exposure(&mut pixel, pos, highlight_exposure);
    }
}

pub fn apply_color_invert(pixel: &mut Vec<u8>, pos: usize) {
    pixel[pos] = 255 - pixel[pos];
    pixel[pos+1] = 255 - pixel[pos+1];
    pixel[pos+2] = 255 - pixel[pos+2];
}

pub fn apply_black_white(pixel: &mut Vec<u8>, pos: usize, b_w: usize) {
    let b_w_channel: usize = pos + b_w - 1;

    pixel[pos] = pixel[b_w_channel];
    pixel[pos+1] = pixel[b_w_channel];
    pixel[pos+2] = pixel[b_w_channel];
}

pub fn apply_noise(pixel: &mut Vec<u8>, pos: usize, noise: usize) {
    // let mut rng = thread_rng();
    let is_pixel_noisy: bool = generate_rand(100) as usize <= noise;
    let c_max = calculate_c_max(pixel[pos] as f32, pixel[pos+1] as f32, pixel[pos+2] as f32) as u8;
    let pixel_change: u8 = generate_rand((if 255 - c_max >= 100 { 100 } else { 255 - c_max }) as i16) as u8;
    
    if is_pixel_noisy {
        pixel[pos] = pixel[pos] + pixel_change;
        pixel[pos+1] = pixel[pos+1] + pixel_change;
        pixel[pos+2] = pixel[pos+2] + pixel_change;

        pixel[pos] = clamp(0, 255, pixel[pos] as i16) as u8;
        pixel[pos+1] = clamp(0, 255, pixel[pos+1] as i16) as u8;
        pixel[pos+2] = clamp(0, 255, pixel[pos+2] as i16) as u8;
    }
}

pub fn generate_rand(max: i16) -> i16 {
    let rand_num: i16 = (random() * max as f64) as i16;

    return rand_num;
}

pub fn apply_hsv_adjustments(pixel: &mut Vec<u8>, pos: usize, hue: i16, saturation: i16) {
    let mut hsv: [i16; 3] = rgb_to_hsv(pixel[pos] as f32, pixel[pos+1] as f32, pixel[pos+2] as f32);

    hsv[0] = clamp(0, 360, hsv[0] + hue) as i16;
    hsv[1] = clamp(0, 100, hsv[1] + saturation) as i16;

    let rgb = hsv_to_rgb(hsv[0], hsv[1] as f32 * 0.01, hsv[2] as f32 * 0.01);

    pixel[pos] = clamp(0, 255, rgb[0] as i16) as u8;
    pixel[pos+1] = clamp(0, 255, rgb[1] as i16) as u8;
    pixel[pos+2] = clamp(0, 255, rgb[2] as i16) as u8;
}

pub fn calculate_statistics(mut pixel: &mut Vec<u8>, pos: usize, canvas_width: i32) -> [f32; 2] {
    let init_index: i32 = pos as i32 - canvas_width - 4;
    let final_index: i32 = pos as i32 + canvas_width + 4;
    let value_list: [u8; 9] = [
        calculate_v(&mut pixel, init_index as usize),
        calculate_v(&mut pixel, (pos as i32 - canvas_width) as usize),
        calculate_v(&mut pixel, (pos as i32 - canvas_width + 4) as usize),
        calculate_v(&mut pixel, (pos as i32 - 4) as usize),
        calculate_v(&mut pixel, pos as usize),
        calculate_v(&mut pixel, (pos as i32 + 4) as usize),
        calculate_v(&mut pixel, (pos as i32 + canvas_width - 4) as usize),
        calculate_v(&mut pixel, (pos as i32 + canvas_width) as usize),
        calculate_v(&mut pixel, final_index as usize),
    ];
    let mut mean: f32 = 0.0;
    let mut variance: f32 = 0.0;

    for val in value_list.iter() {
        mean += *val as f32;
    }

    mean /= 9.0;

    for val in value_list.iter() {
        variance += (mean - (*val as f32)) * (mean - (*val as f32));
    }

    variance /= 9.0;
    
    return [ mean, variance ];
}

pub fn calculate_shadow_exposure(v: f32, shadows: f32) -> f32 {
    if v >= 0.0 && v < 20.0 {
        return shadows;
    } else if v >= 20.0 && v < 34.0 {
        return (- pow(0.2 * v - 2.0, 2) as f32 + 50.0) / 50.0 * shadows;
    } else if v >= 34.0 && v < 71.0 {
        return (0.0307 * pow(v - 71.0, 2) as f32) / 50.0 * shadows;
    } else {
        return 0.0;
    }
}

pub fn calculate_highlight_exposure(v: f32, highlights: f32) -> f32 {
    if v >= 0.0 && v < 29.0 {
        return 0.0;
    } else if v >= 29.0 && v < 66.0 {
        return (0.0307 * pow(v - 29.0, 2) as f32) / 50.0 * highlights;
    } else if v >= 66.0 && v < 88.0 {
        return (- pow(0.2 * v - 16.0, 2) as f32 + 50.0) / 50.0 * highlights;
    } else {
        return highlights;
    }
}


pub fn rgb_to_hsv(r: f32, g: f32, b: f32) -> [i16; 3] {
    let _r: f32 = r / 255.0;
    let _g: f32 = g / 255.0;
    let _b: f32 = b / 255.0;
    let c_max: f32 = calculate_c_max(_r, _g, _b);
    let c_min: f32 = calculate_c_min(_r, _g, _b);
    let delta = c_max - c_min;
    
    let h = calculate_h(_r, _g, _b, delta, c_max);
    let s = calculate_s(delta, c_max);
    let v = (100.0 * c_max) as u8;
    
    return [h, s as i16, v as i16];
}

pub fn hsv_to_rgb(h: i16, s: f32, v: f32) -> [u8; 3] {
    let c = v * s;
    let x = c as f32 * ( 1.0 - ((h as f32 / 60.0) % 2.0 - 1.0).abs());
    let m = v - c;
    let mut buff: [f32; 3] = [0.0, 0.0, 0.0];
    if h >= 0 && h < 60 {
        buff = [c, x, 0.0];
    } else if h >= 60 && h < 120 {
        buff = [x, c, 0.0];
    } else if h >= 120 && h < 180 {
        buff = [0.0, c, x];
    } else if h >= 180 && h < 240 {
        buff = [0.0, x, c];
    } else if h >= 240 && h < 300 {
        buff = [x, 0.0, c];
    } else if h >= 300 && h < 360 {
        buff = [c, 0.0, x];
    }

    return [
        ((buff[0] + m) * 255.0) as u8,
        ((buff[1] + m) * 255.0) as u8,
        ((buff[2] + m) * 255.0) as u8
    ];

}

pub fn calculate_h(r: f32, g: f32, b: f32, delta: f32, c_max: f32) -> i16 {
    if delta == 0.0 {
        return 0;
    } else if c_max == r {
        return (60.0 * ( ((g - b) as f32 / delta) % 6.0) ) as i16;
    } else if c_max == g {
        return (60.0 * ( ((b - r) / delta) + 2.0) ) as i16;
    } else if c_max == b {
        return (60.0 * ( ((r - g) / delta) + 4.0) ) as i16;
    } else { return 0; }
}

pub fn calculate_s(delta: f32, c_max: f32) -> u8 {
    if c_max == 0.0 { return 0; }
    else { return (100.0 * delta / c_max) as u8; }
}

pub fn calculate_v(pixel: &mut Vec<u8>, pos: usize) -> u8 {
    let c_max = calculate_c_max(pixel[pos] as f32, pixel[pos+1] as f32, pixel[pos+2] as f32);

    if c_max == pixel[pos] as f32 {
        return (100.0 * (pixel[pos] as f32 / 255.0)) as u8;
    } else if c_max == pixel[pos+1] as f32 {
        return (100.0 * (pixel[pos+1] as f32 / 255.0)) as u8;
    } else if c_max == pixel[pos+2] as f32 {
        return (100.0 * (pixel[pos+2] as f32 / 255.0)) as u8;
    } else { return 0; }
}

pub fn calculate_c_max(r: f32, g: f32, b: f32) -> f32 {
    if r >= g && r >= b { return r; }
    else if g >= b && g >= r { return g; }
    else if b >= r && b >= g { return b; }
    else { return 0.0; }
}

pub fn calculate_c_min(r: f32, g: f32, b: f32) -> f32 {
    if r <= g && r <= b { return r; }
    else if g <= b && g <= r { return g; }
    else if b <= r && b <= g { return b; }
    else { return 0.0; }
}

pub fn clamp(min: i16, max: i16, val: i16) -> i16 {
    if val < min{
        return min;
    } else if val > max{
        return max;
    } else {
        return val;
    }
}
