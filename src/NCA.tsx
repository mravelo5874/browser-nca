import * as ort from 'onnxruntime-web'
import Rand from './lib/rand-seed'

export { NCA }

class NCA 
{
    session: ort.InferenceSession | null = null
    transpose: ort.InferenceSession | null = null
    state: ort.Tensor | null = null
    size: number = 0
    seed: ort.Tensor | null = null
    worker: Worker | null = null
    worker_running: boolean = false

    constructor() {
        this.create_transpose_session()
    }

    async create_transpose_session() {
        try {
            this.transpose = await ort.InferenceSession.create('./models/transpose_model.onnx')
        }
        catch (e) {
            console.log(e)
        }
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
        
        // * start worker
        this.start_worker()
    }

    async run_model() {
        if (!this.session || !this.state)
            return

        // run this in an async method:
        const feeds = { 'l_x_': this.state }
        const outputMap = await this.session.run(feeds)
        const data = outputMap.mul_1.data as Float32Array
        this.state = new ort.Tensor('float32', data, [1, 16, this.size, this.size, this.size])
    }

    is_ready() {
        return (this.session && this.state)
    }

    async get_state() {
        if (this.state && this.transpose) {
            let s = this.size

            // Prepare the input feed
            const feeds: Record<string, ort.Tensor> = {};
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

    worker_loop() {
        if (!this.worker_running) return
        if (!this.worker) return

        this.worker.postMessage([])
        this.worker.onmessage = (event) => {   
            if (this.worker_running) {
                // recieve message from worker and update volume
                let res = event.data[0]
                console.log(res)
                this.worker_loop()
            }
        }
    }

    start_worker() {
        if (this.worker && this.worker_running) this.worker.terminate()
        console.log('About to create worker')
        this.worker = new Worker('Worker.js')
        console.log('Worker created')
        this.worker_running = true
        this.worker_loop()
        
    }

    stop_worker() {
        if (!this.worker_running) return
        if (!this.worker) return
        this.worker_running = false
        this.worker.terminate()
    }
}