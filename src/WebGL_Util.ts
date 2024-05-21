export class webgl_util 
{
    /**
     * Creates and compiles a WebGL Shader from given source
     * @param ctx a WebGL rendering context. This has methods for compiling the shader.
     * @param shaderType can only be ctx.VERTEX_SHADER or ctx.FRAGMENT_SHADER.
     * @param source the shader source code as a string.
     * @return a WebGL shader
     */
    public static createShader(
      ctx: WebGLRenderingContext,
      shaderType: number,
      source: string
    ): WebGLShader {
      /* TODO: error checking */
      const shader: WebGLShader = ctx.createShader(shaderType) as WebGLShader;
      ctx.shaderSource(shader, source);
      ctx.compileShader(shader);
  
      /* Check for Compilation Errors */
      if (!ctx.getShaderParameter(shader, ctx.COMPILE_STATUS)) {
        console.error("ERROR compiling shader!", ctx.getShaderInfoLog(shader));
      }
      return shader;
    }
  
    /**
     * Creates a shader program from the given vertex shader and fragment shader
     * @param vsSource the vertex shader source as a string
     * @param fsSource the fragment shader source as a string
     * @return a WebGLProgram
     */
    public static createProgram(
      ctx: WebGLRenderingContext,
      vsSource: string,
      fsSource: string
    ): WebGLProgram {
      /* TODO: error checking */
  
      const shaderProgram: WebGLProgram = ctx.createProgram() as WebGLProgram;
  
      const vertexShader: WebGLShader = webgl_util.createShader(
        ctx,
        ctx.VERTEX_SHADER,
        vsSource
      );
      ctx.attachShader(shaderProgram, vertexShader);
  
      const fragmentShader: WebGLShader = webgl_util.createShader(
        ctx,
        ctx.FRAGMENT_SHADER,
        fsSource
      );
      ctx.attachShader(shaderProgram, fragmentShader);
  
      ctx.linkProgram(shaderProgram);
  
      /* Check for Linker Errors */
      if (!ctx.getProgramParameter(shaderProgram, ctx.LINK_STATUS)) {
        console.error(
          "ERROR linking program!",
          ctx.getProgramInfoLog(shaderProgram)
        );
      }
  
      /* While debugging Validate Program */
      ctx.validateProgram(shaderProgram);
      if (!ctx.getProgramParameter(shaderProgram, ctx.VALIDATE_STATUS)) {
        console.error(
          "ERROR validating program!",
          ctx.getProgramInfoLog(shaderProgram)
        );
      }
  
      return shaderProgram;
    }
  
    /**
     * Returns a WebGL context for the given Canvas
     * @param canvas any HTML canvas element
     * @return the WebGL rendering context for the canvas
     */
    public static request_context(
      canvas: HTMLCanvasElement
    ): WebGL2RenderingContext {
      /* Request WebGL Context */
      let ctx: WebGL2RenderingContext = canvas.getContext("webgl2", {
        preserveDrawingBuffer: true
      }) as WebGL2RenderingContext;
  
      if (!ctx) {
        console.log(
          "Your browser does not support WebGL, falling back",
          "to Experimental WebGL"
        );
        ctx = canvas.getContext("experimental-webgl") as WebGL2RenderingContext;
      }
  
      if (!ctx) {
        throw new Error(
          "Your browser does not support WebGL or Experimental-WebGL"
        );
      }
  
      return ctx;
    }
  }