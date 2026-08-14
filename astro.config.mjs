import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import vercel from '@astrojs/vercel/serverless';
import node from '@astrojs/node';

const isVercel = process.env.VERCEL === '1' || process.env.VERCEL === 'true' || process.env.VERCEL_ENV !== undefined;

// https://astro.build/config
export default defineConfig({
  output: 'server',
  adapter: isVercel
    ? vercel({
        webAnalytics: {
          enabled: true,
        },
      })
    : node({
        mode: 'standalone',
      }),
  integrations: [
    react(),
    tailwind({
      applyBaseStyles: false,
    }),
  ],
});

