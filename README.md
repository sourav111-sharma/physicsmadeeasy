
# OPTICS LAB v2.0 – Advanced Interactive Physics

**"Don't Just Learn Physics. See It, Experiment With It and Understand It."**

Optics Lab is a premium, interactive educational platform designed for Class 10 and Class 12 Physics students. Version 2.0 introduces a fully rewritten mathematical ray-tracing engine, a guided learning mode, and interactive visualizations to help students master the complexities of light reflection and refraction.

## ✨ What's New in Version 2.0?
- **Guided Laboratory Mode:** Challenges students to place objects at specific points (like the Center of Curvature) to achieve specific image results, moving beyond passive observation.
- **Interactive Sign Convention Visualizer:** A dedicated visual coordinate system that demystifies positive and negative values for object distance, image distance, and focal length.
- **Interactive Glossary:** Key physics terms feature hoverable tooltips that instantly explain fundamental concepts without cluttering the UI.
- **Advanced Physics Quiz Engine:** A multi-question assessment module with score tracking and detailed explanations for every correct and incorrect answer.
- **Immersive UI/UX:** Features a dynamic photon-particle animated background, glassmorphism design elements, and seamless light/dark mode toggling.

## 🔬 Core Features
- **Virtual Optics Lab:** Real-time HTML5 Canvas-based ray tracing for Concave Mirrors, Convex Mirrors, Convex Lenses, and Concave Lenses. Drag-and-drop the object arrow to instantly see the updated image and rays.
- **Live Telemetry Engine:** Calculates exact image distance ($v$) and magnification ($m$) using the mirror ($1/f = 1/v + 1/u$) and lens ($1/f = 1/v - 1/u$) formulas.
- **Formula Calculator:** A built-in utility to instantly solve equations for missing variables.

## 💻 Technology Stack
- **HTML5** (Semantic structure)
- **CSS3** (Glassmorphism, CSS Variables, Responsive Grid/Flexbox)
- **Vanilla JavaScript** (Physics engine, DOM manipulation, Game logic)
- **HTML5 Canvas API** (Real-time ray tracing and particle animations - no external libraries used)

## 🚀 Installation & Usage
1. Download or clone this repository.
2. Ensure all files are in the same directory:
   - `index.html`
   - `style.css`
   - `script.js`
   - `README.md`
3. Open `index.html` in any modern web browser (Chrome, Firefox, Safari, Edge). No local server is required.
4. **Optional:** Host directly on GitHub Pages for easy sharing with students.

## 📂 Project Structure
```text
optics-lab/
│
├── index.html       # The main webpage containing all UI structure
├── style.css        # All styling, animations, and responsive design
├── script.js        # The physics engine, canvas drawing, and interactive logic
└── README.md        # Project documentation
