import type { Player } from "@/types/game"

interface PowerUpIndicatorProps {
  player: Player
}

export function PowerUpIndicator({ player }: PowerUpIndicatorProps) {
  const now = Date.now()
  const activePowerUps = []

  if (player.powerUps.speedBoost > now) {
    activePowerUps.push({
      name: "Speed Boost",
      timeLeft: Math.ceil((player.powerUps.speedBoost - now) / 1000),
      color: "text-yellow-400",
      icon: "⚡",
    })
  }

  if (player.powerUps.shield > now) {
    activePowerUps.push({
      name: "Shield",
      timeLeft: Math.ceil((player.powerUps.shield - now) / 1000),
      color: "text-cyan-400",
      icon: "🛡️",
    })
  }

  if (player.powerUps.sizeMultiplier > now) {
    activePowerUps.push({
      name: "Size Boost",
      timeLeft: Math.ceil((player.powerUps.sizeMultiplier - now) / 1000),
      color: "text-purple-400",
      icon: "🔮",
    })
  }

  if (player.powerUps.magnet > now) {
    activePowerUps.push({
      name: "Magnet",
      timeLeft: Math.ceil((player.powerUps.magnet - now) / 1000),
      color: "text-green-400",
      icon: "🧲",
    })
  }

  if (activePowerUps.length === 0) return null

  return (
    <div className="absolute top-5 left-1/2 transform -translate-x-1/2 bg-black/70 backdrop-blur-sm border border-green-400/30 rounded-lg p-3 z-10">
      <div className="flex gap-4">
        {activePowerUps.map((powerUp, index) => (
          <div key={index} className={`text-center ${powerUp.color}`}>
            <div className="text-lg">{powerUp.icon}</div>
            <div className="text-xs font-mono">{powerUp.name}</div>
            <div className="text-xs font-mono">{powerUp.timeLeft}s</div>
          </div>
        ))}
      </div>
    </div>
  )
}
