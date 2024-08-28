import { webgl_util } from './WebGL_Util'
import { CanvasResize } from './CanvasResize'
import { UI } from './UI'
import { delay, random_uint8_volume } from './Util'
import { Camera, Vec2, Vec3, Vec4 } from './lib/rary'
import { RenderCube } from './RenderCube'
import { RenderShadow } from './RenderShadow'
import { PostProcessing } from './PostProcessing'
import { NCA } from './NCA'

// [TODO]
//      - postprocess antialiasing using WebGLRenderTargets (https://discourse.threejs.org/t/how-to-get-canvas-as-a-texture-to-chain-together-shaders/16056)
//      - fix lighting engine (large alpha values through volume into plane are too dark)
//      - add ability to add delay to model steps (to view model grow slower or in real-time)

export { Sim }

class Sim {

    // simulation components
    paused: boolean
    bg: Vec4
    light_pos: Vec3
    light_radius: number
    light_color_mult: Vec4
    static zoom: number = 1.8

    // render components
    canvas: HTMLCanvasElement | null = null
    context: WebGL2RenderingContext | null = null
    resize: CanvasResize | null = null
    ui: UI | null = null
    camera: Camera | null = null
    texture3d: WebGLTexture | null = null
    nca: NCA
    step: number = 0

    // render layers
    rendershadow: RenderShadow | null = null
    rendercube: RenderCube | null = null
    postprocess: PostProcessing | null = null
    use_postprocess: boolean = true
    
    // user input
    is_input: boolean = false
    mouse_button: number = 0
    cam_sense: number = 0.25
    rot_speed: number = 4
    rot_fric: number = 0.99
    zoom_speed: number = 0.002
    min_zoom: number = 0.0
    max_zoom: number = 8.0
    prev_d: Vec2 = Vec2.zero

    // auto restart feature
    auto_restart: boolean = true
    auto_restart_steps: number = 250

    // key input dictionary
    key_down: Record<string, boolean>

    // used to calculate time and fps
    fps: number = 0
    start_time: number = 0
    prev_time: number = 0
    curr_delta_time: number = 0
    prev_fps_time: number = 0
    frame_count: number = 0

    constructor() {
        this.key_down = {}
        this.paused = false
        this.bg = new Vec4([0.0, 0.0, 0.0, 1.0])
        this.light_color_mult = new Vec4([0.1, 0.2, 0.3, 1.0])
        this.light_pos = new Vec3([2, 2, -2])
        this.light_radius = 8.0

        // * setup NCA
        this.nca = new NCA()
        this.nca.load_model_worker('sphere')
        console.log('simulation constructed...')
    }
    
    init(_canvas: HTMLCanvasElement) {
        this.canvas = _canvas
        this.context = webgl_util.request_context(this.canvas)
        this.resize = new CanvasResize(this.canvas)
        this.rendershadow = new RenderShadow(this.context)
        this.rendercube = new RenderCube(this.context)
        this.postprocess = new PostProcessing(this.context)
        
        this.reboot_camera()
        console.log('simulation initialized...')
    }

    start() {
        window.requestAnimationFrame(() => this.render_loop())
        console.log('simulation started...')
    }

    public toggle_pp() {
        this.use_postprocess = !this.use_postprocess
    }

    public load_model(model: string) {
        this.nca.load_model_worker(model)
    }

    public get_key(key: string): boolean {
        if (!this.key_down[key]) return false
        else return this.key_down[key]
    }

