import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const faqItem = z.object({
  q: z.string(),
  a: z.string(),
});

const services = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/services' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    seoTitle: z.string(),
    seoDescription: z.string(),
    pageSlug: z.string(),
    icon: z.enum(['mobile', 'web', 'b2b', 'team', 'discovery']),
    locale: z.enum(['uz', 'ru', 'en']),
    order: z.number(),
    relatedProjects: z.array(z.string()).default([]),
    faq: z.array(faqItem).default([]),
  }),
});

const portfolio = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/portfolio' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    seoTitle: z.string(),
    seoDescription: z.string(),
    pageSlug: z.string(),
    category: z.string(),
    platform: z.string(),
    highlight: z.string(),
    locale: z.enum(['uz', 'ru', 'en']),
    order: z.number(),
    link: z.string().optional(),
    appStore: z.string().optional(),
    playStore: z.string().optional(),
    icon: z.string().optional(),
    screenshots: z.array(z.string()).default([]),
    // Products made of several store apps (e.g. a customer app and a business app)
    apps: z
      .array(
        z.object({
          name: z.string(),
          role: z.string(),
          description: z.string(),
          icon: z.string(),
          appStore: z.string().optional(),
          playStore: z.string().optional(),
          screenshots: z.array(z.string()).default([]),
        }),
      )
      .default([]),
    image: z.string().optional(),
    imageAlt: z.string(),
    inProcess: z.boolean().default(false),
    stat: z.string().default(''),
    challenge: z.string(),
    solution: z.string(),
    features: z.array(z.string()),
    metrics: z.array(z.object({ value: z.string(), label: z.string() })),
    stack: z.array(z.string()),
    relatedService: z.string().default('mobile-apps'),
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

const blog = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    seoTitle: z.string(),
    seoDescription: z.string(),
    pageSlug: z.string(),
    locale: z.enum(['uz', 'ru', 'en']),
    datePublished: z.string(),
    relatedService: z.string().optional(),
    faq: z.array(faqItem).default([]),
  }),
});

export const collections = { services, portfolio, testimonials, blog };
