# Rhythm Game - Modular Architecture Project

## 🎯 Project Overview

This project started as a single HTML file rhythm game and is being refactored into a clean, modular JavaScript application. The goal is to learn modular programming patterns that will be applicable to other music education tools.

## 🏗️ Architecture Philosophy

**Modular Design Principles:**

- **Single Responsibility**: Each module handles one specific concern
- **Clear Interfaces**: Modules communicate through well-defined exports/imports
- **State Management**: Centralized game state with predictable updates
- **Separation of Concerns**: Audio, patterns, state, input, and rendering are separate

**Benefits for Future Projects:**

- Music school management tools
- Student progress tracking
- Multi-user applications
- Easy testing and debugging
- Collaborative development

## 📁 Project Structure

```
rhythm-game-modular/
├── index.html              # Main HTML structure
├── css/
│   └── styles.css          # All styling (complete from original)
├── js/
│   ├── main.js            # Main controller, coordinates all modules
│   ├── modules/
│   │   ├── audio.js       # ✅ COMPLETE: Metronome, sounds, tempo
│   │   ├── patterns.js    # ✅ COMPLETE: Rhythm patterns, level management
│   │   ├── gameState.js   # ✅ COMPLETE: State management, scoring, sessions
│   │   ├── inputHandler.js # 🚧 NEXT: Keyboard/touch event handling
│   │   └── notation.js    # ⏳ FUTURE: Music notation rendering
│   └── utils/
│       └── helpers.js     # ⏳ FUTURE: Utility functions
├── README.md              # This documentation
└── .gitignore            # Git ignore rules
```

## ✅ Completed Modules

### 1. Audio Module (`js/modules/audio.js`)

**Purpose**: Handles all sound and metronome functionality

**Key Features:**

- Metronome with 4/4 beat counting
- Configurable tempo (BPM)
- Click sound generation with accent on beat 1
- Start/stop metronome control
- Audio context management

**Main Functions:**

```javascript
import {
  initAudio,
  startMetronome,
  stopMetronome,
  setBeatInterval,
  playTickSound,
} from "./modules/audio.js";
```

**Learning Value**: Clean module initialization, DOM element management, Web Audio API usage

---

### 2. Patterns Module (`js/modules/patterns.js`)

**Purpose**: Manages rhythm pattern data and logic

**Key Features:**

- 30+ rhythm patterns across 3 difficulty levels (beginner: 15, intermediate: 8, advanced: 7)
- Pattern validation and normalization
- Level-based pattern filtering
- Pattern cycling within levels
- Flatten patterns (convert from bars to linear sequence)

**Main Functions:**

```javascript
import {
  setSelectedLevel,
  getCurrentPattern,
  nextPattern,
  getPatternInfo,
  getPatternsForLevel,
} from "./modules/patterns.js";
```

**Pattern Structure**: Hierarchical - `bars` → `beats` → `notes`

- Each note has: `type` (quarter/eighth/sixteenth), `rest` (boolean), optional `dotted`
- Supports barlines for multi-bar patterns
- SVG definitions for rest symbols

**Learning Value**: Complex data structure management, functional programming, music theory implementation

---

### 3. Game State Module (`js/modules/gameState.js`)

**Purpose**: Centralized state management for the entire application

**Key Features:**

- Single source of truth for all game data
- Mode management (single/multiplayer)
- Score tracking and session statistics
- Input state management (key presses, hold periods)
- Game flow control (start/end games, sessions)
- Predictable state updates with logging

**Main Functions:**

```javascript
import {
  initGameState,
  setGameMode,
  startNewGame,
  endGame,
  getStateSnapshot,
  getSessionStats,
  recordHit,
  updateScore,
} from "./modules/gameState.js";
```

**State Structure:**

```javascript
gameState = {
  // Configuration
  mode: "single" | "multi",
  speed: "slow" | "medium" | "fast",
  selectedLevel: "beginner" | "intermediate" | "advanced",

  // Game flow
  isActive: boolean,
  gamesPlayed: number,

  // Scoring (single & multiplayer)
  score,
  score1,
  score2,
  beatHitResults,
  beatHitResultsP1,
  beatHitResultsP2,

  // Input tracking
  keyIsDown: {},
  holdPeriods: [],

  // Session statistics
  cumulativeScore1,
  cumulativeScore2,
  accArray1,
  accArray2,
};
```

