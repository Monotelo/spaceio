import type { PowerUp } from "@/types/game"
import { POWER_UP_DURATION, POWER_UP_TYPES } from "@/constants/game"

export function createPowerUp(x: number, y: number): PowerUp {
  const types = Object.keys(POWER_UP_TYPES) as Array<keyof typeof POWER_UP_TYPES>

  // Weighted random selection based on rarity
  const totalWeight = types.reduce((sum, type) => sum + POWER_UP_TYPES[type].rarity, 0)
  let random = Math.random() * totalWeight

  let selectedType: keyof typeof POWER_UP_TYPES = "speed"
  for (const type of types) {
    random -= POWER_UP_TYPES[type].rarity
    if (random <= 0) {
      selectedType = type
      break
    }
  }

  const config = POWER_UP_TYPES[selectedType]

  return {
    id: Math.random().toString(36).substr(2, 9),
    x,
    y,
    type: selectedType,
    size: config.size,
    rotation: 0,
    pulsePhase: Math.random() * Math.PI * 2,
    duration: POWER_UP_DURATION[selectedType],
    color: config.color,
    effect: config.effect,
    rarity: config.rarity,
  }
}

export function applyPowerUpEffect(player: any, powerUp: PowerUp): void {
  const now = Date.now()

  switch (powerUp.type) {
    case "speed":
      player.powerUps.speedBoost = now + powerUp.duration
      break
    case "shield":
      player.powerUps.shield = now + powerUp.duration
      break
    case "size":
      player.powerUps.sizeMultiplier = now + powerUp.duration
      break
    case "mass":
      player.mass += powerUp.effect
      player.size = Math.sqrt(player.mass / Math.PI) * 2
      break
    case "magnet":
      player.powerUps.magnet = now + powerUp.duration
      break
  }
}

export function updatePowerUps(player: any): void {
  const now = Date.now()

  Object.keys(player.powerUps).forEach((key) => {
    if (player.powerUps[key] < now) {
      player.powerUps[key] = 0
    }
  })
}

// Magnet effect - attracts nearby small objects and power-ups
export function applyMagnetEffect(player: any, objects: any[], powerUps: any[]): void {
  if (player.powerUps.magnet <= 0) return

  const magnetRange = player.size * 3
  const magnetStrength = 0.3

  // Attract small objects
  objects.forEach((obj) => {
    if (obj.size < player.size * 0.8) {
      const dx = player.x - obj.x
      const dy = player.y - obj.y
      const distance = Math.sqrt(dx * dx + dy * dy)

      if (distance < magnetRange && distance > 0) {
        const force = magnetStrength / (distance * 0.1)
        obj.vx += (dx / distance) * force
        obj.vy += (dy / distance) * force
      }
    }
  })

  // Attract power-ups
  powerUps.forEach((powerUp) => {
    const dx = player.x - powerUp.x
    const dy = player.y - powerUp.y
    const distance = Math.sqrt(dx * dx + dy * dy)

    if (distance < magnetRange && distance > 0) {
      const force = (magnetStrength * 2) / (distance * 0.1)
      powerUp.x += (dx / distance) * force
      powerUp.y += (dy / distance) * force
    }
  })
}
