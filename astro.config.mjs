// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import mdx from '@astrojs/mdx';
import vercel from '@astrojs/vercel';

// https://astro.build/config
export default defineConfig({
  site: 'https://turoncore.uz',
  adapter: vercel(),
  i18n: {
    defaultLocale: 'uz',
    locales: ['uz', 'ru', 'en'],
    routing: 'manual',
  },
  vite: {
    plugins: [tailwindcss()],
  },
  integrations: [mdx()],
});
