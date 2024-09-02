import { Vec3 } from './lib/rary'

export class Light
{
    light_pos: Vec3
    target_speed: number
    current_speed: number
    acceleration: number
    angle: number

    constructor(initialSpeed = 0.1) {
        this.light_pos = new Vec3([2, 2, 0])
        this.target_speed = initialSpeed
        this.current_speed = initialSpeed
        this.acceleration = 4.0 // Adjust this value to change how quickly the speed changes
        this.angle = 0
    }

    update(deltaTime: number) {
        // Gradually adjust the current speed towards the target speed
        if (this.current_speed < this.target_speed) {
            this.current_speed = Math.min(this.current_speed + this.acceleration * deltaTime, this.target_speed)
        } else if (this.current_speed > this.target_speed) {
            this.current_speed = Math.max(this.current_speed - this.acceleration * deltaTime, this.target_speed)
        }

        // Update the angle based on the current speed
        this.angle += this.current_speed * deltaTime

        // Calculate the new position
        const radius = 2; // Adjust this value to change the circle's radius
        this.light_pos.x = Math.sin(this.angle) * radius
        this.light_pos.z = Math.cos(this.angle) * radius
    
        return this.light_pos
    }

    set_speed(newSpeed: number) {
        this.target_speed = newSpeed * 3.0
    }
}