    async setup_texture3d(rgba_data: Uint8Array, size: number) {
        let gl = this.context as WebGL2RenderingContext
        this.texture3d = gl.createTexture() as WebGLTexture
        gl.bindTexture(gl.TEXTURE_3D, this.texture3d);
        gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_WRAP_S, gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_WRAP_T, gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_WRAP_R, gl.REPEAT);
        gl.texImage3D(gl.TEXTURE_3D, 0, gl.RGBA, size, size, size, 0, gl.RGBA, gl.UNSIGNED_BYTE, rgba_data)
    }

    reset_camera () {
        let canvas = this.canvas as HTMLCanvasElement
        let cam = this.camera as Camera
        this.camera = new Camera(
            cam.pos(),
            cam.target(),
            cam.up(),
            45,
            canvas.width / canvas.height,
            0.1,
            1000.0
        )
    }

    reboot_camera() {
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
        // * update canvas size
        if (CanvasResize.update_canvas) {
            console.log('update canvas!')
            CanvasResize.update_canvas = false

            // reset current sim
            this.resize?.resize_canvas_to_display_size(this.ui);
            (async () => { 
                this.reset_camera()
                await delay(1)
            })();
        }

        // * render current simulation
        this.render_frame()

        // * calculate current delta time
        this.frame_count++
        const curr_time: number = Date.now()
        this.curr_delta_time = (curr_time - this.prev_time)
        this.prev_time = curr_time

        // * calculate fps
        if (Date.now() - this.prev_fps_time >= 1000) {
            this.fps = this.frame_count
            this.frame_count = 0
            this.prev_fps_time = Date.now()
        }
        
        // * update ui
        if (this.ui) this.ui.update()

        // * camera rotational velocity
        if (!this.is_input && this.prev_d !== Vec2.zero) {
            let dx = this.prev_d.x
            let dy = this.prev_d.y
            this.orbit_cube(dx, dy);
            this.prev_d = new Vec2(this.prev_d.scale(this.rot_fric).xy)
        }

        // * move light source
        let light_vel = 0.00005
        this.light_pos = new Vec3([Math.sin(curr_time*light_vel)*2, 2, Math.cos(curr_time*light_vel)*2])

        // * auto restart calculation
        let reset = false
        if (this.auto_restart) {
            if (this.auto_restart_steps <= this.nca.get_worker_steps()) {
                reset = true
            }
        }

        // * reset model ELSE update model
        if (this.get_key('KeyR') || reset) {
            this.nca.reset()
            this.step = 0
        }
        else {
            this.nca.update()
            this.step = this.nca.get_worker_steps()
        }

        // get rbga data from NCA worker
        const rgba_data = this.nca.get_rgba()
        const size = this.nca.get_size()
        if (rgba_data && size) {
            this.setup_texture3d(rgba_data, size)
        }

        // request next frame to be drawn
        window.requestAnimationFrame(() => this.render_loop())
    }

    render_frame() {
        let camera = this.camera as Camera
        let w = this.canvas?.width as number
        let h = this.canvas?.height as number

        // nca data available
        if (this.texture3d) {
            this.rendershadow?.render(w, h, camera, this.bg, this.light_pos, this.light_radius, this.light_color_mult, this.texture3d)
            if (this.use_postprocess) this.postprocess?.render(w, h, 4.0, this.canvas!)
            this.rendercube?.render(w, h, camera, this.light_pos, this.texture3d)

        // * no nca data
        } else {
            this.rendershadow?.render(w, h, camera, this.bg, this.light_pos, this.light_radius, this.light_color_mult)
        }
    }

    /*****************************************************************
        MOUSE INPUT FUNCTIONS
    *****************************************************************/

    mouse_start(x: number, y: number, button: number) {
        this.is_input = true
        this.mouse_button = button;
        this.prev_d = new Vec2([0.0, 0.0])
        switch (this.mouse_button) {
        default: break
        case 1:
            
            break
        case 2:
            this.reboot_camera()
            break
        }
    }

    mouse_drag(x: number, y: number, dx: number, dy: number) {
        switch (this.mouse_button) {
        default: break
        case 1:
            if (!this.is_input) return
            this.prev_d = new Vec2([dx, dy])
            this.orbit_cube(dx, dy);
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
        //dir.normalize();

        // move camera
        let rotAxis: Vec3 = Vec3.cross(this.camera.forward(), dir);
        rotAxis = rotAxis.normalize();

        // make sure values are not NaN
        if (dy !== 0 || dx !== 0) {
            this.camera.orbitTarget(rotAxis, this.rot_speed * Math.sqrt(dx*dx+dy*dy));
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