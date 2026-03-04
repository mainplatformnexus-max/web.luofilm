import { useState, useEffect } from "react";
import { getSeries, getMovies, getEpisodes } from "@/lib/firebaseServices";

const Sitemap = () => {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      const [series, movies, episodes] = await Promise.all([
        getSeries(),
        getMovies(),
        getEpisodes()
      ]);
      setData({ series, movies, episodes });
    };
    fetchData();
  }, []);

  if (!data) return <div>Loading index...</div>;

  return (
    <div className="p-8 max-w-4xl mx-auto bg-background text-foreground">
      <h1 className="text-3xl font-bold mb-6 text-primary">LUO FILM - Site Index</h1>
      
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4 border-b border-border pb-2">Movies</h2>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {data.movies.map((m: any) => (
            <li key={m.id}>
              <a href={`/watch/${m.id}`} className="hover:text-primary transition-colors text-sm">
                {m.name}
              </a>
            </li>
          ))}
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4 border-b border-border pb-2">Series</h2>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {data.series.map((s: any) => (
            <li key={s.id}>
              <a href={`/series/${s.id}`} className="hover:text-primary transition-colors text-sm">
                {s.name}
              </a>
            </li>
          ))}
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4 border-b border-border pb-2">Episodes</h2>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {data.episodes.slice(0, 100).map((e: any) => (
            <li key={e.id}>
              <a href={`/watch/${e.id}`} className="hover:text-primary transition-colors text-sm">
                {e.seriesName} - {e.name}
              </a>
            </li>
          ))}
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4 border-b border-border pb-2">All Pages</h2>
        <ul className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <li><a href="/" className="hover:text-primary font-medium">Home Page</a></li>
          <li><a href="/movies" className="hover:text-primary font-medium">Movies Collection</a></li>
          <li><a href="/series" className="hover:text-primary font-medium">TV Series</a></li>
          <li><a href="/adult" className="hover:text-primary font-medium">18+ Adult Premium</a></li>
          <li><a href="/tv-channels" className="hover:text-primary font-medium">Live TV Channels</a></li>
          <li><a href="/live-sport" className="hover:text-primary font-medium">Live Sports & Football</a></li>
          <li><a href="/agent" className="hover:text-primary font-medium">Agent 1X Portal</a></li>
          <li><a href="/how-to-use" className="hover:text-primary font-medium">User Guide</a></li>
          <li><a href="/sitemap" className="hover:text-primary font-medium">Site Index</a></li>
        </ul>
      </section>
    </div>
  );
};

export default Sitemap;
