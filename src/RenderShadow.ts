import { Camera, Plane, Vec3, Vec4 } from './lib/rary'

export class RenderShadow 
{
    plane: Plane
    gl: WebGL2RenderingContext
    program: WebGLProgram
    vao: WebGLVertexArrayObject

    constructor(_gl: WebGL2RenderingContext) {
        this.plane = new Plane()

        this.gl = _gl
        this.program = _gl.createProgram() as WebGLProgram
        this.vao = _gl.createVertexArray() as WebGLVertexArrayObject
        this.init(_gl)
    }

    init(gl: WebGL2RenderingContext) {
        let vert = _3D_VERT
        let frag = _3D_FRAG

        // create shaders
        const vertex_shader = gl.createShader(gl.VERTEX_SHADER) as WebGLShader
        const fragment_shader = gl.createShader(gl.FRAGMENT_SHADER) as WebGLShader
        gl.shaderSource(vertex_shader, vert)
        gl.compileShader(vertex_shader)
        gl.shaderSource(fragment_shader, frag)
        gl.compileShader(fragment_shader)

        // used for debugging shaders
        const vertex_log = gl.getShaderInfoLog(vertex_shader)
        const fragment_log = gl.getShaderInfoLog(fragment_shader)
        if (vertex_log !== '') console.log('vertex shader log: ' + vertex_log)
        if (fragment_log !== '') console.log('fragment shader log: ' + fragment_log)

        // create program
        let program = this.program
        gl.attachShader(program, vertex_shader)
        gl.attachShader(program, fragment_shader)
        gl.linkProgram(program)

        // used for debugging program
        const program_log = gl.getProgramInfoLog(program)
        if (program_log !== '') console.log('shader program log: ' + program_log)

        // use program!
        gl.useProgram(this.program)
    }

    render(w: number, h: number, camera: Camera, bg: Vec4, light: Vec3, light_radius: number, light_color_mult: Vec4, texture3d?: WebGLTexture) {
        let gl = this.gl
        gl.bindFramebuffer(gl.FRAMEBUFFER, null)
        gl.clearColor(bg.r, bg.g, bg.b, bg.a)
        gl.clear(gl.COLOR_BUFFER_BIT)
        gl.enable(gl.CULL_FACE)
        gl.cullFace(gl.BACK)
        gl.frontFace(gl.CCW)
        gl.enable(gl.BLEND)
        gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA)
        gl.viewport(0, 0, w, h)

        // setup render plane
        this.setup_plane_render(gl, camera, bg, light, light_radius, light_color_mult, texture3d)

        // draw
        gl.bindFramebuffer(gl.FRAMEBUFFER, null)
        gl.drawElements(gl.TRIANGLES, this.plane.get_idx_u32().length, gl.UNSIGNED_INT, 0)
    }

    setup_plane_render(gl: WebGL2RenderingContext, camera: Camera, bg: Vec4, light: Vec3, light_radius: number, light_color_mult: Vec4, texture3d?: WebGLTexture) {
        let program = this.program as WebGLProgram
        
        // draw cube
        gl.useProgram(this.program)
        /* Setup VAO */
        gl.bindVertexArray(this.vao)

        /* Setup Index Buffer */
        const idx_buffer = gl.createBuffer() as WebGLBuffer
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, idx_buffer)
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.plane.get_idx_u32(), gl.STATIC_DRAW)

        /* Setup Attributes */
        // position attribute
        let pos_loc = gl.getAttribLocation(program, 'a_pos')
        const pos_buffer = gl.createBuffer() as WebGLBuffer
        gl.bindBuffer(gl.ARRAY_BUFFER, pos_buffer)
        gl.bufferData(gl.ARRAY_BUFFER, this.plane.get_pos_f32(), gl.STATIC_DRAW)
        gl.vertexAttribPointer(pos_loc, 4, gl.FLOAT, false, 4 * Float32Array.BYTES_PER_ELEMENT, 0)
        gl.vertexAttribDivisor(pos_loc, 0)
        gl.enableVertexAttribArray(pos_loc)

        // normal attribute
        let norm_loc = gl.getAttribLocation(program, 'a_norm')
        const norm_buffer = gl.createBuffer() as WebGLBuffer
        gl.bindBuffer(gl.ARRAY_BUFFER, norm_buffer)
        gl.bufferData(gl.ARRAY_BUFFER, this.plane.get_norms_f32(), gl.STATIC_DRAW)
        gl.vertexAttribPointer(norm_loc, 4, gl.FLOAT, false, 4 * Float32Array.BYTES_PER_ELEMENT, 0)
        gl.vertexAttribDivisor(norm_loc, 0)
        gl.enableVertexAttribArray(norm_loc)

        // uvs attribute
        let uv_loc = gl.getAttribLocation(program, 'a_uv')
        const uv_buffer = gl.createBuffer() as WebGLBuffer
        gl.bindBuffer(gl.ARRAY_BUFFER, uv_buffer)
        gl.bufferData(gl.ARRAY_BUFFER, this.plane.get_uvs_f32(), gl.STATIC_DRAW)
        gl.vertexAttribPointer(uv_loc, 2, gl.FLOAT, false, 2 * Float32Array.BYTES_PER_ELEMENT, 0)
        gl.vertexAttribDivisor(uv_loc, 0)
        gl.enableVertexAttribArray(uv_loc)

        // set view uniform
        const view_loc = gl.getUniformLocation(program, "u_view")
        gl.uniformMatrix4fv(view_loc, false, new Float32Array(camera.viewMatrix().all()))

        // set projection uniform
        const proj_loc = gl.getUniformLocation(program, "u_proj")
        gl.uniformMatrix4fv(proj_loc, false, new Float32Array(camera.projMatrix().all()))

        // set plane f uniform
        const plane_f_loc = gl.getUniformLocation(program, "u_plane_f")
        gl.uniform1f(plane_f_loc, Plane.F)

        // set plane s uniform
        const plane_s_loc = gl.getUniformLocation(program, "u_plane_s")
        gl.uniform1f(plane_s_loc, Plane.S)

        // set light uniform
        const light_loc = gl.getUniformLocation(program, "u_light")
        gl.uniform3fv(light_loc, new Float32Array(light.xyz))

        // set light radius uniform
        const light_rad_loc = gl.getUniformLocation(program, "u_light_rad")
        gl.uniform1f(light_rad_loc, light_radius)

        // set light radius uniform
        const light_mult_loc = gl.getUniformLocation(program, "u_light_color_mult")
        gl.uniform4fv(light_mult_loc, new Float32Array(light_color_mult.xyzw))

        // set use volume boolean
        const usevolloc = gl.getUniformLocation(program, "u_use_vol")
        gl.uniform1i(usevolloc, texture3d == null ? 0 : 1)

        // set volume uniform
        if (texture3d) {
            const volume_loc = gl.getUniformLocation(program, 'u_volume')
            gl.activeTexture(gl.TEXTURE0)
            gl.bindTexture(gl.TEXTURE_3D, texture3d)
            gl.generateMipmap(gl.TEXTURE_3D)
            gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_WRAP_R, gl.CLAMP_TO_EDGE)
            gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
            gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
            gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
            gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
            gl.uniform1i(volume_loc, 0)
        }
    }
}
const _3D_VERT =
`#version 300 es
layout(location=0) in vec3 pos;
precision highp float;

uniform mat4 u_view;
uniform mat4 u_proj;

in vec4 a_norm;
in vec4 a_pos;
in vec2 a_uv;

out vec4 v_norm;
out vec2 v_uv;

void main() {
    gl_Position = u_proj * u_view * a_pos;
    v_norm = normalize(a_norm);
    v_uv = a_uv;
}
`

