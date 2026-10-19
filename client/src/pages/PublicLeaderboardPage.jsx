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
      <footer style={styles.footerBar}>
        <div style={styles.footerContainer}>
          <div style={styles.footerItem}>
            <span>PROTOCOL <span style={{ color: '#00E5FF', fontWeight: '700' }}>{GAME_VERSION}</span></span>
            <span style={{ margin: '0 8px', opacity: 0.4 }}>|</span>
            <span>MONGODB VERIFIED LEDGER</span>
          </div>
          <div style={styles.footerCenter}>
            <span>HALL OF FAME</span>
            <span style={{ margin: '0 6px', color: '#00E5FF' }}>•</span>
            <span style={{ color: '#8B5CF6' }}>INTERGALACTIC COMBAT ACES</span>
          </div>
          <div style={styles.footerRight}>
            <span style={{ color: '#20D6A0' }}>●</span>
            <span style={{ marginLeft: '6px' }}>TELEMETRY SYNCHRONIZED</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

const styles = {
  footerBar: {
    width: '100%',
    height: '36px',
    background: 'rgba(5, 9, 27, 0.95)',
    borderTop: '1px solid rgba(0, 229, 255, 0.15)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    zIndex: 20,
    fontFamily: 'Orbitron, sans-serif',
    fontSize: '0.66rem',
    letterSpacing: '0.1em',
    color: '#9AA9C7',
    padding: '0 24px',
    boxSizing: 'border-box'
  },
  footerContainer: {
    maxWidth: '1280px',
    width: '100%',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  footerItem: {
    display: 'flex',
    alignItems: 'center'
  },
  footerCenter: {
    display: 'flex',
    alignItems: 'center'
  },
  footerRight: {
    display: 'flex',
    alignItems: 'center'
  }
};

export default PublicLeaderboardPage;
