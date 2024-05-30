import { Vec3, Vec4 } from './TSM'

export { Plane }

class Plane
{
    static S: number = 2.0
    static F: number = -0.6

    private pos_v4: Vec4[]
    private idx_v4: Vec3[]
    private norm_v4: Vec4[]
    private uv_v3: Vec3[]

    private pos_f32: Float32Array
    private idx_u32: Uint32Array
    private norm_f32: Float32Array
    private uv_f32: Float32Array

    constructor()
    {
        // set position arrays
        this.pos_v4 = [
            /* Top */
            new Vec4([-Plane.S,     Plane.F,    -Plane.S, 1.0]),
            new Vec4([-Plane.S,     Plane.F,     Plane.S, 1.0]),
            new Vec4([ Plane.S,     Plane.F,     Plane.S, 1.0]),
            new Vec4([ Plane.S,     Plane.F,    -Plane.S, 1.0]),
        ]
        this.pos_f32 = new Float32Array(this.pos_v4.length * 4)
        this.pos_v4.forEach((v: Vec4, i: number) => {this.pos_f32.set(v.xyzw, i * 4)})
        
        // set index arrays
        this.idx_v4 = [
            /* Top */
            new Vec3([0, 1, 2]),
            new Vec3([0, 2, 3]),
        ]
        this.idx_u32 = new Uint32Array(this.idx_v4.length * 3)
        this.idx_v4.forEach((v: Vec3, i: number) => {this.idx_u32.set(v.xyz, i * 3)})
          
        // set normals array
        this.norm_v4 = [
            /* Top */
            new Vec4([0.0, 1.0, 0.0, 0.0]),
            new Vec4([0.0, 1.0, 0.0, 0.0]),
            new Vec4([0.0, 1.0, 0.0, 0.0]),
            new Vec4([0.0, 1.0, 0.0, 0.0]),
        ]       
        this.norm_f32 = new Float32Array(this.norm_v4.length * 4)
        this.norm_v4.forEach((v: Vec4, i: number) => {this.norm_f32.set(v.xyzw, i * 4)})

        // set uvs
        this.uv_v3 = [
            /* Top */
            new Vec3([0.0, 0.0, 0.0]),
            new Vec3([0.0, 1.0, 0.0]),
            new Vec3([1.0, 1.0, 0.0]),
            new Vec3([1.0, 0.0, 0.0]), 
        ]
        this.uv_f32 = new Float32Array(this.uv_v3.length * 2)
        this.uv_v3.forEach((v: Vec3, i: number) => {this.uv_f32.set(v.xy, i * 2)})
    }

    public get_pos_f32(): Float32Array 
    {
      return this.pos_f32;
    }
    
    public get_idx_u32(): Uint32Array 
    {
      return this.idx_u32;
    }

    public get_norms_f32(): Float32Array 
    {
      return this.norm_f32;
    }
    
    public get_uvs_f32() : Float32Array 
    {
      return this.uv_f32;
    }
}