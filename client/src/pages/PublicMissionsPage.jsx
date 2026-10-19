import React, { useState } from 'react';
import soundManager from '../game/managers/SoundManager.js';
import PublicNavbar from '../components/PublicNavbar.jsx';
import EnlistPromptModal from '../components/EnlistPromptModal.jsx';
import { SECTORS_LIST, MISSIONS_CATALOG } from '../data/missionsData.js';
import { Play, Star, Crosshair, Lock, Zap } from 'lucide-react';

export const PublicMissionsPage = ({ onNavigate }) => {
  const [activeSectorId, setActiveSectorId] = useState('sector-1');
  const [selectedDifficulty, setSelectedDifficulty] = useState('NORMAL');
  const [promptMission, setPromptMission] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const currentSector = SECTORS_LIST.find((s) => s.id === activeSectorId) || SECTORS_LIST[0];
  const sectorMissions = MISSIONS_CATALOG.filter((m) => m.sectorId === activeSectorId);

  const handleMissionClick = (mission) => {
    soundManager.playLaser();
    setPromptMission(mission);
    setIsModalOpen(true);
  };

  const handleEnlistConfirm = () => {
    setIsModalOpen(false);
    if (onNavigate) onNavigate('auth');
  };

  return (
    <div style={styles.pageWrapper}>
      {/* Dynamic Starry Space Backdrop */}
      <div style={styles.starsBackdrop} />
      <div style={styles.nebulaGlow} />

      {/* Top Cyber Navigation Bar (No Sidebar) */}
      <PublicNavbar current="missions" onNavigate={onNavigate} />

      {/* Main Public Content */}
      <main style={styles.contentContainer}>
        {/* Hero Header */}
        <div style={styles.heroSection}>
          <div style={styles.heroBadge}>
            <span style={styles.onlineDot}>●</span>
            <span>PUBLIC MISSION ARCHIVE // 50 SORTIES</span>
          </div>

          <h1 className="font-heading" style={styles.heroTitle}>
            TACTICAL MISSIONS <span className="text-glow-cyan" style={{ color: 'var(--secondary-cyan)' }}>CATALOG</span>
          </h1>

          <p style={styles.heroSubtitle}>
            Explore all 5 contested deep-space sectors. Enlist as an active pilot to launch starfighter sorties, destroy Void Vanguard flagships, and claim mission rewards.
          </p>

          {/* Quick Stats Banner */}
          <div style={styles.statsBar} className="glass-panel">
            <div style={styles.statItem}>
              <span style={styles.statVal}>50</span>
              <span style={styles.statLbl}>TOTAL MISSIONS</span>
            </div>
            <div style={styles.statDivider} />
            <div style={styles.statItem}>
              <span style={styles.statVal}>5</span>
              <span style={styles.statLbl}>DEEP SECTORS</span>
            </div>
            <div style={styles.statDivider} />
            <div style={styles.statItem}>
              <span style={styles.statVal}>150</span>
              <span style={styles.statLbl}>SECTOR STARS</span>
            </div>
            <div style={styles.statDivider} />
            <div style={styles.statItem}>
              <span style={{ ...styles.statVal, color: '#10B981' }}>UNLOCKED</span>
              <span style={styles.statLbl}>MISSION 01 ENTRY</span>
            </div>
          </div>
        </div>

        {/* 5 Sector Tabs */}
        <div style={styles.sectorsNav}>
          {SECTORS_LIST.map((sector) => {
            const isActive = sector.id === activeSectorId;
            return (
              <button
                key={sector.id}
                onClick={() => {
                  soundManager.playLaser();
                  setActiveSectorId(sector.id);
                }}
                style={{
                  ...styles.sectorTab,
                  ...(isActive ? styles.sectorTabActive : {})
                }}
                className={`sector-tab-btn ${isActive ? 'active' : ''}`}
              >
                <div style={styles.sectorTabNumber}>SECTOR {sector.id.replace('sector-', '0')}</div>
                <div className="font-heading" style={styles.sectorTabName}>{sector.name}</div>
              </button>
            );
          })}
        </div>

        {/* Active Sector Summary Banner */}
        <div style={styles.activeSectorBanner} className="glass-panel cyber-box">
          <div style={styles.activeSectorLeft}>
            <div style={styles.sectorTag}>ACTIVE THEATER OF OPERATIONS</div>
            <h2 className="font-heading text-glow-cyan" style={styles.activeSectorTitle}>
              {currentSector.name.toUpperCase()}
            </h2>
            <p style={styles.activeSectorDesc}>
              {currentSector.description}
            </p>
          </div>

          {/* Difficulty Selector */}
          <div style={styles.diffSelector}>
            <span style={styles.diffLabel}>COMBAT DIFFICULTY:</span>
            <div style={styles.diffBtnGroup}>
              {['NORMAL', 'HARD', 'EXPERT'].map((diff) => (
                <button
                  key={diff}
                  onClick={() => {
                    soundManager.playLaser();
                    setSelectedDifficulty(diff);
                  }}
                  style={{
                    ...styles.diffBtn,
                    background: selectedDifficulty === diff ? 'var(--secondary-cyan)' : 'rgba(255, 255, 255, 0.05)',
                    color: selectedDifficulty === diff ? '#060919' : 'var(--text-muted)',
                    borderColor: selectedDifficulty === diff ? 'var(--secondary-cyan)' : 'rgba(255, 255, 255, 0.12)'
                  }}
                  className="font-heading"
                >
                  {diff}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Mission Cards Grid */}
        <div style={styles.missionsGrid}>
          {sectorMissions.map((mission, index) => {
            const isFirst = mission.globalSequence === 1;

            return (
              <div
                key={mission.id}
                style={{
                  ...styles.missionCard,
                  ...(isFirst ? styles.firstMissionCard : {})
                }}
                className="glass-panel cyber-box animate-hover-lift"
                onClick={() => handleMissionClick(mission)}
              >
                {/* Header Tag */}
                <div style={styles.cardHeader}>
                  <div style={styles.seqBadge}>
                    <span>MISSION {String(mission.globalSequence).padStart(2, '0')}</span>
                  </div>

                  {isFirst ? (
                    <span style={styles.unlockedTag}>● READY TO PLAY</span>
                  ) : (
                    <span style={styles.lockedTag}>
                      <Lock size={12} />
                      <span>SORTIE #{mission.globalSequence}</span>
                    </span>
                  )}
                </div>

                {/* Title */}
                <h3 className="font-heading text-glow-cyan" style={styles.missionTitle}>
                  {mission.name}
                </h3>

                <p style={styles.missionDesc}>
                  {mission.description || `Deploy into ${currentSector.name} airspace to clear hostile interceptors and secure planetary navigational relays.`}
                </p>

                {/* Mission Specs */}
                <div style={styles.specsRow}>
                  <div style={styles.specItem}>
                    <Crosshair size={14} color="var(--secondary-cyan)" />
                    <span>Waves: {mission.waves || 3}</span>
                  </div>
                  <div style={styles.specItem}>
                    <Star size={14} color="var(--currency-gold)" />
                    <span>Max Stars: 3</span>
                  </div>
                  <div style={styles.specItem}>
                    <Zap size={14} color="#C084FC" />
                    <span>Reward: 100-350 CR</span>
                  </div>
                </div>

                {/* Action CTA Button */}
                <button
                  style={{
                    ...styles.launchBtn,
                    ...(isFirst ? styles.launchBtnActive : {})
                  }}
                  className={isFirst ? "btn btn-cyan animate-pulse-glow" : "btn btn-outline"}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleMissionClick(mission);
                  }}
                >
                  <Play size={16} fill="currentColor" />
                  <span>{isFirst ? "LAUNCH MISSION 01" : "DEPLOY SORTIE"}</span>
                </button>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA Banner */}
        <div style={styles.bottomCta} className="glass-panel cyber-box">
          <div>
            <div style={styles.bottomTag}>ENLISTMENT PROTOCOL READY</div>
            <h3 className="font-heading text-glow-cyan" style={{ fontSize: '1.4rem', margin: '4px 0 8px 0' }}>
              READY TO COMMENCE YOUR COMBAT SORTIE?
            </h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', margin: 0, maxWidth: '600px' }}>
              Enlist as a Void Hunter pilot to save high scores, unlock advanced starships, and claim double-entry wallet credits.
            </p>
          </div>
          <button
            onClick={() => onNavigate('auth')}
            className="btn btn-cyan animate-pulse-glow"
            style={{ padding: '14px 32px', fontSize: '0.9rem', fontWeight: 'bold' }}
          >
            LOGIN / ENLIST TO PLAY
          </button>
        </div>
      </main>

      {/* Login Prompt Modal when Mission is Clicked */}
      <EnlistPromptModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onEnlist={handleEnlistConfirm}
        title={promptMission?.name || "PILOT AUTHENTICATION REQUIRED"}
        subtitle={`You selected ${promptMission?.name || 'Mission 01: Recon Patrol'}. Log in or enlist now to deploy your starfighter, save combat progress, and record your high scores!`}
        featureList={[
          `Launch ${promptMission?.name || 'Mission 01'} and all 50 sequential sorties`,
          "Earn Credits and Energy Cores recorded to your wallet ledger",
          "Unlock advanced starships (Phoenix, Shadow, Titan, Nova)",
          "Compete on the global Hall of Fame leaderboard"
        ]}
      />
    </div>
  );
};

const styles = {
  pageWrapper: {
    minHeight: '100vh',
    width: '100%',
    backgroundColor: '#060919',
    position: 'relative',
    color: 'var(--text-light)',
    overflowX: 'hidden'
  },
  starsBackdrop: {
    position: 'fixed',
    inset: 0,
    background: 'radial-gradient(ellipse at 50% 25%, rgba(14, 23, 60, 0.75) 0%, #060919 80%)',
    zIndex: 1,
    pointerEvents: 'none'
  },
  nebulaGlow: {
    position: 'fixed',
    width: '750px',
    height: '750px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(124, 58, 237, 0.12) 0%, rgba(0, 229, 255, 0.08) 50%, transparent 80%)',
    top: '10%',
    left: '50%',
    transform: 'translateX(-50%)',
    filter: 'blur(50px)',
    zIndex: 2,
    pointerEvents: 'none'
  },
  contentContainer: {
    position: 'relative',
    zIndex: 10,
    maxWidth: '1280px',
    margin: '0 auto',
    padding: 'clamp(70px, 9vw, 100px) clamp(14px, 3vw, 24px) 60px clamp(14px, 3vw, 24px)',
    display: 'flex',
    flexDirection: 'column',
    gap: '32px'
  },
  heroSection: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    gap: '16px'
  },
  heroBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '6px 16px',
    borderRadius: '20px',
    background: 'rgba(0, 229, 255, 0.1)',
    border: '1px solid rgba(0, 229, 255, 0.35)',
    color: 'var(--secondary-cyan)',
    fontSize: '0.74rem',
    letterSpacing: '0.1em',
    fontFamily: 'var(--font-heading)'
  },
  onlineDot: {
    color: '#10B981',
    fontSize: '0.9rem'
  },
  heroTitle: {
    fontSize: 'clamp(2.2rem, 4vw, 3.2rem)',
    fontWeight: '900',
    letterSpacing: '0.06em',
    lineHeight: 1.15,
    margin: 0
  },
  heroSubtitle: {
    fontSize: '0.98rem',
    color: 'var(--text-muted)',
    maxWidth: '680px',
    lineHeight: 1.6,
    margin: 0
  },
  statsBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '32px',
    padding: '16px 36px',
    borderRadius: '16px',
    border: '1px solid rgba(0, 229, 255, 0.25)',
    marginTop: '12px',
    flexWrap: 'wrap'
  },
  statItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px'
  },
  statVal: {
    fontFamily: 'var(--font-heading)',
    fontSize: '1.25rem',
    fontWeight: '900',
    color: 'var(--secondary-cyan)'
  },
  statLbl: {
    fontSize: '0.66rem',
    color: 'var(--text-muted)',
    letterSpacing: '0.08em'
  },
  statDivider: {
    width: '1px',
    height: '28px',
    background: 'rgba(255, 255, 255, 0.1)'
  },
  sectorsNav: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '12px',
    width: '100%'
  },
  sectorTab: {
    padding: '16px 20px',
    borderRadius: '12px',
    background: 'rgba(10, 16, 40, 0.65)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: '6px',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'all 0.25s ease'
  },
  sectorTabActive: {
    background: 'rgba(0, 229, 255, 0.12)',
    borderColor: 'var(--secondary-cyan)',
    boxShadow: '0 0 20px rgba(0, 229, 255, 0.25)'
  },
  sectorTabNumber: {
    fontSize: '0.64rem',
    color: 'var(--secondary-cyan)',
    letterSpacing: '0.1em',
    fontFamily: 'var(--font-heading)'
  },
  sectorTabName: {
    fontSize: '0.92rem',
    color: 'var(--text-light)',
    letterSpacing: '0.04em'
  },
  activeSectorBanner: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '24px 32px',
    borderRadius: '16px',
    border: '1px solid rgba(0, 229, 255, 0.25)',
    flexWrap: 'wrap',
    gap: '20px'
  },
  activeSectorLeft: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    maxWidth: '650px'
  },
  sectorTag: {
    fontSize: '0.66rem',
    color: 'var(--text-muted)',
    letterSpacing: '0.12em',
    fontFamily: 'var(--font-heading)'
  },
  activeSectorTitle: {
    fontSize: '1.6rem',
    margin: 0,
    letterSpacing: '0.06em'
  },
  activeSectorDesc: {
    fontSize: '0.88rem',
    color: 'var(--text-muted)',
    lineHeight: 1.5,
    margin: 0
  },
  diffSelector: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    alignItems: 'flex-start'
  },
  diffLabel: {
    fontSize: '0.68rem',
    color: 'var(--text-muted)',
    letterSpacing: '0.08em',
    fontFamily: 'var(--font-heading)'
  },
  diffBtnGroup: {
    display: 'flex',
    gap: '8px'
  },
  diffBtn: {
    padding: '6px 14px',
    borderRadius: '6px',
    border: '1px solid',
    fontSize: '0.74rem',
    letterSpacing: '0.08em',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  missionsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '16px'
  },
  missionCard: {
    padding: '24px',
    borderRadius: '16px',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
    cursor: 'pointer',
    background: 'rgba(10, 16, 42, 0.7)',
    transition: 'all 0.25s ease'
  },
  firstMissionCard: {
    border: '1px solid rgba(0, 229, 255, 0.45)',
    boxShadow: '0 0 25px rgba(0, 229, 255, 0.15)'
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  seqBadge: {
    fontSize: '0.7rem',
    fontFamily: 'var(--font-heading)',
    color: 'var(--secondary-cyan)',
    letterSpacing: '0.08em'
  },
  unlockedTag: {
    fontSize: '0.66rem',
    color: '#10B981',
    fontWeight: 'bold',
    letterSpacing: '0.08em'
  },
  lockedTag: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '0.64rem',
    color: 'var(--text-muted)',
    letterSpacing: '0.08em'
  },
  missionTitle: {
    fontSize: '1.1rem',
    margin: 0,
    lineHeight: 1.25
  },
  missionDesc: {
    fontSize: '0.84rem',
    color: 'var(--text-muted)',
    lineHeight: 1.5,
    margin: 0,
    minHeight: '38px'
  },
  specsRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '10px 14px',
    background: 'rgba(0, 0, 0, 0.3)',
    borderRadius: '8px',
    fontSize: '0.74rem',
    color: 'var(--text-light)'
  },
  specItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  },
  launchBtn: {
    width: '100%',
    padding: '12px',
    fontSize: '0.84rem',
    fontWeight: 'bold',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    borderRadius: '10px',
    marginTop: 'auto'
  },
  launchBtnActive: {
    boxShadow: '0 0 15px rgba(0, 229, 255, 0.4)'
  },
  bottomCta: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '32px 40px',
    borderRadius: '16px',
    border: '1px solid rgba(0, 229, 255, 0.3)',
    background: 'rgba(8, 14, 38, 0.85)',
    flexWrap: 'wrap',
    gap: '20px',
    marginTop: '20px'
  },
  bottomTag: {
    fontSize: '0.68rem',
    color: 'var(--secondary-cyan)',
    letterSpacing: '0.12em',
    fontFamily: 'var(--font-heading)'
  }
};

export default PublicMissionsPage;
