import { getSeries, getMovies, getEpisodes, getTVChannels } from "./lib/firebaseServices";

export async function generateSitemap(baseUrl: string) {
  const series = await getSeries();
  const movies = await getMovies();
  const episodes = await getEpisodes();
  const channels = await getTVChannels();

  const pages = [
    "",
    "series",
    "movies",
    "adult",
    "tv-channels",
    "live-sport",
    "agent",
    "how-to-use"
  ];

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

  // Static pages
  pages.forEach(page => {
    xml += `
  <url>
    <loc>${baseUrl}/${page}</loc>
    <changefreq>hourly</changefreq>
    <priority>1.0</priority>
  </url>`;
  });

  // Series
  series.forEach(s => {
    xml += `
  <url>
    <loc>${baseUrl}/series/${s.id}</loc>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>`;
  });

  // Movies
  movies.forEach(m => {
    xml += `
  <url>
    <loc>${baseUrl}/watch/${m.id}</loc>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>`;
  });

  // Episodes
  episodes.forEach(e => {
    xml += `
  <url>
    <loc>${baseUrl}/watch/${e.id}</loc>
    <changefreq>daily</changefreq>
    <priority>0.6</priority>
  </url>`;
  });

  // TV Channels
  channels.forEach(c => {
    xml += `
  <url>
    <loc>${baseUrl}/tv-channels</loc>
    <changefreq>hourly</changefreq>
    <priority>0.7</priority>
  </url>`;
  });

  xml += "\n</urlset>";
  return xml;
}
