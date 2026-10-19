import React from 'react';
import HangarView from '../components/HangarView.jsx';
import './HangarPage.css';

export const HangarPage = ({ 
  onBack, 
  onNavigate, 
  onLaunchMission 
}) => {
  return (
    <div className="hangar-page-root" style={{ backgroundAttachment: 'scroll' }}>
      {/* Background Atmosphere Vignette */}
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
