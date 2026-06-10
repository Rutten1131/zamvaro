import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://www.zamvaro.com';

  return {
    rules: [
      {
        // Todos los crawlers normales (Google, Bing, etc.)
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/api/'],
      },
      {
        // ChatGPT / OpenAI — permitido
        userAgent: 'GPTBot',
        allow: '/',
        disallow: ['/admin', '/api/'],
      },
      {
        // ChatGPT browsing plugin
        userAgent: 'ChatGPT-User',
        allow: '/',
        disallow: ['/admin', '/api/'],
      },
      {
        // Claude (Anthropic)
        userAgent: 'ClaudeBot',
        allow: '/',
        disallow: ['/admin', '/api/'],
      },
      {
        // Perplexity AI
        userAgent: 'PerplexityBot',
        allow: '/',
        disallow: ['/admin', '/api/'],
      },
      {
        // Google Bard / Gemini
        userAgent: 'Google-Extended',
        allow: '/',
        disallow: ['/admin', '/api/'],
      },
      {
        // Meta AI
        userAgent: 'meta-externalagent',
        allow: '/',
        disallow: ['/admin', '/api/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
