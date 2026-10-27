import React, { useState, useEffect, useMemo, useRef } from 'react';
import api from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import soundManager from '../game/managers/SoundManager.js';
import EnlistPromptModal from './EnlistPromptModal.jsx';
import { 
  Shield, Zap, Crosshair, Check, Lock, 
  Sparkles, AlertCircle, CheckCircle2, ChevronRight, ChevronLeft,
  Wrench, Coins, Award, Palette, Layers,
  Activity, Compass, Radio, ShieldCheck
} from 'lucide-react';
import '../pages/HangarPage.css';

// 5 Mandatory Spaceship Classes matching User Specification
const SHIPS_SHOWCASE_CATALOG = [
  {
    id: 'v01-orbitron',
    code: 'V-01',
    name: 'ORBITRON VANGUARD',
    classType: 'Balanced Interceptor',
    tagline: 'Standard Recon & Fast Combat Superiority',
    description: 'The backbone of the Void Defense Fleet. Equipped with dual pulse cannons, balanced hyperdrive acceleration, and reinforced kinetic shielding.',
    image: '/assets/ships/ship_orbitron.jpg',
    baseStats: { firepower: 78, shield: 64, speed: 82, maneuver: 76 },
    primaryWeapon: 'Dual Plasma Pulse Laser',
    secondaryWeapon: 'Micro-Missile Swarm',
    specialAbility: 'Overdrive Dash (3x Boost)',
    priceCredits: 0,
    priceCores: 0,
    unlockedByDefault: true,
    thrusterColor: '#00E5FF',
    manufacturer: 'Aegis Orbital Shipyards',
    hardpoints: 4,
    armorRating: 'Class-IV Poly-Carbide'
  },
  {
    id: 's02-phoenix',
    code: 'S-02',
    name: 'PHOENIX STRIKE',
    classType: 'Heavy Assault Striker',
    tagline: 'High Firepower Anti-Capital Craft',
    description: 'A heavy strike craft forged with supercritical thermal blasters. Sacrifices slight handling for devastating armor-piercing damage output.',
    image: '/assets/ships/ship_phoenix.jpg',
    baseStats: { firepower: 94, shield: 50, speed: 75, maneuver: 70 },
    primaryWeapon: 'Twin Thermal Beam Cannons',
    secondaryWeapon: 'Concussion Torpedoes',
    specialAbility: 'Supernova Burst Area AoE',
    priceCredits: 2500,
    priceCores: 15,
    unlockedByDefault: false,
    thrusterColor: '#FF7A00',
    manufacturer: 'Solari Vanguard Forge',
    hardpoints: 6,
    armorRating: 'Class-V Tungsten Weave'
  },
  {
    id: 'x03-shadow',
    code: 'X-03',
    name: 'SHADOW PHANTOM',
    classType: 'Stealth Infiltrator',
    tagline: 'Apex Velocity & Cloaked Flanking',
    description: 'Engineered for covert reconnaissance and lightning interception. Boasts supreme sublight velocity to outrun enemy interceptors and missiles.',
    image: '/assets/ships/ship_shadow.jpg',
    baseStats: { firepower: 72, shield: 55, speed: 96, maneuver: 92 },
    primaryWeapon: 'Silent Tachyon Needlers',
    secondaryWeapon: 'EMP Cluster Mine',
    specialAbility: 'Phase Shift Invisibility',
    priceCredits: 4000,
    priceCores: 25,
    unlockedByDefault: false,
    thrusterColor: '#A855F7',
    manufacturer: 'Umbra Black-Site Foundry',
    hardpoints: 3,
    armorRating: 'Class-III Nano-Laminate'
  },
  {
    id: 'r04-titan',
    code: 'R-04',
    name: 'TITAN DREADNOUGHT',
    classType: 'Armored Juggernaut',
    tagline: 'Heavy Citadel Bastion & Defense',
    description: 'Heavily fortified with multi-layered titanium alloys and automated point-defense shields. Can withstand direct impacts from orbital barrages.',
    image: '/assets/ships/ship_titan.jpg',
    baseStats: { firepower: 85, shield: 98, speed: 55, maneuver: 52 },
    primaryWeapon: 'Quad Heavy Autocannons',
    secondaryWeapon: 'Flak Defense Matrix',
    specialAbility: 'Invulnerable Bulwark Shield',
    priceCredits: 6500,
    priceCores: 40,
    unlockedByDefault: false,
    thrusterColor: '#38BDF8',
    manufacturer: 'Goliath Heavy Industries',
    hardpoints: 8,
    armorRating: 'Class-VI Reinforced Adamantine'
  },
  {
    id: 'z05-nova',
    code: 'Z-05',
    name: 'NOVA CRUSADER',
    classType: 'Flagship Battlecruiser',
    tagline: 'Apex Void Sovereign Superiority',
    description: 'The pinnacle of intergalactic engineering. Powered by an internal singularity core delivering dark matter weaponry and quantum emergency warp.',
    image: '/assets/ships/ship_nova.jpg',
    baseStats: { firepower: 92, shield: 84, speed: 88, maneuver: 85 },
    primaryWeapon: 'Singularity Dark Matter Driver',
    secondaryWeapon: 'Quantum Pulse Torpedoes',
    specialAbility: 'Quantum Emergency Warp',
    priceCredits: 10000,
    priceCores: 75,
    unlockedByDefault: false,
    thrusterColor: '#EC4899',
    manufacturer: 'Void Sovereign Skunkworks',
    hardpoints: 8,
    armorRating: 'Class-VII Quantum Matrix'
  }
];

