# TuronCore Website

TuronCore IT kompaniyasi uchun rasmiy korporativ sayt. Mobil ilovalar, web saytlar va B2B IT xizmatlarini taqdim etadi.

## Texnologiyalar

- [Astro](https://astro.build) v7
- TypeScript
- Tailwind CSS v4
- Astro Content Collections (MDX)
- 3 til: O'zbekcha, Ruscha, Inglizcha

## Ishga tushirish

```bash
npm install
npm run dev
```

Brauzerda: `http://localhost:4321/uz/`

## Build

```bash
npm run build
npm run preview
```

## Loyiha tuzilmasi

```
src/
├── components/     # UI va sahifa bo'limlari
├── content/        # MDX kontent (services, portfolio)
├── i18n/           # Tarjimalar (uz, ru, en)
├── layouts/        # BaseLayout
├── pages/          # Astro sahifalar
├── scripts/        # Theme, scroll reveal, header
└── styles/         # Global CSS + Tailwind
```

## Kontent qo'shish

Yangi xizmat qo'shish uchun `src/content/services/` papkasiga MDX fayl yarating:

```mdx
---
title: "Xizmat nomi"
description: "Qisqa tavsif"
icon: "mobile"
locale: "uz"
order: 4
---
```

## Deploy

Static build — Netlify, Vercel, Cloudflare Pages yoki har qanday static hosting ga deploy qilish mumkin.
