export type FaqItem = { q: string; a: string };

export type BreadcrumbItem = {
  name: string;
  url: string;
};

export function faqPageSchema(items: FaqItem[]) {
  return {
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.a,
      },
    })),
  };
}

export function breadcrumbSchema(items: BreadcrumbItem[]) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function serviceSchema(input: {
  id: string;
  name: string;
  description: string;
  url: string;
  providerId: string;
  areaServed: string;
  serviceType: string;
}) {
  return {
    '@type': 'Service',
    '@id': input.id,
    name: input.name,
    description: input.description,
    url: input.url,
    provider: { '@id': input.providerId },
    areaServed: input.areaServed,
    serviceType: input.serviceType,
  };
}

export function softwareSchema(input: {
  id: string;
  name: string;
  description: string;
  url: string;
  applicationCategory: string;
  operatingSystem: string;
}) {
  return {
    '@type': 'SoftwareApplication',
    '@id': input.id,
    name: input.name,
    description: input.description,
    url: input.url,
    applicationCategory: input.applicationCategory,
    operatingSystem: input.operatingSystem,
  };
}

export function articleSchema(input: {
  id: string;
  headline: string;
  description: string;
  url: string;
  datePublished: string;
  dateModified: string;
  inLanguage: string;
  image: string;
  publisherId: string;
}) {
  return {
    '@type': 'Article',
    '@id': input.id,
    headline: input.headline,
    description: input.description,
    url: input.url,
    datePublished: input.datePublished,
    dateModified: input.dateModified,
    inLanguage: input.inLanguage,
    image: input.image,
    publisher: { '@id': input.publisherId },
    mainEntityOfPage: input.url,
  };
}
