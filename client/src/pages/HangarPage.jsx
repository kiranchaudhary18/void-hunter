import React from 'react';
import HangarView from '../components/HangarView.jsx';
import './HangarPage.css';

export const HangarPage = ({ 
  onBack, 
  onNavigate, 
  onLaunchMission 
}) => {
  return (
    <div className="hangar-page-root">
      {/* 100% Pure-Code Atmospheric Background Layers */}
      <div className="hangar-starfield" />
      <div className="hangar-structural-gantries" />
      <div className="hangar-light-shafts" />
      <div className="hangar-docking-runway" />
      <div className="hangar-laser-scan" />
      <div className="hangar-vignette" />

      {/* Unified AAA Fleet Hangar Operations */}
      <HangarView 
        isPublic={false}
        onNavigate={onNavigate}
        onLaunchMission={onLaunchMission}
      />
    </div>
  );
};

export default HangarPage;
