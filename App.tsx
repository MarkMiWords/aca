
import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import BookDetails from './pages/BookDetails';
import PublishedBooks from './pages/PublishedBooks';
import Narratives from './pages/Narratives';
import AuthorBuilder from './pages/AuthorBuilder';
import WrapItUp from './pages/WrapItUp';
import ArtGallery from './pages/ArtGallery';
import Mission from './pages/Mission';
import WhyPublish from './pages/WhyPublish';
import SubstackBridge from './pages/SubstackBridge';
import Support from './pages/Support';
import Security from './pages/Security';
import Kindred from './pages/Kindred';
import SovereignSlate from './pages/SovereignSlate';
import WrapperInfo from './pages/WrapperInfo';
import SovereignVault from './pages/SovereignVault';
import Origin from './pages/Origin';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import BugReportModal from './components/BugReportModal';
import { DevConsole } from './components/DevConsole';

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const App: React.FC = () => {
  const [isBugModalOpen, setIsBugModalOpen] = useState(false);

  useEffect(() => {
    // Initial theme sync
    const profile = JSON.parse(localStorage.getItem('aca_author_profile') || '{}');
    if (profile.theme && profile.theme !== 'amber') {
      document.body.className = `theme-${profile.theme}`;
    }
    
    // Production Domain Console Log
    if (window.location.hostname.includes('acaptiveaudience.net')) {
      console.log("%c SOVEREIGN FORGE PRO LIVE ", "background: #e67e22; color: #fff; font-weight: bold; padding: 4px;");
    }
  }, []);

  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-[#050505]">
        <ScrollToTop />
        <Navbar onReportBug={() => setIsBugModalOpen(true)} />
        <main className="flex-grow pt-24">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/published-books" element={<PublishedBooks />} />
            <Route path="/book/:slug" element={<BookDetails />} />
            <Route path="/narratives" element={<Narratives />} />
            <Route path="/art-gallery" element={<ArtGallery />} />
            <Route path="/mission" element={<Mission />} />
            <Route path="/why-publish" element={<WhyPublish />} />
            <Route path="/substack-bridge" element={<SubstackBridge />} />
            <Route path="/support" element={<Support />} />
            <Route path="/security" element={<Security />} />
            <Route path="/virty-dating" element={<Kindred />} />
            <Route path="/wrapper-info" element={<WrapperInfo />} />
            <Route path="/origin-story" element={<Origin />} />
            <Route path="/author-builder" element={<AuthorBuilder />} />
            <Route path="/sovereign-slate" element={<SovereignSlate />} />
            <Route path="/sovereign-vault" element={<SovereignVault />} />
            <Route path="/wrap-it-up" element={<WrapItUp />} />
          </Routes>
        </main>
        <Footer />
        <BugReportModal isOpen={isBugModalOpen} onClose={() => setIsBugModalOpen(false)} />
        <DevConsole />
      </div>
    </Router>
  );
};

export default App;
