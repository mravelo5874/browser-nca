/* eslint-disable no-restricted-globals */
import * as ort from 'onnxruntime-web'

const pwd = `${self.location.origin}`

class NCAWorker 
{
	private session: ort.InferenceSession | null = null

	async init(model_name: string) {
		// * attempt to load onnx model from file
		try {
			const path = `${pwd}/models/${model_name}.onnx`
			this.session = await ort.InferenceSession.create(path)
			// console.log('[NCAWorker -- init] ONNX model loaded successfully')
			return true
		} 
		catch (error) {
			console.log([ '[NCAWorker -- init] error! ' + error])
			return false
		}
	}

	async run_step(state: Float32Array, size: number) {
		// * assert session is initialized
		if (!this.session) {
			console.log('[NCAWorker -- run_step] error! model not initialized. call initialize() first')
			return
		}

		try {
			const input = new ort.Tensor('float32', state, [1, 16, size, size, size])
			const input_feeds = { 'input': input }
            const output = await this.session.run(input_feeds)
            const new_state = output.output.data as Float32Array
            return new_state
		} catch (error) {
			console.log([ '[NCAWorker -- run_step] error! at inference: ' + error])
			return
		}
	}
}

const worker = new NCAWorker()

onmessage = async (event: MessageEvent) => {
	// * initialize worker
	if (event.data.type === 'init') {
		const data = event.data.data
		const res = await worker.init(data[0])
		if (res) { postMessage({ type: 'init-complete' }) }
		else { postMessage({ type: 'error', data: 'error! attempting to initialize session' }) }

	// * run model step
	} else if (event.data.type === 'run') {
		try {
			const data = event.data.data
			const result = await worker.run_step(data[0], data[1])
			postMessage({ type: 'result', data: result })
		} catch (error) {
			console.log([ '[NCAWorker -- onmessage] error! run step: ' + error])
			postMessage({ type: 'error', data: error })
		}
	}
}