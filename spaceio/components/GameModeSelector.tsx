"use client"

import { Button } from "@/components/ui/button"

interface GameModeSelectorProps {
  onSelectMode: (debugMode: boolean) => void
}

export function GameModeSelector({ onSelectMode }: GameModeSelectorProps) {
  return (
    <div className="absolute inset-0 bg-black/95 flex flex-col items-center justify-center text-green-400 z-50">
      <div className="text-center max-w-4xl px-8">
        <h1 className="text-6xl font-bold mb-8 animate-pulse bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
          ORBIT.IO
        </h1>

        <div className="text-xl mb-12 opacity-80 space-y-2">
          <p>🎮 Move your mouse to control your planet</p>
          <p>🌟 Absorb smaller objects to grow larger</p>
          <p>⚠️ Avoid larger planets or be consumed!</p>
          <p>⚡ Collect power-ups for special abilities</p>
          <p>🛡️ Shield protects you from larger enemies</p>
          <p>🚀 Speed boost makes you faster temporarily</p>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6 text-cyan-400">Choose Your Game Mode</h2>

          <div className="flex flex-col md:flex-row gap-6 justify-center items-center">
            {/* Normal Mode */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 border-2 border-green-400/30 rounded-lg p-6 max-w-sm hover:border-green-400 transition-all duration-300 group">
              <div className="text-center mb-4">
                <div className="text-4xl mb-2">🎮</div>
                <h3 className="text-xl font-bold text-green-400 group-hover:text-green-300">Normal Mode</h3>
              </div>
              <div className="text-sm text-gray-300 mb-6 space-y-1">
                <p>• Clean, immersive gameplay</p>
                <p>• No debug information</p>
                <p>• Optimal performance</p>
                <p>• Pure gaming experience</p>
              </div>
              <Button
                onClick={() => onSelectMode(false)}
                className="w-full text-lg py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 transform hover:scale-105 transition-all duration-200"
              >
                Play Normal
              </Button>
            </div>

            {/* Debug Mode */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 border-2 border-yellow-400/30 rounded-lg p-6 max-w-sm hover:border-yellow-400 transition-all duration-300 group">
              <div className="text-center mb-4">
                <div className="text-4xl mb-2">🔧</div>
                <h3 className="text-xl font-bold text-yellow-400 group-hover:text-yellow-300">Debug Mode</h3>
              </div>
              <div className="text-sm text-gray-300 mb-6 space-y-1">
                <p>• Real-time game statistics</p>
                <p>• Mouse position tracking</p>
                <p>• Performance monitoring</p>
                <p>• Development insights</p>
              </div>
              <Button
                onClick={() => onSelectMode(true)}
                className="w-full text-lg py-3 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 transform hover:scale-105 transition-all duration-200"
              >
                Play Debug
              </Button>
            </div>
          </div>
        </div>

        <div className="text-sm text-gray-400 space-y-1">
          <p>💡 You can toggle debug mode anytime during gameplay by pressing 'D'</p>
          <p>🎯 Debug mode shows mouse crosshair, movement lines, and detailed stats</p>
        </div>
      </div>
    </div>
  )
}
