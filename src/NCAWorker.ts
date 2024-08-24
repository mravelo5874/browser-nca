/* eslint-disable no-restricted-globals */
import * as ort from 'onnxruntime-web';

class NCAWorker 
{
    transpose: ort.InferenceSession | null = null
    session: ort.InferenceSession | null = null
    state: ort.Tensor | null = null
    seed: Float32Array | null = null
    size: number = 0

    constructor() {
        this.create_transpose_session()
    }

    set_state(state: Float32Array,) {
        this.state = new ort.Tensor('float32', state, [1, 16, this.size, this.size, this.size])
    }

    reset() {
        if (!this.seed) return
        this.state = new ort.Tensor('float32', this.seed, [1, 16, this.size, this.size, this.size])
    }

    async create_transpose_session() {
        try {
            this.transpose = await ort.InferenceSession.create('./models/transpose_model.onnx')
        }
        catch (e) {
            console.log(e)
        }
    }

    async load_model(model: string, size: number, seed: Float32Array) {
        const path = './models/' + model + '.onnx'
        this.session = await ort.InferenceSession.create(path);
        this.size = size
        this.seed = seed
        this.reset()
    }

    async run_step() {
        if (this.session && this.state) {
            const input_feeds = { 'l_x_': this.state }
            const outputMap = await this.session.run(input_feeds)
            const new_state = outputMap.mul_1.data as Float32Array
            this.state = new ort.Tensor('float32', new_state, [1, 16, this.size, this.size, this.size])

            if (!this.transpose) return
            let s = this.size

            // Prepare the input feed
            let feeds: Record<string, ort.Tensor> = {};
            feeds['input'] = this.state;

            // Run inference
            const outputData = await this.transpose.run(feeds);
            const output = outputData['output'];
            let data = output.data as Float32Array

            // clip data to be between 0 and 1
            for (let i = 0; i < data.length; i++) {
                let x = data[i]
                if (x > 1.0) 
                    data[i] = 1.0
                else if (x < 0.0)
                    data[i] = 0.0
            }
            
            // * extract RGBA values from data
            let rgba = new Float32Array(s*s*s*4)
            let x = 0
            for (let i = 0; i < data.length; i += 16) {
                // * convert to [0-255] Uint8Array
                rgba[x+0] = data[i+0] * 255.0
                rgba[x+1] = data[i+1] * 255.0
                rgba[x+2] = data[i+2] * 255.0 
                rgba[x+3] = data[i+3] * 255.0
                x += 4
            }
            let rgba_uint8 = new Uint8Array(rgba)
            return rgba_uint8
        }
        return null
    }
    

}

const worker = new NCAWorker();

self.onmessage = async (event) => {
    const command: string = event.data[0]
    let shape: number[] = []

    switch (command) {
        case 'load-model':
            const model: string = event.data[1]
            const size: number = event.data[2]
            const seed: Float32Array = event.data[2]
            await worker.load_model(model, size, seed)
            self.postMessage(['load-model-complete'])
            break
        case 'reset':
            worker.reset()
            self.postMessage(['reset-complete'])
            break
        case 'set-state':
            const state: Float32Array = event.data[1]
            worker.set_state(state)
            self.postMessage(['set-state-complete'])
            break
        case 'run-step':
            shape = event.data[1]
            const new_state = await worker.run_step()
            self.postMessage([new_state])
            break;
        default:
          self.postMessage(['error! unknown command: ' + command]);
    }
}

export {}