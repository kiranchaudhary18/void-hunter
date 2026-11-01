import React, { useEffect } from 'react';
import PublicNavbar from '../components/PublicNavbar.jsx';
import LeaderboardView from '../components/LeaderboardView.jsx';
import { GAME_VERSION } from '../config/gameConfig.js';
import './Leaderboard.css';

export const PublicLeaderboardPage = ({ onNavigate }) => {
  // Update browser document title for SEO & bookmarking
  useEffect(() => {
    document.title = 'Void Hunter — Intergalactic Hall of Fame & Combat Leaderboard';
  }, []);

  return (
    <div className="leaderboard-page-wrapper">
      {/* Top Cyber Navigation Bar (Preserves logo, font, active navigation) */}
      <PublicNavbar current="leaderboard" onNavigate={onNavigate} />

      {/* Unified AAA Competitive Esports Leaderboard View */}
      <LeaderboardView 
        isPublic={true}
        onNavigate={onNavigate}
      />

      {/* Bottom Status Strip */}
      <footer className="public-page-footer">
        <div className="public-footer-container">
          <div className="public-footer-item">
            <span>PROTOCOL <span className="public-footer-highlight">{GAME_VERSION}</span></span>
            <span className="public-footer-divider">|</span>
            <span>MONGODB VERIFIED LEDGER</span>
          </div>
          <div className="public-footer-center">
            <span>HALL OF FAME</span>
            <span className="public-footer-dot-sep">•</span>
            <span style={{ color: '#8B5CF6' }}>INTERGALACTIC COMBAT ACES</span>
          </div>
          <div className="public-footer-item">
            <span className="public-footer-beacon" />
            <span>TELEMETRY SYNCHRONIZED</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicLeaderboardPage;
