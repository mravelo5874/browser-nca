import * as ort from 'onnxruntime-web'
import * as data from './data/nca-data'

export class NCA
{
    private transpose: ort.InferenceSession | null = null
    private state: Float32Array | null = null
    private size: number | null = null
    private model: string | null = null
    private worker: Worker | null = null
    private current_worker: string | null = null
    private worker_ready: boolean = false
    private worker_running: boolean = false
    private worker_steps: number = 0
    private rgba: Uint8Array | null = null
    private apply_damage_next: boolean = false
    private paused: boolean = false

    constructor () { 
        this.worker_ready = false
        this.init_transpose_model()
    }

    public update() {
        this.start_model()
    }

    public start_model() {
        if (!this.worker_ready) return
        if (this.worker_running) return
        this.worker_running = true
        this.worker_loop()
    }

    public toggle_paused() {
        this.paused = !this.paused
    }

    public reset() {
        if (!this.current_worker) return
        this.load_model_worker(this.current_worker)
    }

    public terminate() {
        this.worker_ready = false
        this.worker_running = false
        this.worker?.terminate()
    }
    
    async init_transpose_model() {
        try { this.transpose = await ort.InferenceSession.create('./models/transpose_model_v1.onnx') }
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

    public apply_damage() {
        this.apply_damage_next = true
    }

    public load_model_worker(model: string) {
        // * assert model is valid
        if (!data.NCAmodels.includes(model)) {
            console.log('[NCA -- load_model_worker] invalid model: "'+model+'"')
        }
        // * terinate current worker
        this.terminate()
        this.worker_steps = 0
        // * init model worker
        switch (model) {
        case 'oak':
            this.model = data.oak_data['model']
            this.size = data.oak_data['size']
            this.state = data.oak_data['seed']
            break
        case 'sphere':
            this.model = data.sphere_data['model']
            this.size = data.sphere_data['size']
            this.state = data.sphere_data['seed']
            break
        case 'rubiks':
            this.model = data.rubiks_data['model']
            this.size = data.rubiks_data['size']
            this.state = data.rubiks_data['seed']
            break
        case 'burger':
            this.model = data.burger_data['model']
            this.size = data.burger_data['size']
            this.state = data.burger_data['seed']
            break
        case 'cowboy':
            this.model = data.cowboy_data['model']
            this.size = data.cowboy_data['size']
            this.state = data.cowboy_data['seed']
            break
        case 'earth':
            this.model = data.earth_data['model']
            this.size = data.earth_data['size']
            this.state = data.earth_data['seed']
            break
        case 'cactus':
            this.model = data.cactus_data['model']
            this.size = data.cactus_data['size']
            this.state = data.cactus_data['seed']
            break
        case 'maze':
            this.model = data.maze_data['model']
            this.size = data.maze_data['size']
            this.state = data.maze_data['seed']
            break
        case 'minicube':
            this.model = data.minicube_data['model']
            this.size = data.minicube_data['size']
            this.state = data.minicube_data['seed']
            break
        }
        this.convert_to_rgba()
        this.current_worker = model
        this.worker = new Worker(new URL('./NCAWorker.ts', import.meta.url), { type: 'module' })
        console.log(`[NCA.tsx] loaded new model: ${model}`)
        this.worker.postMessage({ type: 'init', data: [this.model] })
        this.worker.onmessage = (event) => {
            if (event.data.type === 'init-complete') {
                this.worker_ready = true
                // console.log('[NCA -- load_model] worker is ready!')
            }
        }
    }

    private async worker_loop() {
        if (!this.worker) return
        if (!this.worker_running) return

        if (this.paused) {
            setTimeout(() => {
                this.worker_loop()
            }, 100)
            return
        }

        let worker_cmd = 'run'

        // * apply damage to current state
        if (this.apply_damage_next) {
            this.apply_damage_next = false
            worker_cmd = 'dmg'
            console.log(`[NCA.tsx] applying cellular damage`)
        }

        // * send current state to worker
        this.worker.postMessage({ type: worker_cmd, data: [this.state, this.size]})
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
            //console.log('[NCA -- convert_to_rgba] transpose model is not created yet -- creating now')
            await this.init_transpose_model().then(() => {
                this.convert_to_rgba()
                return
            })
        }
        if (!this.transpose) return
        if (!this.state) return
        if (!this.size) return

        // * transpose data
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