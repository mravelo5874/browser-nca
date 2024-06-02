import { Tensor, InferenceSession } from 'onnxjs';
import Rand from './lib/rand-seed'

export { NCA }

class NCA 
{
    session: InferenceSession
    state: Tensor | null = null

    constructor() {
        this.session = new InferenceSession()
    }

    create_dummy_array(size: number) {
        let array = []
        let rng = new Rand('0123456789');
        for (let i = 0; i < size; i++) {
            array.push(rng.next())
        }
        return new Float32Array(array)
    }

    async load_model(model_name: string): Promise<void> {
        console.log('loading new model...')
        await this.session.loadModel('./data/models/' + model_name + '.onnx')

        // creating an array of input Tensors is the easiest way. For other options see the API documentation
        this.state = new Tensor(this.create_dummy_array(16*32*32*32), 'float32', [1, 16, 32, 32, 32])
        console.log('finished loading model...')
    }

    async run_model() {
        if (!this.session || !this.state)
            return

        // run this in an async method:
        const outputMap = await this.session.run([this.state]);
        this.state = outputMap.values().next().value;
    }
}