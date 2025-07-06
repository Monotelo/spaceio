# 🚀 SpaceIO - Space Survival Game

Space survival game built with Next.js, TypeScript, and HTML5 Canvas. Navigate through a vast space environment, absorb smaller objects to grow, collect power-ups, and compete against othrtd to become the largest entity in the universe!

![SpaceIO Game](https://img.shields.io/badge/Status-Active-brightgreen)
![Next.js](https://img.shields.io/badge/Next.js-15.2.4-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![React](https://img.shields.io/badge/React-19.0.0-blue)

## Features

### Core Gameplay
- **Real-time Movement**: Smooth mouse-controlled movement with physics-based acceleration and friction
- **Growth Mechanics**: Absorb smaller objects to increase your mass and size
- **Competitive Environment**: Compete against other opponents with unique names
- **Dynamic World**: 4000x4000 pixel world with various space objects
- **Live Leaderboard**: Real-time ranking system showing your position among competitors

### Power-ups System
- **Speed Boost** (Yellow): Temporarily increases movement speed
- **Shield** (Cyan): Provides temporary protection
- **Size Multiplier** (Magenta): Increases visual size for better absorption
- **Mass Boost** (Orange): Instantly increases mass
- **Magnet** (Green): Attracts nearby objects

### Visual Effects
- **Particle Systems**: Dynamic particle effects for collisions and absorption
- **Trail Effects**: Smooth trailing effect behind your player
- **Glow Effects**: Dynamic lighting and glow effects
- **Camera Shake**: Impact feedback for collisions
- **Smooth Animations**: 60 FPS gameplay with optimized rendering

### Game Modes
- **Normal Mode**: Standard gameplay experience
- **Debug Mode**: Enhanced debugging information and controls

## Tech Stack

- **Frontend**: Next.js 15.2.4 with React 19
- **Language**: TypeScript 5.0
- **Styling**: Tailwind CSS 4.0
- **UI Components**: Radix UI with custom styling
- **Icons**: Lucide React
- **Build Tool**: Turbopack for fast development
- **Linting**: ESLint with Next.js configuration

## Getting Started

### Prerequisites
- Node.js 18.0 or higher
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/spaceio.git
   cd spaceio
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000) to start playing!

## 🎯 How to Play

### Controls
- **Mouse Movement**: Control your player's direction
- **Automatic Movement**: Player moves towards mouse cursor
- **Absorption**: Collide with smaller objects to grow
- **Power-ups**: Collect colored power-ups for temporary boosts

### Game Mechanics
1. **Start Small**: Begin with 100 mass units
2. **Grow by Absorbing**: Collide with smaller asteroids and enemies
3. **Avoid Larger Objects**: Don't collide with objects larger than you
4. **Collect Power-ups**: Use strategic power-ups to gain advantages
5. **Climb the Leaderboard**: Compete to become the largest entity

## 🏗️ Project Structure

```
spaceio/
├── app/                    # Next.js app directory
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout component
│   └── page.tsx           # Main game page
├── classes/               # Game entity classes
│   ├── Player.ts          # Player logic and physics
│   └── SpaceObject.ts     # Space object definitions
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   ├── DebugOverlay.tsx  # Debug information display
│   ├── GameModeSelector.tsx # Game mode selection
│   ├── GameStats.tsx     # Player statistics
│   ├── Leaderboard.tsx   # Leaderboard display
│   └── PowerUpIndicator.tsx # Power-up status
├── constants/             # Game constants
│   └── game.ts           # Game configuration
├── hooks/                # Custom React hooks
│   └── useGameLoop.ts    # Game loop management
├── types/                # TypeScript type definitions
│   └── game.ts           # Game type interfaces
├── utils/                # Utility functions
│   ├── performance.ts    # Performance optimizations
│   ├── physics.ts        # Physics calculations
│   └── powerups.ts       # Power-up logic
└── public/               # Static assets
```

## 🎨 Key Features Implementation

### Physics System
- Realistic acceleration and friction mechanics
- Boundary collision handling with bounce effects
- Mass-based speed calculations
- Smooth movement interpolation

### Performance Optimizations
- Object pooling for particles
- Viewport culling for off-screen objects
- Efficient collision detection
- Optimized rendering pipeline

### Game Loop
- 60 FPS game loop using `requestAnimationFrame`
- Smooth animation and physics updates
- Efficient state management
- Real-time leaderboard updates

