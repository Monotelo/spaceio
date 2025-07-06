import type { Particle, ParticlePool } from "@/types/game"
import { MAX_PARTICLES, PARTICLE_POOL_SIZE } from "@/constants/game"

// Object pooling for particles to reduce garbage collection
export function createParticlePool(): ParticlePool {
  const particles: Particle[] = []

  for (let i = 0; i < PARTICLE_POOL_SIZE; i++) {
    particles.push({
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      life: 0,
      decay: 0.02,
      size: 1,
      color: "#ffffff",
    })
  }

  return {
    particles,
    activeCount: 0,
  }
}

export function getParticleFromPool(
  pool: ParticlePool,
  x: number,
  y: number,
  vx: number,
  vy: number,
  color: string,
  size = 2,
): boolean {
  if (pool.activeCount >= MAX_PARTICLES) return false

  const particle = pool.particles[pool.activeCount]
  particle.x = x
  particle.y = y
  particle.vx = vx
  particle.vy = vy
  particle.life = 1
  particle.decay = 0.02
  particle.size = size
  particle.color = color

  pool.activeCount++
  return true
}

export function updateParticlePool(pool: ParticlePool): void {
  let writeIndex = 0

  for (let i = 0; i < pool.activeCount; i++) {
    const particle = pool.particles[i]

    // Update particle
    particle.x += particle.vx
    particle.y += particle.vy
    particle.vx *= 0.98
    particle.vy *= 0.98
    particle.life -= particle.decay

    // Keep alive particles
    if (particle.life > 0) {
      if (writeIndex !== i) {
        pool.particles[writeIndex] = particle
      }
      writeIndex++
    }
  }

  pool.activeCount = writeIndex
}

export function isInViewport(
  x: number,
  y: number,
  size: number,
  cameraX: number,
  cameraY: number,
  canvasWidth: number,
  canvasHeight: number,
  zoom: number,
): boolean {
  const screenX = (x - cameraX) * zoom
  const screenY = (y - cameraY) * zoom
  const scaledSize = size * zoom

  return (
    screenX > -scaledSize - 50 &&
    screenX < canvasWidth + scaledSize + 50 &&
    screenY > -scaledSize - 50 &&
    screenY < canvasHeight + scaledSize + 50
  )
}

// Spatial partitioning for collision detection optimization
export class SpatialGrid {
  private cellSize: number
  private grid: Map<string, any[]>

  constructor(cellSize = 200) {
    this.cellSize = cellSize
    this.grid = new Map()
  }

  clear(): void {
    this.grid.clear()
  }

  insert(obj: any): void {
    const cellX = Math.floor(obj.x / this.cellSize)
    const cellY = Math.floor(obj.y / this.cellSize)
    const key = `${cellX},${cellY}`

    if (!this.grid.has(key)) {
      this.grid.set(key, [])
    }
    this.grid.get(key)!.push(obj)
  }

  getNearby(x: number, y: number, radius: number): any[] {
    const nearby: any[] = []
    const cellRadius = Math.ceil(radius / this.cellSize)
    const centerX = Math.floor(x / this.cellSize)
    const centerY = Math.floor(y / this.cellSize)

    for (let dx = -cellRadius; dx <= cellRadius; dx++) {
      for (let dy = -cellRadius; dy <= cellRadius; dy++) {
        const key = `${centerX + dx},${centerY + dy}`
        const cell = this.grid.get(key)
        if (cell) {
          nearby.push(...cell)
        }
      }
    }

    return nearby
  }
}
