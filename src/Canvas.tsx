import React from 'react'
import { Sim } from './Sim'

interface CanvasInterface { sim: Sim }

export class Canvas extends React.Component<CanvasInterface, {}> {

    // reference to canvas to render to
    canvas_ref: React.RefObject<HTMLCanvasElement>

    // component has been mounted bool
    comp_mounted: boolean

    // mouse variables
    prev_x: number
    prev_y: number

    constructor(props: CanvasInterface) {
        super(props)
        this.canvas_ref = React.createRef()
        this.comp_mounted = false
        this.prev_x = 0
        this.prev_y = 0
        console.log('canvas constructed...');
    }


    // thanks to:
    // https://stackoverflow.com/questions/42309715/how-to-correctly-pass-mouse-coordinates-to-webgl
    private get_mouse_relative(event: MouseEvent, target: HTMLCanvasElement)  {
        target = target || event.target
        var rect = target.getBoundingClientRect()
        return { x: event.clientX - rect.left, y: event.clientY - rect.top }
    }
      
    // assumes target or event.target is canvas
    private get_mouse_canvas(event: MouseEvent, target: HTMLCanvasElement) {
        target = target || event.target
        var pos = this.get_mouse_relative(event, target)
        pos.x = pos.x * target.width  / target.clientWidth
        pos.y = pos.y * target.height / target.clientHeight
        return pos
    }

    private mouse_start(mouse: MouseEvent) {
        let canvas = this.canvas_ref.current as HTMLCanvasElement;
        const pos = this.get_mouse_canvas(mouse, canvas)
        this.prev_x = pos.x / canvas.width
        this.prev_y = pos.y / canvas.height
        
        // update sim about user input
        let sim = this.props.sim
        sim.mouse_start(this.prev_x, this.prev_y, mouse.buttons)
    }

    private mouse_drag(mouse: MouseEvent) {
        // draw with mouse
        let canvas = this.canvas_ref.current as HTMLCanvasElement;
        const pos = this.get_mouse_canvas(mouse, canvas);
        const x = pos.x / canvas.width
        const y = pos.y / canvas.height
        const dx = x - this.prev_x
        const dy = y - this.prev_y
        this.prev_x = x
        this.prev_y = y

        // update sim about user input
        let sim = this.props.sim
        sim.mouse_drag(x, y, dx, dy)
    }

    private mouse_end(mouse: MouseEvent) {
        // update sim about user input
        let sim = this.props.sim
        sim.mouse_end()
    }

    private mouse_wheel(wheel: WheelEvent) {
        // update sim about user input
        let sim = this.props.sim
        sim.mouse_wheel(wheel.deltaY)
    }

    private on_key_down(key: KeyboardEvent) {
        let sim = this.props.sim
        sim.key_down[key.code] = true
    }

    private on_key_up(key: KeyboardEvent) {
        let sim = this.props.sim
        sim.key_down[key.code] = false
    }

    private handle_focus_event() {
        let sim = this.props.sim
        sim.set_hidden(document.hidden)
    }

    componentDidMount = () => {
        // only initialize simulation once
        if (!this.comp_mounted) {
            this.comp_mounted = true

            // prevent right-click menu
            window.addEventListener('contextmenu', (event: any) => event.preventDefault())

            // setup mouse input
            window.addEventListener('mousedown', (mouse: MouseEvent) => this.mouse_start(mouse))
            window.addEventListener('mousemove', (mouse: MouseEvent) => this.mouse_drag(mouse))
            window.addEventListener('mouseup', (mouse: MouseEvent) => this.mouse_end(mouse))
            window.addEventListener('wheel', (event: WheelEvent) => this.mouse_wheel(event))

            // event listeners for keyboard input
            window.addEventListener("keydown", (key: KeyboardEvent) => this.on_key_down(key))
            window.addEventListener("keyup", (key: KeyboardEvent) => this.on_key_up(key))

            // event listeners for tab visibility
            window.addEventListener('focus', (event: FocusEvent) => this.handle_focus_event())
            window.addEventListener('blur', (event: FocusEvent) => this.handle_focus_event())
            window.addEventListener('visibilitychange', (event: Event) => this.handle_focus_event())

            // setup simulation
            let canvas = this.canvas_ref.current as HTMLCanvasElement
            let sim = this.props.sim
            sim.init(canvas)
            sim.start()
        }
    }

    render() {
        return(
            <canvas ref={this.canvas_ref} style={{imageRendering:'pixelated'}}></canvas>
        );
    }
}