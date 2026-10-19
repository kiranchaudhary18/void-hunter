import React, { useState, useEffect, useMemo } from 'react';
import api from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import soundManager from '../game/managers/SoundManager.js';
import EnlistPromptModal from './EnlistPromptModal.jsx';
import { 
  Shield, Zap, Crosshair, Check, Lock, 
  Sparkles, AlertCircle, CheckCircle2, ChevronRight, Play, Wrench, Coins, Award
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
    unlockedByDefault: true
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
    unlockedByDefault: false
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
    unlockedByDefault: false
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
    unlockedByDefault: false
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
    unlockedByDefault: false
  }
];

export const HangarView = ({ 
  isPublic = false, 
  onNavigate, 
  onLaunchMission 
}) => {
  const { user, profile, isAuthenticated, refreshProfile } = useAuth();
  const [ships, setShips] = useState(SHIPS_SHOWCASE_CATALOG);
  const [selectedShipId, setSelectedShipId] = useState('v01-orbitron');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [feedback, setFeedback] = useState({ error: null, success: null });
  const [enlistModalOpen, setEnlistModalOpen] = useState(false);

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
            name: catShip.name
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
        setFeedback({ success: `${activeShip.name} successfully commissioned for battle!`, error: null });
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

  return (
    <div className="hangar-container">
      {/* ==========================================================================
          A. PAGE HEADING COMMAND BAR
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

        {/* Fleet Summary Metrics */}
        <div className="fleet-summary-strip">
          <div className="fleet-stat-item">
            <span className="fleet-stat-val">5 / 5</span>
            <span className="fleet-stat-lbl">SHIP CLASSES</span>
          </div>
          <div style={{ width: 1, height: 26, background: 'rgba(255, 255, 255, 0.1)' }} />
          <div className="fleet-stat-item">
            <span className="fleet-stat-val" style={{ color: '#FBBF24' }}>
              {isAuthenticated ? `${ships.filter(s => s.isUnlocked || s.unlockedByDefault).length} / 5` : 'ALL BROWSEABLE'}
            </span>
            <span className="fleet-stat-lbl">{isAuthenticated ? 'COMMISSIONED' : 'CATALOG ACCESS'}</span>
          </div>
        </div>
      </section>

      {/* Guest Mode Banner */}
      {!isAuthenticated && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 20px',
          background: 'rgba(11, 18, 48, 0.85)',
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
          B. 5-SHIP HORIZONTAL SELECTOR
          ========================================================================== */}
      <section className="ships-selector-row" aria-label="Spaceship Fleet Selection">
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
                    <span>{ship.priceCredits ? `${ship.priceCredits} CR` : 'LOCKED'}</span>
                  </span>
                )}
                {isSelected && (
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#00E5FF', boxShadow: '0 0 8px #00E5FF' }} />
                )}
              </div>
            </button>
          );
        })}
      </section>

      {/* ==========================================================================
          C. MAIN FEATURED-SHIP PANEL (TWO-COLUMN COMPOSITION)
          ========================================================================== */}
      <section className="featured-ship-panel">
        
        {/* Left Column: Featured Spaceship Showcase */}
        <div className="featured-ship-showcase">
          {/* Tactical HUD Corner Callouts */}
          <div className="ship-hud-callout hud-callout-top-left">
            + REG: {activeShip.code} // {activeShip.name}
          </div>
          <div className="ship-hud-callout hud-callout-top-right">
            CLASS: {activeShip.classType.toUpperCase()} +
          </div>
          <div className="ship-hud-callout hud-callout-bottom-left">
            + PROPULSION: SUB-LIGHT ION DRIVE
          </div>
          <div className="ship-hud-callout hud-callout-bottom-right">
            SHIELD MATRIX: {calcStat(activeShip.baseStats?.shield, upgrades.shield)}% +
          </div>

          {/* Central Spaceship Render Viewport */}
          <div className="ship-artwork-container">
            <img 
              src={activeShip.image || '/assets/ships/ship_orbitron.jpg'} 
              alt={activeShip.name}
              className="featured-ship-image"
            />
            <div className="ship-artwork-vignette" />
          </div>
        </div>

        {/* Right Column: Ship Specifications & Upgrades */}
        <div className="featured-ship-specs">
          {/* Header & Description */}
          <div className="specs-header-group">
            <div className="specs-title-row">
              <h2 className="specs-ship-name">{activeShip.name}</h2>
              <span className="specs-class-pill">{activeShip.classType}</span>
            </div>
            <p className="specs-description">{activeShip.description}</p>
          </div>

          {/* Combat Statistics Progress Bars */}
          <div className="combat-stats-container">
            {/* Firepower */}
            <div className="stat-row-item">
              <div className="stat-label-bar">
                <span className="stat-lbl-firepower">FIREPOWER / DPS</span>
                <span className="stat-val-text">{calcStat(activeShip.baseStats?.firepower, upgrades.weapon)} / 100</span>
              </div>
              <div className="stat-progress-track">
                <div 
                  className="stat-progress-fill fill-firepower" 
                  style={{ width: `${calcStat(activeShip.baseStats?.firepower, upgrades.weapon)}%` }} 
                />
              </div>
            </div>

            {/* Defense / Shield */}
            <div className="stat-row-item">
              <div className="stat-label-bar">
                <span className="stat-lbl-defense">SHIELD DEFENSE MATRIX</span>
                <span className="stat-val-text">{calcStat(activeShip.baseStats?.shield, upgrades.shield)} / 100</span>
              </div>
              <div className="stat-progress-track">
                <div 
                  className="stat-progress-fill fill-defense" 
                  style={{ width: `${calcStat(activeShip.baseStats?.shield, upgrades.shield)}%` }} 
                />
              </div>
            </div>

            {/* Sublight Speed */}
            <div className="stat-row-item">
              <div className="stat-label-bar">
                <span className="stat-lbl-speed">SUBLIGHT VELOCITY</span>
                <span className="stat-val-text">{calcStat(activeShip.baseStats?.speed, upgrades.engine)} / 100</span>
              </div>
              <div className="stat-progress-track">
                <div 
                  className="stat-progress-fill fill-speed" 
                  style={{ width: `${calcStat(activeShip.baseStats?.speed, upgrades.engine)}%` }} 
                />
              </div>
            </div>

            {/* Maneuverability / Special */}
            <div className="stat-row-item">
              <div className="stat-label-bar">
                <span className="stat-lbl-special">MANEUVERABILITY // DRIFT</span>
                <span className="stat-val-text">{calcStat(activeShip.baseStats?.maneuver, upgrades.special)} / 100</span>
              </div>
              <div className="stat-progress-track">
                <div 
                  className="stat-progress-fill fill-special" 
                  style={{ width: `${calcStat(activeShip.baseStats?.maneuver, upgrades.special)}%` }} 
                />
              </div>
            </div>
          </div>

          {/* Weapons & Ordnance Tactical Grid */}
          <div className="weapons-specs-grid">
            <div className="weapon-spec-box">
              <span className="weapon-box-lbl">PRIMARY WEAPON</span>
              <span className="weapon-box-val">
                <Crosshair size={14} color="#00E5FF" />
                <span>{activeShip.primaryWeapon}</span>
              </span>
            </div>

            <div className="weapon-spec-box">
              <span className="weapon-box-lbl">SECONDARY ORDNANCE</span>
              <span className="weapon-box-val">
                <Zap size={14} color="#FFB84D" />
                <span>{activeShip.secondaryWeapon}</span>
              </span>
            </div>

            <div className="weapon-spec-box" style={{ gridColumn: 'span 2' }}>
              <span className="weapon-box-lbl">TACTICAL SPECIAL ABILITY</span>
              <span className="weapon-box-val" style={{ color: '#8B5CF6' }}>
                <Sparkles size={14} color="#8B5CF6" />
                <span>{activeShip.specialAbility}</span>
              </span>
            </div>
          </div>

          {/* Module Upgrades Strip (Atomic Server Enforced) */}
          <div className="modules-upgrade-strip">
            {['weapon', 'shield', 'engine', 'special'].map((mod) => {
              const currentLvl = upgrades[mod] || 1;
              const cost = getUpgradeCost(currentLvl);
              const isMax = cost === 'MAX';

              return (
                <div key={mod} className="module-item-card">
                  <span className="module-card-title">{mod}</span>
                  <span className="module-card-lvl">LVL {currentLvl}</span>
                  <button
                    onClick={() => handleUpgradeModule(mod)}
                    disabled={actionLoading || isMax || !isUnlocked}
                    className="btn-module-upgrade"
                    title={isUnlocked ? (isMax ? 'Maximum Level Reached' : `Upgrade for ${cost} Credits`) : 'Unlock ship first'}
                  >
                    {isMax ? 'MAX' : `+${cost} CR`}
                  </button>
                </div>
              );
            })}
          </div>

          {/* ==========================================================================
              D. ACTION AREA (Equip, Unlock & Deploy)
              ========================================================================== */}
          <div className="hangar-actions-row">
            {isEquipped ? (
              <div className="btn-equipped-active">
                <Check size={18} />
                <span>CURRENTLY EQUIPPED FOR COMBAT</span>
              </div>
            ) : isUnlocked ? (
              <button
                onClick={() => handleSelectShip(activeShip.id)}
                disabled={actionLoading}
                className="btn-equip-primary"
              >
                {actionLoading ? <span>COMMISSIONING...</span> : (
                  <>
                    <Check size={18} />
                    <span>EQUIP FOR BATTLE</span>
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={() => handleUnlockShip(activeShip.id)}
                disabled={actionLoading}
                className="btn-unlock-gold"
              >
                {actionLoading ? <span>COMMISSIONING...</span> : (
                  <>
                    <Lock size={18} />
                    <span>UNLOCK HULL // {activeShip.priceCredits} CREDITS</span>
                  </>
                )}
              </button>
            )}

            {/* Launch Direct Combat Sortie */}
            <button
              onClick={() => onNavigate && onNavigate('missions')}
              className="btn-launch-missions"
              title="Proceed to Tactical Missions Deck"
            >
              <span>SORTIE ARCHIVE</span>
              <ChevronRight size={16} />
            </button>
          </div>
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
