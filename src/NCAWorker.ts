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

	damage_state(state: Float32Array, size: number): Float32Array {
        const mask = this.createHalfVolumeMask(size)
        const newState = new Float32Array(state.length)
        
        for (let c = 0; c < 16; c++) {
            for (let x = 0; x < size; x++) {
                for (let y = 0; y < size; y++) {
                    for (let z = 0; z < size; z++) {
                        const volumeIndex = x * size * size + y * size + z
                        const stateIndex = (c * size * size * size) + volumeIndex
                        newState[stateIndex] = state[stateIndex] * mask[volumeIndex]
                    }
                }
            }
        }
        return newState
    }

    private createHalfVolumeMask(size: number): Float32Array {
        const maskTypes = ['x+', 'x-', 'y+', 'y-', 'z+', 'z-']
        const type = maskTypes[Math.floor(Math.random() * maskTypes.length)]
        const mat = new Float32Array(size * size * size)
        const half = Math.floor(size / 2)

        for (let x = 0; x < size; x++) {
            for (let y = 0; y < size; y++) {
                for (let z = 0; z < size; z++) {
                    const index = x * size * size + y * size + z
                    if (
                        (type === 'x+' && x < half) ||
                        (type === 'x-' && x >= half) ||
                        (type === 'y+' && y < half) ||
                        (type === 'y-' && y >= half) ||
                        (type === 'z+' && z < half) ||
                        (type === 'z-' && z >= half)
                    ) {
                        mat[index] = 1.0
                    } else {
                        mat[index] = 0.0
                    }
                }
            }
        }
        return mat
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

	// * damage state
	} else if (event.data.type === 'dmg') {
		try {
			const data = event.data.data
			let dmg_state = worker.damage_state(data[0], data[1])
			postMessage({ type: 'result', data: dmg_state })
		} catch (error) {
			console.log([ '[NCAWorker -- onmessage] error! damage state: ' + error])
			postMessage({ type: 'error', data: error })
		}
	}
}