import type { Player } from "@/types/game"

interface DebugOverlayProps {
  player: Player
  mousePos: { x: number; y: number }
  camera: { x: number; y: number; zoom: number; shake: number }
}

export function DebugOverlay({ player, mousePos, camera }: DebugOverlayProps) {
  const distance = Math.sqrt((mousePos.x - player.x) ** 2 + (mousePos.y - player.y) ** 2)
  const speed = Math.sqrt(player.vx ** 2 + player.vy ** 2)

  return (
    <div className="absolute top-20 left-5 bg-black/90 text-green-400 p-3 rounded font-mono text-xs z-20 border border-green-400/30 max-w-xs">
      <div className="text-yellow-400 mb-2 font-bold">🔧 DEBUG MODE</div>

      <div className="space-y-1">
        <div className="text-cyan-400">PLAYER:</div>
        <div>
          Position: ({Math.round(player.x)}, {Math.round(player.y)})
        </div>
        <div>
          Size: {Math.round(player.size)} | Mass: {Math.round(player.mass)}
        </div>
        <div>
          Velocity: ({player.vx.toFixed(2)}, {player.vy.toFixed(2)})
        </div>
        <div>Speed: {speed.toFixed(2)}</div>

        <div className="text-cyan-400 mt-2">MOUSE:</div>
        <div>
          World: ({Math.round(mousePos.x)}, {Math.round(mousePos.y)})
        </div>
        <div>Distance: {Math.round(distance)}</div>

        <div className="text-cyan-400 mt-2">CAMERA:</div>
        <div>
          Pos: ({Math.round(camera.x)}, {Math.round(camera.y)})
        </div>
        <div>
          Zoom: {camera.zoom.toFixed(2)} | Shake: {camera.shake.toFixed(1)}
        </div>

        <div className="text-cyan-400 mt-2">POWER-UPS:</div>
        <div className="text-xs">
          Speed:{" "}
          {player.powerUps.speedBoost > 0 ? Math.ceil((player.powerUps.speedBoost - Date.now()) / 1000) + "s" : "OFF"}
        </div>
        <div className="text-xs">
          Shield: {player.powerUps.shield > 0 ? Math.ceil((player.powerUps.shield - Date.now()) / 1000) + "s" : "OFF"}
        </div>
        <div className="text-xs">
          Size:{" "}
          {player.powerUps.sizeMultiplier > 0
            ? Math.ceil((player.powerUps.sizeMultiplier - Date.now()) / 1000) + "s"
            : "OFF"}
        </div>
        <div className="text-xs">
          Magnet: {player.powerUps.magnet > 0 ? Math.ceil((player.powerUps.magnet - Date.now()) / 1000) + "s" : "OFF"}
        </div>

        <div className="text-yellow-400 mt-2 text-xs">Press 'D' to toggle debug</div>
      </div>
    </div>
  )
}
