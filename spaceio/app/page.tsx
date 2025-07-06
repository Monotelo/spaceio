"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { GameStats } from "@/components/GameStats"
import { Leaderboard } from "@/components/Leaderboard"
import { PowerUpIndicator } from "@/components/PowerUpIndicator"
import { DebugOverlay } from "@/components/DebugOverlay"
import { GameModeSelector } from "@/components/GameModeSelector"
import { createPlayer } from "@/classes/Player"
import { createSpaceObject } from "@/classes/SpaceObject"
import { useGameLoop } from "@/hooks/useGameLoop"
import type {
  Player,
  SpaceObject,
  PowerUp,
  Particle,
  Camera,
  GameStats as GameStatsType,
  LeaderboardEntry,
} from "@/types/game"
import { WORLD_SIZE, AI_NAMES } from "@/constants/game"

export default function OrbitIOGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const miniMapRef = useRef<HTMLCanvasElement>(null)

  const [gameRunning, setGameRunning] = useState(false)
  const [gameStarted, setGameStarted] = useState(false)
  const [gameModeSelected, setGameModeSelected] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  const [showDebug, setShowDebug] = useState(false) // Default to false, will be set by mode selection
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const [gameStats, setGameStats] = useState<GameStatsType>({
    mass: 100,
    absorbed: 0,
    rank: 1,
    powerUpsCollected: 0,
  })
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])

  const playerRef = useRef<Player | null>(null)
  const objectsRef = useRef<SpaceObject[]>([])
  const powerUpsRef = useRef<PowerUp[]>([])
  const particlesRef = useRef<Particle[]>([])
  const cameraRef = useRef<Camera>({ x: 0, y: 0, shake: 0, zoom: 1.0 })
  const mouseRef = useRef({ x: WORLD_SIZE / 2, y: WORLD_SIZE / 2 })

  const { gameLoop, animationRef } = useGameLoop()

  // Initialize leaderboard
  const initializeLeaderboard = useCallback(() => {
    const entries: LeaderboardEntry[] = []

    entries.push({
      id: "player",
      name: "You",
      mass: 100,
      isPlayer: true,
    })

    for (let i = 0; i < 9; i++) {
      entries.push({
        id: `ai-${i}`,
        name: AI_NAMES[i % AI_NAMES.length],
        mass: Math.floor(Math.random() * 3000) + 500,
        isPlayer: false,
      })
    }

    entries.sort((a, b) => b.mass - a.mass)
    setLeaderboard(entries)
  }, [])

  // Update leaderboard
  const updateLeaderboard = useCallback((playerMass: number) => {
    setLeaderboard((prev) => {
      const updated = prev.map((entry) => {
        if (entry.isPlayer) {
          return { ...entry, mass: playerMass }
        } else {
          const growthRate = 0.3 + Math.random() * 1.2
          return { ...entry, mass: entry.mass + growthRate }
        }
      })

      updated.sort((a, b) => b.mass - a.mass)

      const playerRank = updated.findIndex((entry) => entry.isPlayer) + 1
      setGameStats((prev) => ({ ...prev, rank: playerRank }))

      return updated
    })
  }, [])

  // Initialize game
  const initGame = useCallback(() => {
    playerRef.current = createPlayer()
    objectsRef.current = []
    powerUpsRef.current = []
    particlesRef.current = []

    // Reset camera to center on player
    const player = playerRef.current
    cameraRef.current = {
      x: player.x - window.innerWidth / 2,
      y: player.y - window.innerHeight / 2,
      shake: 0,
      zoom: 1.0,
    }

    // Initialize mouse position to player position
    mouseRef.current = { x: player.x, y: player.y }

    // Generate objects
    for (let i = 0; i < 80; i++) {
      let x, y
      do {
        x = Math.random() * WORLD_SIZE
        y = Math.random() * WORLD_SIZE
      } while (Math.sqrt((x - player.x) ** 2 + (y - player.y) ** 2) < 150)

      const size = 3 + Math.random() * 8
      objectsRef.current.push(createSpaceObject(x, y, size, "small_asteroid"))
    }

    for (let i = 0; i < 30; i++) {
      let x, y
      do {
        x = Math.random() * WORLD_SIZE
        y = Math.random() * WORLD_SIZE
      } while (Math.sqrt((x - player.x) ** 2 + (y - player.y) ** 2) < 200)

      const size = 15 + Math.random() * 40
      objectsRef.current.push(createSpaceObject(x, y, size, "asteroid"))
    }

    for (let i = 0; i < 20; i++) {
      let x, y
      do {
        x = Math.random() * WORLD_SIZE
        y = Math.random() * WORLD_SIZE
      } while (Math.sqrt((x - player.x) ** 2 + (y - player.y) ** 2) < 250)

      const size = 20 + Math.random() * 60
      objectsRef.current.push(createSpaceObject(x, y, size, "enemy"))
    }

    setGameStats({ mass: 100, absorbed: 0, rank: 1, powerUpsCollected: 0 })
    initializeLeaderboard()
  }, [initializeLeaderboard])

  // Handle mouse movement with improved coordinate system
  useEffect(() => {
    if (!gameRunning || !canvasRef.current) return

    const canvas = canvasRef.current

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      const camera = cameraRef.current

      // Get mouse position relative to canvas
      const canvasX = e.clientX - rect.left
      const canvasY = e.clientY - rect.top

      // Transform to world coordinates
      mouseRef.current.x = canvasX / camera.zoom + camera.x
      mouseRef.current.y = canvasY / camera.zoom + camera.y

      // Update global mouse position for the game loop
      ;(window as any).gameMouse = mouseRef.current
    }

    canvas.addEventListener("mousemove", handleMouseMove)

    return () => {
      canvas.removeEventListener("mousemove", handleMouseMove)
    }
  }, [gameRunning])

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        canvasRef.current.width = window.innerWidth
        canvasRef.current.height = window.innerHeight
      }
    }

    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  // Handle debug toggle - ONLY in debug mode
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if ((e.key === "d" || e.key === "D") && gameRunning && showDebug) {
        // Only allow toggling if already in debug mode
        setShowDebug((prev) => {
          const newState = !prev
          // Visual feedback for debug toggle
          if (newState) {
            console.log("🔧 Debug overlay enabled")
          } else {
            console.log("🔧 Debug overlay disabled")
          }
          return newState
        })
      }
    }

    window.addEventListener("keydown", handleKeyPress)
    return () => window.removeEventListener("keydown", handleKeyPress)
  }, [gameRunning, showDebug])

  // Start game loop
  useEffect(() => {
    if (gameRunning && playerRef.current && canvasRef.current && miniMapRef.current) {
      const startLoop = () => {
        gameLoop(
          canvasRef as React.RefObject<HTMLCanvasElement>,
          miniMapRef as React.RefObject<HTMLCanvasElement>,
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
        )
      }

      // Start the loop on next frame to ensure everything is initialized
      requestAnimationFrame(startLoop)
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [gameRunning, gameLoop, updateLeaderboard, animationRef, showDebug])

  // Handle game mode selection
  const handleModeSelection = (debugMode: boolean) => {
    setShowDebug(debugMode)
    setGameModeSelected(true)

    // Show feedback message
    if (debugMode) {
      console.log("🔧 Debug mode selected - you'll see detailed game information")
    } else {
      console.log("🎮 Normal mode selected - clean gaming experience")
    }
  }

  const startGame = () => {
    setGameStarted(true)
    setGameOver(false)
    initGame()
    // Set game running after initialization
    setTimeout(() => setGameRunning(true), 100)
  }

  const restartGame = () => {
    setGameOver(false)
    setGameStats({ mass: 100, absorbed: 0, rank: 1, powerUpsCollected: 0 })
    initGame()
    setTimeout(() => setGameRunning(true), 100)
  }

  const backToModeSelection = () => {
    setGameStarted(false)
    setGameModeSelected(false)
    setGameRunning(false)
    setGameOver(false)
    setShowDebug(false)
  }

  return (
    <div className="relative w-full h-screen overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Background stars */}
      <div className="absolute inset-0">
        {Array.from({ length: 100 }).map((_, i) => (
          <div
            key={i}
            className="absolute bg-white rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${Math.random() * 3 + 1}px`,
              height: `${Math.random() * 3 + 1}px`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      {/* Game Mode Selection Screen */}
      {!gameModeSelected && <GameModeSelector onSelectMode={handleModeSelection} />}

      {/* Start Screen */}
      {gameModeSelected && !gameStarted && (
        <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center text-green-400 z-50">
          <h1 className="text-6xl font-bold mb-8 animate-pulse">ORBIT.IO</h1>

          <div className="text-center mb-8">
            <div className="text-2xl mb-4">
              {showDebug ? (
                <span className="text-yellow-400">🔧 Debug Mode Selected</span>
              ) : (
                <span className="text-green-400">🎮 Normal Mode Selected</span>
              )}
            </div>

            {showDebug ? (
              <div className="text-sm text-yellow-300 mb-4 space-y-1">
                <p>• Real-time statistics will be displayed</p>
                <p>• Mouse position tracking enabled</p>
                <p>• Performance metrics visible</p>
                <p>• Press 'D' during gameplay to toggle overlay</p>
              </div>
            ) : (
              <div className="text-sm text-green-300 mb-4 space-y-1">
                <p>• Clean, immersive gameplay experience</p>
                <p>• No debug information displayed</p>
                <p>• Optimal performance and visuals</p>
                <p>• Pure gaming focus</p>
              </div>
            )}
          </div>

          <div className="flex gap-4">
            <Button
              onClick={startGame}
              className="text-xl px-8 py-4 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 transform hover:scale-110 transition-all"
            >
              Enter the Galaxy
            </Button>

            <Button
              onClick={backToModeSelection}
              variant="outline"
              className="text-xl px-8 py-4 border-gray-400 text-gray-300 hover:bg-gray-700 transform hover:scale-110 transition-all"
            >
              Change Mode
            </Button>
          </div>
        </div>
      )}

      {/* Game Over Screen */}
      {gameOver && (
        <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center text-red-400 z-50">
          <h1 className="text-5xl font-bold mb-8">CONSUMED!</h1>
          <div className="text-center mb-8 text-white space-y-2">
            <div className="text-2xl">Final Mass: {Math.floor(gameStats.mass).toLocaleString()}</div>
            <div className="text-lg">Objects Absorbed: {gameStats.absorbed}</div>
            <div className="text-lg">Power-ups Collected: {gameStats.powerUpsCollected}</div>
            <div className="text-lg">Final Rank: #{gameStats.rank}</div>
            <div className="text-sm text-gray-400 mt-4">Mode: {showDebug ? "Debug" : "Normal"}</div>
          </div>
          <div className="flex gap-4">
            <Button
              onClick={restartGame}
              className="text-xl px-8 py-4 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 transform hover:scale-110 transition-all"
            >
              Respawn
            </Button>

            <Button
              onClick={backToModeSelection}
              variant="outline"
              className="text-xl px-8 py-4 border-gray-400 text-gray-300 hover:bg-gray-700 transform hover:scale-110 transition-all"
            >
              Change Mode
            </Button>
          </div>
        </div>
      )}

      {/* Game Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 cursor-none" style={{ background: "transparent" }} />

      {/* UI Elements */}
      {gameRunning && playerRef.current && (
        <>
          <GameStats stats={gameStats} />
          <Leaderboard entries={leaderboard} />
          <PowerUpIndicator player={playerRef.current} />

          {/* Debug Overlay - ONLY shown in debug mode */}
          {showDebug && debugInfo && (
            <DebugOverlay player={debugInfo.player} mousePos={debugInfo.mouse} camera={debugInfo.camera} />
          )}

          {/* Minimap */}
          <canvas
            ref={miniMapRef}
            width={150}
            height={150}
            className="absolute bottom-5 right-5 border-2 border-green-400 rounded-lg bg-black/80 backdrop-blur-sm z-10"
          />

          {/* Controls hint - Different for each mode */}
          <div className="absolute bottom-5 left-5 text-green-400/60 text-sm font-mono z-10">
            <div>🎮 Move mouse to control</div>
            <div>⚡ Yellow dots = Power-ups</div>
            {showDebug ? (
              <>
                <div className="text-yellow-400">🔧 Press 'D' to toggle debug overlay</div>
                <div>🎯 Red crosshair = Mouse position</div>
                <div>📏 Yellow line = Movement direction</div>
                <div className="text-xs text-gray-500 mt-2">Mode: Debug</div>
              </>
            ) : (
              <div className="text-xs text-gray-500 mt-2">Mode: Normal</div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
