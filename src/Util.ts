import Rand from './lib/rand-seed'
import { Vec4 } from './lib/rary'


// * delay function must be used inside an async function
export function delay(ms: number) { return new Promise( resolve => setTimeout(resolve, ms))}

export function random_uint8_volume(width: number, depth: number, height: number, seed: string, alpha_mult: number = 1.0) : Uint8Array
{
    let size = width*depth*height*4;
    let rng = new Rand(seed);
    let array = new Uint8Array(size)
    for (let i = 0; i < size; i++) {
        let n = rng.next() * 255
        if ((i+1) % 4 === 0) {
            n *= alpha_mult
        }
        array[i] = n
    }
    return array
}

export function create_dummy_array(size: number, seed: string = '0123456789') {
    let array = []
    let rng = new Rand(seed)
    for (let i = 0; i < size; i++) {
        array.push(rng.next())
    }
    return new Float32Array(array)
}

export function convert_hexcolor_to_rgba(hexcolor: string) {
    // * remove the hash if it's there
    let hex = hexcolor.replace(/^#/, '')

    // * parse the hex string
    let r, g, b, a
    if (hex.length === 3) {
        // * short notation (#RGB)
        r = parseInt(hex[0] + hex[0], 16)
        g = parseInt(hex[1] + hex[1], 16)
        b = parseInt(hex[2] + hex[2], 16)
        a = 255
    } else if (hex.length === 4) {
        // * short notation with alpha (#RGBA)
        r = parseInt(hex[0] + hex[0], 16)
        g = parseInt(hex[1] + hex[1], 16)
        b = parseInt(hex[2] + hex[2], 16)
        a = parseInt(hex[3] + hex[3], 16)
    } else if (hex.length === 6) {
        // * full notation (#RRGGBB)
        r = parseInt(hex.slice(0, 2), 16)
        g = parseInt(hex.slice(2, 4), 16)
        b = parseInt(hex.slice(4, 6), 16)
        a = 255
    } else if (hex.length === 8) {
        // * full notation with alpha (#RRGGBBAA)
        r = parseInt(hex.slice(0, 2), 16)
        g = parseInt(hex.slice(2, 4), 16)
        b = parseInt(hex.slice(4, 6), 16)
        a = parseInt(hex.slice(6, 8), 16)
    } else {
        throw new Error('Invalid hex color format')
    }

    // * convert to 0-1 range
    return new Vec4([
        r / 255,
        g / 255,
        b / 255,
        a / 255
    ])
}