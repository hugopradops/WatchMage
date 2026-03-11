import TopBar from './components/TopBar';
import SaleCard from './components/SaleCard';
import ReleasesCard from './components/ReleasesCard';
import CriticScoresCard from './components/CriticScoresCard';
import NewsCard from './components/NewsCard';

export default function Home() {
  return (
    <>
      {/* Gradient mesh background — pure CSS, no canvas needed */}
      <div className="bg-mesh" aria-hidden="true">
        <div className="bg-blob bg-blob-1"></div>
        <div className="bg-blob bg-blob-2"></div>
        <div className="bg-blob bg-blob-3"></div>
      </div>

      <TopBar />

      <main className="dashboard">
        <div className="bento-sale">
          <SaleCard />
        </div>
        <div className="bento-releases">
          <ReleasesCard />
        </div>
        <div className="bento-critics">
          <CriticScoresCard />
        </div>
        <div className="bento-news">
          <NewsCard />
        </div>
      </main>
    </>
  );
}
