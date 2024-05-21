import { webgl_util } from './WebGL_Util'
import { CanvasResize } from './CanvasResize'
import { UI } from './UI'
import { delay } from './Util'

export { Sim }

class Sim {

    // simulation components
    paused: boolean
    static zoom: number = 1.0;

    // render components
    canvas: HTMLCanvasElement | null = null
    context: WebGL2RenderingContext | null = null
    resize: CanvasResize | null = null
    ui: UI | null = null

    // user input
    is_input: boolean = false
    mouse_button: number = 0

    // used to calculate time and fps
    fps: number = 0;
    start_time: number = 0;
    prev_time: number = 0;
    curr_delta_time: number = 0;
    prev_fps_time: number = 0;
    frame_count: number = 0;

    constructor() {
        this.paused = false
        console.log('simulation constructed...')
    }

    init(_canvas: HTMLCanvasElement) {
        this.canvas = _canvas
        this.context = webgl_util.request_context(this.canvas)
        this.resize = new CanvasResize(this.canvas)
        console.log('simulation initialized...')
    }

    start() {
        this.reset()
        window.requestAnimationFrame(() => this.render_loop())
        console.log('simulation started...')
    }

    reset() {
        
    }

    render_loop() {
        // update canvas size
        if (CanvasResize.update_canvas) {
            console.log('update canvas!')
            CanvasResize.update_canvas = false

            // reset current sim
            this.resize?.resize_canvas_to_display_size(this.ui);
            (async () => { 
                await delay(1)
                this.reset()
            })();
        }

        // render current simulation
        this.render_frame()

        // calculate current delta time
        this.frame_count++
        const curr_time: number = Date.now()
        this.curr_delta_time = (curr_time - this.prev_time)
        this.prev_time = curr_time

        // calculate fps
        if (Date.now() - this.prev_fps_time >= 1000) {
            this.fps = this.frame_count
            this.frame_count = 0
            this.prev_fps_time = Date.now()
        }
        
        // update ui
        if (this.ui) this.ui.update()

        // request next frame to be drawn
        window.requestAnimationFrame(() => this.render_loop())
    }

    render_frame() {
        console.log('rendering frame!')
    }

    /*****************************************************************
        MOUSE INPUT FUNCTIONS
    *****************************************************************/

        mouse_start(x: number, y: number, button: number) {
            this.is_input = true
            this.mouse_button = button;
            switch (this.mouse_button) {
            default: break
            case 1:
                break
            case 2:
                break
            }
        }
    
        mouse_drag(x: number, y: number, dx: number, dy: number) {
            if (!this.is_input) return
            switch (this.mouse_button) {
            default: break
            case 1:
                break
            case 2:
                break
            }
        }
    
        mouse_end() {
            this.is_input = false
        }
    
        mouse_wheel(dy: number) {
            
        }
}