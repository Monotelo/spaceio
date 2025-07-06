import type { SpaceObject } from "@/types/game"
import { WORLD_SIZE } from "@/constants/game"

export function createSpaceObject(x: number, y: number, size: number, type: SpaceObject["type"]): SpaceObject {
  const mass = size * size * Math.PI
  let color: string

  if (type === "enemy") {
    color = "#ff4444"
  } else if (type === "small_asteroid") {
    color = "#66bbff"
  } else {
    color = size < 15 ? "#44aaff" : size < 40 ? "#ffaa44" : "#aa44ff"
  }

  return {
    id: Math.random().toString(36).substr(2, 9),
    x,
    y,
    size,
    mass,
    type,
    vx: (Math.random() - 0.5) * 1.5, 
    vy: (Math.random() - 0.5) * 1.5,
    rotation: Math.random() * Math.PI * 2,
    rotationSpeed: (Math.random() - 0.5) * 0.05, 
    pulsePhase: Math.random() * Math.PI * 2,
    color,
  }
}

export function updateSpaceObject(obj: SpaceObject): void {
  obj.x += obj.vx
  obj.y += obj.vy
  obj.rotation += obj.rotationSpeed
  obj.pulsePhase += 0.03 // Slower pulse

  if (obj.x < obj.size || obj.x > WORLD_SIZE - obj.size) {
    obj.vx *= -0.6
    obj.x = Math.max(obj.size, Math.min(WORLD_SIZE - obj.size, obj.x))
  }
  if (obj.y < obj.size || obj.y > WORLD_SIZE - obj.size) {
    obj.vy *= -0.6
    obj.y = Math.max(obj.size, Math.min(WORLD_SIZE - obj.size, obj.y))
  }
}
