import React from 'react';
import MissionsView from '../components/MissionsView.jsx';
import './MissionsPage.css';

export const MissionsPage = ({ 
  onBack, 
  onNavigate, 
  onLaunchMission, 
  selectedShip = { id: 'v01-orbitron', name: 'V-01 ORBITRON', speed: 380, damage: 25 } 
}) => {
  return (
    <div className="missions-page-root" style={{ backgroundAttachment: 'scroll' }}>
      {/* Background Atmosphere Vignette */}
      <div className="missions-vignette" />

      {/* Unified AAA Missions Operations Command-Center */}
      <MissionsView 
        isPublic={false}
        onNavigate={onNavigate}
        onLaunchMission={onLaunchMission}
        selectedShip={selectedShip}
        onBack={onBack}
      />
    </div>
  );
};

export default MissionsPage;
