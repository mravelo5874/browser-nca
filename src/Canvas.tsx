import React from 'react'
import { Sim } from './Sim'

interface CanvasInterface { sim: Sim }

class Canvas extends React.Component<CanvasInterface, {}> {

    // reference to canvas to render to
    canvas_ref: React.RefObject<HTMLCanvasElement>

    // sim has been initialized boolean
    sim_init: boolean

    // mouse variables
    prev_x: number
    prev_y: number;

    constructor(props: CanvasInterface) {
        super(props)
        this.canvas_ref = React.createRef()
        this.sim_init = false
        this.prev_x = 0
        this.prev_y = 0
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
        this.prev_x = pos.x / canvas.width;
        this.prev_y = pos.y / canvas.height;
        
        // update sim about user input
        let sim = this.props.sim;
        sim.mouse_start(this.prev_x, this.prev_y, mouse.buttons);
    }

    private mouse_drag(mouse: MouseEvent) {
        // draw with mouse
        let canvas = this.canvas_ref.current as HTMLCanvasElement;
        const pos = this.get_mouse_canvas(mouse, canvas);
        const x = pos.x / canvas.width;
        const y = pos.y / canvas.height;
        const dx = x - this.prev_x;
        const dy = y - this.prev_y;
        this.prev_x = x;
        this.prev_y = y;

        // update sim about user input
        let sim = this.props.sim;
        sim.mouse_drag(x, y, dx, dy);
    }

    private mouse_end(mouse: MouseEvent) {
        // update sim about user input
        let sim = this.props.sim;
        sim.mouse_end();
    }

    private mouse_wheel(wheel: WheelEvent) {
        // update sim about user input
        let sim = this.props.sim;
        sim.mouse_wheel(wheel.deltaY);
    }

    componentDidMount = () => {
        // only initialize simulation once
        if (!this.sim_init) {
            this.sim_init = true;
            let canvas = this.canvas_ref.current as HTMLCanvasElement;

            // prevent right-click menu
            canvas.addEventListener("contextmenu", (event: any) => event.preventDefault())

            // setup mouse input
            canvas.addEventListener('mousedown', (mouse: MouseEvent) => this.mouse_start(mouse))
            canvas.addEventListener('mousemove', (mouse: MouseEvent) => this.mouse_drag(mouse))
            canvas.addEventListener('mouseup', (mouse: MouseEvent) => this.mouse_end(mouse))
            canvas.addEventListener("wheel", (event: WheelEvent) => this.mouse_wheel(event))

            // setup simulation
            let sim = this.props.sim;
            sim.init(canvas);
            sim.start();
        }
    }

    render() {
        return(
            <canvas ref={this.canvas_ref} style={{imageRendering:'pixelated'}}></canvas>
        );
    }
}