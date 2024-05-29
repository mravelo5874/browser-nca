import Rand from './lib/rand-seed'

// must be used inside an async functions
export function delay(ms: number) { return new Promise( resolve => setTimeout(resolve, ms))}

export function random_uint8_volume(width: number, depth: number, height: number, seed: string, alpha_mult: number = 1.0) : Uint8Array
{
    let size = width*depth*height*4;
    let rng = new Rand(seed);
    let array = new Uint8Array(size)
    for (let i = 0; i < size; i++) {
        let n = rng.next() * 255
        if ((i+1) % 4 == 0) {
            n *= alpha_mult
        }
        array[i] = n
    }
    return array
}