const _3D_FRAG =
`#version 300 es
precision highp float;

uniform float u_plane_f;
uniform float u_plane_s;
uniform float u_light_rad;
uniform vec3 u_light;
uniform vec4 u_light_color_mult;
uniform highp sampler3D u_volume;
uniform int u_use_vol;

in vec4 v_norm;
in vec2 v_uv;

out vec4 fragColor;

vec2 intersect_box(vec3 orig, vec3 dir) {
	const vec3 box_min = vec3(-0.5, -0.5, -0.5);
	const vec3 box_max = vec3(0.5, 0.5, 0.5);
	vec3 inv_dir = 1.0 / dir;
	vec3 tmin_tmp = (box_min - orig) * inv_dir;
	vec3 tmax_tmp = (box_max - orig) * inv_dir;
	vec3 tmin = min(tmin_tmp, tmax_tmp);
	vec3 tmax = max(tmin_tmp, tmax_tmp);
	float t0 = max(tmin.x, max(tmin.y, tmin.z));
	float t1 = min(tmax.x, min(tmax.y, tmax.z));
	return vec2(t0, t1);
}

void main() {
    vec2 world_uv = 2.0 * u_plane_s * v_uv - u_plane_s;
    vec3 ori = vec3(world_uv.x, u_plane_f, world_uv.y);
    vec3 dir = normalize(ori - u_light);
    vec2 t_hit = intersect_box(ori, dir);
    vec4 my_color = vec4(0.0, 0.0, 0.0, 0.0);
    
    // march through volume to check for any intersections
    if (t_hit.x <= t_hit.y) {;

        float dt = 0.01;

        vec3 p = ori + t_hit.x * dir;
        for (float t = t_hit.x; t < t_hit.y; t += dt) {

            vec3 pos = p+0.5;
            vec4 rgba = texture(u_volume, pos);
    
            // if miss -> hit bg
            if (rgba.a == 0.0 && my_color.a > 0.0) {
                p += dir * dt;
                continue;
            }

    
            my_color.rgb += (1.0 - my_color.a) * rgba.a * rgba.rgb;
            my_color.a += (1.0 - my_color.a) * rgba.a;
    
            if (my_color.a >= 0.95) {
                my_color.a = 1.0;
                break;
            }
            p += dir * dt;
        }

        // no shadow if volume not used
        if (u_use_vol == 0) {
            my_color = vec4(0.0);
        }

        // shadow if no voxels hit
        if (my_color != vec4(0.0)) {
            float ldist = distance(ori, u_light);
            float shadow_intensity = 0.1;
            float light = 1.0 - (ldist / u_light_rad) - shadow_intensity;
            my_color = vec4(light, light, light, 1.0) * u_light_color_mult;
        }
    }
    
    if (my_color.a < 0.1) {
        float ldist = distance(ori, u_light);
        float light = 1.0 - (ldist / u_light_rad);
        my_color = vec4(light, light, light, 1.0) * u_light_color_mult;
    }
        
    // Apply dithering to reduce banding
    float dither_strength = 0.014; // Adjust this value for stronger dithering
    float dither = (fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453) - 0.5) * dither_strength;
    fragColor = my_color + vec4(dither, dither, dither, 0.0);
}
`