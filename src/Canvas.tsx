import React from 'react'
import { Sim } from './Sim'

interface CanvasInterface { sim: Sim }

export class Canvas extends React.Component<CanvasInterface, {}> {

    // * reference to canvas object
    canvas_ref: React.RefObject<HTMLCanvasElement>

    // * has component has been mounted?
    comp_mounted: boolean

    // * mouse position variables
    prev_x: number
    prev_y: number

    constructor(props: CanvasInterface) {
        super(props)
        this.canvas_ref = React.createRef()
        this.comp_mounted = false
        this.prev_x = 0
        this.prev_y = 0
        console.log('[Canvas.tsx] canvas constructed')
    }

    componentDidMount = () => {
        if (!this.comp_mounted) {
            this.comp_mounted = true

            // * prevent right-click menu
            window.addEventListener('contextmenu', (event: any) => event.preventDefault())

            // * setup mouse inputs
            window.addEventListener('mousedown', (mouse: MouseEvent) => this.mouse_start(mouse))
            window.addEventListener('mousemove', (mouse: MouseEvent) => this.mouse_drag(mouse))
            window.addEventListener('mouseup', (mouse: MouseEvent) => this.mouse_end())
            window.addEventListener('wheel', (event: WheelEvent) => this.mouse_wheel(event))

            // * event listeners for keyboard inputs
            window.addEventListener("keydown", (key: KeyboardEvent) => this.on_key_down(key))
            window.addEventListener("keyup", (key: KeyboardEvent) => this.on_key_up(key))

            // * event listeners for window visibility
            window.addEventListener('focus', () => this.handle_focus_event())
            window.addEventListener('blur', () => this.handle_focus_event())
            window.addEventListener('visibilitychange', () => this.handle_focus_event())

            // * initialize simulation
            let canvas = this.canvas_ref.current as HTMLCanvasElement
            let sim = this.props.sim
            sim.init(canvas)
            sim.start()
        }
    }


    // thanks to:
    // https://stackoverflow.com/questions/42309715/how-to-correctly-pass-mouse-coordinates-to-webgl
    private get_mouse_relative(event: MouseEvent, target: HTMLCanvasElement)  {
        target = target || event.target
        var rect = target.getBoundingClientRect()
        return { x: event.clientX - rect.left, y: event.clientY - rect.top }
    }
      
    // * assumes target or event.target is canvas
    private get_mouse_canvas(event: MouseEvent, target: HTMLCanvasElement) {
        target = target || event.target
        var pos = this.get_mouse_relative(event, target)
        pos.x = pos.x * target.width  / target.clientWidth
        pos.y = pos.y * target.height / target.clientHeight
        return pos
    }

    // * fires when mosue button pressed
    private mouse_start(mouse: MouseEvent) {
        let canvas = this.canvas_ref.current as HTMLCanvasElement
        const pos = this.get_mouse_canvas(mouse, canvas)
        this.prev_x = pos.x / canvas.width
        this.prev_y = pos.y / canvas.height
        let sim = this.props.sim
        sim.mouse_start(this.prev_x, this.prev_y, mouse.buttons)
    }

    // * fires when mouse is moved 
    private mouse_drag(mouse: MouseEvent) {
        let canvas = this.canvas_ref.current as HTMLCanvasElement
        const pos = this.get_mouse_canvas(mouse, canvas)
        const x = pos.x / canvas.width
        const y = pos.y / canvas.height
        const dx = x - this.prev_x
        const dy = y - this.prev_y
        this.prev_x = x
        this.prev_y = y
        let sim = this.props.sim
        sim.mouse_drag(x, y, dx, dy)
    }

    // * fires when mouse button is unpressed
    private mouse_end() {
        let sim = this.props.sim
        sim.mouse_end()
    }

    //* fires when mouse wheel is used
    private mouse_wheel(wheel: WheelEvent) {
        let sim = this.props.sim
        sim.mouse_wheel(wheel.deltaY)
    }

    // * fires when keyboard key is pressed
    private on_key_down(key: KeyboardEvent) {
        let sim = this.props.sim
        sim.key_down[key.code] = true
    }

    // * fires when keyboard key is unpressed
    private on_key_up(key: KeyboardEvent) {
        let sim = this.props.sim
        sim.key_down[key.code] = false
    }

    // * fires when window is focused or unfocused
    private handle_focus_event() {
        let sim = this.props.sim
        sim.set_hidden(document.hidden)
    }

    render() {
        return(
            <canvas ref={this.canvas_ref} style={{imageRendering:'pixelated'}}></canvas>
        )
    }
}