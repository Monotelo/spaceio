export const WORLD_SIZE = 4000
export const PLAYER_START_SIZE = 25
export const BASE_SPEED_MULTIPLIER = 0.18 
export const GRAVITY_STRENGTH = 0.25 
export const MAX_SPEED = 5 
export const FRICTION = 0.92 

export const POWER_UP_TYPES = {
  speed: { color: "#ffff00", effect: 2, size: 8, rarity: 0.3 },
  shield: { color: "#00ffff", effect: 1, size: 10, rarity: 0.25 },
  size: { color: "#ff00ff", effect: 1.5, size: 12, rarity: 0.2 },
  mass: { color: "#ff8800", effect: 200, size: 9, rarity: 0.15 },
  magnet: { color: "#00ff00", effect: 1, size: 11, rarity: 0.1 },
} as const

export const POWER_UP_SPAWN_RATE = 0.001 
export const POWER_UP_DURATION = {
  speed: 6000,
  shield: 10000,
  size: 8000,
  mass: 0,
  magnet: 12000,
}

// Performance constants
export const MAX_PARTICLES = 200
export const PARTICLE_POOL_SIZE = 300
export const CULLING_MARGIN = 100

export const AI_NAMES = [
  "CosmicHunter",
  "StarDestroyer",
  "GalaxyEater",
  "NebulaNinja",
  "VoidWalker",
  "PlanetCrusher",
  "SolarFlare",
  "DarkMatter",
  "Supernova",
  "BlackHole",
  "AstroKnight",
  "SpaceReaper",
  "CometTail",
  "OrbitMaster",
  "StellarForce",
]
