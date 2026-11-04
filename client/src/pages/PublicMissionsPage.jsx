import React from 'react';
import PublicNavbar from '../components/PublicNavbar.jsx';
import MissionsView from '../components/MissionsView.jsx';
import { GAME_VERSION } from '../config/gameConfig.js';
import './MissionsPage.css';

export const PublicMissionsPage = ({ onNavigate }) => {
  return (
    <div className="missions-page-root">
      {/* Background Atmosphere Vignette */}
      <div className="missions-vignette" />

      {/* Top Cyber Navigation Bar */}
      <PublicNavbar current="missions" onNavigate={onNavigate} />

      {/* Unified AAA Missions Operations Command-Center */}
      <MissionsView 
        isPublic={true}
        onNavigate={onNavigate}
        onLaunchMission={(_mission) => {
          if (onNavigate) onNavigate('auth');
        }}
      />

      {/* Bottom Status Strip */}
      <footer className="public-page-footer">
        <div className="public-footer-container">
          <div className="public-footer-item">
            <span>PROTOCOL <span className="public-footer-highlight">{GAME_VERSION}</span></span>
            <span className="public-footer-divider">|</span>
            <span>PHASER 3 ENGINE</span>
          </div>
          <div className="public-footer-center">
            <span>TACTICAL CAMPAIGN</span>
            <span className="public-footer-dot-sep">•</span>
            <span>50 MISSIONS</span>
            <span className="public-footer-dot-sep">•</span>
            <span>5 CONTESTED SECTORS</span>
          </div>
          <div className="public-footer-item">
            <span className="public-footer-beacon" />
            <span>MISSION ARCHIVE OPERATIONAL</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicMissionsPage;
