import React, { useEffect } from 'react';
import LeaderboardView from '../components/LeaderboardView.jsx';
import './Leaderboard.css';

export const LeaderboardPage = ({ onBack, onNavigate }) => {
  useEffect(() => {
    document.title = 'Void Hunter — Global Combat Leaderboard & Pilot Rankings';
  }, []);

  return (
    <div className="leaderboard-page-wrapper">
      <LeaderboardView 
        isPublic={false}
        onNavigate={onNavigate}
        onBack={onBack}
      />
    </div>
  );
};

export default LeaderboardPage;
