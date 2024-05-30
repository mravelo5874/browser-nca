import { Camera, Plane, Vec4 } from './lib/rary'

export { RenderShadow }

class RenderShadow 
{
    plane: Plane
    gl: WebGL2RenderingContext
    program: WebGLProgram
    vao: WebGLVertexArrayObject

    constructor(_gl: WebGL2RenderingContext) {
        this.plane = new Plane()

        this.gl = _gl;
        this.program = _gl.createProgram() as WebGLProgram
        this.vao = _gl.createVertexArray() as WebGLVertexArrayObject
        this.init(_gl)
    }

    init(gl: WebGL2RenderingContext) {
        {/* CREATE RENDER PROGRAM */}
        let vert = _3D_VERT;
        let frag = _3D_FRAG;

        // create shaders
        const vertex_shader = gl.createShader(gl.VERTEX_SHADER) as WebGLShader;
        const fragment_shader = gl.createShader(gl.FRAGMENT_SHADER) as WebGLShader;
        gl.shaderSource(vertex_shader, vert);
        gl.compileShader(vertex_shader);
        gl.shaderSource(fragment_shader, frag);
        gl.compileShader(fragment_shader);

        // used for debugging shaders
        const vertex_log = gl.getShaderInfoLog(vertex_shader);
        const fragment_log = gl.getShaderInfoLog(fragment_shader);
        if (vertex_log != '') console.log('vertex shader log: ' + vertex_log);
        if (fragment_log != '') console.log('fragment shader log: ' + fragment_log);

        // create program
        let program = this.program;
        gl.attachShader(program, vertex_shader);
        gl.attachShader(program, fragment_shader);
        gl.linkProgram(program);

        // used for debugging program
        const program_log = gl.getProgramInfoLog(program);
        if (program_log != '') console.log('shader program log: ' + program_log);

        // use program!
        gl.useProgram(this.program);
    }

    render(w: number, h: number, camera: Camera, bg: Vec4) {
        let gl = this.gl
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.clearColor(bg.r, bg.g, bg.b, bg.a);
        gl.clear(gl.COLOR_BUFFER_BIT);
        // gl.enable(gl.CULL_FACE);
        gl.cullFace(gl.BACK);
        gl.frontFace(gl.CCW);
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
        gl.viewport(0, 0, w, h);

        // setup render plane
        this.setup_cube_render(gl, camera, bg);

        // draw
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.drawElements(gl.TRIANGLES, this.plane.get_idx_u32().length, gl.UNSIGNED_INT, 0);
    }

    setup_cube_render(gl: WebGL2RenderingContext, camera: Camera, bg: Vec4, texture3d?: WebGLTexture) {
        let program = this.program as WebGLProgram;
        
        // draw cube
        gl.useProgram(this.program);
        /* Setup VAO */
        gl.bindVertexArray(this.vao);

        /* Setup Index Buffer */
        const idx_buffer = gl.createBuffer() as WebGLBuffer;
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, idx_buffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.plane.get_idx_u32(), gl.STATIC_DRAW);

        /* Setup Attributes */
        // position attribute
        let pos_loc = gl.getAttribLocation(program, 'a_pos');
        const pos_buffer = gl.createBuffer() as WebGLBuffer;
        gl.bindBuffer(gl.ARRAY_BUFFER, pos_buffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.plane.get_pos_f32(), gl.STATIC_DRAW);
        gl.vertexAttribPointer(pos_loc, 4, gl.FLOAT, false, 4 * Float32Array.BYTES_PER_ELEMENT, 0);
        gl.vertexAttribDivisor(pos_loc, 0);
        gl.enableVertexAttribArray(pos_loc);

        // normal attribute
        let norm_loc = gl.getAttribLocation(program, 'a_norm');
        const norm_buffer = gl.createBuffer() as WebGLBuffer;
        gl.bindBuffer(gl.ARRAY_BUFFER, norm_buffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.plane.get_norms_f32(), gl.STATIC_DRAW);
        gl.vertexAttribPointer(norm_loc, 4, gl.FLOAT, false, 4 * Float32Array.BYTES_PER_ELEMENT, 0);
        gl.vertexAttribDivisor(norm_loc, 0);
        gl.enableVertexAttribArray(norm_loc);

        // uvs attribute
        let uv_loc = gl.getAttribLocation(program, 'a_uv');
        const uv_buffer = gl.createBuffer() as WebGLBuffer;
        gl.bindBuffer(gl.ARRAY_BUFFER, uv_buffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.plane.get_uvs_f32(), gl.STATIC_DRAW);
        gl.vertexAttribPointer(uv_loc, 2, gl.FLOAT, false, 2 * Float32Array.BYTES_PER_ELEMENT, 0);
        gl.vertexAttribDivisor(uv_loc, 0);
        gl.enableVertexAttribArray(uv_loc);

        // set view uniform
        const view_loc = gl.getUniformLocation(program, "u_view");
        gl.uniformMatrix4fv(view_loc, false, new Float32Array(camera.viewMatrix().all()));

        // set projection uniform
        const proj_loc = gl.getUniformLocation(program, "u_proj");
        gl.uniformMatrix4fv(proj_loc, false, new Float32Array(camera.projMatrix().all()));

        // set eye uniform
        const eye_loc = gl.getUniformLocation(program, "u_eye");
        gl.uniform3fv(eye_loc, new Float32Array(camera.pos().xyz));

        // bind transfer function texture
        const bg_loc = gl.getUniformLocation(program, 'u_bg_color');
        gl.uniform4fv(bg_loc, new Float32Array(bg.rgba));
    }
}
const _3D_VERT =
`#version 300 es
layout(location=0) in vec3 pos;
precision highp float;

uniform mat4 u_view;
uniform mat4 u_proj;
uniform vec3 u_eye;

in vec4 a_norm;
in vec4 a_pos;
in vec2 a_uv;

out vec4 v_norm;
out vec2 v_uv;
out vec3 v_eye;
out vec3 v_ray;

void main() {
    gl_Position = u_proj * u_view * a_pos;
    v_norm = normalize(a_norm);
    v_uv = a_uv;
    v_eye = u_eye;
    v_ray = a_pos.xyz - u_eye;
}
`;

const _3D_FRAG =
`#version 300 es
precision highp float;

in vec4 v_norm;
in vec2 v_uv;
in vec3 v_eye;
in vec3 v_ray;

out vec4 fragColor;

void main() {   
    vec4 my_color = vec4(0.0, 1.0, 0.0, 1.0);
    fragColor = my_color;
}
`;