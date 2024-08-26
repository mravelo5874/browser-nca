export { RenderCapture }

class RenderCapture 
{
    private gl: WebGL2RenderingContext
    private framebuffer: WebGLFramebuffer
    private texture: WebGLTexture | null = null

    constructor(gl: WebGL2RenderingContext) {
        this.gl = gl
        this.framebuffer = gl.createFramebuffer() as WebGLFramebuffer
        this.setupFramebuffer()
    }

    private createTexture(width: number, height: number): WebGLTexture {
        const gl = this.gl
        const texture = gl.createTexture() as WebGLTexture
        gl.activeTexture(gl.TEXTURE1)
        gl.bindTexture(gl.TEXTURE_2D, texture)
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
        return texture
    }

    private setupFramebuffer() {
        const gl = this.gl
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer)
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.texture, 0)
    }

    public render(width: number, height: number) {
        const gl = this.gl
        this.texture = this.createTexture(width, height)
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer)
        gl.viewport(0, 0, width, height)
        gl.bindFramebuffer(gl.FRAMEBUFFER, null)
    }

    getTexture(): WebGLTexture | null {
        return this.texture
    }
}