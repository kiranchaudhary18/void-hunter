import React, { useState } from 'react';
import soundManager from '../game/managers/SoundManager.js';
import PublicNavbar from '../components/PublicNavbar.jsx';
import EnlistPromptModal from '../components/EnlistPromptModal.jsx';
import { Crosshair, Wrench } from 'lucide-react';

const SHIPS_SHOWCASE = [
  {
    id: 'v01-orbitron',
    code: 'V-01',
    name: 'ORBITRON VANGUARD',
    classType: 'Balanced Interceptor',
    tagline: 'Standard Recon & Fast Combat Superiority',
    description: 'The backbone of the Void Defense Fleet. Equipped with dual pulse cannons, balanced hyperdrive acceleration, and reinforced kinetic shielding.',
    stats: { firepower: 78, shield: 68, speed: 84, maneuver: 80 },
    primaryWeapon: 'Dual Plasma Pulse Laser',
    secondaryWeapon: 'Micro-Missile Swarm',
    specialAbility: 'Overdrive Dash (3x Boost)',
    cost: 'STANDARD ISSUE',
    color: '#00E5FF',
    svgType: 'orbitron'
  },
  {
    id: 's02-phoenix',
    code: 'S-02',
    name: 'PHOENIX STRIKE',
    classType: 'Heavy Assault Fighter',
    tagline: 'High Firepower Anti-Capital Craft',
    description: 'A heavy strike craft forged with supercritical thermal blasters. Sacrifices slight handling for devastating armor-piercing damage output.',
    stats: { firepower: 94, shield: 72, speed: 76, maneuver: 70 },
    primaryWeapon: 'Twin Thermal Beam Cannons',
    secondaryWeapon: 'Concussion Torpedoes',
    specialAbility: 'Supernova Burst Area AoE',
    cost: '1,500 CREDITS',
    color: '#F59E0B',
    svgType: 'phoenix'
  },
  {
    id: 'x03-shadow',
    code: 'X-03',
    name: 'SHADOW PHANTOM',
    classType: 'Stealth Infiltrator',
    tagline: 'Apex Velocity & Cloaked Flanking',
    description: 'Engineered for covert reconnaissance and lightning interception. Boasts supreme sublight velocity to outrun enemy interceptors and missiles.',
    stats: { firepower: 72, shield: 58, speed: 96, maneuver: 92 },
    primaryWeapon: 'Silent Tachyon Needlers',
    secondaryWeapon: 'EMP Cluster Mine',
    specialAbility: 'Phase Shift Invisibility',
    cost: '2,500 CREDITS',
    color: '#A855F7',
    svgType: 'shadow'
  },
  {
    id: 'r04-titan',
    code: 'R-04',
    name: 'TITAN DREADNOUGHT',
    classType: 'Armored Juggernaut',
    tagline: 'Heavy Citadel Bastion & Defense',
    description: 'Heavily fortified with multi-layered titanium alloys and automated point-defense shields. Can withstand direct impacts from orbital barrages.',
    stats: { firepower: 86, shield: 96, speed: 64, maneuver: 62 },
    primaryWeapon: 'Quad Heavy Autocannons',
    secondaryWeapon: 'Flak Defense Matrix',
    specialAbility: 'Invulnerable Bulwark Shield',
    cost: '4,000 CREDITS',
    color: '#EF4444',
    svgType: 'titan'
  },
  {
    id: 'z05-nova',
    code: 'Z-05',
    name: 'NOVA CRUSADER',
    classType: 'Flagship Battlecruiser',
    tagline: 'Apex Void Sovereign Superiority',
    description: 'The pinnacle of intergalactic engineering. Powered by an internal singularity core delivering unmatched energy projection and defense.',
    stats: { firepower: 96, shield: 90, speed: 88, maneuver: 85 },
    primaryWeapon: 'Singularity Wave Beam',
    secondaryWeapon: 'Vortex Seeker Missiles',
    specialAbility: 'Dimensional Rift Nova',
    cost: '8,000 CREDITS',
    color: '#EC4899',
    svgType: 'nova'
  }
];

