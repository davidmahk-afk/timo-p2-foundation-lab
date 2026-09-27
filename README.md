# TIMO P2 Foundation Lab

Interactive concept-building web app for Primary 2 TIMO preparation.

## Purpose

This app groups recurring TIMO Primary 2 question formats by their underlying mathematical ideas so learners can understand the concepts rather than memorise past-paper question patterns.

The learning flow is:

**Learn → Explore → Same idea → Explain**

The current version focuses on foundation building rather than mock papers.

## V3 spatial learning

V3 expands the curriculum to **17 transferable skills** and separates two recurring 3D geometry ideas:

- **Cube views & 3D projection** — build irregular cube stacks, inspect a 3D model, switch between top/front/right/left viewpoints, predict the visible-square count, then reveal the 2D projection.
- **Pyramid structure** — change the number of base sides and visually connect the base to vertices, edges, and faces.

The cube activity is designed around the key projection idea: cubes on the same line of sight can overlap, so a side view is controlled by the tallest visible outline rather than the total number of cubes.

## Use on iPad

Open the GitHub Pages site in **Safari**. Landscape orientation is recommended for the larger interactive diagrams. All main controls use touch-friendly targets.

## Source

The site is plain HTML/CSS/JavaScript with no build step or external JavaScript libraries. The main page is `index.html`; the V3 spatial activities are split into small `spatial-*.js` modules.
