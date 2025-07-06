"use client"

import { useEffect } from "react"

import type React from "react"
import { useRef, useCallback } from "react"
import type { Player, SpaceObject, PowerUp, GameStats, ParticlePool } from "@/types/game"
import { updatePlayer, growPlayer } from "@/classes/Player"
import { updateSpaceObject } from "@/classes/SpaceObject"
import { applyGravity, checkCollision, calculateCameraZoom } from "@/utils/physics"
import { createPowerUp, applyPowerUpEffect, updatePowerUps, applyMagnetEffect } from "@/utils/powerups"
import {
  createParticlePool,
  getParticleFromPool,
  updateParticlePool,
  isInViewport,
  SpatialGrid,
} from "@/utils/performance"
import { WORLD_SIZE, POWER_UP_SPAWN_RATE } from "@/constants/game"

function ensureFinite(value: number): number {
  return Number.isFinite(value) ? value : 0
}

export function useGameLoop() {
  const animationRef = useRef<number | undefined>(undefined)
  const particlePoolRef = useRef<ParticlePool>(createParticlePool())
  const spatialGridRef = useRef<SpatialGrid>(new SpatialGrid())
  const gameRunningRef = useRef<boolean>(false)
  const mouseRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 })

  const gameLoop = useCallback(
    (
      canvasRef: React.RefObject<HTMLCanvasElement>,
      miniMapRef: React.RefObject<HTMLCanvasElement>,
      playerRef: React.MutableRefObject<Player | null>,
      objectsRef: React.MutableRefObject<SpaceObject[]>,
      powerUpsRef: React.MutableRefObject<PowerUp[]>,
      setGameStats: React.Dispatch<React.SetStateAction<GameStats>>,
      setGameRunning: React.Dispatch<React.SetStateAction<boolean>>,
      setGameOver: React.Dispatch<React.SetStateAction<boolean>>,
      updateLeaderboard: (mass: number) => void,
      createSpaceObject: (x: number, y: number, size: number, type: SpaceObject["type"]) => SpaceObject,
      setDebugInfo?: React.Dispatch<React.SetStateAction<any>>,
      showDebug?: boolean,
    ) => {
      // Set the running flag
      gameRunningRef.current = true

      if (!playerRef.current) return

      const canvas = canvasRef.current
      const miniMap = miniMapRef.current
      if (!canvas || !miniMap) return

      const ctx = canvas.getContext("2d")
      const miniMapCtx = miniMap.getContext("2d")
      if (!ctx || !miniMapCtx) return

      const player = playerRef.current
      const particlePool = particlePoolRef.current
      const spatialGrid = spatialGridRef.current
      const mouse = mouseRef.current

      // Get camera from a ref 
      const camera = (window as any).gameCamera || {
        x: player.x - canvas.width / 2,
        y: player.y - canvas.height / 2,
        zoom: 1,
        shake: 0,
      }

      // Calculate camera zoom based on player size
      camera.zoom = calculateCameraZoom(player.size)

      // Ensure zoom is a valid number
      if (!Number.isFinite(camera.zoom) || camera.zoom <= 0) {
        camera.zoom = 1.0 
      }

      // Clear canvas
      ctx.fillStyle = "rgba(10, 10, 35, 0.1)"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Update power-ups
      updatePowerUps(player)

      // Apply magnet effect
      applyMagnetEffect(player, objectsRef.current, powerUpsRef.current)

      // Update player
      updatePlayer(player, mouse.x, mouse.y)

      // Update camera with zoom
      const targetX = player.x - canvas.width / 2 / camera.zoom
      const targetY = player.y - canvas.height / 2 / camera.zoom
      camera.x += (targetX - camera.x) * 0.08
      camera.y += (targetY - camera.y) * 0.08

      // Apply camera shake
      if (camera.shake > 0) {
        camera.x += ((Math.random() - 0.5) * camera.shake) / camera.zoom
        camera.y += ((Math.random() - 0.5) * camera.shake) / camera.zoom
        camera.shake *= 0.9
      }
      // Store camera back to global
      ;(window as any).gameCamera = camera

      // Update debug info if callback provided AND debug mode is enabled
      if (setDebugInfo && showDebug) {
        setDebugInfo({
          player: { ...player },
          mouse: { ...mouse },
          camera: { ...camera },
        })
      }

      // Clear spatial grid
      spatialGrid.clear()

      // Populate spatial grid with objects
      objectsRef.current.forEach((obj) => spatialGrid.insert(obj))

      // Spawn power-ups with rarity consideration
      if (Math.random() < POWER_UP_SPAWN_RATE) {
        let x, y
        do {
          x = Math.random() * WORLD_SIZE
          y = Math.random() * WORLD_SIZE
        } while (Math.sqrt((x - player.x) ** 2 + (y - player.y) ** 2) < 200)

        powerUpsRef.current.push(createPowerUp(x, y))
      }

      // Update and draw power-ups
      for (let i = powerUpsRef.current.length - 1; i >= 0; i--) {
        const powerUp = powerUpsRef.current[i]
        powerUp.rotation += 0.05
        powerUp.pulsePhase += 0.1

        // Check collision with player
        if (checkCollision(player, powerUp)) {
          applyPowerUpEffect(player, powerUp)
          powerUpsRef.current.splice(i, 1)

          setGameStats((prev) => ({
            ...prev,
            powerUpsCollected: prev.powerUpsCollected + 1,
          }))

          // Create collection particles using pool
          for (let j = 0; j < 8; j++) {
            const angle = Math.random() * Math.PI * 2
            const speed = Math.random() * 6 + 2
            getParticleFromPool(
              particlePool,
              powerUp.x,
              powerUp.y,
              Math.cos(angle) * speed,
              Math.sin(angle) * speed,
              powerUp.color,
              3,
            )
          }
          continue
        }

        // Draw power-up only if in viewport
        if (
          isInViewport(powerUp.x, powerUp.y, powerUp.size, camera.x, camera.y, canvas.width, canvas.height, camera.zoom)
        ) {
          const screenX = (powerUp.x - camera.x) * camera.zoom
          const screenY = (powerUp.y - camera.y) * camera.zoom

          ctx.save()
          ctx.translate(screenX, screenY)
          ctx.rotate(powerUp.rotation)
          ctx.scale(camera.zoom, camera.zoom)

          // Draw glow
          const glowSize = powerUp.size * (2 + Math.sin(powerUp.pulsePhase) * 0.5)
          const safeGlowSize = ensureFinite(glowSize)
          if (safeGlowSize > 0) {
            const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, safeGlowSize)
            gradient.addColorStop(0, powerUp.color + "80")
            gradient.addColorStop(1, powerUp.color + "00")

            ctx.fillStyle = gradient
            ctx.beginPath()
            ctx.arc(0, 0, glowSize, 0, Math.PI * 2)
            ctx.fill()
          }

          // Draw core
          ctx.fillStyle = powerUp.color
          ctx.beginPath()
          ctx.arc(0, 0, powerUp.size, 0, Math.PI * 2)
          ctx.fill()

          // Draw symbol
          ctx.fillStyle = "#ffffff"
          ctx.font = `${powerUp.size}px Arial`
          ctx.textAlign = "center"
          ctx.textBaseline = "middle"

          const symbols = { speed: "⚡", shield: "🛡", size: "🔮", mass: "💎", magnet: "🧲" }
          ctx.fillText(symbols[powerUp.type] || "?", 0, 0)

          ctx.restore()
        }
      }

      // Update objects with spatial optimization
      for (let i = objectsRef.current.length - 1; i >= 0; i--) {
        const obj = objectsRef.current[i]
        updateSpaceObject(obj)

        // Apply gravity only from nearby objects
        const nearbyObjects = spatialGrid.getNearby(obj.x, obj.y, 200)
        nearbyObjects.forEach((other) => {
          if (other.id !== obj.id && other.size > obj.size * 0.5) {
            applyGravity(obj, other)
          }
        })

        // Apply gravity from player if nearby
        if (playerRef.current && Math.abs(obj.x - player.x) < 200 && Math.abs(obj.y - player.y) < 200) {
          if (player.size > obj.size * 0.5) {
            applyGravity(obj, player)
          }
        }

        // Check collision with player
        if (checkCollision(player, obj)) {
          const canEat = player.size > obj.size * 1.1
          const hasShield = player.powerUps.shield > 0

          if (canEat || hasShield) {
            if (canEat) {
              const massGain = obj.mass
              growPlayer(player, massGain)

              // Reduced momentum transfer to prevent speed issues
              const momentumTransfer = 0.02 // Reduced from 0.05
              player.vx += obj.vx * momentumTransfer
              player.vy += obj.vy * momentumTransfer

              setGameStats((prev) => ({
                mass: player.mass,
                absorbed: prev.absorbed + 1,
                rank: prev.rank,
                powerUpsCollected: prev.powerUpsCollected,
              }))

              updateLeaderboard(player.mass)
              camera.shake = Math.min(8, massGain / 100)
            }

            // Create particles using pool
            const particleCount = Math.min(12, obj.size)
            for (let j = 0; j < particleCount; j++) {
              const angle = Math.random() * Math.PI * 2
              const speed = Math.random() * 6 + 2
              getParticleFromPool(
                particlePool,
                obj.x,
                obj.y,
                Math.cos(angle) * speed,
                Math.sin(angle) * speed,
                canEat ? obj.color : "#00ffff",
                3,
              )
            }

            // Remove and replace object
            objectsRef.current.splice(i, 1)

            let x, y
            do {
              x = Math.random() * WORLD_SIZE
              y = Math.random() * WORLD_SIZE
            } while (Math.sqrt((x - player.x) ** 2 + (y - player.y) ** 2) < 300)

            if (obj.type === "small_asteroid") {
              const size = 3 + Math.random() * 8
              objectsRef.current.push(createSpaceObject(x, y, size, "small_asteroid"))
            } else if (obj.type === "enemy") {
              const size = 20 + Math.random() * 60
              objectsRef.current.push(createSpaceObject(x, y, size, "enemy"))
            } else {
              const size = 15 + Math.random() * 40
              objectsRef.current.push(createSpaceObject(x, y, size, "asteroid"))
            }

            continue
          } else {
            // Player death
            for (let j = 0; j < 30; j++) {
              const angle = Math.random() * Math.PI * 2
              const speed = Math.random() * 15 + 5
              getParticleFromPool(
                particlePool,
                player.x,
                player.y,
                Math.cos(angle) * speed,
                Math.sin(angle) * speed,
                "#ff4444",
                4,
              )
            }

            camera.shake = 25
            gameRunningRef.current = false
            setGameRunning(false)
            setGameOver(true)
            return
          }
        }

        // Draw object only if in viewport
        if (isInViewport(obj.x, obj.y, obj.size, camera.x, camera.y, canvas.width, canvas.height, camera.zoom)) {
          const screenX = (obj.x - camera.x) * camera.zoom
          const screenY = (obj.y - camera.y) * camera.zoom

          ctx.save()
          ctx.translate(screenX, screenY)
          ctx.rotate(obj.rotation)
          ctx.scale(camera.zoom, camera.zoom)

          // Draw glow for larger objects
          if (obj.size > 20) {
            const glowSize = obj.size * (1.5 + Math.sin(obj.pulsePhase) * 0.2)
            const safeObjGlowSize = ensureFinite(glowSize)
            if (safeObjGlowSize > 0) {
              const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, safeObjGlowSize)
              gradient.addColorStop(0, obj.color + "60")
              gradient.addColorStop(1, obj.color + "00")

              ctx.fillStyle = gradient
              ctx.beginPath()
              ctx.arc(0, 0, glowSize, 0, Math.PI * 2)
              ctx.fill()
            }
          }

          ctx.fillStyle = obj.color
          if (obj.type === "enemy") {
            // Angular enemy shape
            ctx.beginPath()
            for (let i = 0; i < 6; i++) {
              const angle = (i / 6) * Math.PI * 2
              const radius = obj.size * (0.8 + Math.sin(obj.pulsePhase + i) * 0.2)
              const x = Math.cos(angle) * radius
              const y = Math.sin(angle) * radius
              if (i === 0) ctx.moveTo(x, y)
              else ctx.lineTo(x, y)
            }
            ctx.closePath()
            ctx.fill()
          } else {
            ctx.beginPath()
            ctx.arc(0, 0, obj.size, 0, Math.PI * 2)
            ctx.fill()

            if (obj.type === "small_asteroid") {
              ctx.fillStyle = "#ffffff"
              ctx.beginPath()
              ctx.arc(obj.size * 0.3, -obj.size * 0.3, obj.size * 0.2, 0, Math.PI * 2)
              ctx.fill()
            }
          }

          ctx.restore()
        }
      }

      // Update particle pool
      updateParticlePool(particlePool)

      // Draw particles
      for (let i = 0; i < particlePool.activeCount; i++) {
        const particle = particlePool.particles[i]
        const screenX = (particle.x - camera.x) * camera.zoom
        const screenY = (particle.y - camera.y) * camera.zoom

        ctx.save()
        ctx.globalAlpha = particle.life
        ctx.fillStyle = particle.color
        ctx.beginPath()
        ctx.arc(screenX, screenY, particle.size * camera.zoom, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
      }

      // Draw player with zoom
      const screenX = (player.x - camera.x) * camera.zoom
      const screenY = (player.y - camera.y) * camera.zoom

      // Draw trail
      ctx.globalAlpha = 0.3
      for (let i = 0; i < player.trail.length - 1; i++) {
        const alpha = ((player.trail.length - i) / player.trail.length) * 0.3
        ctx.globalAlpha = alpha
        ctx.strokeStyle = `rgba(0, 255, 136, ${alpha})`
        ctx.lineWidth = player.size * (alpha + 0.1) * camera.zoom
        ctx.beginPath()
        ctx.moveTo((player.trail[i].x - camera.x) * camera.zoom, (player.trail[i].y - camera.y) * camera.zoom)
        ctx.lineTo((player.trail[i + 1].x - camera.x) * camera.zoom, (player.trail[i + 1].y - camera.y) * camera.zoom)
        ctx.stroke()
      }

      ctx.globalAlpha = 1

      // Draw magnet effect
      if (player.powerUps.magnet > 0) {
        const safeScreenX = ensureFinite(screenX)
        const safeScreenY = ensureFinite(screenY)
        const safePlayerSize = ensureFinite(player.size * camera.zoom)
        const safeMagnetSize = ensureFinite(player.size * 3 * camera.zoom)
        if (safeMagnetSize > 0) {
          const magnetGradient = ctx.createRadialGradient(
            safeScreenX,
            safeScreenY,
            safePlayerSize,
            safeScreenX,
            safeScreenY,
            safeMagnetSize,
          )
          magnetGradient.addColorStop(0, "rgba(0, 255, 0, 0.1)")
          magnetGradient.addColorStop(1, "rgba(0, 255, 0, 0)")

          ctx.fillStyle = magnetGradient
          ctx.beginPath()
          ctx.arc(screenX, screenY, player.size * 3 * camera.zoom, 0, Math.PI * 2)
          ctx.fill()
        }
      }

      // Draw shield effect
      if (player.powerUps.shield > 0) {
        const safeScreenX = ensureFinite(screenX)
        const safeScreenY = ensureFinite(screenY)
        const safePlayerSize = ensureFinite(player.size * camera.zoom)
        const safeShieldSize = ensureFinite(player.size * 2.5 * camera.zoom)
        if (safeShieldSize > 0) {
          const shieldGradient = ctx.createRadialGradient(
            safeScreenX,
            safeScreenY,
            safePlayerSize,
            safeScreenX,
            safeScreenY,
            safeShieldSize,
          )
          shieldGradient.addColorStop(0, "rgba(0, 255, 255, 0.3)")
          shieldGradient.addColorStop(1, "rgba(0, 255, 255, 0)")

          ctx.fillStyle = shieldGradient
          ctx.beginPath()
          ctx.arc(screenX, screenY, player.size * 2.5 * camera.zoom, 0, Math.PI * 2)
          ctx.fill()
        }
      }

      // Draw player glow
      const safeScreenX = ensureFinite(screenX)
      const safeScreenY = ensureFinite(screenY)
      const safeGlowRadius = ensureFinite(player.size * 2 * camera.zoom)
      if (safeGlowRadius > 0) {
        const gradient = ctx.createRadialGradient(safeScreenX, safeScreenY, 0, safeScreenX, safeScreenY, safeGlowRadius)
        gradient.addColorStop(0, `rgba(0, 255, 136, ${player.glowIntensity})`)
        gradient.addColorStop(0.7, `rgba(0, 255, 136, ${player.glowIntensity * 0.3})`)
        gradient.addColorStop(1, "rgba(0, 255, 136, 0)")

        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.arc(screenX, screenY, player.size * 2 * camera.zoom, 0, Math.PI * 2)
        ctx.fill()
      }

      // Draw player core
      ctx.fillStyle = "#00ff88"
      ctx.beginPath()
      ctx.arc(screenX, screenY, player.size * camera.zoom, 0, Math.PI * 2)
      ctx.fill()

      // Draw energy core
      ctx.fillStyle = "#ffffff"
      ctx.beginPath()
      ctx.arc(
        screenX - player.size * 0.3 * camera.zoom,
        screenY - player.size * 0.3 * camera.zoom,
        player.size * 0.3 * camera.zoom,
        0,
        Math.PI * 2,
      )
      ctx.fill()

      // Draw debug elements ONLY if debug mode is enabled
      if (showDebug) {
        // Draw mouse cursor indicator for debugging
        const mouseCursorX = (mouse.x - camera.x) * camera.zoom
        const mouseCursorY = (mouse.y - camera.y) * camera.zoom

        // Only draw if cursor is within canvas bounds
        if (mouseCursorX >= 0 && mouseCursorX <= canvas.width && mouseCursorY >= 0 && mouseCursorY <= canvas.height) {
          ctx.strokeStyle = "#ff0000"
          ctx.lineWidth = 2
          ctx.beginPath()
          ctx.moveTo(mouseCursorX - 10, mouseCursorY)
          ctx.lineTo(mouseCursorX + 10, mouseCursorY)
          ctx.moveTo(mouseCursorX, mouseCursorY - 10)
          ctx.lineTo(mouseCursorX, mouseCursorY + 10)
          ctx.stroke()

          // Draw line from player to mouse
          ctx.strokeStyle = "#ffff00"
          ctx.lineWidth = 1
          ctx.setLineDash([5, 5])
          ctx.beginPath()
          ctx.moveTo(screenX, screenY)
          ctx.lineTo(mouseCursorX, mouseCursorY)
          ctx.stroke()
          ctx.setLineDash([])
        }
      }

      // Draw minimap
      miniMapCtx.fillStyle = "rgba(0, 20, 40, 0.9)"
      miniMapCtx.fillRect(0, 0, 150, 150)

      const scale = 150 / WORLD_SIZE

      miniMapCtx.strokeStyle = "#00ff88"
      miniMapCtx.lineWidth = 1
      miniMapCtx.strokeRect(0, 0, 150, 150)

      // Draw objects on minimap
      miniMapCtx.fillStyle = "#ffffff"
      for (const obj of objectsRef.current) {
        const x = obj.x * scale
        const y = obj.y * scale
        const size = Math.max(1, obj.size * scale * 0.5)
        miniMapCtx.beginPath()
        miniMapCtx.arc(x, y, size, 0, Math.PI * 2)
        miniMapCtx.fill()
      }

      // Draw power-ups on minimap
      miniMapCtx.fillStyle = "#ffff00"
      for (const powerUp of powerUpsRef.current) {
        const x = powerUp.x * scale
        const y = powerUp.y * scale
        miniMapCtx.beginPath()
        miniMapCtx.arc(x, y, 2, 0, Math.PI * 2)
        miniMapCtx.fill()
      }

      // Draw player on minimap
      const playerX = player.x * scale
      const playerY = player.y * scale
      const playerSize = Math.max(2, player.size * scale)

      miniMapCtx.fillStyle = "#00ff88"
      miniMapCtx.beginPath()
      miniMapCtx.arc(playerX, playerY, playerSize, 0, Math.PI * 2)
      miniMapCtx.fill()

      miniMapCtx.strokeStyle = "#00ff88"
      miniMapCtx.lineWidth = 2
      miniMapCtx.beginPath()
      miniMapCtx.arc(playerX, playerY, playerSize + 2, 0, Math.PI * 2)
      miniMapCtx.stroke()

      // Continue the loop if still running
      if (gameRunningRef.current) {
        animationRef.current = requestAnimationFrame(() =>
          gameLoop(
            canvasRef,
            miniMapRef,
            playerRef,
            objectsRef,
            powerUpsRef,
            setGameStats,
            setGameRunning,
            setGameOver,
            updateLeaderboard,
            createSpaceObject,
            setDebugInfo,
            showDebug,
          ),
        )
      }
    },
    [],
  )

  // Set up mouse tracking
  const setupMouseTracking = useCallback(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const camera = (window as any).gameCamera || { x: 0, y: 0, zoom: 1, shake: 0 }

      // Get mouse position relative to canvas
      const rect = e.target ? (e.target as HTMLElement).getBoundingClientRect() : { left: 0, top: 0 }
      const canvasX = e.clientX - rect.left
      const canvasY = e.clientY - rect.top

      // Transform to world coordinates
      const worldX = canvasX / camera.zoom + camera.x
      const worldY = canvasY / camera.zoom + camera.y

      mouseRef.current = { x: worldX, y: worldY }
    }

    const handleMouseLeave = () => {
      // Keep last known position when mouse leaves canvas
    }

    window.addEventListener("mousemove", handleMouseMove)
    window.addEventListener("mouseleave", handleMouseLeave)

    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("mouseleave", handleMouseLeave)
    }
  }, [])

  // Initialize mouse tracking
  useEffect(() => {
    return setupMouseTracking()
  }, [setupMouseTracking])

  return { gameLoop, animationRef }
}
