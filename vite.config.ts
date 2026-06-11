import { reactRouter } from '@react-router/dev/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';
import netlifyReactRouter from '@netlify/vite-plugin-react-router';
import netlify from '@netlify/vite-plugin';
import netlifyPlugin from '@netlify/vite-plugin-react-router';

export default defineConfig({
  plugins: [
    tailwindcss(),
    reactRouter(),
    netlifyPlugin(),
    netlifyReactRouter(),
    netlify(),
  ],
  resolve: {
    tsconfigPaths: true,
  },
});
