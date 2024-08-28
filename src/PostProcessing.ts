// Define the vertex shader
const vertexShaderSource = 
`#version 300 es
in vec4 a_position;
in vec2 a_texCoord;
out vec2 v_texCoord;

void main() {
    gl_Position = a_position;
    v_texCoord = a_texCoord;
}`

// Define the fragment shader with FXAA anti-aliasing
const fragmentShaderSource = 
`#version 300 es
precision highp float;

in vec2 v_texCoord;
out vec4 outColor;

uniform sampler2D u_texture;
uniform vec2 u_resolution;
uniform float u_blur_strength;

const float EDGE_THRESHOLD_MIN = 0.0312;
const float EDGE_THRESHOLD_MAX = 0.125; // Lowered for more aggressive detection
const int ITERATIONS = 4; // Increased for more refinement
const float SUBPIXEL_QUALITY = 0.75;

float rgb2luma(vec3 rgb) {
    return dot(rgb, vec3(0.299, 0.587, 0.114));
}

vec3 blur13(sampler2D tex, vec2 uv, vec2 resolution) {
    vec2 texelSize = 1.0 / resolution;
    vec3 result = vec3(0.0);
    vec2 hlim = vec2(float(-ITERATIONS) * 0.5 + 0.5);
    for (int i = 0; i < ITERATIONS; ++i) {
        for (int j = 0; j < ITERATIONS; ++j) {
            vec2 offset = (hlim + vec2(float(i), float(j))) * texelSize * u_blur_strength;
            result += texture(tex, uv + offset).rgb;
        }
    }
    return result / float(ITERATIONS * ITERATIONS);
}

void main() {
    vec2 texelSize = 1.0 / u_resolution;
    vec2 screenTexCoords = v_texCoord;

    // Apply initial blur
    vec3 blurredColor = blur13(u_texture, screenTexCoords, u_resolution);

    // Sample neighboring texels
    vec3 rgbNW = texture(u_texture, screenTexCoords + vec2(-1.0, -1.0) * texelSize).rgb;
    vec3 rgbNE = texture(u_texture, screenTexCoords + vec2(1.0, -1.0) * texelSize).rgb;
    vec3 rgbSW = texture(u_texture, screenTexCoords + vec2(-1.0, 1.0) * texelSize).rgb;
    vec3 rgbSE = texture(u_texture, screenTexCoords + vec2(1.0, 1.0) * texelSize).rgb;
    vec3 rgbM  = blurredColor;

    // Calculate luma for each sample
    float lumaNW = rgb2luma(rgbNW);
    float lumaNE = rgb2luma(rgbNE);
    float lumaSW = rgb2luma(rgbSW);
    float lumaSE = rgb2luma(rgbSE);
    float lumaM  = rgb2luma(rgbM);

    // Calculate luma range for edge detection
    float lumaMin = min(lumaM, min(min(lumaNW, lumaNE), min(lumaSW, lumaSE)));
    float lumaMax = max(lumaM, max(max(lumaNW, lumaNE), max(lumaSW, lumaSE)));
    float lumaRange = lumaMax - lumaMin;

    // Check if we're on an edge
    if (lumaRange < max(EDGE_THRESHOLD_MIN, lumaMax * EDGE_THRESHOLD_MAX)) {
        outColor = vec4(rgbM, 1.0);
        return;
    }

    // Calculate horizontal and vertical gradients
    float horizontalGradient = abs((lumaNW + lumaNE) - (lumaSW + lumaSE));
    float verticalGradient = abs((lumaNW + lumaSW) - (lumaNE + lumaSE));

    // Determine edge direction
    vec2 dir;
    if (horizontalGradient >= verticalGradient) {
        dir = vec2(0.0, sign((lumaNW + lumaNE) - (lumaSW + lumaSE)));
    } else {
        dir = vec2(sign((lumaNW + lumaSW) - (lumaNE + lumaSE)), 0.0);
    }

    // Refine edge direction
    vec3 rgbA = 0.5 * (
        texture(u_texture, screenTexCoords + dir * texelSize).rgb +
        texture(u_texture, screenTexCoords - dir * texelSize).rgb
    );

    // Perform iterative refinement
    vec3 rgbB;
    float lumaB;
    for (int i = 0; i < ITERATIONS; i++) {
        rgbB = rgbA * 0.5 + 0.25 * (
            texture(u_texture, screenTexCoords + dir * texelSize * float(i + 1)).rgb +
            texture(u_texture, screenTexCoords - dir * texelSize * float(i + 1)).rgb
        );
        lumaB = rgb2luma(rgbB);
        if (lumaB < lumaMin || lumaB > lumaMax) break;
        rgbA = rgbB;
    }

    // Perform subpixel antialiasing
    float lumaA = rgb2luma(rgbA);
    if (abs(lumaA - lumaM) >= SUBPIXEL_QUALITY * lumaRange) {
        outColor = vec4(mix(rgbA, rgbM, 0.5), 1.0); // Blend FXAA result with blur
    } else {
        outColor = vec4(rgbM, 1.0);
    }
}`;

