# light.edit

A client-side, photo editor for the web inspired by Lightroom.

Photos are processed entirely inside the browser using HTML5 Canvas and TypedArrays. Edits are modeled as pure data rather than mutated pixels, keeping original files untouched and enabling full undo/redo, preset sharing, and educational inspection.

---

## Philosophy

### Non-Destructive Editing

```
Original Image + EditState = Rendered Image
```

Edits are represented as a serializable state object (`EditState`). Every slider adjustment, crop boundary, rotation angle, and effect parameter modifies the state description rather than the source image. The raw source pixels are preserved in memory, allowing non-destructive resets, multi-step history traversal, and reproducible rendering.

### Local Processing First

Interactive manipulation belongs on the user's machine, not on a server:

```
User Input -> React UI -> EditState -> Image Engine -> HTML5 Canvas
```

- Zero latency slider interactions without server round-trips.
- Private by default: images never leave the local browser environment.
- Works offline after initial asset load.

### Progressive Optimization Model

Performance optimizations follow a measured path rather than speculative rewrites:

1. TypeScript + Canvas 2D with TypedArrays and Lookup Tables (LUTs).
2. Web Workers for offloading intensive pixel loops from the UI thread.
3. WebAssembly (WASM) for CPU-bound bottlenecks when measured.
4. WebGPU for parallel compute shaders when required by resolution.

---

## Features

### Light Adjustments

- **Exposure**: Precise exposure compensation (-5.0 EV to +5.0 EV) via power-of-two gain curve.
- **Contrast**: Symmetric tone expansion and compression.
- **Tonal Regions**: Dedicated controls for Highlights, Shadows, Whites, and Blacks with smooth cubic Hermite falloff curves.

### Color

- **White Balance**: Temperature (cool to warm balance) and Tint (green to magenta compensation).
- **Vibrance**: Saturation-aware boost that selectively enhances muted tones while preserving skin and highly saturated colors.
- **Saturation**: Global chromatic intensity adjustment.

### Presence

- **Texture**: Fine-detail enhancement and smoothing via localized luminance box-blur frequency separation.
- **Clarity**: Midtone local contrast modulation with edge-preserving detail accumulation.
- **Dehaze**: Atmospheric haze reduction and contrast restoration with saturation compensation.

### Effects

- **Vignette**: Radial corner darkening or lightening driven by smoothstep polynomial falloff precomputed into lookup tables.
- **Grain**: Procedural hash-noise grain field with bilinear sampling and midtone-weighted distribution.

### Geometry and Composition

- **Crop**: Interactive 8-point handles with rule-of-thirds grid.
- **Aspect Ratio Presets**:
  - Standard: 1:1, 5:4, 4:3, 3:2, 2:3, 3:4, 16:9, 2:1, and Original.
  - Social: Instagram Square (1:1), Portrait (4:5), Landscape (1.91:1), and Story (9:16).
- **Aspect Lock**: Constrained proportional resizing during crop.
- **Straighten**: -45 degrees to +45 degrees angle adjustment with automated geometric cover scaling.
- **Auto Straighten**: Algorithmic horizon detection using Sobel edge gradients and shear projection variance analysis.
- **Interactive Straighten Tool**: Draw a line across any horizon or reference edge to level the photo.
- **Rotation & Flipping**: 90-degree clockwise rotation, horizontal flip, and vertical flip.

### Workflow and Productivity

- **Filmstrip Support**: Open and switch between multiple photos in a single session.
- **History**: Multi-level undo and redo stack per photo.
- **Compare Mode**: Instant toggle or hold to view original unedited image against the current edit state.
- **Full-Resolution Export**: High-quality PNG rendering matching the source image dimensions.

---

## Keyboard Shortcuts

| Shortcut | Action |
| --- | --- |
| `Z` or `Ctrl/Cmd + Z` | Undo |
| `Shift + Z` or `Ctrl/Cmd + Shift + Z` | Redo |
| `Ctrl/Cmd + R` | Rotate 90 degrees clockwise |
| `C` | Toggle crop overlay mode |
| `Y` (hold) | Compare with original unedited image |
| `Esc` | Cancel crop or straighten tool |
| `Enter` | Commit active crop |

---

## Tech Stack

- **Framework**: Next.js 16 (App Router, Turbopack)
- **UI Library**: React 19, TypeScript
- **Styling**: Tailwind CSS v4
- **State Management**: Zustand
- **Image Processing**: HTML5 Canvas 2D Context, `ImageData`, TypedArrays (`Uint8ClampedArray`, `Float32Array`, `Int8Array`)

---

## Architecture and Codebase Structure

```
light.edit/
├── web/
│   ├── app/
│   │   ├── globals.css          # Design system, theme tokens, slider tracks
│   │   ├── layout.tsx           # Root HTML layout and metadata
│   │   ├── page.tsx             # Landing page with interactive preview
│   │   └── editor/
│   │       └── page.tsx         # Main photo editor route
│   ├── components/
│   │   ├── editor/
│   │   │   ├── crop-overlay.tsx       # Interactive crop handles and rule-of-thirds grid
│   │   │   ├── develop-panel.tsx      # Sidebar adjustment controls, sliders, geometry
│   │   │   ├── editor-shell.tsx       # Layout shell, drag-and-drop, export, shortcuts
│   │   │   ├── empty-state.tsx        # Initial file drop and upload target
│   │   │   ├── filmstrip.tsx          # Multi-photo thumbnail dock
│   │   │   ├── icons.tsx              # Clean SVG icons
│   │   │   ├── parameter-slider.tsx   # Edit state slider binding
│   │   │   ├── slider.tsx             # Reusable accessible slider primitive
│   │   │   ├── stage.tsx              # Viewport canvas and repaint pipeline
│   │   │   └── straighten-line.tsx    # Drag-to-level horizon tool
│   │   └── landing/
│   │       ├── backdrop.tsx           # Atmospheric ambient background lighting
│   │       ├── hero-preview.tsx       # Live interactive hero mockup
│   │       ├── hero.tsx               # Product overview and hero section
│   │       └── how-it-works.tsx       # Interactive step walkthrough
│   └── lib/
│       ├── edit-state.ts        # Parameter definitions, ranges, EditState types
│       ├── editor-store.ts      # Zustand store for active photo, history, edits
│       └── engine/
│           ├── geometry.ts      # Matrix transforms, crop math, auto-straighten
│           ├── image-processor.ts # Per-pixel tone curves, color balance, grain, texture
│           └── render.ts        # Canvas composition and full-resolution export
└── AGENTS.md                    # Engineering principles, roadmap, and design decisions
```

---

## Getting Started

### Prerequisites

- Node.js 18.18 or later
- npm, pnpm, or yarn

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/24thAbhinav/light.edit.git
   cd light.edit/web
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Run the development server:

   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser. Navigate to `/editor` to start editing.

### Building for Production

To create an optimized production build:

```bash
npm run build
npm run start
```

To run type checking:

```bash
npx tsc --noEmit
```

---

## License

MIT
