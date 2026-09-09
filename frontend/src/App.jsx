import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import Navbar from './components/Navigation/Navbar';
import MapPage from './pages/MapPage';
import DiscoverPage from './pages/DiscoverPage';
import ContributePage from './pages/ContributePage';
import StructuralGrid from './components/Layout/StructuralGrid';
import DharoharChatbot from './components/Chatbot/DharoharChatbot';
import VisitedPassportModal from './components/Passport/VisitedPassportModal';
import HeritageQuizModal from './components/Quiz/HeritageQuizModal';

function AppContent() {
  const { isPassportOpen, setIsPassportOpen } = useLanguage();

  return (
    <Router>
      <StructuralGrid>
        <Navbar />
        <Routes>
          <Route path="/" element={<MapPage />} />
          <Route path="/discover" element={<DiscoverPage />} />
          <Route path="/contribute" element={<ContributePage />} />
        </Routes>
        <DharoharChatbot />
        <VisitedPassportModal 
          isOpen={isPassportOpen} 
          onClose={() => setIsPassportOpen(false)} 
        />
        <HeritageQuizModal />
      </StructuralGrid>
    </Router>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}

