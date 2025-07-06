import type { GameStats } from "@/types/game"

interface GameStatsProps {
  stats: GameStats
}

export function GameStats({ stats }: GameStatsProps) {
  return (
    <div className="absolute top-5 left-5 text-green-400 text-lg font-mono z-10 bg-black/50 backdrop-blur-sm rounded-lg p-3 border border-green-400/30">
      <div>Mass: {Math.floor(stats.mass).toLocaleString()}</div>
      <div>Rank: #{stats.rank}</div>
      <div>Absorbed: {stats.absorbed}</div>
      <div>Power-ups: {stats.powerUpsCollected}</div>
    </div>
  )
}
