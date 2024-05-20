class Sim {

    // canvas to render to
    canvas: HTMLCanvasElement | null = null;

    // user input
    is_input: boolean = false;
    mouse_button: number = 0;

    constructor() {
        // sim constructed message
        console.log('simulation constructed.');
    }

    init(_canvas: HTMLCanvasElement) {
        this.canvas = _canvas
    }

    start() {

    }

    /*****************************************************************
        MOUSE INPUT FUNCTIONS
    *****************************************************************/

        mouse_start(x: number, y: number, button: number) {
            this.is_input = true;
            this.mouse_button = button;
            switch (this.mouse_button) {
            default: break;
            case 1:
                break;
            case 2:
                break;
            }
        }
    
        mouse_drag(x: number, y: number, dx: number, dy: number) {
            if (!this.is_input) return;
            switch (this.mouse_button) {
            default: break;
            case 1:
                break;
            case 2:
                break;
            }
        }
    
        mouse_end() {
            this.is_input = false;
        }
    
        mouse_wheel(dy: number) {
            
        }
}

export { Sim }