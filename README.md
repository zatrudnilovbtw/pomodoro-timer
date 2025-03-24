# Pomodoro Timer

A minimalist Pomodoro timer to boost focus and productivity. Switch between work and break modes, track completed cycles, and customize settings. Available as a web app and a desktop application powered by Electron.

## Live Demo
Try the web version here: [Pomodoro Timer](https://pomodoro-timer-to-focus.netlify.app)

## Features
- Work and break timers with customizable durations
- Progress bar for visual time tracking
- Audio notifications with adjustable volume
- Cycle counter to track completed sessions
- Desktop notifications (Electron version)
- Settings for work time, break time, and sound volume
- Responsive design with a clean, dark theme
- Tray icon and minimized mode (Electron version)

## How to Use
### Web Version
1. Visit the [live demo](https://pomodoro-timer-to-focus.netlify.app).
2. Click "Start" to begin the timer, "Stop" to pause, or "Reset" to restart.
3. Use the settings button to adjust work/break durations and volume.
4. Track your progress with the cycle counter.

### Desktop Version (Electron)
1. Clone the repository and navigate to the project folder.
2. Install dependencies: `npm install`.
3. Build and run: `npm run start` (development) or `npm run dist` (production build).
4. Use the tray icon to show/hide the app or quit.

## Files
- `Timer.jsx`: Main React component for the timer logic and UI
- `Timer.css`: Styling for the application
- `main.js`: Electron configuration for the desktop app
- `preload.js`: Preload script for Electron IPC
- `dist/icon.png`: App icon (required for Electron builds)

## Requirements
- Node.js and npm (for development and Electron builds)
- Web browser (for the web version)

Built with React, CSS, and Electron. Created by Zatrudnilov.
