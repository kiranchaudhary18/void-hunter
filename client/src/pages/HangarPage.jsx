import React, { useState, useEffect } from 'react';
import api from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { 
  Shield, Zap, Crosshair, Wrench, ArrowLeft, Check, Lock, 
  Coins, Sparkles, ChevronRight, AlertCircle, CheckCircle2 
} from 'lucide-react';

export const HangarPage = ({ onBack, onNavigate, onLaunchMission }) => {
  const { user, profile, isAuthenticated, refreshProfile } = useAuth();
  const [ships, setShips] = useState([]);
  const [selectedShipId, setSelectedShipId] = useState('v01-orbitron');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [feedback, setFeedback] = useState({ error: null, success: null });

  // Fetch real ship ownership and upgrades from server
  const fetchShips = async () => {
    try {
      const res = await api.ships.getShips();
      if (res.success) {
        setShips(res.ships);
        if (res.selectedShipId) {
          setSelectedShipId(res.selectedShipId);
        }
      }
    } catch (err) {
      console.error('Failed to load ships:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShips();
  }, []);

  const activeShip = ships.find((s) => s.id === selectedShipId) || ships[0];

  // Equip Ship
  const handleSelectShip = async (shipId) => {
    if (!isAuthenticated) {
      if (onNavigate) onNavigate('auth');
      return;
    }
    setActionLoading(true);
    setFeedback({ error: null, success: null });
    try {
      const res = await api.ships.selectShip(shipId);
      if (res.success) {
        setFeedback({ success: `${activeShip.name} equipped for battle!`, error: null });
        await fetchShips();
        if (refreshProfile) refreshProfile();
      }
    } catch (err) {
      setFeedback({ error: err.message, success: null });
    } finally {
      setActionLoading(false);
    }
  };

  // Unlock Ship
  const handleUnlockShip = async (shipId) => {
    if (!isAuthenticated) {
      if (onNavigate) onNavigate('auth');
      return;
    }
    setActionLoading(true);
    setFeedback({ error: null, success: null });
    try {
      const res = await api.ships.unlockShip(shipId);
      if (res.success) {
        setFeedback({ success: res.message, error: null });
        await fetchShips();
        if (refreshProfile) refreshProfile();
      }
    } catch (err) {
      setFeedback({ error: err.message, success: null });
    } finally {
      setActionLoading(false);
    }
  };

  // Upgrade Module (Section 25 Atomic server validation)
  const handleUpgradeModule = async (moduleType) => {
    if (!isAuthenticated) {
      if (onNavigate) onNavigate('auth');
      return;
    }
    setActionLoading(true);
    setFeedback({ error: null, success: null });
    try {
      const res = await api.ships.upgradeShip(activeShip.id, moduleType);
      if (res.success) {
        setFeedback({ success: res.message, error: null });
        await fetchShips();
        if (refreshProfile) refreshProfile();
      }
    } catch (err) {
      setFeedback({ error: err.message, success: null });
    } finally {
      setActionLoading(false);
    }
  };

  // Upgrade cost helper
  const getUpgradeCost = (currentLvl) => {
    const costs = { 1: 250, 2: 500, 3: 1000, 4: 2000 };
    return costs[currentLvl] || 'MAX';
  };

  // Calculate dynamic stats including upgrade bonuses
  const calcStat = (base, upgradeLvl = 1) => {
    return Math.min(100, Math.round(base + (upgradeLvl - 1) * 3));
  };

  if (loading || !activeShip) {
    return (
      <div style={styles.loadingContainer}>
        <div className="font-heading" style={{ color: 'var(--secondary-cyan)' }}>
          SYNCHRONIZING HANGAR PROTOCOLS...
        </div>
      </div>
    );
  }

  const upgrades = activeShip.upgrades || { weapon: 1, shield: 1, engine: 1, special: 1 };

  // Carousel Navigation Chevrons (Screen 5)
  const handlePrevShip = () => {
    if (ships.length === 0) return;
    const currentIndex = ships.findIndex((s) => s.id === activeShip.id);
    const prevIndex = (currentIndex - 1 + ships.length) % ships.length;
    setSelectedShipId(ships[prevIndex].id);
  };

  const handleNextShip = () => {
    if (ships.length === 0) return;
    const currentIndex = ships.findIndex((s) => s.id === activeShip.id);
    const nextIndex = (currentIndex + 1) % ships.length;
    setSelectedShipId(ships[nextIndex].id);
  };

  return (
    <div style={styles.pageContainer}>
      {/* Top Subheader (Screen 5) */}
      <div style={styles.subHeaderBar} className="glass-panel cyber-box">
        <div>
          <h1 className="font-heading text-glow-cyan" style={styles.pageTitle}>SHIP HANGAR</h1>
          <p style={styles.pageSubtitle}>Select, upgrade and customize your spacecraft fleet</p>
        </div>
      </div>

      {/* Guest Mode Banner */}
      {!isAuthenticated && (
        <div className="glass-panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 20px', border: '1px solid rgba(0, 229, 255, 0.35)', background: 'rgba(0, 229, 255, 0.08)', borderRadius: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Sparkles size={18} color="var(--secondary-cyan)" />
            <span style={{ fontSize: '0.82rem', color: 'var(--text-light)' }}>
              GUEST PREVIEW MODE // Log in to equip starships, commission hulls, and purchase module upgrades.
            </span>
          </div>
          <button 
            onClick={() => onNavigate && onNavigate('auth')} 
            className="btn btn-cyan animate-pulse-glow" 
            style={{ padding: '6px 18px', fontSize: '0.76rem', fontWeight: 'bold' }}
          >
            LOGIN / ENLIST
          </button>
        </div>
      )}

      {/* Feedback Alerts */}
      {feedback.error && (
        <div style={styles.alertError} className="glass-panel">
          <AlertCircle size={18} color="#EF4444" />
          <span>{feedback.error}</span>
        </div>
      )}
      {feedback.success && (
        <div style={styles.alertSuccess} className="glass-panel">
          <CheckCircle2 size={18} color="#10B981" />
          <span>{feedback.success}</span>
        </div>
      )}

      {/* Main Hangar Workspace */}
      <div style={styles.hangarGrid}>
        {/* ================= 1. LEFT SHIP ROSTER ================= */}
        <aside style={styles.rosterPanel} className="glass-panel cyber-box">
          <div className="font-heading text-glow-cyan" style={styles.rosterTitle}>FLEET ROSTER</div>

          <div style={styles.shipList}>
            {ships.map((s) => {
              const isSelected = s.id === activeShip.id;
              return (
                <div
                  key={s.id}
                  onClick={() => setSelectedShipId(s.id)}
                  style={{
                    ...styles.shipListItem,
                    ...(isSelected ? styles.shipListItemActive : {})
                  }}
                  className="glass-card"
                >
                  <div style={styles.shipListInfo}>
                    <div className="font-heading" style={styles.shipListCode}>
                      {s.code} {s.name}
                    </div>
                    <div style={styles.shipListTagline}>{s.tagline}</div>
                  </div>

                  <div style={styles.shipListBadge}>
                    {s.isEquipped ? (
                      <span className="badge badge-cyan" style={{ fontSize: '0.62rem' }}>EQUIPPED</span>
                    ) : s.isUnlocked ? (
                      <span className="badge badge-purple" style={{ fontSize: '0.62rem' }}>READY</span>
                    ) : (
                      <span className="badge badge-gold" style={{ fontSize: '0.62rem' }}>
                        <Lock size={10} /> {s.priceCredits}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </aside>

        {/* ================= 2. CENTER HOLOGRAPHIC SHOWCASE WITH CHEVRONS (SCREEN 5) ================= */}
        <section style={styles.showcasePanel} className="glass-panel cyber-box">
          {/* Left / Right Carousel Chevrons */}
          <button 
            onClick={handlePrevShip} 
            style={styles.carouselChevronLeft}
            className="glass-card"
            title="Previous Spacecraft"
          >
            <ChevronRight size={22} style={{ transform: 'rotate(180deg)' }} />
          </button>

          <button 
            onClick={handleNextShip} 
            style={styles.carouselChevronRight}
            className="glass-card"
            title="Next Spacecraft"
          >
            <ChevronRight size={22} />
          </button>

          <div style={styles.holoStage}>
            {/* Holographic Glowing Rings */}
            <div style={styles.holoRingOuter} />
            <div style={styles.holoRingInner} />

            {/* Ship Visual Sprite */}
            <div style={styles.shipSpriteWrapper} className="animate-float">
              {activeShip.id === 'v01-orbitron' && (
                <svg width="200" height="200" viewBox="0 0 64 64" style={styles.shipSvg}>
                  <polygon points="32,6 44,28 60,52 48,56 38,48 32,58 26,48 16,56 4,52 20,28" fill="#00E5FF" filter="drop-shadow(0 0 16px #00E5FF)" />
                  <polygon points="32,10 42,32 52,50 40,48 32,54 24,48 12,50 22,32" fill="#0A1232" />
                  <ellipse cx="32" cy="26" rx="4" ry="10" fill="#FFFFFF" />
                  <circle cx="28" cy="56" r="3" fill="#FF2DFF" />
                  <circle cx="36" cy="56" r="3" fill="#FF2DFF" />
                </svg>
              )}
              {activeShip.id === 's02-phoenix' && (
                <svg width="200" height="200" viewBox="0 0 64 64" style={styles.shipSvg}>
                  <polygon points="32,4 40,24 62,44 46,60 38,48 32,56 26,48 18,60 2,44 24,24" fill="#F97316" filter="drop-shadow(0 0 16px #EA580C)" />
                  <polygon points="32,10 38,30 50,46 32,50 14,46 26,30" fill="#18181B" />
                  <rect x="16" y="18" width="4" height="18" fill="#EF4444" />
                  <rect x="44" y="18" width="4" height="18" fill="#EF4444" />
                  <circle cx="32" cy="28" r="5" fill="#FBBF24" />
                </svg>
              )}
              {activeShip.id === 'x03-shadow' && (
                <svg width="200" height="200" viewBox="0 0 64 64" style={styles.shipSvg}>
                  <polygon points="32,2 42,34 58,62 44,52 32,58 20,52 6,62 22,34" fill="#A855F7" filter="drop-shadow(0 0 16px #7C3AED)" />
                  <polygon points="32,8 38,36 46,52 32,52 18,52 26,36" fill="#09090B" />
                  <rect x="30" y="22" width="4" height="14" fill="#00E5FF" />
                </svg>
              )}
              {activeShip.id === 'r04-titan' && (
                <svg width="200" height="200" viewBox="0 0 64 64" style={styles.shipSvg}>
                  <polygon points="32,8 54,20 60,54 48,62 32,54 16,62 4,54 10,20" fill="#D97706" filter="drop-shadow(0 0 16px #FBBF24)" />
                  <rect x="20" y="20" width="24" height="30" fill="#1C1917" />
                  <circle cx="16" cy="30" r="4" fill="#38BDF8" />
                  <circle cx="48" cy="30" r="4" fill="#38BDF8" />
                </svg>
              )}
              {activeShip.id === 'z05-nova' && (
                <svg width="200" height="200" viewBox="0 0 64 64" style={styles.shipSvg}>
                  <polygon points="32,2 46,26 62,48 48,54 38,44 32,60 26,44 16,54 2,48 18,26" fill="#FF2DFF" filter="drop-shadow(0 0 18px #FF2DFF)" />
                  <polygon points="32,8 40,30 32,46 24,30" fill="#FFFFFF" />
                  <circle cx="32" cy="34" r="16" fill="none" stroke="#00E5FF" strokeWidth="2" />
                </svg>
              )}
            </div>

            <div style={styles.holoPedestal} />
          </div>
        </section>

        {/* ================= 3. RIGHT SHIP STATS & ACTIONS ================= */}
        <aside style={styles.statsPanel} className="glass-panel cyber-box">
          <div style={styles.statsHeader}>
            <span className="badge badge-cyan">{activeShip.classType} CLASS</span>
            <h2 className="font-heading text-glow-cyan" style={styles.activeShipName}>
              {activeShip.code} {activeShip.name}
            </h2>
            <p style={styles.activeShipDesc}>{activeShip.description}</p>
          </div>

          {/* Interactive Stat Bars */}
          <div style={styles.barsContainer}>
            <div className="stat-bar-container">
              <span className="stat-label">FIREPOWER</span>
              <div className="stat-bar-track">
                <div 
                  className="stat-bar-fill stat-fill-purple" 
                  style={{ width: `${calcStat(activeShip.baseStats.firepower, upgrades.weapon)}%` }} 
                />
              </div>
              <span className="stat-value">{calcStat(activeShip.baseStats.firepower, upgrades.weapon)}</span>
            </div>

            <div className="stat-bar-container">
              <span className="stat-label">SHIELD</span>
              <div className="stat-bar-track">
                <div 
                  className="stat-bar-fill stat-fill-cyan" 
                  style={{ width: `${calcStat(activeShip.baseStats.shield, upgrades.shield)}%` }} 
                />
              </div>
              <span className="stat-value">{calcStat(activeShip.baseStats.shield, upgrades.shield)}</span>
            </div>

            <div className="stat-bar-container">
              <span className="stat-label">SPEED</span>
              <div className="stat-bar-track">
                <div 
                  className="stat-bar-fill stat-fill-gold" 
                  style={{ width: `${calcStat(activeShip.baseStats.speed, upgrades.engine)}%` }} 
                />
              </div>
              <span className="stat-value">{calcStat(activeShip.baseStats.speed, upgrades.engine)}</span>
            </div>

            <div className="stat-bar-container">
              <span className="stat-label">MANEUVER</span>
              <div className="stat-bar-track">
                <div 
                  className="stat-bar-fill stat-fill-green" 
                  style={{ width: `${calcStat(activeShip.baseStats.maneuver, upgrades.special)}%` }} 
                />
              </div>
              <span className="stat-value">{calcStat(activeShip.baseStats.maneuver, upgrades.special)}</span>
            </div>
          </div>

          {/* Primary Action Button */}
          <div style={styles.shipActionBox}>
            {activeShip.isEquipped ? (
              <button className="btn btn-outline" style={{ width: '100%', borderColor: 'var(--secondary-cyan)', color: 'var(--secondary-cyan)' }}>
                <Check size={18} /> CURRENTLY EQUIPPED
              </button>
            ) : activeShip.isUnlocked ? (
              <button 
                onClick={() => handleSelectShip(activeShip.id)}
                className="btn btn-cyan" 
                style={{ width: '100%', padding: '12px' }}
                disabled={actionLoading}
              >
                EQUIP STARSHIP
              </button>
            ) : (
              <button 
                onClick={() => handleUnlockShip(activeShip.id)}
                className="btn btn-purple" 
                style={{ width: '100%', padding: '12px' }}
                disabled={actionLoading}
              >
                <Lock size={16} /> UNLOCK ({activeShip.priceCredits} CREDITS)
              </button>
            )}
          </div>
        </aside>
      </div>

      {/* ================= 4. BOTTOM MODULAR UPGRADES (SCREEN 5) ================= */}
      <section style={styles.upgradesSection}>
        <div style={styles.modulesGrid}>
          {/* Module 1: WEAPON */}
          <div 
            onClick={() => handleUpgradeModule('weapon')}
            className="glass-card glass-card-hover" 
            style={{
              ...styles.moduleCard,
              cursor: upgrades.weapon >= 5 || !activeShip.isUnlocked ? 'default' : 'pointer'
            }}
            title={`Upgrade Weapon (${getUpgradeCost(upgrades.weapon)} Credits)`}
          >
            <div style={styles.moduleIconBox}>
              <Crosshair size={22} color="var(--accent-magenta)" />
            </div>
            <div style={styles.moduleInfo}>
              <div className="font-heading" style={styles.moduleName}>WEAPON</div>
              <div style={styles.moduleLevelText}>Lv. {upgrades.weapon}</div>
            </div>
            <div style={styles.moduleChevron}>
              <ChevronRight size={18} color="var(--secondary-cyan)" />
            </div>
          </div>

          {/* Module 2: SHIELD */}
          <div 
            onClick={() => handleUpgradeModule('shield')}
            className="glass-card glass-card-hover" 
            style={{
              ...styles.moduleCard,
              cursor: upgrades.shield >= 5 || !activeShip.isUnlocked ? 'default' : 'pointer'
            }}
            title={`Upgrade Shield (${getUpgradeCost(upgrades.shield)} Credits)`}
          >
            <div style={styles.moduleIconBox}>
              <Shield size={22} color="var(--secondary-cyan)" />
            </div>
            <div style={styles.moduleInfo}>
              <div className="font-heading" style={styles.moduleName}>SHIELD</div>
              <div style={styles.moduleLevelText}>Lv. {upgrades.shield}</div>
            </div>
            <div style={styles.moduleChevron}>
              <ChevronRight size={18} color="var(--secondary-cyan)" />
            </div>
          </div>

          {/* Module 3: ENGINE */}
          <div 
            onClick={() => handleUpgradeModule('engine')}
            className="glass-card glass-card-hover" 
            style={{
              ...styles.moduleCard,
              cursor: upgrades.engine >= 5 || !activeShip.isUnlocked ? 'default' : 'pointer'
            }}
            title={`Upgrade Engine (${getUpgradeCost(upgrades.engine)} Credits)`}
          >
            <div style={styles.moduleIconBox}>
              <Zap size={22} color="var(--currency-gold)" />
            </div>
            <div style={styles.moduleInfo}>
              <div className="font-heading" style={styles.moduleName}>ENGINE</div>
              <div style={styles.moduleLevelText}>Lv. {upgrades.engine}</div>
            </div>
            <div style={styles.moduleChevron}>
              <ChevronRight size={18} color="var(--secondary-cyan)" />
            </div>
          </div>

          {/* Module 4: SPECIAL */}
          <div 
            onClick={() => handleUpgradeModule('special')}
            className="glass-card glass-card-hover" 
            style={{
              ...styles.moduleCard,
              cursor: upgrades.special >= 5 || !activeShip.isUnlocked ? 'default' : 'pointer'
            }}
            title={`Upgrade Special (${getUpgradeCost(upgrades.special)} Credits)`}
          >
            <div style={styles.moduleIconBox}>
              <Sparkles size={22} color="#C084FC" />
            </div>
            <div style={styles.moduleInfo}>
              <div className="font-heading" style={styles.moduleName}>SPECIAL</div>
              <div style={styles.moduleLevelText}>Lv. {upgrades.special}</div>
            </div>
            <div style={styles.moduleChevron}>
              <ChevronRight size={18} color="var(--secondary-cyan)" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

const styles = {
  pageContainer: {
    minHeight: '100vh',
    padding: '24px 32px',
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
    background: 'radial-gradient(circle at 50% 10%, rgba(124, 58, 237, 0.1) 0%, rgba(6, 9, 25, 0.98) 70%)'
  },
  subHeaderBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 24px',
    borderRadius: '14px',
    border: '1px solid var(--border-glass)'
  },
  carouselChevronLeft: {
    position: 'absolute',
    left: '16px',
    top: '50%',
    transform: 'translateY(-50%)',
    zIndex: 20,
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid rgba(0, 229, 255, 0.4)',
    background: 'rgba(6, 9, 25, 0.7)',
    color: 'var(--secondary-cyan)',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  carouselChevronRight: {
    position: 'absolute',
    right: '16px',
    top: '50%',
    transform: 'translateY(-50%)',
    zIndex: 20,
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid rgba(0, 229, 255, 0.4)',
    background: 'rgba(6, 9, 25, 0.7)',
    color: 'var(--secondary-cyan)',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  loadingContainer: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'var(--bg-void-dark)'
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: '16px',
    borderBottom: '1px solid rgba(0, 229, 255, 0.15)'
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px'
  },
  backBtn: {
    padding: '8px 16px',
    fontSize: '0.78rem'
  },
  pageTitle: {
    fontSize: '1.6rem',
    fontWeight: '900',
    letterSpacing: '0.08em',
    background: 'linear-gradient(90deg, #FFFFFF, #00E5FF)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    lineHeight: 1.1
  },
  pageSubtitle: {
    fontSize: '0.82rem',
    color: 'var(--text-muted)'
  },
  currencyHeader: {
    display: 'flex',
    gap: '12px'
  },
  alertError: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '12px 18px',
    background: 'rgba(239, 68, 68, 0.15)',
    borderColor: '#EF4444',
    color: '#FCA5A5',
    fontSize: '0.875rem'
  },
  alertSuccess: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '12px 18px',
    background: 'rgba(16, 185, 129, 0.15)',
    borderColor: '#10B981',
    color: '#6EE7B7',
    fontSize: '0.875rem'
  },
  hangarGrid: {
    display: 'grid',
    gridTemplateColumns: '300px 1fr 340px',
    gap: '24px',
    minHeight: '420px'
  },
  rosterPanel: {
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '14px'
  },
  rosterTitle: {
    fontSize: '0.85rem',
    color: 'var(--text-muted)',
    letterSpacing: '0.1em'
  },
  shipList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  shipListItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '14px',
    cursor: 'pointer',
    borderRadius: '8px'
  },
  shipListItemActive: {
    borderColor: 'var(--secondary-cyan)',
    boxShadow: '0 0 16px rgba(0, 229, 255, 0.35)',
    background: 'rgba(0, 229, 255, 0.08)'
  },
  shipListInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px'
  },
  shipListCode: {
    fontSize: '0.88rem',
    fontWeight: '700',
    color: 'var(--text-light)'
  },
  shipListTagline: {
    fontSize: '0.72rem',
    color: 'var(--text-muted)'
  },
  shipListBadge: {
    marginLeft: '8px'
  },
  showcasePanel: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
    padding: '40px'
  },
  holoStage: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center'
  },
  holoRingOuter: {
    position: 'absolute',
    width: '320px',
    height: '100px',
    borderRadius: '50%',
    border: '2px dashed rgba(0, 229, 255, 0.35)',
    transform: 'translateY(80px) rotateX(60deg)',
    boxShadow: '0 0 30px rgba(0, 229, 255, 0.2)'
  },
  holoRingInner: {
    position: 'absolute',
    width: '240px',
    height: '75px',
    borderRadius: '50%',
    border: '1px solid rgba(124, 58, 237, 0.45)',
    transform: 'translateY(80px) rotateX(60deg)'
  },
  shipSpriteWrapper: {
    zIndex: 10,
    marginBottom: '20px'
  },
  shipSvg: {
    transition: 'transform 0.3s ease'
  },
  holoPedestal: {
    width: '160px',
    height: '16px',
    borderRadius: '50%',
    background: 'radial-gradient(ellipse at center, rgba(0, 229, 255, 0.6) 0%, transparent 70%)',
    filter: 'blur(4px)',
    marginTop: '10px'
  },
  statsPanel: {
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between'
  },
  statsHeader: {
    marginBottom: '16px'
  },
  activeShipName: {
    fontSize: '1.45rem',
    fontWeight: '800',
    marginTop: '8px',
    marginBottom: '6px'
  },
  activeShipDesc: {
    fontSize: '0.8rem',
    color: 'var(--text-muted)',
    lineHeight: 1.5
  },
  barsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    margin: '16px 0'
  },
  shipActionBox: {
    marginTop: 'auto'
  },
  upgradesSection: {
    padding: '24px 28px'
  },
  upgradesHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '20px'
  },
  upgradesTitle: {
    fontSize: '1.05rem',
    letterSpacing: '0.06em'
  },
  upgradesNotice: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)'
  },
  modulesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '14px'
  },
  moduleCard: {
    padding: '14px 18px',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: '12px',
    border: '1px solid var(--border-glass)',
    transition: 'all 0.2s ease'
  },
  moduleIconBox: {
    width: '42px',
    height: '42px',
    borderRadius: '10px',
    background: 'rgba(0, 0, 0, 0.45)',
    border: '1px solid var(--border-glass)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  },
  moduleInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    flex: 1,
    marginLeft: '14px'
  },
  moduleName: {
    fontSize: '0.86rem',
    fontWeight: '700',
    color: 'var(--text-light)',
    letterSpacing: '0.04em'
  },
  moduleLevelText: {
    fontSize: '0.74rem',
    color: 'var(--secondary-cyan)',
    fontWeight: '600'
  },
  moduleChevron: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: '8px'
  },
  pipsRow: {
    display: 'flex',
    gap: '6px'
  },
  pip: {
    flex: 1,
    height: '5px',
    borderRadius: '3px',
    transition: 'background 0.25s ease'
  },
  moduleUpgradeBtn: {
    width: '100%',
    padding: '8px',
    fontSize: '0.75rem'
  }
};

export default HangarPage;
