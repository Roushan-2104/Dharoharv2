import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navigation/Navbar';
import MapPage from './pages/MapPage';
import DiscoverPage from './pages/DiscoverPage';
import ContributePage from './pages/ContributePage';
import StructuralGrid from './components/Layout/StructuralGrid';

export default function App() {
  return (
    <Router>
      <StructuralGrid>
        <Navbar />
        <Routes>
          <Route path="/" element={<MapPage />} />
          <Route path="/discover" element={<DiscoverPage />} />
          <Route path="/contribute" element={<ContributePage />} />
        </Routes>
      </StructuralGrid>
    </Router>
  );
}