export const PublicHangarPage = ({ onNavigate }) => {
  const [selectedShipId, setSelectedShipId] = useState('v01-orbitron');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [actionType, setActionType] = useState('equip');

  const activeShip = SHIPS_SHOWCASE.find((s) => s.id === selectedShipId) || SHIPS_SHOWCASE[0];

  const handleActionClick = (type) => {
    soundManager.playLaser();
    setActionType(type);
    setIsModalOpen(true);
  };

  const handleEnlistConfirm = () => {
    setIsModalOpen(false);
    if (onNavigate) onNavigate('auth');
  };

  // Render SVG Starship graphic based on type
  const renderShipVisual = (ship) => {
    switch (ship.svgType) {
      case 'phoenix':
        return (
          <svg width="240" height="240" viewBox="0 0 64 64" style={{ filter: `drop-shadow(0 0 25px ${ship.color})` }}>
            <polygon points="32,2 48,22 62,44 48,56 36,46 32,58 28,46 16,56 2,44 16,22" fill={ship.color} />
            <polygon points="32,10 42,26 52,42 40,46 32,50 24,46 12,42 22,26" fill="#060919" />
            <ellipse cx="32" cy="24" rx="3.5" ry="10" fill="#FFFFFF" />
            <circle cx="28" cy="56" r="3" fill="#FF5500" />
            <circle cx="36" cy="56" r="3" fill="#FF5500" />
          </svg>
        );
      case 'shadow':
        return (
          <svg width="240" height="240" viewBox="0 0 64 64" style={{ filter: `drop-shadow(0 0 25px ${ship.color})` }}>
            <polygon points="32,4 44,20 62,54 46,54 36,44 32,52 28,44 18,54 2,54 20,20" fill={ship.color} />
            <polygon points="32,12 40,24 50,48 38,46 32,48 26,46 14,48 24,24" fill="#060919" />
            <ellipse cx="32" cy="24" rx="3" ry="8" fill="#FFFFFF" />
            <circle cx="32" cy="52" r="3" fill="#C084FC" />
          </svg>
        );
      case 'titan':
        return (
          <svg width="240" height="240" viewBox="0 0 64 64" style={{ filter: `drop-shadow(0 0 25px ${ship.color})` }}>
            <polygon points="32,6 50,18 58,48 48,58 36,50 32,56 28,50 16,58 6,48 14,18" fill={ship.color} />
            <polygon points="32,12 44,22 50,44 40,48 32,50 24,48 14,44 20,22" fill="#060919" />
            <rect x="29" y="18" width="6" height="14" rx="2" fill="#FFFFFF" />
            <circle cx="24" cy="56" r="4" fill="#EF4444" />
            <circle cx="40" cy="56" r="4" fill="#EF4444" />
          </svg>
        );
      case 'nova':
        return (
          <svg width="240" height="240" viewBox="0 0 64 64" style={{ filter: `drop-shadow(0 0 30px ${ship.color})` }}>
            <polygon points="32,2 48,16 62,38 52,60 38,48 32,62 26,48 12,60 2,38 16,16" fill={ship.color} />
            <polygon points="32,8 44,20 54,36 44,48 32,52 20,48 10,36 20,20" fill="#060919" />
            <ellipse cx="32" cy="22" rx="4" ry="12" fill="#FFFFFF" />
            <circle cx="32" cy="60" r="4" fill="#EC4899" />
          </svg>
        );
      case 'orbitron':
      default:
        return (
          <svg width="240" height="240" viewBox="0 0 64 64" style={{ filter: `drop-shadow(0 0 25px ${ship.color})` }}>
            <polygon points="32,4 46,24 62,48 48,56 36,46 32,58 28,46 16,56 2,48 18,24" fill={ship.color} />
            <polygon points="32,8 42,28 54,46 40,46 32,52 24,46 10,46 22,28" fill="#060919" />
            <ellipse cx="32" cy="24" rx="4" ry="12" fill="#FFFFFF" />
            <circle cx="26" cy="56" r="3" fill="#FF2DFF" />
            <circle cx="38" cy="56" r="3" fill="#FF2DFF" />
          </svg>
        );
    }
  };

  return (
    <div style={styles.pageWrapper}>
      {/* Dynamic Starry Space Backdrop */}
      <div style={styles.starsBackdrop} />
      <div style={styles.nebulaGlow} />

      {/* Top Cyber Navigation Bar (No Sidebar) */}
      <PublicNavbar current="hangar" onNavigate={onNavigate} />

      {/* Main Public Content */}
      <main style={styles.contentContainer}>
        {/* Hero Section */}
        <div style={styles.heroSection}>
          <div style={styles.heroBadge}>
            <span style={styles.onlineDot}>●</span>
            <span>PUBLIC FLEET ARCHIVE // 5 ACTIVE HULLS</span>
          </div>

          <h1 className="font-heading" style={styles.heroTitle}>
            STARSHIP FLEET <span className="text-glow-cyan" style={{ color: 'var(--secondary-cyan)' }}>HANGAR</span>
          </h1>

          <p style={styles.heroSubtitle}>
            Inspect all 5 tactical spacecraft classes. View hull armaments, tactical weapon loadouts, and module upgrade trees. Enlist to pilot your favorite starship.
          </p>
        </div>

        {/* 5 Ship Selector Tabs */}
        <div style={styles.shipSelectorGrid}>
          {SHIPS_SHOWCASE.map((ship) => {
            const isSelected = ship.id === selectedShipId;
            return (
              <button
                key={ship.id}
                onClick={() => {
                  soundManager.playLaser();
                  setSelectedShipId(ship.id);
                }}
                style={{
                  ...styles.shipTabBtn,
                  ...(isSelected ? {
                    background: 'rgba(0, 229, 255, 0.12)',
                    borderColor: ship.color,
                    boxShadow: `0 0 20px ${ship.color}40`
                  } : {})
                }}
                className={`ship-tab-card ${isSelected ? 'active' : ''}`}
              >
                <div style={styles.shipTabCode} style={{ color: ship.color }}>
                  {ship.code}
                </div>
                <div className="font-heading" style={styles.shipTabName}>
                  {ship.name}
                </div>
                <div style={styles.shipTabClass}>
                  {ship.classType}
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Ship Showcase Deck */}
        <div style={styles.showcaseDeck} className="glass-panel cyber-box">
          {/* Left Column: Visualizer & Thruster Glow */}
          <div style={styles.visualizerCol}>
            <div 
              style={{
                ...styles.shipGlowBackdrop,
                background: `radial-gradient(circle, ${activeShip.color}35 0%, transparent 70%)`
              }} 
            />

            <div className="animate-float" style={styles.shipVisualBox}>
              {renderShipVisual(activeShip)}
            </div>

            <div style={styles.shipBadgeRow}>
              <span className="badge badge-cyan">{activeShip.code}</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-light)', fontWeight: 'bold' }}>
                {activeShip.classType}
              </span>
            </div>
          </div>

          {/* Right Column: Specs, Loadouts & Action CTAs */}
          <div style={styles.specsCol}>
            <div style={styles.shipHeader}>
              <div style={styles.shipTagline}>{activeShip.tagline.toUpperCase()}</div>
              <h2 className="font-heading text-glow-cyan" style={{ fontSize: '2rem', margin: '4px 0 10px 0' }}>
                {activeShip.name}
              </h2>
              <p style={styles.shipDescText}>
                {activeShip.description}
              </p>
            </div>

            {/* Performance Stats Bars */}
            <div style={styles.statsSection}>
              <div style={styles.sectionTitle}>TACTICAL PERFORMANCE MATRIX</div>

              <div style={styles.statBarItem}>
                <div style={styles.statBarLabels}>
                  <span>FIREPOWER RATING</span>
                  <span style={{ color: 'var(--secondary-cyan)', fontWeight: 'bold' }}>{activeShip.stats.firepower}%</span>
                </div>
                <div style={styles.statTrack}>
                  <div style={{ ...styles.statFill, width: `${activeShip.stats.firepower}%`, background: 'var(--secondary-cyan)' }} />
                </div>
              </div>

              <div style={styles.statBarItem}>
                <div style={styles.statBarLabels}>
                  <span>SHIELD INTEGRITY</span>
                  <span style={{ color: '#10B981', fontWeight: 'bold' }}>{activeShip.stats.shield}%</span>
                </div>
                <div style={styles.statTrack}>
                  <div style={{ ...styles.statFill, width: `${activeShip.stats.shield}%`, background: '#10B981' }} />
                </div>
              </div>

              <div style={styles.statBarItem}>
                <div style={styles.statBarLabels}>
                  <span>SUBLIGHT VELOCITY</span>
                  <span style={{ color: 'var(--currency-gold)', fontWeight: 'bold' }}>{activeShip.stats.speed}%</span>
                </div>
                <div style={styles.statTrack}>
                  <div style={{ ...styles.statFill, width: `${activeShip.stats.speed}%`, background: 'var(--currency-gold)' }} />
                </div>
              </div>

              <div style={styles.statBarItem}>
                <div style={styles.statBarLabels}>
                  <span>TACTICAL MANEUVER</span>
                  <span style={{ color: '#C084FC', fontWeight: 'bold' }}>{activeShip.stats.maneuver}%</span>
                </div>
                <div style={styles.statTrack}>
                  <div style={{ ...styles.statFill, width: `${activeShip.stats.maneuver}%`, background: '#C084FC' }} />
                </div>
              </div>
            </div>

            {/* Weapon Armament Breakdown */}
            <div style={styles.loadoutGrid}>
              <div style={styles.loadoutCard} className="glass-card">
                <div style={styles.loadoutType}>PRIMARY BATTERY</div>
                <div className="font-heading" style={styles.loadoutVal}>{activeShip.primaryWeapon}</div>
              </div>

              <div style={styles.loadoutCard} className="glass-card">
                <div style={styles.loadoutType}>ORDNANCE POD</div>
                <div className="font-heading" style={styles.loadoutVal}>{activeShip.secondaryWeapon}</div>
              </div>

              <div style={{ ...styles.loadoutCard, gridColumn: 'span 2' }} className="glass-card">
                <div style={styles.loadoutType}>SPECIAL SIGNATURE ABILITY</div>
                <div className="font-heading text-glow-cyan" style={{ ...styles.loadoutVal, color: 'var(--secondary-cyan)' }}>
                  {activeShip.specialAbility}
                </div>
              </div>
            </div>

            {/* Actions Row */}
            <div style={styles.actionButtonsRow}>
              <button
                onClick={() => handleActionClick('equip')}
                className="btn btn-cyan animate-pulse-glow"
                style={styles.mainActionBtn}
              >
                <Crosshair size={18} />
                <span>EQUIP {activeShip.code} FOR BATTLE</span>
              </button>

              <button
                onClick={() => handleActionClick('upgrade')}
                className="btn btn-outline"
                style={styles.subActionBtn}
              >
                <Wrench size={16} />
                <span>UPGRADE MODULES</span>
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Enlist Prompt Modal */}
      <EnlistPromptModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onEnlist={handleEnlistConfirm}
        title="COMMAND DECK COMMISSION REQUIRED"
        subtitle={`You selected to ${actionType === 'equip' ? 'equip' : 'upgrade'} the ${activeShip.name}. Enlist as an active pilot to commission this starship into your personal fleet and spend credits on weapon upgrades!`}
        featureList={[
          `Equip ${activeShip.name} and command its specialized ${activeShip.specialAbility}`,
          "Upgrade Weapon, Shield, Engine, and Special modules up to Level 5",
          "Save ship telemetry and combat stats to your MongoDB pilot account",
          "Deploy on missions with full speed and firepower bonuses"
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
  shipSelectorGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '14px',
    width: '100%'
  },
  shipTabBtn: {
    padding: '14px 16px',
    borderRadius: '12px',
    background: 'rgba(10, 16, 40, 0.65)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: '4px',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'all 0.25s ease'
  },
  shipTabCode: {
    fontSize: '0.72rem',
    fontWeight: '900',
    letterSpacing: '0.1em',
    fontFamily: 'var(--font-heading)'
  },
  shipTabName: {
    fontSize: '0.92rem',
    color: 'var(--text-light)',
    letterSpacing: '0.04em'
  },
  shipTabClass: {
    fontSize: '0.68rem',
    color: 'var(--text-muted)'
  },
  showcaseDeck: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: 'clamp(20px, 4vw, 40px)',
    padding: 'clamp(20px, 4vw, 40px)',
    borderRadius: '20px',
    border: '1px solid rgba(0, 229, 255, 0.3)',
    background: 'rgba(8, 14, 38, 0.85)',
    alignItems: 'center'
  },
  visualizerCol: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '380px'
  },
  shipGlowBackdrop: {
    position: 'absolute',
    width: '320px',
    height: '320px',
    borderRadius: '50%',
    filter: 'blur(40px)',
    pointerEvents: 'none'
  },
  shipVisualBox: {
    position: 'relative',
    zIndex: 5,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  shipBadgeRow: {
    position: 'relative',
    zIndex: 5,
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginTop: '24px'
  },
  specsCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px'
  },
  shipHeader: {
    display: 'flex',
    flexDirection: 'column'
  },
  shipTagline: {
    fontSize: '0.68rem',
    color: 'var(--secondary-cyan)',
    letterSpacing: '0.12em',
    fontFamily: 'var(--font-heading)'
  },
  shipDescText: {
    fontSize: '0.9rem',
    color: 'var(--text-muted)',
    lineHeight: 1.6,
    margin: 0
  },
  statsSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  sectionTitle: {
    fontSize: '0.7rem',
    color: 'var(--text-muted)',
    letterSpacing: '0.1em',
    fontFamily: 'var(--font-heading)'
  },
  statBarItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  statBarLabels: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.72rem',
    fontFamily: 'var(--font-heading)',
    letterSpacing: '0.06em',
    color: 'var(--text-light)'
  },
  statTrack: {
    width: '100%',
    height: '6px',
    background: 'rgba(255, 255, 255, 0.08)',
    borderRadius: '3px',
    overflow: 'hidden'
  },
  statFill: {
    height: '100%',
    borderRadius: '3px',
    transition: 'width 0.4s ease'
  },
  loadoutGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px'
  },
  loadoutCard: {
    padding: '12px 16px',
    borderRadius: '10px',
    background: 'rgba(0, 0, 0, 0.35)',
    border: '1px solid rgba(255, 255, 255, 0.06)',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  loadoutType: {
    fontSize: '0.62rem',
    color: 'var(--text-muted)',
    letterSpacing: '0.1em',
    fontFamily: 'var(--font-heading)'
  },
  loadoutVal: {
    fontSize: '0.84rem',
    color: 'var(--text-light)',
    letterSpacing: '0.04em'
  },
  actionButtonsRow: {
    display: 'flex',
    gap: '16px',
    marginTop: '8px'
  },
  mainActionBtn: {
    flex: 1.2,
    padding: '14px',
    fontSize: '0.88rem',
    fontWeight: 'bold',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    borderRadius: '10px'
  },
  subActionBtn: {
    flex: 0.8,
    padding: '14px',
    fontSize: '0.84rem',
    fontWeight: 'bold',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    borderRadius: '10px'
  }
};

export default PublicHangarPage;
