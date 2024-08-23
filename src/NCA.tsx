import * as ort from 'onnxruntime-web';
import Rand from './lib/rand-seed'

export { NCA }

class NCA 
{
    session: ort.InferenceSession | null = null
    state: ort.Tensor | null = null
    size: number = 0
    seed: ort.Tensor | null = null

    constructor() {

    }

    create_dummy_array(size: number) {
        let array = []
        let rng = new Rand('0123456789')
        for (let i = 0; i < size; i++) {
            array.push(rng.next())
        }
        return new Float32Array(array)
    }

    async load_model(model_name: string, size: number, seed_array: Float32Array): Promise<void> {
        const path = './models/' + model_name + '.onnx'
        console.log('loading new model: ' + path)
        this.session = await ort.InferenceSession.create(path);
        this.size = size
        this.seed = new ort.Tensor('float32', seed_array, [1, 16, size, size, size])
        this.state = this.seed
        console.log('finished loading model...')
    }

    async run_model() {
        if (!this.session || !this.state)
            return

        // run this in an async method:
        const feeds = { 'l_x_': this.state }
        // console.log('before: '+this.state.data)
        const outputMap = await this.session.run(feeds)
        console.log(outputMap)
        const data = outputMap.mul_1.data as Float32Array
        this.state = new ort.Tensor('float32', data, [1, 16, this.size, this.size, this.size])
        // console.log('after: '+this.state.data)
    }

    is_ready() {
        return (this.session && this.state)
    }

    get_state() {
        if (this.state) {
            let s = this.size
            let rgba = new Float32Array(s*s*s*4)
            let data = this.state?.data as Float32Array
            // * extract RGBA values from data
            let x = 0
            for (let i = 0; i < data.length; i += 16) {
                // * convert to [0-255] Uint8Array
                rgba[x+0] = data[i+0] * 255.0
                rgba[x+1] = data[i+1] * 255.0
                rgba[x+2] = data[i+2] * 255.0 
                rgba[x+3] = data[i+3] * 255.0
                x += 4
            }
            return new Uint8Array(rgba)
        }
        return null
    }
}