import * as ort from 'onnxruntime-web'
import Rand from './lib/rand-seed'

export { NCA }

class NCA
{
    worker: Worker
    running: boolean = false
    rgba: Uint8Array | null = null

    constructor () {
        this.worker = new Worker(new URL('./NCAWorker.ts', import.meta.url), { type: 'module' });        
    }

    async load_model(model: string, size: number, seed: Float32Array) {
        this.worker.postMessage(['load-model', model, size, seed])
        this.worker.onmessage = (event) => {   
            let res = event.data[0]
            console.log('worker: ' + res)
        }
    }

    reset() {
        this.worker.postMessage(['reset'])
        this.worker.onmessage = (event) => {   
            let res = event.data[0]
            console.log('worker: ' + res)
        }
    }

    start_model() {
        if (this.running) return
        this.running = true
        this.worker_loop()
    }

    stop_model() {
        if (!this.running) return
        this.running = false
    }

    worker_loop() {
        if (!this.running) return

        this.worker.postMessage(['run-step'])
        this.worker.onmessage = (event) => { 
            let res = event.data[0]
            console.log('worker: ' + res)
            this.rgba = event.data[1]
            if (this.running) this.worker_loop()
        }
    }

    get_rgba() {
        return this.rgba
    }
}