// Interactive Hull Coatings
const HULL_COATINGS = [
  { id: 'default', name: 'Fleet Standard', tint: 'rgba(0, 229, 255, 0.28)', accent: '#00E5FF', desc: 'Standard navy & cyan Void Fleet finish' },
  { id: 'stealth', name: 'Midnight Umbra', tint: 'rgba(139, 92, 246, 0.32)', accent: '#8B5CF6', desc: 'Light-absorbing radar-baffling dark matte' },
  { id: 'solar', name: 'Solar Apex', tint: 'rgba(251, 191, 36, 0.32)', accent: '#FBBF24', desc: 'Heat-resistant reflective aurum plating' },
  { id: 'cyber', name: 'Hyper Matrix', tint: 'rgba(32, 214, 160, 0.32)', accent: '#20D6A0', desc: 'Superconductive bio-luminescent crystalline weave' }
];

// Interactive Fleet Insignias
const FLEET_INSIGNIAS = [
  { id: 'vanguard', name: 'Sector 01 Vanguard', seal: 'Active Recon Taskforce', desc: 'Frontline recon badge authorized for deep void border patrols.' },
  { id: 'ghost', name: 'Ghost Squadron', seal: 'Covert Operations Emblem', desc: 'Black-budget strike unit specialization with reduced radar profile.' },
  { id: 'phoenix', name: 'Solar Phoenix Crest', seal: 'Heavy Siege Commendation', desc: 'Awarded for exceptional valor in defense of the inner asteroid belt.' },
  { id: 'citadel', name: 'Void Citadel Guard', seal: 'Elite Sovereign Mark', desc: 'Supreme honors reserved for flagship pilots protecting the core system.' }
];

