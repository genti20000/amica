import { readFile, writeFile, mkdir } from 'node:fs/promises';
const src = await readFile('dist/index.html', 'utf8');
const title = 'Private Karaoke in Soho, London | AMICA Soho';
const description = 'Book a private karaoke room at AMICA Soho, 23 Frith Street, for 8–15 guests. Choose your date, time and session length online.';
const canonical = 'https://www.amicasoho.com/karaoke-booking';
const html = src
  .replace(/<title>[^<]*<\/title>/i, '<title>' + title + '</title>')
  .replace(/(<meta name="description" content=")[^"]*(")/i, '$1' + description + '$2')
  .replace(/(<meta property="og:title" content=")[^"]*(")/i, '$1' + title + '$2')
  .replace(/(<meta property="og:description" content=")[^"]*(")/i, '$1' + description + '$2')
  .replace(/(<link rel="canonical" href=")[^"]*(")/i, '$1' + canonical + '$2')
  .replace(/(<meta property="og:url" content=")[^"]*(")/i, '$1' + canonical + '$2')
  .replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/i, '');
if (!html.includes('<title>' + title + '</title>') || !html.includes('rel="canonical" href="' + canonical + '"') || !html.includes('name="description" content="' + description + '"')) {
  throw new Error('Karaoke SEO page metadata generation failed');
}
await mkdir('dist/karaoke-booking', { recursive: true });
await writeFile('dist/karaoke-booking/index.html', html);
