import React from 'react';
import PublicNavbar from '../components/PublicNavbar.jsx';
import HangarView from '../components/HangarView.jsx';
import { GAME_VERSION } from '../config/gameConfig.js';
import './HangarPage.css';

export const PublicHangarPage = ({ onNavigate }) => {
  return (
    <div className="hangar-page-root">
      {/* 100% Pure-Code Atmospheric Background Layers */}
      <div className="hangar-starfield" />
      <div className="hangar-structural-gantries" />
      <div className="hangar-light-shafts" />
      <div className="hangar-docking-runway" />
      <div className="hangar-laser-scan" />
      <div className="hangar-vignette" />

      {/* Top Cyber Navigation Bar */}
      <PublicNavbar current="hangar" onNavigate={onNavigate} />

      {/* Unified AAA Fleet Hangar Operations */}
      <HangarView 
        isPublic={true}
        onNavigate={onNavigate}
        onLaunchMission={() => {
          if (onNavigate) onNavigate('auth');
        }}
      />

      {/* Bottom Status Strip */}
      <footer style={styles.footerBar}>
        <div style={styles.footerContainer}>
          <div style={styles.footerItem}>
            <span>PROTOCOL <span style={{ color: '#00E5FF', fontWeight: '700' }}>{GAME_VERSION}</span></span>
            <span style={{ margin: '0 4px', opacity: 0.5 }}>|</span>
            <span>PHASER 3 ENGINE</span>
          </div>
          <div style={styles.footerCenter}>
            <span>FLEET RECONNAISSANCE</span>
            <span style={{ margin: '0 6px', color: '#00E5FF' }}>•</span>
            <span>5 ADVANCED HULLS</span>
            <span style={{ margin: '0 6px', color: '#00E5FF' }}>•</span>
            <span>ATOMIC MODULE UPGRADES</span>
          </div>
          <div style={styles.footerItem}>
            <span style={styles.liveDot} />
            <span>HANGAR DECK OPERATIONAL</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

const styles = {
  footerBar: {
    position: 'relative',
    zIndex: 20,
    width: '100%',
    height: '40px',
    background: 'rgba(6, 9, 25, 0.95)',
    borderTop: '1px solid rgba(0, 229, 255, 0.2)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    display: 'flex',
    alignItems: 'center',
    padding: '0 clamp(16px, 4vw, 48px)',
    boxSizing: 'border-box'
  },
  footerContainer: {
    width: '100%',
    maxWidth: '1440px',
    margin: '0 auto',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    fontFamily: 'Orbitron, monospace',
    fontSize: '0.72rem',
    letterSpacing: '0.12em',
    color: '#9AA9C7'
  },
  footerItem: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px'
  },
  footerCenter: {
    color: '#9AA9C7',
    letterSpacing: '0.16em',
    fontSize: '0.7rem'
  },
  liveDot: {
    width: '7px',
    height: '7px',
    borderRadius: '50%',
    backgroundColor: '#10B981',
    boxShadow: '0 0 8px #10B981'
  }
};

export default PublicHangarPage;
