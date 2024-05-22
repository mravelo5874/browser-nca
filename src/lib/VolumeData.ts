export { VolumeData }

/**
 * We want to swap between volume buffers when updating 
 * Therefore there is always a texture and framebuffer pair
 * When reading we use the texture directly
 * When writing we use the layered framebuffer 
 */
class VolumeData {
    size: number;
    gl: WebGL2RenderingContext;
    texture: WebGLTexture;
    frame_buffers: Array<LayeredFrameBuffer>;
    max_layers: number;

    constructor(_gl: WebGL2RenderingContext, _size: number) {
        this.gl = _gl;
        this.size = _size;

        // create 3D texture
        let gl = this.gl;
        let s = this.size;
        let texture = gl.createTexture() as WebGLTexture;
        gl.bindTexture(gl.TEXTURE_3D, texture);
        gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_WRAP_S, gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_WRAP_T, gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_WRAP_R, gl.REPEAT);
        // NOTE: We are using ONE channel: [value]
        gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
        gl.pixelStorei(gl.PACK_ALIGNMENT, 1);
        gl.texImage3D(gl.TEXTURE_3D, 0, gl.RGBA, s, s, s, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
        // create framebuffers for layers of volume
        let frame_buffers = []
        const max_layers = gl.getParameter(gl.MAX_COLOR_ATTACHMENTS);
        let curr_z = 0;
        while (curr_z !== s) {
            let rem_z = s - curr_z;
            let total_layers = Math.min(rem_z, max_layers);
            let fb = new LayeredFrameBuffer(gl, texture, curr_z, total_layers);
            frame_buffers.push(fb);
            curr_z += total_layers;
        }

        this.texture = texture;
        this.frame_buffers = frame_buffers;
        this.max_layers = max_layers;
    }

    set_wrap = (is_wrap: boolean) => {
        let gl = this.gl;

        gl.bindTexture(gl.TEXTURE_3D, this.texture);

        if (is_wrap) {
            gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_WRAP_S, gl.REPEAT);
            gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_WRAP_T, gl.REPEAT);
            gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_WRAP_R, gl.REPEAT);
        } else {
            gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_WRAP_R, gl.CLAMP_TO_EDGE);
        }
    }
}

class LayeredFrameBuffer {
    fb: WebGLFramebuffer;
    layers: Array<number>;
    texture: WebGLTexture;
    total_layers: number;
    z_offset: number;

    constructor(gl: WebGL2RenderingContext, texture: WebGLTexture, z_offset: number, total_layers: number) {
        let framebuffer = gl.createFramebuffer() as WebGLFramebuffer;
        let layers = Array(total_layers);
        gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
        // create layers
        for (let i = 0; i < total_layers; i++) {
            let layer = gl.COLOR_ATTACHMENT0 + i;
            gl.framebufferTextureLayer(gl.FRAMEBUFFER, layer, texture, 0, z_offset+i);
            layers[i] = layer;
        }

        let res = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
        if (res !== gl.FRAMEBUFFER_COMPLETE) {
            throw Error(`Incomplete layered framebuffer ${res}`);
        }

        this.fb = framebuffer;
        this.layers = layers;
        this.texture = texture;
        this.total_layers = total_layers;
        this.z_offset = z_offset;
    }
}