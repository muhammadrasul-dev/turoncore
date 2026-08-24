import { getCollection } from 'astro:content';
import type { Lang } from '../i18n/ui';

export async function getServices(lang: Lang) {
  const all = await getCollection('services');
  return all
    .filter((entry) => entry.data.locale === lang)
    .sort((a, b) => a.data.order - b.data.order);
}

export async function getService(lang: Lang, slug: string) {
  const services = await getServices(lang);
  return services.find((entry) => entry.data.pageSlug === slug) ?? null;
}

export async function getProjects(lang: Lang) {
  const all = await getCollection('portfolio');
  return all
    .filter((entry) => entry.data.locale === lang)
    .sort((a, b) => a.data.order - b.data.order);
}

export async function getProject(lang: Lang, slug: string) {
  const projects = await getProjects(lang);
  return projects.find((entry) => entry.data.pageSlug === slug) ?? null;
}

export async function getArticles(lang: Lang) {
  const all = await getCollection('blog');
  return all
    .filter((entry) => entry.data.locale === lang)
    .sort((a, b) => b.data.datePublished.localeCompare(a.data.datePublished));
}

export async function getArticle(lang: Lang, slug: string) {
  const articles = await getArticles(lang);
  return articles.find((entry) => entry.data.pageSlug === slug) ?? null;
}