**Learning Value**: State management patterns, session handling, statistics tracking, multiplayer coordination

## 🚧 Next Steps

### Immediate: Input Handler Module

**Goal**: Extract and clean up all keyboard/touch event handling from original code

**Planned Features:**

- Clean event listener management
- Key state tracking
- Touch event handling
- Input validation
- Player assignment (single vs multiplayer)

**Files**: `js/modules/inputHandler.js`

### Future Modules:

**Notation Module**:

- Music notation rendering
- Beam/stem/flag drawing
- Note positioning
- Complex visual logic from original

**Utils Module**:

- Helper functions
- Validation utilities
- Mathematical operations

## 🎮 Current Functionality

**Working Features:**

- ✅ Metronome with configurable tempo
- ✅ Pattern selection by difficulty level
- ✅ Pattern cycling within levels
- ✅ Game mode switching (single/multiplayer)
- ✅ Session management and statistics
- ✅ Complete state coordination between modules

**Test Interface:**

- Test buttons for game state simulation
- Debug logging for all state changes
- Pattern information display
- Session statistics tracking

## 🔧 Development Workflow

### Getting Started

1. **VS Code**: Open project folder
2. **Live Server**: Right-click `index.html` → "Open with Live Server"
3. **Console**: Press F12 → Console tab for debug logs
4. **Testing**: Use test buttons and console commands

### Making Changes

1. **Edit module files** in `js/modules/`
2. **Test in browser** with Live Server auto-reload
3. **Check console** for debug information
4. **Commit progress**: `git add . && git commit -m "Description"`

### Debug Features

- **Shift+Click metronome**: Full state debug dump
- **Test buttons**: Simulate game state changes
- **Console logging**: All state changes logged with emojis for easy scanning

## 🎵 Application to Music School Tools

This modular architecture directly applies to:

**Student Management System:**

- **State Module**: Student progress, lesson status, payment tracking
- **Audio Module**: Practice playback, metronome tools
- **Input Module**: Student response handling, touch interfaces
- **Patterns Module**: Exercise libraries, curriculum progression

**Scheduling Tools:**

- **State Module**: Appointment status, teacher availability, room booking
- **Input Module**: Calendar interactions, drag-and-drop scheduling
- **Data Module**: Calendar integration, payment processing

**Music Games:**

- **Reusable modules** for any rhythm-based game
- **Session management** for student progress
- **State patterns** for real-time feedback

## 💡 Key Learning Outcomes

**Modular Programming:**

- Module design and interfaces
- State management patterns
- Event coordination between modules
- Clean separation of concerns

**JavaScript Patterns:**

- ES6 modules (import/export)
- Object destructuring and spread
- Functional programming concepts
- Async/await patterns

**Development Practices:**

- Git version control
- Debug logging strategies
- Test-driven development mindset
- Documentation as development aid

**Music Technology:**

- Web Audio API usage
- Rhythm pattern representation
- Real-time input handling
- Music notation concepts

## 🚀 Next Development Session

**Immediate Goals:**

1. Complete Input Handler module
2. Connect input handling to game state
3. Test full game loop (metronome + patterns + input + scoring)
4. Add simple pattern visualization

**Future Goals:**

1. Music notation rendering
2. Enhanced scoring algorithms
3. Student progress tracking
4. Integration with external APIs

## 📝 Notes for Future Development

**Module Communication:**

- All modules import/export through main.js
- State changes flow through gameState module
- No direct module-to-module communication
- Clear, logged state transitions

**Testing Strategy:**

- Each module has test functions
- Debug buttons for manual testing
- Console logging for traceability
- State snapshots for debugging

**Code Quality:**

- Consistent naming conventions
- Clear function documentation
- Error handling and validation
- Performance considerations for real-time audio

---

**Last Updated**: Current development session  
**Status**: 3/5 core modules complete, ready for Input Handler development  
**Next Session**: Extract input handling logic from original code
