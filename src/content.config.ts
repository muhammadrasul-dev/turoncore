import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const services = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/services' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    icon: z.enum(['mobile', 'web', 'b2b']),
    locale: z.enum(['uz', 'ru', 'en']),
    order: z.number(),
  }),
});

const portfolio = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/portfolio' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    category: z.string(),
    locale: z.enum(['uz', 'ru', 'en']),
    order: z.number(),
    link: z.string().optional(),
    image: z.string().optional(),
  }),
});

const testimonials = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/testimonials' }),
  schema: z.object({
    author: z.string(),
    position: z.string(),
    company: z.string(),
    avatar: z.string().optional(),
    locale: z.enum(['uz', 'ru', 'en']),
    order: z.number(),
  }),
});

export const collections = { services, portfolio, testimonials };
