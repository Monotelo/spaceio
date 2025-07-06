import { BASE_SPEED_MULTIPLIER, MAX_SPEED, GRAVITY_STRENGTH } from "@/constants/game"

export function calculateSpeed(mass: number, hasSpeedBoost = false): number {
  // Improved speed calculation with better scaling to prevent slowdown
  const baseMass = 100
  const massRatio = mass / baseMass

  // More gradual speed decrease with better minimum speed
  const baseSpeed = Math.max(4, 28 - Math.log(massRatio + 1) * 6) * BASE_SPEED_MULTIPLIER

  // Speed boost effect
  const speedMultiplier = hasSpeedBoost ? 2.2 : 1

  // Apply multiplier and cap
  const finalSpeed = Math.min(MAX_SPEED, baseSpeed * speedMultiplier)

  return finalSpeed
}

export function applyGravity(
  obj1: { x: number; y: number; mass: number; vx: number; vy: number },
  obj2: { x: number; y: number; mass: number },
): void {
  const dx = obj2.x - obj1.x
  const dy = obj2.y - obj1.y
  const distance = Math.sqrt(dx * dx + dy * dy)

  if (distance > 0 && distance < 200) {
    const force = (GRAVITY_STRENGTH * obj2.mass) / (distance * distance + 100) // Added smoothing
    const fx = (dx / distance) * force
    const fy = (dy / distance) * force

    obj1.vx += fx / Math.max(obj1.mass, 100)
    obj1.vy += fy / Math.max(obj1.mass, 100)
  }
}

export function limitVelocity(vx: number, vy: number, maxSpeed: number): { vx: number; vy: number } {
  const speed = Math.sqrt(vx * vx + vy * vy)
  if (speed > maxSpeed) {
    return {
      vx: (vx / speed) * maxSpeed,
      vy: (vy / speed) * maxSpeed,
    }
  }
  return { vx, vy }
}

export function checkCollision(
  obj1: { x: number; y: number; size: number },
  obj2: { x: number; y: number; size: number },
): boolean {
  const dx = obj1.x - obj2.x
  const dy = obj1.y - obj2.y
  const distance = Math.sqrt(dx * dx + dy * dy)
  return distance < (obj1.size + obj2.size) * 0.8
}

export function calculateCameraZoom(playerSize: number): number {
  // Zoom out as player grows - starts at 1.0 and decreases more gradually
  const baseZoom = 1.0
  const zoomFactor = Math.max(0.5, baseZoom - (playerSize - 10) / 200)

  // Ensure we return a finite number
  return Number.isFinite(zoomFactor) ? zoomFactor : 1.0
}
