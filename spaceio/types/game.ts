export interface Player {
  x: number
  y: number
  size: number
  mass: number
  vx: number
  vy: number
  trail: Array<{ x: number; y: number }>
  glowIntensity: number
  powerUps: {
    shield: number
    speedBoost: number
    sizeMultiplier: number
    magnet: number
  }
}

export interface SpaceObject {
  id: string
  x: number
  y: number
  size: number
  mass: number
  type: "asteroid" | "enemy" | "small_asteroid"
  vx: number
  vy: number
  rotation: number
  rotationSpeed: number
  pulsePhase: number
  color: string
}

export interface PowerUp {
  id: string
  x: number
  y: number
  type: "speed" | "shield" | "size" | "mass" | "magnet"
  size: number
  rotation: number
  pulsePhase: number
  duration: number
  color: string
  effect: number
  rarity: number
}

export interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  decay: number
  size: number
  color: string
}

export interface LeaderboardEntry {
  id: string
  name: string
  mass: number
  isPlayer: boolean
}

export interface Camera {
  x: number
  y: number
  shake: number
  zoom: number
}

export interface GameStats {
  mass: number
  absorbed: number
  rank: number
  powerUpsCollected: number
}

// Performance optimization: Object pool
export interface ParticlePool {
  particles: Particle[]
  activeCount: number
}
