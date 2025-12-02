# Ultima Magic Circle

Real-time interactive 3D particle system controlled by hand gestures using Three.js and MediaPipe.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18-green.svg)

## Features

- **Hand Gesture Control**: Use your hands to control particle scaling and expansion through webcam detection
- **Multiple Templates**: Choose from 5 beautiful particle formations:
  - ❤️ Heart
  - 🌸 Flower
  - 🪐 Saturn
  - 🧘 Buddha
  - 🎆 Fireworks
- **Color Customization**: Pick any color or use preset palettes
- **Real-time Response**: Particles respond instantly to gesture changes
- **Modern UI**: Clean, minimalist interface with glassmorphism design

## Demo

Visit the live demo: [Ultima Magic Circle](https://[username].github.io/ultima-magic-circle/)

## Getting Started

### Prerequisites

- Node.js >= 18
- Modern browser with WebGL support
- Webcam (for gesture control)

### Installation

```bash
# Clone the repository
git clone https://github.com/[username]/ultima-magic-circle.git
cd ultima-magic-circle

# Install dependencies
npm install

# Start development server
npm run dev
```

### Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## Usage

1. **Allow Camera Access**: When prompted, allow the browser to access your webcam
2. **Show Your Hands**: Position your hands in front of the camera
3. **Control Particles**:
   - **Close fists** → Increase tension/scale
   - **Open hands** → Decrease tension
   - **Move hands apart** → Expand particles
   - **Move hands together** → Contract particles
4. **Change Templates**: Click on template icons to switch particle shapes
5. **Change Colors**: Use the color picker or presets to customize particle colors

## Project Structure

```
ultima-magic-circle/
├── docs/
│   └── SDD.md              # Software Design Document
├── src/
│   ├── core/
│   │   ├── AppController.ts
│   │   ├── GestureController.ts
│   │   └── ParticleSystem.ts
│   ├── templates/
│   │   ├── index.ts
│   │   ├── heart.ts
│   │   ├── flower.ts
│   │   ├── saturn.ts
│   │   ├── buddha.ts
│   │   └── fireworks.ts
│   ├── ui/
│   │   ├── TemplateSelector.ts
│   │   ├── ColorPicker.ts
│   │   ├── CameraPreview.ts
│   │   └── GestureIndicator.ts
│   ├── utils/
│   │   └── math.ts
│   ├── types/
│   │   └── index.ts
│   ├── styles/
│   │   └── main.css
│   └── main.ts
├── tests/
│   ├── core/
│   ├── templates/
│   └── utils/
└── package.json
```

## Development

### Tech Stack

- **Three.js** - 3D rendering
- **MediaPipe Hands** - Hand detection
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Vitest** - Testing framework

### Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run test` | Run tests in watch mode |
| `npm run test:run` | Run tests once |
| `npm run test:coverage` | Run tests with coverage |

### Testing

This project follows TDD (Test-Driven Development) principles. Run tests:

```bash
# Watch mode
npm run test

# Single run
npm run test:run

# With coverage
npm run test:coverage
```

## Architecture

See [Software Design Document](docs/SDD.md) for detailed architecture and specifications.

### Key Components

1. **GestureController**: Handles MediaPipe hand detection and gesture recognition
2. **ParticleSystem**: Manages Three.js particle rendering and animations
3. **AppController**: Orchestrates the application, connecting gesture input to particle output
4. **Templates**: Generate 3D particle positions for different shapes

### Gesture Recognition

- **Openness**: Calculated from fingertip-to-palm distances
- **Tension**: Inverse of average hand openness (closed = high tension)
- **Expansion**: Distance between left and right hand centers

## Browser Support

- Chrome 80+
- Firefox 75+
- Safari 14+
- Edge 80+

## Performance

| Metric | Target |
|--------|--------|
| Frame Rate | 60 FPS |
| Gesture Latency | < 50ms |
| Particle Count | 5000-10000 |
| Memory Usage | < 200MB |

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Three.js](https://threejs.org/) - 3D graphics library
- [MediaPipe](https://mediapipe.dev/) - Hand tracking solution
- Inspired by creative coding and interactive art projects
