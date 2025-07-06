import type { Player } from "@/types/game"
import { WORLD_SIZE, PLAYER_START_SIZE, FRICTION } from "@/constants/game"
import { calculateSpeed } from "@/utils/physics"

export function createPlayer(): Player {
  return {
    x: WORLD_SIZE / 2,
    y: WORLD_SIZE / 2,
    size: PLAYER_START_SIZE,
    mass: 100,
    vx: 0,
    vy: 0,
    trail: [],
    glowIntensity: 0,
    powerUps: {
      shield: 0,
      speedBoost: 0,
      sizeMultiplier: 0,
      magnet: 0,
    },
  }
}

export function updatePlayer(player: Player, mouseX: number, mouseY: number): void {
  // Calculate movement towards mouse 
  const dx = mouseX - player.x
  const dy = mouseY - player.y
  const distance = Math.sqrt(dx * dx + dy * dy)

  // Only apply movement if mouse is far enough away (dead zone)
  const deadZone = 5
  if (distance > deadZone) {
    const speed = calculateSpeed(player.mass, player.powerUps.speedBoost > 0)

    // acceleration 
    const baseAcceleration = 0.15
    const acceleration = baseAcceleration

    // Normalize direction and apply acceleration
    const directionX = dx / distance
    const directionY = dy / distance

    player.vx += directionX * speed * acceleration
    player.vy += directionY * speed * acceleration
  }

  // Apply friction - consistent across all masses
  const totalFriction = FRICTION

  player.vx *= totalFriction
  player.vy *= totalFriction

  // Limit velocity with improved scaling
  const maxSpeed = calculateSpeed(player.mass, player.powerUps.speedBoost > 0)
  const currentSpeed = Math.sqrt(player.vx * player.vx + player.vy * player.vy)

  if (currentSpeed > maxSpeed) {
    const scale = maxSpeed / currentSpeed
    player.vx *= scale
    player.vy *= scale
  }

  // Update position
  player.x += player.vx
  player.y += player.vy

  // Boundary handling with improved bouncing
  const bounceReduction = 0.4
  if (player.x < player.size) {
    player.x = player.size
    player.vx = Math.abs(player.vx) * bounceReduction
  }
  if (player.x > WORLD_SIZE - player.size) {
    player.x = WORLD_SIZE - player.size
    player.vx = -Math.abs(player.vx) * bounceReduction
  }
  if (player.y < player.size) {
    player.y = player.size
    player.vy = Math.abs(player.vy) * bounceReduction
  }
  if (player.y > WORLD_SIZE - player.size) {
    player.y = WORLD_SIZE - player.size
    player.vy = -Math.abs(player.vy) * bounceReduction
  }

  // Update trail with improved smoothing
  const trailLength = Math.min(25, Math.max(10, Math.floor(player.size / 2)))
  player.trail.unshift({ x: player.x, y: player.y })
  if (player.trail.length > trailLength) player.trail.pop()

  // Update glow 
  const time = Date.now() * 0.008
  player.glowIntensity = 0.6 + Math.sin(time) * 0.2 + Math.sin(time * 1.7) * 0.1
}

export function growPlayer(player: Player, amount: number): void {
  player.mass += amount
  player.size = Math.sqrt(player.mass / Math.PI) * 2

  // Size multiplier power-up effect
  if (player.powerUps.sizeMultiplier > 0) {
    player.size *= 1.3
  }
}
