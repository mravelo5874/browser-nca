import * as ort from 'onnxruntime-web'
import { cowboy16, earth, oak, oak_seed } from './data/all'

export { NCA, NCAmodels }

const NCAmodels: string[] = [
    'oak',
    'earth'
]

const oak_data = {
    'model': 'oak_aniso',
    'size': 32,
    'seed': new Float32Array(oak_seed)
}

class NCA
{
    private transpose: ort.InferenceSession | null = null
    private state: Float32Array | null = null
    private size: number | null = null

    private worker: Worker | null = null
    private current_worker: string | null = null

    private worker_ready: boolean = false
    private worker_running: boolean = false
    private worker_steps: number = 0
    private rgba: Uint8Array | null = null

    constructor () { 
        this.worker_ready = false
        this.init_transpose_model()
    }

    public load_model_worker(model: string) {
        // * assert model is valid
        if (!NCAmodels.includes(model)) {
            console.log('[NCA -- load_model_worker] invalid model: \"'+model+'\"')
        }
        // * terinate current worker
        this.terminate()
        this.worker_steps = 0
        // * init model worker
        switch(model) {
        case 'oak':
            this.size = oak_data['size']
            this.state = oak_data['seed']
            this.current_worker = model
            this.worker = new Worker(new URL('./OakWorker.ts', import.meta.url), { type: 'module' })
            this.worker.postMessage({ type: 'init' })
            this.worker.onmessage = (event) => {
                if (event.data.type === 'init-complete') {
                    this.worker_ready = true
                    console.log('[NCA -- load_model] worker is ready!')
                }
            }
            break
        }
    }

    public update() {
        this.start_model()
    }

    public reset() {
        if (!this.current_worker) return
        this.load_model_worker(this.current_worker)
    }

    public terminate() {
        // * terinate current worker
        this.worker_ready = false
        this.worker_running = false
        this.worker?.terminate()
    }
    
    async init_transpose_model() {
        try { this.transpose = await ort.InferenceSession.create('./models/transpose_model.onnx') }
        catch (e) { console.log('error! unable to create transpose session: ' + e) }
    }

    public get_rgba() {
        return this.rgba
    }

    public get_size() {
        return this.size
    }

    public get_worker_steps() {
        return this.worker_steps
    }

    public start_model() {
        // * assert worker is ready
        if (!this.worker_ready) {
            //console.log('[NCA -- start_model] worker is not ready -- returning')
            return
        } 
        // * assert worker is not already running
        if (this.worker_running) {
            //console.log('[NCA -- start_model] worker is already running -- returning')
            return
        } 

        // * begin worker loop
        this.worker_running = true
        this.worker_loop()
    }

    private async worker_loop() {
        if (!this.worker) return
        if (!this.worker_running) return

        // * send current state to worker
        this.worker.postMessage({ type: 'run', data: [this.state, this.size]})
        this.worker.onmessage = (event) => {

            // * recieve new state -- convert to rgba
            if (event.data.type === 'result') {
                const new_state = event.data.data
                this.state = new_state
                this.convert_to_rgba()
                this.worker_steps += 1
            }
            else if (event.data.type === 'error') {
                this.terminate()
                console.log('[NCA -- worker_loop] error! current worker -- terminating')
            }

            // * continue worker loop
            if (this.worker_running)
                this.worker_loop()
        }
    }

    private async convert_to_rgba() {  
        // * if transpose session is null -- create it
        if (!this.transpose) {
            console.log('[NCA -- convert_to_rgba] transpose model is not created yet -- creating now')
            await this.init_transpose_model().then(() => {
                this.convert_to_rgba()
                return
            })
        }
        if (!this.transpose) return
        if (!this.state) return
        if (!this.size) return

        // * transpose data
        let feeds: Record<string, ort.Tensor> = {};
        const input = new ort.Tensor('float32', this.state, [1, 16, this.size, this.size, this.size])
		const input_feeds = { 'input': input }
        const output = await this.transpose.run(input_feeds)
        let data = output['output'].data as Float32Array

        // * clip data to be between 0 and 1
        for (let i = 0; i < data.length; i++) {
            let x = data[i]
            if (x > 1.0) 
                data[i] = 1.0
            else if (x < 0.0)
                data[i] = 0.0
        }
        
        // * extract RGBA values from data
        let rgba = new Float32Array(this.size*this.size*this.size*4)
        let x = 0
        for (let i = 0; i < data.length; i += 16) {
            // * convert to [0-255] Uint8Array
            rgba[x+0] = data[i+0] * 255.0
            rgba[x+1] = data[i+1] * 255.0
            rgba[x+2] = data[i+2] * 255.0 
            rgba[x+3] = data[i+3] * 255.0
            x += 4
        }
        this.rgba = new Uint8Array(rgba)
    }
}