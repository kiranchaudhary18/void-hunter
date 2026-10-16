import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import soundManager from '../game/managers/SoundManager.js';
import { GAME_NAME, GAME_TAGLINE } from '../config/gameConfig.js';
import { 
  Play, Compass, Shield, Award, BarChart3, Wallet, 
  Coins, Zap, User, Star, ChevronRight, Crosshair, 
  Calendar, CheckCircle2, ArrowUpRight, Sparkles 
} from 'lucide-react';

export const DashboardPage = ({ onNavigate, onLaunchQuickCombat, selectedShip }) => {
  const { user, profile } = useAuth();

  const handleNav = (screenName) => {
    soundManager.playLaser();
    if (onNavigate) onNavigate(screenName);
  };

  const currentShipName = selectedShip?.name || profile?.selectedShipId?.toUpperCase() || 'V-01 ORBITRON';

  return (
    <div style={styles.dashboardContainer}>
      {/* ================= HERO COMMAND BANNER ================= */}
      <div style={styles.heroBanner} className="glass-panel">
        <div style={styles.heroLeft}>
          <div style={styles.badgeRow}>
            <span className="badge badge-cyan animate-pulse-glow">
              <Sparkles size={13} style={{ marginRight: '6px' }} />
              OPERATIONAL COMMAND DECK • FLEET COMBAT READY
            </span>
          </div>

          <h1 className="font-heading" style={styles.heroHeading}>
            WELCOME BACK, <span style={{ color: 'var(--secondary-cyan)' }}>{user?.name?.toUpperCase() || 'COMMANDER'}</span>
          </h1>

          <p style={styles.heroDesc}>
            Starfighter systems calibrated at 60 FPS. 50 tactical missions across 5 sectors awaiting deployment. Check daily rotation quests and upgrade your module tracks.
          </p>

          <div style={styles.heroActions}>
            <button 
              onClick={() => onLaunchQuickCombat ? onLaunchQuickCombat() : handleNav('gameplay')}
              className="btn btn-cyan animate-pulse-glow"
              style={{ padding: '14px 28px', fontSize: '1rem' }}
            >
              <Play size={18} fill="currentColor" />
              <span>DEPLOY COMBAT</span>
            </button>
            <button 
              onClick={() => handleNav('missions')}
              className="btn btn-purple"
              style={{ padding: '14px 24px', fontSize: '0.95rem' }}
            >
              <Compass size={18} />
              <span>SECTOR CAMPAIGNS</span>
            </button>
          </div>
        </div>

        <div style={styles.heroRight}>
          <div style={styles.starshipBadgeCard} className="glass-card">
            <div style={styles.starshipBadgeHeader}>
              <Crosshair size={18} color="var(--electric-magenta)" />
              <span style={styles.starshipBadgeTag}>DEPLOYED STARFIGHTER</span>
            </div>
            <div className="font-heading" style={styles.starshipBadgeName}>{currentShipName}</div>
            <div style={styles.shipStatGrid}>
              <div style={styles.shipStatRow}>
                <span>SPEED</span>
                <b style={{ color: 'var(--secondary-cyan)' }}>{selectedShip?.speed || 390} KM/S</b>
              </div>
              <div style={styles.shipStatRow}>
                <span>DAMAGE</span>
                <b style={{ color: 'var(--electric-magenta)' }}>{selectedShip?.damage || 28} DPS</b>
              </div>
            </div>
            <button 
              onClick={() => handleNav('hangar')}
              style={styles.hangarShortcutBtn}
              className="btn-secondary"
            >
              <span>MANAGE SHIP MODULES</span>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* ================= 4 PRIMARY METRIC CARDS ================= */}
      <div style={styles.metricsGrid}>
        {/* 1. Wallet Ledger Balance */}
        <div 
          style={{ ...styles.metricCard, cursor: 'pointer' }} 
          className="glass-card glass-card-hover"
          onClick={() => handleNav('wallet')}
          title="Click to view full double-entry ledger"
        >
          <div style={styles.metricCardHeader}>
            <div style={styles.metricIconGold}>
              <Coins size={20} color="var(--currency-gold)" />
            </div>
            <ArrowUpRight size={16} color="var(--text-muted)" />
          </div>
          <div style={styles.metricValGold}>
            {profile?.credits?.toLocaleString() || 500}
          </div>
          <div style={styles.metricLabel}>CREDITS LEDGER BALANCE</div>
          <div style={styles.metricSub}>Double-entry cryptographically verified &rarr;</div>
        </div>

        {/* 2. Energy Cores Hard Currency */}
        <div 
          style={{ ...styles.metricCard, cursor: 'pointer' }} 
          className="glass-card glass-card-hover"
          onClick={() => handleNav('wallet')}
        >
          <div style={styles.metricCardHeader}>
            <div style={styles.metricIconPurple}>
              <Zap size={20} color="#C084FC" />
            </div>
            <ArrowUpRight size={16} color="var(--text-muted)" />
          </div>
          <div style={styles.metricValPurple}>
            {profile?.energyCores || 10}
          </div>
          <div style={styles.metricLabel}>ENERGY CORES</div>
          <div style={styles.metricSub}>Premium currency for instant commissioning &rarr;</div>
        </div>

        {/* 3. Campaign Conquest Status */}
        <div 
          style={{ ...styles.metricCard, cursor: 'pointer' }} 
          className="glass-card glass-card-hover"
          onClick={() => handleNav('missions')}
        >
          <div style={styles.metricCardHeader}>
            <div style={styles.metricIconCyan}>
              <Star size={20} color="var(--currency-gold)" fill="var(--currency-gold)" />
            </div>
            <ArrowUpRight size={16} color="var(--text-muted)" />
          </div>
          <div style={styles.metricValCyan}>
            {profile?.stats?.missionsCompleted || 0} / 50
          </div>
          <div style={styles.metricLabel}>SECTOR MISSIONS SECURED</div>
          <div style={styles.metricSub}>5 Sectors across 50 data-driven stages &rarr;</div>
        </div>

        {/* 4. Pilot Level & Rank */}
        <div 
          style={{ ...styles.metricCard, cursor: 'pointer' }} 
          className="glass-card glass-card-hover"
          onClick={() => handleNav('quests')}
        >
          <div style={styles.metricCardHeader}>
            <div style={styles.metricIconMagenta}>
              <Award size={20} color="var(--electric-magenta)" />
            </div>
            <ArrowUpRight size={16} color="var(--text-muted)" />
          </div>
          <div style={styles.metricValMagenta}>
            LV. {profile?.level || 1}
          </div>
          <div style={styles.metricLabel}>{profile?.pilotRank || 'STAR CADET'}</div>
          <div style={styles.metricSub}>{profile?.xp || 0} / {profile?.xpToNextLevel || 500} XP progress &rarr;</div>
        </div>
      </div>

      {/* ================= 6 QUICK TACTICAL ACTION TILES ================= */}
      <div style={styles.actionsSection}>
        <h2 className="font-heading" style={styles.actionsSectionTitle}>TACTICAL OPERATIONS</h2>

        <div style={styles.actionsGrid}>
          <button 
            onClick={() => handleNav('missions')} 
            style={styles.actionTile}
            className="glass-card glass-card-hover"
          >
            <div style={styles.actionIconCyan}><Compass size={24} /></div>
            <div>
              <div className="font-heading" style={styles.actionTileTitle}>SECTOR CAMPAIGNS</div>
              <div style={styles.actionTileSub}>50 Strategic Stages & 5 Apex Bosses</div>
            </div>
          </button>

          <button 
            onClick={() => handleNav('hangar')} 
            style={styles.actionTile}
            className="glass-card glass-card-hover"
          >
            <div style={styles.actionIconMagenta}><Shield size={24} /></div>
            <div>
              <div className="font-heading" style={styles.actionTileTitle}>STARSHIP HANGAR</div>
              <div style={styles.actionTileSub}>5 Ships & 4 Upgrade Tracks</div>
            </div>
          </button>

          <button 
            onClick={() => handleNav('quests')} 
            style={styles.actionTile}
            className="glass-card glass-card-hover"
          >
            <div style={styles.actionIconGold}><Calendar size={24} /></div>
            <div>
              <div className="font-heading" style={styles.actionTileTitle}>DAILY ROTATION QUESTS</div>
              <div style={styles.actionTileSub}>24h Objectives & 7-Day Streak Rewards</div>
            </div>
          </button>

          <button 
            onClick={() => handleNav('leaderboard')} 
            style={styles.actionTile}
            className="glass-card glass-card-hover"
          >
            <div style={styles.actionIconPurple}><BarChart3 size={24} /></div>
            <div>
              <div className="font-heading" style={styles.actionTileTitle}>GLOBAL LEADERBOARD</div>
              <div style={styles.actionTileSub}>Top 100 Aces & Pinned Pilot Rank</div>
            </div>
          </button>

          <button 
            onClick={() => handleNav('wallet')} 
            style={styles.actionTile}
            className="glass-card glass-card-hover"
          >
            <div style={styles.actionIconGreen}><Wallet size={24} /></div>
            <div>
              <div className="font-heading" style={styles.actionTileTitle}>CRYPTOGRAPHIC WALLET</div>
              <div style={styles.actionTileSub}>Immutable Ledger & Rewarded Ads</div>
            </div>
          </button>

          <button 
            onClick={() => handleNav('gameplay')} 
            style={styles.actionTile}
            className="glass-card glass-card-hover"
          >
            <div style={styles.actionIconCyan}><Play size={24} /></div>
            <div>
              <div className="font-heading" style={styles.actionTileTitle}>INSTANT COMBAT ARENA</div>
              <div style={styles.actionTileSub}>Real-Time 60 FPS Shmup Engine</div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  dashboardContainer: {
    padding: '24px 32px',
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
    color: 'var(--text-light)'
  },
  heroBanner: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '32px 36px',
    borderRadius: '20px',
    flexWrap: 'wrap',
    gap: '24px',
    background: 'radial-gradient(ellipse at 80% 20%, rgba(124, 58, 237, 0.15) 0%, rgba(10, 15, 44, 0.85) 75%)'
  },
  heroLeft: {
    maxWidth: '680px'
  },
  badgeRow: {
    marginBottom: '12px'
  },
  heroHeading: {
    fontSize: 'clamp(1.6rem, 3.5vw, 2.2rem)',
    letterSpacing: '0.08em',
    color: 'var(--text-light)',
    margin: '0 0 12px 0'
  },
  heroDesc: {
    fontSize: '0.92rem',
    color: 'var(--text-muted)',
    lineHeight: 1.6,
    margin: '0 0 24px 0'
  },
  heroActions: {
    display: 'flex',
    gap: '14px',
    flexWrap: 'wrap'
  },
  heroRight: {
    minWidth: '280px'
  },
  starshipBadgeCard: {
    padding: '20px',
    borderRadius: '16px',
    border: '1px solid rgba(255, 45, 255, 0.3)',
    background: 'rgba(10, 15, 35, 0.75)'
  },
  starshipBadgeHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '8px'
  },
  starshipBadgeTag: {
    fontSize: '0.65rem',
    color: 'var(--electric-magenta)',
    fontFamily: 'var(--font-heading)',
    letterSpacing: '0.08em'
  },
  starshipBadgeName: {
    fontSize: '1.25rem',
    color: 'var(--text-light)',
    margin: '0 0 12px 0'
  },
  shipStatGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    padding: '10px 0',
    borderTop: '1px solid rgba(255, 255, 255, 0.06)',
    borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
    marginBottom: '12px'
  },
  shipStatRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.78rem',
    fontFamily: 'var(--font-heading)'
  },
  hangarShortcutBtn: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    padding: '8px',
    fontSize: '0.75rem',
    borderRadius: '8px'
  },
  metricsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '16px'
  },
  metricCard: {
    padding: '22px',
    borderRadius: '16px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    minHeight: '140px',
    transition: 'all 0.25s ease'
  },
  metricCardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '10px'
  },
  metricIconGold: {
    width: '38px',
    height: '38px',
    borderRadius: '10px',
    background: 'rgba(251, 191, 36, 0.12)',
    border: '1px solid rgba(251, 191, 36, 0.35)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  metricIconPurple: {
    width: '38px',
    height: '38px',
    borderRadius: '10px',
    background: 'rgba(168, 85, 247, 0.12)',
    border: '1px solid rgba(168, 85, 247, 0.35)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  metricIconCyan: {
    width: '38px',
    height: '38px',
    borderRadius: '10px',
    background: 'rgba(0, 229, 255, 0.12)',
    border: '1px solid rgba(0, 229, 255, 0.35)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  metricIconMagenta: {
    width: '38px',
    height: '38px',
    borderRadius: '10px',
    background: 'rgba(255, 45, 255, 0.12)',
    border: '1px solid rgba(255, 45, 255, 0.35)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  metricValGold: {
    fontSize: '1.8rem',
    fontFamily: 'var(--font-heading)',
    color: 'var(--currency-gold)'
  },
  metricValPurple: {
    fontSize: '1.8rem',
    fontFamily: 'var(--font-heading)',
    color: '#C084FC'
  },
  metricValCyan: {
    fontSize: '1.8rem',
    fontFamily: 'var(--font-heading)',
    color: 'var(--secondary-cyan)'
  },
  metricValMagenta: {
    fontSize: '1.8rem',
    fontFamily: 'var(--font-heading)',
    color: 'var(--electric-magenta)'
  },
  metricLabel: {
    fontSize: '0.68rem',
    color: 'var(--text-muted)',
    fontFamily: 'var(--font-heading)',
    letterSpacing: '0.08em',
    marginTop: '4px'
  },
  metricSub: {
    fontSize: '0.72rem',
    color: 'var(--text-muted)',
    marginTop: '6px'
  },
  actionsSection: {
    marginTop: '8px'
  },
  actionsSectionTitle: {
    fontSize: '1.2rem',
    color: 'var(--text-light)',
    letterSpacing: '0.08em',
    marginBottom: '16px'
  },
  actionsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '16px'
  },
  actionTile: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '20px',
    borderRadius: '16px',
    border: '1px solid var(--border-glass)',
    background: 'rgba(10, 15, 40, 0.65)',
    textAlign: 'left',
    cursor: 'pointer',
    transition: 'all 0.25s ease'
  },
  actionIconCyan: {
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    background: 'rgba(0, 229, 255, 0.12)',
    border: '1px solid var(--secondary-cyan)',
    color: 'var(--secondary-cyan)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  actionIconMagenta: {
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    background: 'rgba(255, 45, 255, 0.12)',
    border: '1px solid var(--electric-magenta)',
    color: 'var(--electric-magenta)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  actionIconGold: {
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    background: 'rgba(251, 191, 36, 0.12)',
    border: '1px solid var(--currency-gold)',
    color: 'var(--currency-gold)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  actionIconPurple: {
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    background: 'rgba(168, 85, 247, 0.12)',
    border: '1px solid #A855F7',
    color: '#C084FC',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  actionIconGreen: {
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    background: 'rgba(16, 185, 129, 0.12)',
    border: '1px solid var(--status-green)',
    color: 'var(--status-green)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  actionTileTitle: {
    fontSize: '0.98rem',
    color: 'var(--text-light)',
    letterSpacing: '0.06em',
    marginBottom: '3px'
  },
  actionTileSub: {
    fontSize: '0.74rem',
    color: 'var(--text-muted)'
  }
};

export default DashboardPage;
