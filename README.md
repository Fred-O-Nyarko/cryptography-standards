# Cryptography Learning Lab

Interactive Cybersecurity class project for teaching symmetric and asymmetric
cryptography techniques in phases.

## Phase 1

The first phase implements the learning app foundation:

- `/` course map for DES, 3DES, AES, RSA, ElGamal, and ECC.
- `/learn/:algorithmId` reusable lesson shells.
- `/references` standards and primary-source reference backbone.
- `/present` classroom presentation mode.
- `slides/phase-1-slide-scaffold.md` companion deck outline.

## Getting Started

Install the dependencies:

```bash
npm install
```

### Development

Start the development server with HMR:

```bash
npm run dev
```

Your application will be available at `http://localhost:5173`.

## Project Direction

Phase 1 intentionally does not implement the real internals of DES, 3DES, AES,
RSA, ElGamal, or ECC. It provides the app structure, content model, rigorous math
panels, key lifecycle panels, glossary, references, and a toy visualizer so each
algorithm can be implemented cleanly in later phases.

## Building for Production

Create a production build:

```bash
npm run build
```

## Deployment

### Docker Deployment

To build and run using Docker:

```bash
docker build -t my-app .

# Run the container
docker run -p 3000:3000 my-app
```

The containerized application can be deployed to any platform that supports Docker, including:

- AWS ECS
- Google Cloud Run
- Azure Container Apps
- Digital Ocean App Platform
- Fly.io
- Railway

### DIY Deployment

If you're familiar with deploying Node applications, the built-in app server is production-ready.

Make sure to deploy the output of `npm run build`

```
├── package.json
├── package-lock.json (or pnpm-lock.yaml, or bun.lockb)
├── build/
│   ├── client/    # Static assets
│   └── server/    # Server-side code
```

## Styling

The app uses Tailwind CSS, lucide-react icons, and KaTeX-rendered math panels.
The visual system is deliberately foundation-focused: readable class material,
strong contrast, responsive layouts, and reduced-motion-aware interactions.
