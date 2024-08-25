/* eslint-disable no-restricted-globals */
import * as ort from 'onnxruntime-web';

class NCAWorker
{
    model: ort.InferenceSession | null = null
    constructor() {}

    init(model: ort.InferenceSession) {
        this.model = model
        console.log('init model: '+this.model.inputNames)
    }

    async run_step(state: ort.Tensor, size: number) {
        if (this.model) {
            const input_feeds = { 'l_x_': state }
            console.log('input names model: '+this.model.inputNames)
            console.log('output names model: '+this.model.outputNames)
            const outputMap = await this.model.run(input_feeds)
            const new_state = outputMap.mul_1.data as Float32Array
            return new ort.Tensor('float32', new_state, [1, 16, size, size, size])
        }
        return null
    }
}

const worker = new NCAWorker()

self.onmessage = async (event) => {
    const command: string = event.data[0]
    switch (command) {
        case 'init':
            const model: ort.InferenceSession = event.data[1]
            console.log('onmessage model: '+model.inputNames)
            worker.init(model)
            self.postMessage(['init-complete'])
            break
        case 'run-step':
            let state = event.data[1]
            let size = event.data[2]
            const new_state = await worker.run_step(state, size)
            self.postMessage([new_state])
            break        
        default:
          self.postMessage(['error! unknown command: ' + command]);
    }
}

export {}