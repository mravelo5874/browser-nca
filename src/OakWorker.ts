/* eslint-disable no-restricted-globals */
import * as ort from 'onnxruntime-web';

const pwd = `${self.location.origin}`

class OakWorker 
{
	private session: ort.InferenceSession | null = null

	async init() {
		// * attempt to load onnx model from file
		try {
			const path = `${pwd}/models/oak_aniso.onnx`
			this.session = await ort.InferenceSession.create(path)
			console.log('[OakWorker -- init] ONNX model loaded successfully')
			return true
		} 
		catch (error) {
			console.log([ '[OakWorker -- init] error! ' + error])
			return false
		}
	}

	async run_step(state: Float32Array, size: number) {
		// * assert session is initialized
		if (!this.session) {
			console.log('[OakWorker -- run_step] error! model not initialized. call initialize() first')
			return
		}

		try {
			const input = new ort.Tensor('float32', state, [1, 16, size, size, size])
			const input_feeds = { 'l_x_': input }
            const output = await this.session.run(input_feeds)
            const new_state = output.mul_1.data as Float32Array
            return new_state
		} catch (error) {
			console.log([ '[OakWorker -- run_step] error! at inference: ' + error])
			return
		}
	}
}

const worker = new OakWorker()
onmessage = async (event: MessageEvent) => {
	// * initialize worker
	if (event.data.type === 'init') {
		const res = await worker.init()
		if (res) { postMessage({ type: 'init-complete' }) }
		else { postMessage({ type: 'error', data: 'error! attempting to initialize session' }) }

	// * run model step
	} else if (event.data.type === 'run') {
		try {
			const data = event.data.data
			const result = await worker.run_step(data[0], data[1])
			postMessage({ type: 'result', data: result })
		} catch (error) {
			console.log([ '[OakWorker -- onmessage] error! run step: ' + error])
			postMessage({ type: 'error', data: error })
		}
	}
}