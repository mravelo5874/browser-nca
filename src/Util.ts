import Rand from './lib/rand-seed'

// must be used inside an async functions
export function delay(ms: number) { return new Promise( resolve => setTimeout(resolve, ms))}

export function random_uint8_volume(width: number, depth: number, height: number, seed: string) : Uint8Array
{
    let size = width*depth*height*4;
    let rng = new Rand(seed);
    let array = new Uint8Array(size)
    for (let i = 0; i < size; i++) {
        array[i] = rng.next() * 255
    }
    console.log('array: ', array)
    return array
}