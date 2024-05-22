import { webgl_util } from './WebGL_Util'
import { CanvasResize } from './CanvasResize'
import { UI } from './UI'
import { delay } from './Util'
import { Camera, Vec3, Vec4, VolumeData } from './lib/ary'
import { RenderCube } from './RenderCube'  

export { Sim }

class Sim {

    // simulation components
    paused: boolean
    bg: Vec4;
    static zoom: number = 3.0;

    // render components
    canvas: HTMLCanvasElement | null = null
    context: WebGL2RenderingContext | null = null
    resize: CanvasResize | null = null
    ui: UI | null = null
    camera: Camera | null = null
    rendercube: RenderCube | null = null
    volume_old: VolumeData | null = null;

    // user input
    is_input: boolean = false
    mouse_button: number = 0
    cam_sense: number = 0.25
    rot_speed: number = 0.05
    zoom_speed: number = 0.002
    min_zoom: number = 0.0
    max_zoom: number = 8.0

    // used to calculate time and fps
    fps: number = 0;
    start_time: number = 0;
    prev_time: number = 0;
    curr_delta_time: number = 0;
    prev_fps_time: number = 0;
    frame_count: number = 0;

    constructor() {
        this.paused = false
        this.bg = new Vec4([1.0, 1.0, 1.0, 1.0])
        console.log('simulation constructed...')
    }

    init(_canvas: HTMLCanvasElement) {
        this.canvas = _canvas
        this.context = webgl_util.request_context(this.canvas)
        this.resize = new CanvasResize(this.canvas)
        this.rendercube = new RenderCube(this.context)
        this.reset_camera()
        console.log('simulation initialized...')
    }

    start() {
        window.requestAnimationFrame(() => this.render_loop())
        console.log('simulation started...')
    }

    reset_camera() {
        let canvas = this.canvas as HTMLCanvasElement
        this.camera = new Camera(
            new Vec3([0, 0, -Sim.zoom]),
            new Vec3([0, 0, 0]),
            new Vec3([0, 1, 0]),
            45,
            canvas.width / canvas.height,
            0.1,
            1000.0
        )
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
        let camera = this.camera as Camera
        let rendercube = this.rendercube as RenderCube
        let w = this.canvas?.width as number
        let h = this.canvas?.height as number
        rendercube.render(w, h, camera, this.bg)
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
            this.reset_camera()
            break
        case 2:
            break
        }
    }

    mouse_drag(x: number, y: number, dx: number, dy: number) {
        // move camera with mouse
        this.orbit_cube(dx, dy);
        
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
        this.camera_zoom(dy);
    }

    orbit_cube(dx: number, dy: number) {
        if (!this.camera)
            return

        // move camera if in 3d mode
        let dir = this.camera.right();
        dir.scale(-dx);
        dir.add(this.camera.up().scale(dy));
        dir.normalize();

        // move camera
        let rotAxis: Vec3 = Vec3.cross(this.camera.forward(), dir);
        rotAxis = rotAxis.normalize();

        // make sure values are not NaN
        if (dy !== 0 || dx !== 0) {
            this.camera.orbitTarget(rotAxis, this.rot_speed);
        }
    }

    camera_zoom(_delta: number) {
        if (!this.camera)
            return

        let dist: number = this.camera.distance();

        // do not zoom if too far away or too close
        if (dist + (_delta*this.zoom_speed) > this.max_zoom) return;
        else if (dist + (_delta*this.zoom_speed) < this.min_zoom) return;

        // offset camera
        this.camera.offsetDist(_delta*this.zoom_speed);
        Sim.zoom = this.camera.distance();
    }
}