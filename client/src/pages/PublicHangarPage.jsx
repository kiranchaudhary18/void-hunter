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
      <footer className="public-page-footer">
        <div className="public-footer-container">
          <div className="public-footer-item">
            <span>PROTOCOL <span className="public-footer-highlight">{GAME_VERSION}</span></span>
            <span className="public-footer-divider">|</span>
            <span>PHASER 3 ENGINE</span>
          </div>
          <div className="public-footer-center">
            <span>FLEET RECONNAISSANCE</span>
            <span className="public-footer-dot-sep">•</span>
            <span>5 ADVANCED HULLS</span>
            <span className="public-footer-dot-sep">•</span>
            <span>ATOMIC MODULE UPGRADES</span>
          </div>
          <div className="public-footer-item">
            <span className="public-footer-beacon" />
            <span>HANGAR DECK OPERATIONAL</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicHangarPage;
