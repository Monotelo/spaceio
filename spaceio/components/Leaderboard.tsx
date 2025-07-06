import type { LeaderboardEntry } from "@/types/game"

interface LeaderboardProps {
  entries: LeaderboardEntry[]
}

export function Leaderboard({ entries }: LeaderboardProps) {
  return (
    <div className="absolute top-5 right-5 bg-black/70 backdrop-blur-sm border-2 border-green-400 rounded-lg p-4 text-white font-mono z-10 min-w-[250px]">
      <h3 className="text-green-400 mb-3 text-center">🌌 GALACTIC LEADERBOARD</h3>
      <div className="space-y-1">
        {entries.slice(0, 10).map((entry, index) => (
          <div
            key={entry.id}
            className={`flex justify-between text-sm ${
              entry.isPlayer ? "text-green-400 font-bold bg-green-400/10 px-2 py-1 rounded" : "text-white"
            }`}
          >
            <span>
              {index + 1}. {entry.name}
            </span>
            <span>{Math.floor(entry.mass).toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
