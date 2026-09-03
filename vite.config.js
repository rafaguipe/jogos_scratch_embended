import { defineConfig } from 'vite';

// Scratch Academy — Vite configuration.
//
// - base: './' keeps asset URLs relative so the built app works on any
//   static host (GitHub Pages, subpaths, S3, etc.).
// - server.cors: the TurboWarp player/editor run inside iframes on a
//   different origin and fetch the lesson .sb3 files directly from this
//   server. Cross-origin reads require permissive CORS in dev.
export default defineConfig({
  base: './',
  server: {
    cors: true,
  },
});