export const HangarView = ({ 
  _isPublic = false, 
  onNavigate, 
  onLaunchMission 
}) => {
  const { user, profile, isAuthenticated, refreshProfile } = useAuth();
  const [ships, setShips] = useState(SHIPS_SHOWCASE_CATALOG);
  const [selectedShipId, setSelectedShipId] = useState('v01-orbitron');
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'loadout' | 'upgrades' | 'customize' | 'skins'
  const [selectedCoating, setSelectedCoating] = useState('default');
  const [selectedInsignia, setSelectedInsignia] = useState('vanguard');
  const [, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [feedback, setFeedback] = useState({ error: null, success: null });
  const [enlistModalOpen, setEnlistModalOpen] = useState(false);
  const [_upgradeFlash, setUpgradeFlash] = useState(false);

  const _renderHangarPowerPips = (score, activeClass = 'active') => {
    const activeCount = Math.max(1, Math.min(10, Math.round((score / 100) * 10)));
    return (
      <div className="cyber-pip-track" style={{ marginTop: '6px' }}>
        {Array.from({ length: 10 }).map((_, i) => (
          <span 
            key={i} 
            className={`cyber-pip ${i < activeCount ? activeClass : ''}`} 
          />
        ))}
      </div>
    );
  };
  
  const carouselTrackRef = useRef(null);

  // Live Currency Readouts
  const playerCredits = profile?.credits ?? user?.credits ?? 0;
  const playerCores = profile?.energyCores ?? user?.energyCores ?? 0;

  // Fetch real ship ownership and upgrades from server
  const fetchShips = async () => {
    try {
      const res = await api.ships.getShips();
      if (res.success && res.ships) {
        // Merge server state with rich client showcase metadata
        const merged = SHIPS_SHOWCASE_CATALOG.map((catShip) => {
          const srv = res.ships.find((s) => s.id === catShip.id) || {};
          return {
            ...catShip,
            ...srv,
            image: catShip.image,
            primaryWeapon: catShip.primaryWeapon,
            secondaryWeapon: catShip.secondaryWeapon,
            specialAbility: catShip.specialAbility,
            name: catShip.name,
            classType: catShip.classType,
            description: catShip.description,
            baseStats: catShip.baseStats
          };
        });
        setShips(merged);
        if (res.selectedShipId) {
          setSelectedShipId(res.selectedShipId);
        }
      }
    } catch (err) {
      console.warn('Hangar fetch fallback to showcase catalog:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShips();
  }, [isAuthenticated]);

  const activeShip = useMemo(() => {
    return ships.find((s) => s.id === selectedShipId) || ships[0];
  }, [ships, selectedShipId]);

  // Upgrade cost helper
  const getUpgradeCost = (currentLvl) => {
    const costs = { 1: 250, 2: 500, 3: 1000, 4: 2000 };
    return costs[currentLvl] || 'MAX';
  };

  // Calculate dynamic stats including module upgrade levels
  const calcStat = (base = 50, upgradeLvl = 1) => {
    return Math.min(100, Math.round(base + (upgradeLvl - 1) * 3));
  };

  const upgrades = activeShip.upgrades || { weapon: 1, shield: 1, engine: 1, special: 1 };
  const isEquipped = activeShip.isEquipped || (profile?.selectedShipId === activeShip.id);
  const isUnlocked = activeShip.isUnlocked || activeShip.unlockedByDefault;

  // Carousel Scroll Handlers
  const handleScrollCarousel = (direction) => {
    soundManager.playLaser();
    if (carouselTrackRef.current) {
      const offset = direction === 'left' ? -260 : 260;
      carouselTrackRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  // Equip Starship Action
  const handleSelectShip = async (shipId) => {
    if (!isAuthenticated) {
      soundManager.playLaser();
      setEnlistModalOpen(true);
      return;
    }
    soundManager.playLaser();
    setActionLoading(true);
    setFeedback({ error: null, success: null });
    try {
      const res = await api.ships.selectShip(shipId);
      if (res.success) {
        soundManager.playPowerUp();
        setFeedback({ success: `${activeShip.name} successfully commissioned for combat!`, error: null });
        await fetchShips();
        if (refreshProfile) refreshProfile();
      }
    } catch (err) {
      soundManager.playShieldHit();
      setFeedback({ error: err.message, success: null });
    } finally {
      setActionLoading(false);
    }
  };

  // Unlock Starship Action
  const handleUnlockShip = async (shipId) => {
    if (!isAuthenticated) {
      soundManager.playLaser();
      setEnlistModalOpen(true);
      return;
    }
    soundManager.playLaser();
    setActionLoading(true);
    setFeedback({ error: null, success: null });
    try {
      const res = await api.ships.unlockShip(shipId);
      if (res.success) {
        soundManager.playPowerUp();
        setFeedback({ success: res.message || `${activeShip.name} unlocked!`, error: null });
        await fetchShips();
        if (refreshProfile) refreshProfile();
      }
    } catch (err) {
      soundManager.playShieldHit();
      setFeedback({ error: err.message, success: null });
    } finally {
      setActionLoading(false);
    }
  };

  // Upgrade Module Action (Section 25 Atomic Engine)
  const handleUpgradeModule = async (moduleType) => {
    if (!isAuthenticated) {
      soundManager.playLaser();
      setEnlistModalOpen(true);
      return;
    }
    soundManager.playLaser();
    setActionLoading(true);
    setFeedback({ error: null, success: null });
    try {
      const res = await api.ships.upgradeShip(activeShip.id, moduleType);
      if (res.success) {
        soundManager.playPowerUp();
        setFeedback({ success: res.message || `${moduleType.toUpperCase()} module upgraded!`, error: null });
        setUpgradeFlash(true);
        setTimeout(() => setUpgradeFlash(false), 1400);
        await fetchShips();
        if (refreshProfile) refreshProfile();
      }
    } catch (err) {
      soundManager.playShieldHit();
      setFeedback({ error: err.message, success: null });
    } finally {
      setActionLoading(false);
    }
  };

  // Current Coating Color Accent
  const currentCoatingObj = HULL_COATINGS.find(c => c.id === selectedCoating) || HULL_COATINGS[0];

  return (
    <div className="hangar-container">
      {/* ==========================================================================
          A. PAGE HEADING COMMAND BAR (SECTION 4)
          ========================================================================== */}
      <section className="hangar-header-bar">
        <div className="hangar-title-col">
          <div className="hangar-eyebrow">
            <span className="hangar-beacon-dot" />
            <span>FLEET COMMAND // SHIP SELECTION</span>
          </div>
          <h1 className="hangar-main-heading">STARSHIP HANGAR</h1>
          <p className="hangar-subtext">Inspect your fleet. Configure your loadout. Prepare for combat.</p>
        </div>

        {/* Fleet Summary Metrics & Live Wallet Balances */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
          <div className="fleet-summary-strip">
            <div className="fleet-stat-item">
              <span className="fleet-stat-val">5 / 5</span>
              <span className="fleet-stat-lbl">SHIP CLASSES</span>
            </div>
            <div style={{ width: 1, height: 26, background: 'rgba(255, 255, 255, 0.1)' }} />
            <div className="fleet-stat-item">
              <span className="fleet-stat-val" style={{ color: '#FFC247' }}>
                {isAuthenticated ? `${ships.filter(s => s.isUnlocked || s.unlockedByDefault).length} / 5` : '5 CATALOG'}
              </span>
              <span className="fleet-stat-lbl">{isAuthenticated ? 'COMMISSIONED' : 'BROWSEABLE'}</span>
            </div>
          </div>

          {/* Quick Wallet Readout for Upgrades */}
          {isAuthenticated && (
            <div className="fleet-currency-badge" title="Pilot Reserves Available for Requisitions">
              <Coins size={14} color="#FFC247" />
              <span>{playerCredits.toLocaleString()} CR</span>
              <span style={{ opacity: 0.3, margin: '0 2px' }}>|</span>
              <Zap size={14} color="#A855F7" />
              <span style={{ color: '#A855F7' }}>{playerCores} CORES</span>
            </div>
          )}
        </div>
      </section>

      {/* Guest Mode Enlistment Banner */}
      {!isAuthenticated && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 20px',
          background: 'rgba(11, 18, 48, 0.88)',
          border: '1px solid rgba(0, 229, 255, 0.35)',
          borderRadius: '10px',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.5)',
          gap: '16px',
          flexWrap: 'wrap'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Sparkles size={18} color="#00E5FF" />
            <span style={{ fontSize: '0.84rem', color: '#EAF1FF' }}>
              <strong>GUEST FLEET PREVIEW //</strong> Browse all 5 advanced starfighters and examine flight parameters. Enlist as an active pilot to equip starships and purchase module upgrades.
            </span>
          </div>
          <button
            onClick={() => onNavigate && onNavigate('auth')}
            style={{
              background: '#00E5FF',
              color: '#05091B',
              fontFamily: 'Orbitron',
              fontWeight: '800',
              fontSize: '0.78rem',
              letterSpacing: '0.1em',
              padding: '8px 18px',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            LOGIN / ENLIST
          </button>
        </div>
      )}

      {/* Feedback Alerts */}
      {feedback.error && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '12px 18px',
          background: 'rgba(239, 68, 68, 0.15)',
          border: '1px solid rgba(239, 68, 68, 0.5)',
          borderRadius: '8px',
          color: '#FF5577',
          fontFamily: 'Orbitron',
          fontSize: '0.82rem'
        }}>
          <AlertCircle size={18} />
          <span>{feedback.error}</span>
        </div>
      )}

      {feedback.success && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '12px 18px',
          background: 'rgba(32, 214, 160, 0.15)',
          border: '1px solid rgba(32, 214, 160, 0.5)',
          borderRadius: '8px',
          color: '#20D6A0',
          fontFamily: 'Orbitron',
          fontSize: '0.82rem'
        }}>
          <CheckCircle2 size={18} />
          <span>{feedback.success}</span>
        </div>
      )}

      {/* ==========================================================================
          B. SHIP SELECTION CAROUSEL (SECTION 5)
          ========================================================================== */}
      <section className="hangar-carousel-section" aria-label="Spaceship Fleet Selection Carousel">
        <div className="carousel-header-row">
          <div className="carousel-section-title">
            <Compass size={16} color="#00E5FF" />
            <span>COMMISSIONED STARFIGHTERS // SELECT VESSEL</span>
          </div>
          <div className="carousel-nav-controls">
            <button 
              onClick={() => handleScrollCarousel('left')}
              className="btn-carousel-nav"
              aria-label="Previous starship"
              title="Previous Ship"
            >
              <ChevronLeft size={16} />
            </button>
            <button 
              onClick={() => handleScrollCarousel('right')}
              className="btn-carousel-nav"
              aria-label="Next starship"
              title="Next Ship"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        <div className="ships-selector-track" ref={carouselTrackRef}>
          {ships.map((ship) => {
            const isSelected = ship.id === activeShip.id;
            const equipped = ship.isEquipped || (profile?.selectedShipId === ship.id);
            const unlocked = ship.isUnlocked || ship.unlockedByDefault;

            return (
              <button
                key={ship.id}
                onClick={() => {
                  soundManager.playLaser();
                  setSelectedShipId(ship.id);
                }}
                className={`ship-selector-card ${isSelected ? 'selected' : ''}`}
                aria-selected={isSelected}
                title={`Select ${ship.name}`}
              >
                <img 
                  src={ship.image || '/assets/ships/ship_orbitron.jpg'} 
                  alt={ship.name}
                  className="selector-thumb-bg"
                />
                <div className="selector-card-overlay" />

                <div className="selector-top-row">
                  <span className="ship-code-pill">{ship.code}</span>
                  <span className="ship-role-text">{ship.classType.split(' ')[0]}</span>
                </div>

                <div className="selector-mid-row">
                  <h3 className="ship-selector-name">{ship.name}</h3>
                </div>

                <div className="selector-bottom-row">
                  {equipped ? (
                    <span className="status-tag-equipped">
                      <Check size={11} />
                      <span>EQUIPPED</span>
                    </span>
                  ) : unlocked ? (
                    <span className="status-tag-unlocked">READY</span>
                  ) : (
                    <span className="status-tag-locked">
                      <Lock size={11} />
                      <span>{ship.priceCredits ? `${ship.priceCredits.toLocaleString()} CR` : 'LOCKED'}</span>
                    </span>
                  )}
                  {isSelected && (
                    <span style={{ 
                      width: 6, 
                      height: 6, 
                      borderRadius: '50%', 
                      background: '#00E5FF', 
                      boxShadow: '0 0 10px #00E5FF' 
                    }} />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* ==========================================================================
          C. MAIN 3D-LIKE SHOWCASE & SYSTEMS CONSOLE ARENA (SECTIONS 6, 7, 8, 9, 10)
          ========================================================================== */}
      <section className="hangar-arena-grid">
        
        {/* ------------------------------------------------------------------------
            LEFT COLUMN: 3D-LIKE SPACECRAFT SHOWCASE (SECTION 6)
            ------------------------------------------------------------------------ */}
        <div className="hangar-showcase-bay">
          {/* Tactical Framing Brackets */}
          <span className="bracket-top-right" />
          <span className="bracket-bottom-left" />

          {/* Top Secondary Tactical Nav Tabs (Section 7) */}
          <nav className="showcase-tactical-nav" aria-label="Hangar Control Navigation">
            <div className="showcase-bay-label">
              <Radio size={14} color="#00E5FF" />
              <span>DOCKING BAY 04 // ACTIVE PODIUM</span>
            </div>
            <div className="showcase-tabs-list">
              {[
                { id: 'overview', label: 'Overview', icon: Compass },
                { id: 'loadout', label: 'Loadout', icon: Crosshair },
                { id: 'upgrades', label: 'Upgrades', icon: Wrench },
                { id: 'customize', label: 'Customize', icon: Palette },
                { id: 'skins', label: 'Skins', icon: Layers }
              ].map((tab) => {
                const IconComponent = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      soundManager.playLaser();
                      setActiveTab(tab.id);
                    }}
                    className={`showcase-tab-btn ${isActive ? 'active' : ''}`}
                  >
                    <IconComponent size={13} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </nav>

          {/* 3D Viewport Stage */}
          <div className="showcase-stage-viewport">
            {/* Holographic Rotating Scan Reticle */}
            <div className="hologram-scan-reticle" />

            {/* Ambient Docking Bay Platform Lighting */}
            <div 
              className="docking-bay-platform" 
              style={{ 
                background: `radial-gradient(ellipse at 50% 50%, ${currentCoatingObj.tint} 0%, rgba(0, 229, 255, 0.08) 50%, transparent 80%)` 
              }} 
            />

            {/* Docking Floor Guide Strips */}
            <div className="docking-floor-grid" />

            {/* Tactical HUD Telemetry Callouts */}
            <div className="hud-tag hud-tag-top-left">
              + REG: {activeShip.code} // {activeShip.name.split(' ')[0]}
            </div>
            <div className="hud-tag hud-tag-top-right">
              CLASS: {activeShip.classType.toUpperCase()} +
            </div>
            <div className="hud-tag hud-tag-bottom-left">
              + PROPULSION: {activeShip.manufacturer.split(' ')[0].toUpperCase()} ION
            </div>
            <div className="hud-tag hud-tag-bottom-right">
              SHIELD MATRIX: {calcStat(activeShip.baseStats?.shield, upgrades.shield)}% +
            </div>

            {/* Floating Centerpiece Starship Artwork */}
            <div className="showcase-ship-render">
              <img 
                src={activeShip.image || '/assets/ships/ship_orbitron.jpg'} 
                alt={activeShip.name}
                className="showcase-ship-img"
                style={{
                  filter: `drop-shadow(0 14px 28px rgba(0, 0, 0, 0.85)) drop-shadow(0 0 26px ${currentCoatingObj.tint})`
                }}
              />
            </div>
          </div>
        </div>

        {/* ------------------------------------------------------------------------
            RIGHT COLUMN: TECHNICAL SYSTEMS CONSOLE (SECTIONS 8, 9)
            ------------------------------------------------------------------------ */}
        <div className="hangar-systems-console">
          
          {/* Console Header */}
          <div className="console-header-block">
            <div className="console-ship-title-wrap">
              <span className="console-ship-code">{activeShip.code} // FLEET REGISTRY</span>
              <h2 className="console-ship-name">{activeShip.name}</h2>
              <span style={{ fontSize: '0.74rem', color: '#00E5FF', fontFamily: 'Orbitron', fontWeight: '700' }}>
                {activeShip.tagline}
              </span>
            </div>
            <span className="console-class-badge">
              <ShieldCheck size={13} />
              <span>{activeShip.classType}</span>
            </span>
          </div>

          <p className="console-ship-desc">{activeShip.description}</p>

          {/* ====================================================================
              TAB CONTENT SWITCHER
              ==================================================================== */}

          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <>
              {/* Combat Performance Progress Bars (Section 8) */}
              <div className="console-stats-section">
                {/* Firepower */}
                <div className="stat-metric-row">
                  <div className="stat-label-wrap">
                    <span className="stat-title stat-title-firepower">
                      <Zap size={13} />
                      <span>FIREPOWER / DPS</span>
                    </span>
                    <span className="stat-value-badge">
                      {calcStat(activeShip.baseStats?.firepower, upgrades.weapon)} / 100
                    </span>
                  </div>
                  <div className="stat-progress-track">
                    <div 
                      className="stat-progress-bar bar-firepower" 
                      style={{ width: `${calcStat(activeShip.baseStats?.firepower, upgrades.weapon)}%` }} 
                    />
                  </div>
                </div>

                {/* Shield Defense */}
                <div className="stat-metric-row">
                  <div className="stat-label-wrap">
                    <span className="stat-title stat-title-shield">
                      <Shield size={13} />
                      <span>SHIELD DEFENSE MATRIX</span>
                    </span>
                    <span className="stat-value-badge">
                      {calcStat(activeShip.baseStats?.shield, upgrades.shield)} / 100
                    </span>
                  </div>
                  <div className="stat-progress-track">
                    <div 
                      className="stat-progress-bar bar-shield" 
                      style={{ width: `${calcStat(activeShip.baseStats?.shield, upgrades.shield)}%` }} 
                    />
                  </div>
                </div>

                {/* Sublight Velocity */}
                <div className="stat-metric-row">
                  <div className="stat-label-wrap">
                    <span className="stat-title stat-title-speed">
                      <Activity size={13} />
                      <span>SUBLIGHT VELOCITY</span>
                    </span>
                    <span className="stat-value-badge">
                      {calcStat(activeShip.baseStats?.speed, upgrades.engine)} / 100
                    </span>
                  </div>
                  <div className="stat-progress-track">
                    <div 
                      className="stat-progress-bar bar-speed" 
                      style={{ width: `${calcStat(activeShip.baseStats?.speed, upgrades.engine)}%` }} 
                    />
                  </div>
                </div>

                {/* Maneuverability / Drift */}
                <div className="stat-metric-row">
                  <div className="stat-label-wrap">
                    <span className="stat-title stat-title-maneuver">
                      <Sparkles size={13} />
                      <span>MANEUVERABILITY // DRIFT</span>
                    </span>
                    <span className="stat-value-badge">
                      {calcStat(activeShip.baseStats?.maneuver, upgrades.special)} / 100
                    </span>
                  </div>
                  <div className="stat-progress-track">
                    <div 
                      className="stat-progress-bar bar-maneuver" 
                      style={{ width: `${calcStat(activeShip.baseStats?.maneuver, upgrades.special)}%` }} 
                    />
                  </div>
                </div>
              </div>

              {/* Tactical Weapons & Ordnance Summary */}
              <div className="tactical-loadout-grid">
                <div className="loadout-card-item">
                  <span className="loadout-card-label">PRIMARY WEAPON</span>
                  <span className="loadout-card-val">
                    <Crosshair size={13} color="#00E5FF" />
                    <span>{activeShip.primaryWeapon}</span>
                  </span>
                </div>
                <div className="loadout-card-item">
                  <span className="loadout-card-label">SECONDARY ORDNANCE</span>
                  <span className="loadout-card-val">
                    <Zap size={13} color="#FFC247" />
                    <span>{activeShip.secondaryWeapon}</span>
                  </span>
                </div>
                <div className="loadout-card-item" style={{ gridColumn: 'span 2' }}>
                  <span className="loadout-card-label">TACTICAL SPECIAL ABILITY</span>
                  <span className="loadout-card-val" style={{ color: '#C084FC' }}>
                    <Sparkles size={13} color="#A855F7" />
                    <span>{activeShip.specialAbility}</span>
                  </span>
                </div>
              </div>
            </>
          )}

          {/* TAB 2: LOADOUT */}
          {activeTab === 'loadout' && (
            <div className="customization-panels-wrap">
              <div className="loadout-card-item">
                <span className="loadout-card-label">PRIMARY ENERGY BATTERY</span>
                <span className="loadout-card-val" style={{ color: '#00E5FF' }}>
                  <Crosshair size={14} color="#00E5FF" />
                  <span>{activeShip.primaryWeapon}</span>
                </span>
                <p style={{ margin: '4px 0 0', fontSize: '0.74rem', color: '#9AA9C7' }}>
                  High-velocity focused plasma delivery optimized for rapid target suppression and shield penetration.
                </p>
              </div>

              <div className="loadout-card-item">
                <span className="loadout-card-label">HEAVY PAYLOAD DISPENSER</span>
                <span className="loadout-card-val" style={{ color: '#FFC247' }}>
                  <Zap size={14} color="#FFC247" />
                  <span>{activeShip.secondaryWeapon}</span>
                </span>
                <p style={{ margin: '4px 0 0', fontSize: '0.74rem', color: '#9AA9C7' }}>
                  Automated lock-on ordnance engineered for capital hull breaching and heavy armor detonation.
                </p>
              </div>

              <div className="loadout-card-item">
                <span className="loadout-card-label">TACTICAL CORE ABILITY</span>
                <span className="loadout-card-val" style={{ color: '#C084FC' }}>
                  <Sparkles size={14} color="#A855F7" />
                  <span>{activeShip.specialAbility}</span>
                </span>
                <p style={{ margin: '4px 0 0', fontSize: '0.74rem', color: '#9AA9C7' }}>
                  Sub-space dimensional warp trigger. Instantly redirects internal reactor flux for supreme evasive advantage.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '4px' }}>
                <div style={{ background: 'rgba(5, 9, 27, 0.5)', padding: '8px', borderRadius: '6px' }}>
                  <span style={{ fontSize: '0.62rem', color: '#627299', fontFamily: 'Orbitron', display: 'block' }}>ARMOR RATING</span>
                  <span style={{ fontSize: '0.75rem', color: '#EAF1FF', fontFamily: 'Orbitron', fontWeight: '700' }}>{activeShip.armorRating}</span>
                </div>
                <div style={{ background: 'rgba(5, 9, 27, 0.5)', padding: '8px', borderRadius: '6px' }}>
                  <span style={{ fontSize: '0.62rem', color: '#627299', fontFamily: 'Orbitron', display: 'block' }}>SHIPYARD FORGE</span>
                  <span style={{ fontSize: '0.75rem', color: '#EAF1FF', fontFamily: 'Orbitron', fontWeight: '700' }}>{activeShip.manufacturer.split(' ')[0]}</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: UPGRADES (SECTION 9) */}
          {activeTab === 'upgrades' && (
            <div className="console-modules-section">
              <div className="section-subhead-row">
                <span className="section-subhead-title">
                  <Wrench size={14} />
                  <span>ATOMIC MODULE UPGRADES</span>
                </span>
                <span className="section-subhead-hint">SERVER ENFORCED // 4 TIERS</span>
              </div>

              <div className="modules-four-grid">
                {[
                  { key: 'weapon', label: 'WEAPON SYSTEM', stat: '+3 DPS per Level', icon: Crosshair },
                  { key: 'shield', label: 'SHIELD MATRIX', stat: '+3 Shield per Level', icon: Shield },
                  { key: 'engine', label: 'SUBLIGHT ENGINE', stat: '+3 Speed per Level', icon: Activity },
                  { key: 'special', label: 'SPECIAL CORE', stat: '+3 Drift per Level', icon: Sparkles }
                ].map((mod) => {
                  const currentLvl = upgrades[mod.key] || 1;
                  const cost = getUpgradeCost(currentLvl);
                  const isMax = cost === 'MAX';
                  const canAfford = !isMax && playerCredits >= cost;
                  // Icon rendered directly

                  return (
                    <div key={mod.key} className="module-tech-card cyber-interactive-card">
                      <div className="module-header-row">
                        <span className="module-name-lbl">{mod.label}</span>
                        <div className="module-level-indicator" title={`Level ${currentLvl} of 4`}>
                          {[1, 2, 3, 4].map((pip) => (
                            <span 
                              key={pip} 
                              className={`lvl-pip ${pip <= currentLvl ? 'active' : ''}`} 
                            />
                          ))}
                        </div>
                      </div>

                      <div className="module-bottom-action">
                        <span className="module-stat-bonus">{mod.stat}</span>
                        <button
                          onClick={() => handleUpgradeModule(mod.key)}
                          disabled={actionLoading || isMax || !isUnlocked || (!canAfford && isAuthenticated)}
                          className="btn-module-upgrade-action"
                          title={
                            !isUnlocked 
                              ? 'Commission ship first' 
                              : isMax 
                                ? 'Maximum Level Reached' 
                                : !canAfford 
                                  ? `Insufficient credits (Need ${cost} CR)` 
                                  : `Upgrade for ${cost} Credits`
                          }
                        >
                          {isMax ? 'MAX' : !isUnlocked ? 'LOCKED' : !canAfford ? `NEED ${cost} CR` : `+${cost} CR`}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 4: CUSTOMIZE (HULL COATINGS) */}
          {activeTab === 'customize' && (
            <div className="customization-panels-wrap">
              <div className="section-subhead-row">
                <span className="section-subhead-title">
                  <Palette size={14} />
                  <span>TACTICAL HULL COATINGS</span>
                </span>
                <span className="section-subhead-hint">ACTIVE PREVIEW</span>
              </div>

              <div className="coating-options-grid">
                {HULL_COATINGS.map((coating) => {
                  const isSelected = selectedCoating === coating.id;
                  return (
                    <div
                      key={coating.id}
                      onClick={() => {
                        soundManager.playLaser();
                        setSelectedCoating(coating.id);
                      }}
                      className={`coating-picker-card ${isSelected ? 'active' : ''}`}
                    >
                      <div className="coating-card-header">
                        <span 
                          className="coating-swatch-circle" 
                          style={{ background: coating.accent, boxShadow: `0 0 8px ${coating.accent}` }} 
                        />
                        <span className="coating-name-text">{coating.name}</span>
                      </div>
                      <p className="coating-desc-text">{coating.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 5: SKINS (FLEET INSIGNIAS) */}
          {activeTab === 'skins' && (
            <div className="customization-panels-wrap">
              <div className="section-subhead-row">
                <span className="section-subhead-title">
                  <Layers size={14} />
                  <span>FLEET SQUADRON INSIGNIAS</span>
                </span>
                <span className="section-subhead-hint">SEALS & MARKS</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {FLEET_INSIGNIAS.map((insignia) => {
                  const isSelected = selectedInsignia === insignia.id;
                  return (
                    <div
                      key={insignia.id}
                      onClick={() => {
                        soundManager.playLaser();
                        setSelectedInsignia(insignia.id);
                      }}
                      className={`coating-picker-card ${isSelected ? 'active' : ''}`}
                      style={{ padding: '8px 12px' }}
                    >
                      <div className="coating-card-header">
                        <Award size={14} color={isSelected ? '#00E5FF' : '#8B5CF6'} />
                        <span className="coating-name-text">{insignia.name}</span>
                        <span style={{ marginLeft: 'auto', fontSize: '0.62rem', color: '#00E5FF', fontFamily: 'Orbitron' }}>
                          {insignia.seal}
                        </span>
                      </div>
                      <p className="coating-desc-text" style={{ margin: '2px 0 0' }}>{insignia.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>

      </section>

      {/* ==========================================================================
          D. BOTTOM EQUIPPED STATUS & SORTIE LAUNCH (SECTION 10)
          ========================================================================== */}
      <section className="hangar-command-deck-actions" aria-label="Hangar Command Deck Controls">
        <div className="equipped-status-card">
          <div className="status-beacon-icon" style={{
            background: isEquipped ? 'rgba(32, 214, 160, 0.15)' : isUnlocked ? 'rgba(0, 229, 255, 0.15)' : 'rgba(255, 194, 71, 0.15)',
            borderColor: isEquipped ? 'rgba(32, 214, 160, 0.4)' : isUnlocked ? 'rgba(0, 229, 255, 0.4)' : 'rgba(255, 194, 71, 0.4)',
            color: isEquipped ? '#20D6A0' : isUnlocked ? '#00E5FF' : '#FFC247',
            boxShadow: isEquipped ? '0 0 16px rgba(32, 214, 160, 0.25)' : '0 0 16px rgba(0, 229, 255, 0.2)'
          }}>
            {isEquipped ? <Check size={22} /> : isUnlocked ? <Shield size={22} /> : <Lock size={22} />}
          </div>
          <div className="status-text-block">
            <span className="status-title-headline" style={{
              color: isEquipped ? '#20D6A0' : isUnlocked ? '#00E5FF' : '#FFC247'
            }}>
              {isEquipped 
                ? 'CURRENTLY EQUIPPED // READY FOR COMBAT' 
                : isUnlocked 
                  ? 'COMMISSIONED // HANGAR DECK STANDBY' 
                  : 'DRYDOCK STATUS // LOCKED VESSEL'}
            </span>
            <span className="status-subtitle-hint">
              {isEquipped 
                ? 'Starfighter active on flight deck. Selected for all mission sorties.' 
                : isUnlocked 
                  ? 'Hull ready for deployment. Equip to launch into combat missions.' 
                  : `Procure blueprint requisition with ${activeShip.priceCredits.toLocaleString()} Credits.`}
            </span>
          </div>
        </div>

        <div className="hangar-primary-action-buttons">
          {/* Action Button: Equip vs Unlock */}
          {isEquipped ? (
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 18px',
              background: 'rgba(32, 214, 160, 0.12)',
              border: '1px solid rgba(32, 214, 160, 0.4)',
              borderRadius: '8px',
              color: '#20D6A0',
              fontFamily: 'Orbitron',
              fontSize: '0.78rem',
              fontWeight: '800',
              letterSpacing: '0.08em'
            }}>
              <Check size={16} />
              <span>ACTIVE SORTIE READY</span>
            </div>
          ) : isUnlocked ? (
            <button
              onClick={() => handleSelectShip(activeShip.id)}
              disabled={actionLoading}
              className="btn-equip-starship"
            >
              <Check size={18} />
              <span>{actionLoading ? 'COMMISSIONING...' : 'EQUIP FOR BATTLE'}</span>
            </button>
          ) : (
            <button
              onClick={() => handleUnlockShip(activeShip.id)}
              disabled={actionLoading || (playerCredits < activeShip.priceCredits && isAuthenticated)}
              className="btn-commission-gold"
              title={
                playerCredits < activeShip.priceCredits && isAuthenticated 
                  ? `Need ${activeShip.priceCredits - playerCredits} more credits` 
                  : 'Commission Starship'
              }
            >
              <Lock size={18} />
              <span>
                {actionLoading 
                  ? 'COMMISSIONING...' 
                  : `COMMISSION HULL // ${activeShip.priceCredits.toLocaleString()} CR`}
              </span>
            </button>
          )}

          {/* Launch Tactical Mission Sortie */}
          <button
            onClick={() => {
              soundManager.playLaser();
              if (onLaunchMission) {
                onLaunchMission();
              } else if (onNavigate) {
                onNavigate('missions');
              }
            }}
            className="btn-combat-sortie"
            title="Proceed to Tactical Missions Deck"
          >
            <span>SORTIE ARCHIVE</span>
            <ChevronRight size={16} />
          </button>
        </div>
      </section>

      {/* Guest Enlist Prompt Modal */}
      {enlistModalOpen && (
        <EnlistPromptModal 
          isOpen={enlistModalOpen}
          onClose={() => setEnlistModalOpen(false)}
          onEnlist={() => {
            setEnlistModalOpen(false);
            if (onNavigate) onNavigate('auth');
          }}
          title="PILOT ENLISTMENT REQUIRED"
          subtitle="Enlist your pilot credentials to commission advanced spacecraft hulls and install tactical module upgrades."
        />
      )}
    </div>
  );
};

export default HangarView;
