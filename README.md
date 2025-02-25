# Tetris Game

A fully functioning Tetris game built with HTML, CSS, and JavaScript.

## How to Play

1. Clone or download this repository
2. Open `index.html` in your web browser
3. Use the controls below to play the game

## Game Controls

- **Left Arrow**: Move piece left
- **Right Arrow**: Move piece right  
- **Down Arrow**: Soft drop (move piece down faster)
- **Up Arrow**: Rotate piece clockwise
- **Spacebar**: Hard drop (instantly drop piece to bottom)
- **C Key**: Hold current piece
- **P Key**: Pause/Resume game

## Features

- Classic Tetris gameplay
- Next piece preview
- Hold piece functionality
- Ghost piece preview (shows where piece will land)
- Level progression (speed increases every 10 lines)
- Scoring system based on the original Nintendo scoring:
  - 1 line: 40 × level
  - 2 lines: 100 × level
  - 3 lines: 300 × level
  - 4 lines: 1200 × level
- Additional points:
  - Soft drop: +1 point per cell
  - Hard drop: +2 points per cell

## Game Mechanics

- Game board is 10 columns × 20 rows
- Seven different tetromino shapes (I, J, L, O, S, T, Z)
- Pieces lock in place after landing
- Lines are cleared when they're completely filled
- Game ends when pieces stack to the top of the board

Enjoy playing!
