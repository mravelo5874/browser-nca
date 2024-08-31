import { UI } from './UI' 

export class CanvasResize {
    
    static update_canvas = false
    static canvas_to_disp_size: Map<HTMLCanvasElement, number[]>

    canvas: HTMLCanvasElement
    resize_observer: ResizeObserver
    phys_width: number
    phys_height: number
    
    constructor(_canvas: HTMLCanvasElement) {
        this.canvas = _canvas
        this.phys_width = _canvas.width
        this.phys_height = _canvas.height
        CanvasResize.canvas_to_disp_size = new Map([[this.canvas, [this.phys_width, this.phys_height]]])
        this.resize_observer = new ResizeObserver(this.on_resize)
        this.resize_observer.observe(this.canvas, { box: 'content-box' })
    }

    on_resize(entries: any) {
        for (const entry of entries) {
            let width
            let height
            let dpr = window.devicePixelRatio
            if (entry.devicePixelContentBoxSize) {
                // NOTE: Only this path gives the correct answer
                // The other 2 paths are an imperfect fallback
                // for browsers that don't provide anyway to do this
                width = entry.devicePixelContentBoxSize[0].inlineSize
                height = entry.devicePixelContentBoxSize[0].blockSize
                dpr = 1 // it's already in width and height
            } 
            else if (entry.contentBoxSize) {
                if (entry.contentBoxSize[0]) 
                {
                    width = entry.contentBoxSize[0].inlineSize
                    height = entry.contentBoxSize[0].blockSize
                } 
                else 
                {
                    // legacy
                    width = entry.contentBoxSize.inlineSize
                    height = entry.contentBoxSize.blockSize
                }
            } 
            else {
                // legacy
                width = entry.contentRect.width
                height = entry.contentRect.height
            }

            this.phys_width = Math.round(width * dpr)
            this.phys_height = Math.round(height * dpr)

            CanvasResize.canvas_to_disp_size.set(entry.target, [this.phys_width, this.phys_height])
            CanvasResize.update_canvas = true
        }
    }
    
    resize_canvas_to_display_size(ui: UI | null) {
        // Get the size the browser is displaying the canvas in device pixels.
        let [displayWidth, displayHeight] = CanvasResize.canvas_to_disp_size.get(this.canvas) as number[]
        
        // update ui
        if (ui) ui.update_res_node(displayWidth, displayHeight)
    
        // Check if the canvas is not the same size.
        const needResize = this.canvas.width  !== displayWidth || this.canvas.height !== displayHeight
    
        if (needResize) {
            // Make the canvas the same size
            this.canvas.width  = displayWidth
            this.canvas.height = displayHeight
        }
    
        return needResize
    }
}