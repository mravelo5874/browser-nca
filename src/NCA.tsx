import * as ort from 'onnxruntime-web';
import Rand from './lib/rand-seed'

export { NCA }

class NCA 
{
    session: ort.InferenceSession | null = null
    state: ort.Tensor | null = null
    size: number = 0

    constructor() {
        // this.session = ort.InferenceSession
    }

    create_dummy_array(size: number) {
        let array = []
        let rng = new Rand('0123456789');
        for (let i = 0; i < size; i++) {
            array.push(rng.next())
        }
        return new Float32Array(array)
    }

    async load_model(model_name: string, size: number): Promise<void> {
        const path = './models/' + model_name + '.onnx'
        console.log('loading new model: ' + path)
        this.session = await ort.InferenceSession.create(path);
        this.size = size

        // creating an array of input Tensors is the easiest way. For other options see the API documentation
        this.state = new ort.Tensor('float32', this.create_dummy_array(16*size*size*size), [1, 16, size, size, size])
        console.log('finished loading model...')
    }

    async run_model() {
        if (!this.session || !this.state)
            return

        // run this in an async method:
        const feeds = { a: this.state };
        const outputMap = await this.session.run(feeds);
        // const data = outputMap.c.data as Float32Array
        // this.state = new ort.Tensor('float32', this.create_dummy_array(16*this.size*this.size*this.size), data)
    }
}