class PostProcessing 
{    
    private gl: WebGL2RenderingContext
    private program: WebGLProgram | null = null
    private texture: WebGLTexture | null = null
    private framebuffer: WebGLFramebuffer | null = null
    private positionBuffer: WebGLBuffer | null = null
    private texCoordBuffer: WebGLBuffer | null = null

    constructor(gl: WebGL2RenderingContext) {
        this.gl = gl
        this.initShaders()
        this.initBuffers()
        this.initTexture()
        this.initFramebuffer()
    }

    private initShaders(): void {
        
        const vertexShader = this.compileShader(vertexShaderSource, this.gl.VERTEX_SHADER)
        const fragmentShader = this.compileShader(fragmentShaderSource, this.gl.FRAGMENT_SHADER)
    
        this.program = this.gl.createProgram()!
        this.gl.attachShader(this.program, vertexShader)
        this.gl.attachShader(this.program, fragmentShader)
        this.gl.linkProgram(this.program)
    
        if (!this.gl.getProgramParameter(this.program, this.gl.LINK_STATUS)) {
            throw new Error('Unable to initialize the shader program')
        }
    }
    
    private compileShader(source: string, type: number): WebGLShader {
        const shader = this.gl.createShader(type)!
        this.gl.shaderSource(shader, source)
        this.gl.compileShader(shader)
    
        if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
            throw new Error('An error occurred compiling the shaders: ' + this.gl.getShaderInfoLog(shader))
        }
    
        return shader
    }

    private createBuffer(data: Float32Array): WebGLBuffer {
        const buffer = this.gl.createBuffer()!
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer)
        this.gl.bufferData(this.gl.ARRAY_BUFFER, data, this.gl.STATIC_DRAW)
        return buffer
    }
    
    private initBuffers(): void {
        this.positionBuffer = this.createBuffer(new Float32Array([
            -1, -1,
            1, -1,
            1, 1,
            
            1, 1,
            -1, 1,
            -1, -1,
        ]))

        this.texCoordBuffer = this.createBuffer(new Float32Array([
            0, 1,
            1, 1,
            1, 0,

            1, 0,
            0, 0,
            0, 1,
        ]))
    }
    
    private initTexture(): void {
        this.texture = this.gl.createTexture()!
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture)
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE)
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE)
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.NEAREST)
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST)
    }
    
    private initFramebuffer() {
        this.framebuffer = this.gl.createFramebuffer()!
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.framebuffer)
        this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, this.gl.COLOR_ATTACHMENT0, this.gl.TEXTURE_2D, this.texture, 0)
    }

    public captureCanvasContent(canvas: HTMLCanvasElement) {
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture)
        this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, canvas)
    }
    
    public applyPostProcessing(w: number, h: number, blur_strength: number) {
        if (!this.program) return

        this.gl.cullFace(this.gl.BACK)
        this.gl.viewport(0, 0, w, h)        
        this.gl.useProgram(this.program)
    
        const positionLoc = this.gl.getAttribLocation(this.program, 'a_position')
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer)
        this.gl.enableVertexAttribArray(positionLoc)
        this.gl.vertexAttribPointer(positionLoc, 2, this.gl.FLOAT, false, 0, 0)

        const texCoordLoc = this.gl.getAttribLocation(this.program, 'a_texCoord')
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.texCoordBuffer)
        this.gl.enableVertexAttribArray(texCoordLoc)
        this.gl.vertexAttribPointer(texCoordLoc, 2, this.gl.FLOAT, false, 0, 0)
    
        const textureLocation = this.gl.getUniformLocation(this.program, 'u_texture')
        this.gl.uniform1i(textureLocation, 0)

        const resolutionLoc = this.gl.getUniformLocation(this.program, 'u_resolution')
        this.gl.uniform2f(resolutionLoc, w, h)

        const blurstrengthLoc = this.gl.getUniformLocation(this.program, 'u_blur_strength')
        this.gl.uniform1f(blurstrengthLoc, blur_strength)
        
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null)
        this.gl.drawArrays(this.gl.TRIANGLES, 0, 6)
    }

    public render(w: number, h: number, blur_strength: number, canvas: HTMLCanvasElement) {
        this.captureCanvasContent(canvas)
        this.applyPostProcessing(w, h, blur_strength)
    }
}

export { PostProcessing }