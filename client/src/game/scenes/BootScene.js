import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  preload() {
    // Generate all game textures procedurally for instant load times and zero network failures
    this.createProceduralTextures();
  }

  create() {
    // Start combat scene immediately after textures are registered
    this.scene.start('SpaceCombatScene');
  }

  createProceduralTextures() {
    // 1. Player Ship: V-01 Orbitron (Balanced Starfighter)
    if (!this.textures.exists('ship_orbitron')) {
      const canvas = document.createElement('canvas');
      canvas.width = 64;
      canvas.height = 64;
      const ctx = canvas.getContext('2d');

      // Hull Shadow & Outer Wings
      ctx.fillStyle = '#00E5FF';
      ctx.shadowColor = '#00E5FF';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.moveTo(32, 6);
      ctx.lineTo(44, 28);
      ctx.lineTo(60, 52);
      ctx.lineTo(48, 56);
      ctx.lineTo(38, 48);
      ctx.lineTo(32, 58);
      ctx.lineTo(26, 48);
      ctx.lineTo(16, 56);
      ctx.lineTo(4, 52);
      ctx.lineTo(20, 28);
      ctx.closePath();
      ctx.fill();

      // Main Dark Armor Plates
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#0A1232';
      ctx.beginPath();
      ctx.moveTo(32, 10);
      ctx.lineTo(42, 32);
      ctx.lineTo(52, 50);
      ctx.lineTo(40, 48);
      ctx.lineTo(32, 54);
      ctx.lineTo(24, 48);
      ctx.lineTo(12, 50);
      ctx.lineTo(22, 32);
      ctx.closePath();
      ctx.fill();

      // Cockpit Canopy (Glowing Cyan/White)
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.ellipse(32, 26, 4, 10, 0, 0, Math.PI * 2);
      ctx.fill();

      // Engine Thruster Glow
      ctx.fillStyle = '#FF2DFF';
      ctx.beginPath();
      ctx.arc(28, 56, 3, 0, Math.PI * 2);
      ctx.arc(36, 56, 3, 0, Math.PI * 2);
      ctx.fill();

      this.textures.addCanvas('ship_orbitron', canvas);
    }

    // 1b. Player Ship: S-02 Phoenix (High Damage Striker - Orange/Crimson Plasma)
    if (!this.textures.exists('ship_phoenix')) {
      const canvas = document.createElement('canvas');
      canvas.width = 64;
      canvas.height = 64;
      const ctx = canvas.getContext('2d');

      ctx.fillStyle = '#F97316';
      ctx.shadowColor = '#EA580C';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.moveTo(32, 4);
      ctx.lineTo(40, 24);
      ctx.lineTo(62, 44);
      ctx.lineTo(46, 60);
      ctx.lineTo(38, 48);
      ctx.lineTo(32, 56);
      ctx.lineTo(26, 48);
      ctx.lineTo(18, 60);
      ctx.lineTo(2, 44);
      ctx.lineTo(24, 24);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#18181B';
      ctx.beginPath();
      ctx.moveTo(32, 10);
      ctx.lineTo(38, 30);
      ctx.lineTo(50, 46);
      ctx.lineTo(32, 50);
      ctx.lineTo(14, 46);
      ctx.lineTo(26, 30);
      ctx.closePath();
      ctx.fill();

      // Twin Forward Plasma Cannons
      ctx.fillStyle = '#EF4444';
      ctx.fillRect(16, 18, 4, 18);
      ctx.fillRect(44, 18, 4, 18);

      ctx.fillStyle = '#FBBF24';
      ctx.beginPath();
      ctx.arc(32, 28, 5, 0, Math.PI * 2);
      ctx.fill();

      this.textures.addCanvas('ship_phoenix', canvas);
    }

    // 1c. Player Ship: X-03 Shadow (High Speed Stealth Interceptor - Purple/Black Needle)
    if (!this.textures.exists('ship_shadow')) {
      const canvas = document.createElement('canvas');
      canvas.width = 64;
      canvas.height = 64;
      const ctx = canvas.getContext('2d');

      ctx.fillStyle = '#A855F7';
      ctx.shadowColor = '#7C3AED';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.moveTo(32, 2);
      ctx.lineTo(42, 34);
      ctx.lineTo(58, 62);
      ctx.lineTo(44, 52);
      ctx.lineTo(32, 58);
      ctx.lineTo(20, 52);
      ctx.lineTo(6, 62);
      ctx.lineTo(22, 34);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#09090B';
      ctx.beginPath();
      ctx.moveTo(32, 8);
      ctx.lineTo(38, 36);
      ctx.lineTo(46, 52);
      ctx.lineTo(32, 52);
      ctx.lineTo(18, 52);
      ctx.lineTo(26, 36);
      ctx.closePath();
      ctx.fill();

      // Sleek Cyan Visor
      ctx.fillStyle = '#00E5FF';
      ctx.fillRect(30, 22, 4, 14);

      this.textures.addCanvas('ship_shadow', canvas);
    }

    // 1d. Player Ship: R-04 Titan (Heavy Armor Guardian - Heavy Golden Bronze)
    if (!this.textures.exists('ship_titan')) {
      const canvas = document.createElement('canvas');
      canvas.width = 64;
      canvas.height = 64;
      const ctx = canvas.getContext('2d');

      ctx.fillStyle = '#D97706';
      ctx.shadowColor = '#FBBF24';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.moveTo(32, 8);
      ctx.lineTo(54, 20);
      ctx.lineTo(60, 54);
      ctx.lineTo(48, 62);
      ctx.lineTo(32, 54);
      ctx.lineTo(16, 62);
      ctx.lineTo(4, 54);
      ctx.lineTo(10, 20);
      ctx.closePath();
      ctx.fill();

      // Reinforced Plates
      ctx.fillStyle = '#1C1917';
      ctx.fillRect(20, 20, 24, 30);

      // Deflector Projectors
      ctx.fillStyle = '#38BDF8';
      ctx.beginPath();
      ctx.arc(16, 30, 4, 0, Math.PI * 2);
      ctx.arc(48, 30, 4, 0, Math.PI * 2);
      ctx.fill();

      this.textures.addCanvas('ship_titan', canvas);
    }

    // 1e. Player Ship: Z-05 Nova (Experimental Prototype - Luminous White & Electric Magenta)
    if (!this.textures.exists('ship_nova')) {
      const canvas = document.createElement('canvas');
      canvas.width = 64;
      canvas.height = 64;
      const ctx = canvas.getContext('2d');

      ctx.fillStyle = '#FF2DFF';
      ctx.shadowColor = '#FF2DFF';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.moveTo(32, 2);
      ctx.lineTo(46, 26);
      ctx.lineTo(62, 48);
      ctx.lineTo(48, 54);
      ctx.lineTo(38, 44);
      ctx.lineTo(32, 60);
      ctx.lineTo(26, 44);
      ctx.lineTo(16, 54);
      ctx.lineTo(2, 48);
      ctx.lineTo(18, 26);
      ctx.closePath();
      ctx.fill();

      // Luminous Core
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.moveTo(32, 8);
      ctx.lineTo(40, 30);
      ctx.lineTo(32, 46);
      ctx.lineTo(24, 30);
      ctx.closePath();
      ctx.fill();

      // Quantum Energy Halo Ring
      ctx.strokeStyle = '#00E5FF';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(32, 34, 16, 0, Math.PI * 2);
      ctx.stroke();

      this.textures.addCanvas('ship_nova', canvas);
    }

    // 2. Player Laser Bolt: High-Power Glowing Plasma Lance (Neon Emerald & Cyan)
    if (!this.textures.exists('player_laser')) {
      const canvas = document.createElement('canvas');
      canvas.width = 14;
      canvas.height = 36;
      const ctx = canvas.getContext('2d');

      // Outer Plasma Energy Aura
      ctx.shadowColor = '#00FF88';
      ctx.shadowBlur = 12;

      // Lance Outer Body
      const outerGrad = ctx.createLinearGradient(0, 0, 0, 36);
      outerGrad.addColorStop(0, '#FFFFFF');
      outerGrad.addColorStop(0.2, '#00FF88');
      outerGrad.addColorStop(0.6, '#00E5FF');
      outerGrad.addColorStop(1, 'rgba(0, 229, 255, 0)');

      ctx.fillStyle = outerGrad;
      ctx.beginPath();
      ctx.moveTo(7, 0);       // Sharp forward tip
      ctx.lineTo(13, 14);     // Right taper
      ctx.lineTo(11, 32);     // Right body
      ctx.lineTo(7, 36);      // Tail center
      ctx.lineTo(3, 32);      // Left body
      ctx.lineTo(1, 14);      // Left taper
      ctx.closePath();
      ctx.fill();

      // Superheated White-Hot Core
      ctx.shadowBlur = 4;
      ctx.shadowColor = '#FFFFFF';
      const coreGrad = ctx.createLinearGradient(0, 2, 0, 28);
      coreGrad.addColorStop(0, '#FFFFFF');
      coreGrad.addColorStop(0.5, '#A7F3D0');
      coreGrad.addColorStop(1, 'rgba(167, 243, 208, 0)');

      ctx.fillStyle = coreGrad;
      ctx.beginPath();
      ctx.moveTo(7, 2);
      ctx.lineTo(10, 12);
      ctx.lineTo(8, 26);
      ctx.lineTo(7, 28);
      ctx.lineTo(6, 26);
      ctx.lineTo(4, 12);
      ctx.closePath();
      ctx.fill();

      this.textures.addCanvas('player_laser', canvas);
    }

    // 3. Enemy Scout (Nimble Orange/Red Fighter)
    if (!this.textures.exists('enemy_scout')) {
      const canvas = document.createElement('canvas');
      canvas.width = 44;
      canvas.height = 44;
      const ctx = canvas.getContext('2d');

      ctx.fillStyle = '#EF4444';
      ctx.shadowColor = '#EF4444';
      ctx.shadowBlur = 8;

      ctx.beginPath();
      ctx.moveTo(22, 40); // Facing downwards towards player
      ctx.lineTo(40, 10);
      ctx.lineTo(30, 6);
      ctx.lineTo(22, 16);
      ctx.lineTo(14, 6);
      ctx.lineTo(4, 10);
      ctx.closePath();
      ctx.fill();

      // Core eye
      ctx.fillStyle = '#FBBF24';
      ctx.beginPath();
      ctx.arc(22, 22, 4, 0, Math.PI * 2);
      ctx.fill();

      this.textures.addCanvas('enemy_scout', canvas);
    }

    // 4. Enemy Interceptor (Purple Swept-Wing Hunter)
    if (!this.textures.exists('enemy_interceptor')) {
      const canvas = document.createElement('canvas');
      canvas.width = 52;
      canvas.height = 52;
      const ctx = canvas.getContext('2d');

      ctx.fillStyle = '#9333EA';
      ctx.shadowColor = '#A855F7';
      ctx.shadowBlur = 8;

      ctx.beginPath();
      ctx.moveTo(26, 48);
      ctx.lineTo(48, 16);
      ctx.lineTo(38, 8);
      ctx.lineTo(26, 20);
      ctx.lineTo(14, 8);
      ctx.lineTo(4, 16);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#060919';
      ctx.beginPath();
      ctx.moveTo(26, 36);
      ctx.lineTo(38, 18);
      ctx.lineTo(26, 24);
      ctx.lineTo(14, 18);
      ctx.closePath();
      ctx.fill();

      this.textures.addCanvas('enemy_interceptor', canvas);
    }

    // 5. Enemy Cruiser (Armored Heavy Tank)
    if (!this.textures.exists('enemy_cruiser')) {
      const canvas = document.createElement('canvas');
      canvas.width = 72;
      canvas.height = 72;
      const ctx = canvas.getContext('2d');

      ctx.fillStyle = '#B91C1C';
      ctx.shadowColor = '#EF4444';
      ctx.shadowBlur = 10;

      // Heavy armor hexagonal chassis
      ctx.beginPath();
      ctx.moveTo(36, 68);
      ctx.lineTo(66, 38);
      ctx.lineTo(58, 8);
      ctx.lineTo(36, 18);
      ctx.lineTo(14, 8);
      ctx.lineTo(6, 38);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#450A0A';
      ctx.fillRect(24, 24, 24, 28);

      ctx.fillStyle = '#F59E0B';
      ctx.beginPath();
      ctx.arc(36, 38, 6, 0, Math.PI * 2);
      ctx.fill();

      this.textures.addCanvas('enemy_cruiser', canvas);
    }

    // 5b. Long-Range Gunship (Section 9: High-Altitude Sniper Vessel)
    if (!this.textures.exists('enemy_gunship')) {
      const canvas = document.createElement('canvas');
      canvas.width = 60;
      canvas.height = 60;
      const ctx = canvas.getContext('2d');

      ctx.fillStyle = '#0284C7';
      ctx.shadowColor = '#00E5FF';
      ctx.shadowBlur = 10;

      // Swept delta with elongated forward railgun barrel
      ctx.beginPath();
      ctx.moveTo(30, 56);
      ctx.lineTo(54, 22);
      ctx.lineTo(44, 12);
      ctx.lineTo(30, 24);
      ctx.lineTo(16, 12);
      ctx.lineTo(6, 22);
      ctx.closePath();
      ctx.fill();

      // Railgun Barrel
      ctx.fillStyle = '#00E5FF';
      ctx.fillRect(28, 2, 4, 24);

      // Targeting Sensor
      ctx.fillStyle = '#EF4444';
      ctx.beginPath();
      ctx.arc(30, 32, 4, 0, Math.PI * 2);
      ctx.fill();

      this.textures.addCanvas('enemy_gunship', canvas);
    }

    // 5c. Elite Enemy (Section 9: Advanced Shielded Assault Craft)
    if (!this.textures.exists('enemy_elite')) {
      const canvas = document.createElement('canvas');
      canvas.width = 68;
      canvas.height = 68;
      const ctx = canvas.getContext('2d');

      ctx.fillStyle = '#D97706';
      ctx.shadowColor = '#FBBF24';
      ctx.shadowBlur = 12;

      // Heavy golden hull with magenta plasma conduits
      ctx.beginPath();
      ctx.moveTo(34, 62);
      ctx.lineTo(62, 30);
      ctx.lineTo(52, 10);
      ctx.lineTo(34, 20);
      ctx.lineTo(16, 10);
      ctx.lineTo(6, 30);
      ctx.closePath();
      ctx.fill();

      // Dual Magenta Energy Cores
      ctx.fillStyle = '#FF2DFF';
      ctx.fillRect(18, 28, 6, 14);
      ctx.fillRect(44, 28, 6, 14);

      // Central Command Orb
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(34, 34, 5, 0, Math.PI * 2);
      ctx.fill();

      this.textures.addCanvas('enemy_elite', canvas);
    }

    // 6. Enemy Bullet (Red Plasma Orb)
    if (!this.textures.exists('enemy_bullet')) {
      const canvas = document.createElement('canvas');
      canvas.width = 14;
      canvas.height = 14;
      const ctx = canvas.getContext('2d');

      ctx.shadowColor = '#EF4444';
      ctx.shadowBlur = 6;
      ctx.fillStyle = '#EF4444';
      ctx.beginPath();
      ctx.arc(7, 7, 5, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(7, 7, 2, 0, Math.PI * 2);
      ctx.fill();

      this.textures.addCanvas('enemy_bullet', canvas);
    }

    // 7. Pickups: High-Tech Credit Coin (Glowing 3D Gold Coin)
    if (!this.textures.exists('pickup_credit')) {
      const canvas = document.createElement('canvas');
      canvas.width = 28;
      canvas.height = 28;
      const ctx = canvas.getContext('2d');

      // Outer Gold Radiant Glow
      ctx.shadowColor = '#FBBF24';
      ctx.shadowBlur = 10;

      // Outer Golden Rim
      const rimGrad = ctx.createRadialGradient(14, 14, 6, 14, 14, 13);
      rimGrad.addColorStop(0, '#FEF08A');
      rimGrad.addColorStop(0.7, '#F59E0B');
      rimGrad.addColorStop(1, '#B45309');

      ctx.fillStyle = rimGrad;
      ctx.beginPath();
      ctx.arc(14, 14, 12, 0, Math.PI * 2);
      ctx.fill();

      // Inner Coin Plate
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#78350F';
      ctx.beginPath();
      ctx.arc(14, 14, 9, 0, Math.PI * 2);
      ctx.fill();

      // Embossed Gold Star / Credit Symbol
      ctx.fillStyle = '#FDE047';
      ctx.beginPath();
      ctx.moveTo(14, 7);
      ctx.lineTo(16, 12);
      ctx.lineTo(21, 14);
      ctx.lineTo(16, 16);
      ctx.lineTo(14, 21);
      ctx.lineTo(12, 16);
      ctx.lineTo(7, 14);
      ctx.lineTo(12, 12);
      ctx.closePath();
      ctx.fill();

      this.textures.addCanvas('pickup_credit', canvas);
    }

    // 8. Pickups: Energy Core (Purple Gem)
    if (!this.textures.exists('pickup_core')) {
      const canvas = document.createElement('canvas');
      canvas.width = 24;
      canvas.height = 24;
      const ctx = canvas.getContext('2d');

      ctx.shadowColor = '#C084FC';
      ctx.shadowBlur = 8;
      ctx.fillStyle = '#A855F7';
      ctx.beginPath();
      ctx.moveTo(12, 2);
      ctx.lineTo(21, 9);
      ctx.lineTo(12, 22);
      ctx.lineTo(3, 9);
      ctx.closePath();
      ctx.fill();

      this.textures.addCanvas('pickup_core', canvas);
    }

    // 9. Shield Bubble Effect
    if (!this.textures.exists('shield_bubble')) {
      const canvas = document.createElement('canvas');
      canvas.width = 96;
      canvas.height = 96;
      const ctx = canvas.getContext('2d');

      ctx.strokeStyle = '#00E5FF';
      ctx.lineWidth = 3;
      ctx.shadowColor = '#00E5FF';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(48, 48, 42, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = 'rgba(0, 229, 255, 0.12)';
      ctx.fill();

      this.textures.addCanvas('shield_bubble', canvas);
    }

    // 10. Particle Spark
    if (!this.textures.exists('spark')) {
      const canvas = document.createElement('canvas');
      canvas.width = 6;
      canvas.height = 6;
      const ctx = canvas.getContext('2d');

      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, 6, 6);

      this.textures.addCanvas('spark', canvas);
    }

    // 11. Homing Missile (Heavy Sci-Fi Tactical Rocket with Thruster Flare)
    if (!this.textures.exists('homing_missile')) {
      const canvas = document.createElement('canvas');
      canvas.width = 24;
      canvas.height = 56;
      const ctx = canvas.getContext('2d');

      // Glowing Rocket Booster Flare
      ctx.shadowColor = '#F97316';
      ctx.shadowBlur = 12;

      // Rocket Exhaust Plume
      const exhaustGrad = ctx.createLinearGradient(0, 36, 0, 56);
      exhaustGrad.addColorStop(0, '#FFFFFF');
      exhaustGrad.addColorStop(0.25, '#FDE047');
      exhaustGrad.addColorStop(0.65, '#EA580C');
      exhaustGrad.addColorStop(1, 'rgba(234, 88, 12, 0)');

      ctx.fillStyle = exhaustGrad;
      ctx.beginPath();
      ctx.moveTo(6, 36);
      ctx.lineTo(12, 56);
      ctx.lineTo(18, 36);
      ctx.closePath();
      ctx.fill();

      // Titanium Rocket Fuselage
      ctx.shadowBlur = 5;
      ctx.shadowColor = '#000000';
      const bodyGrad = ctx.createLinearGradient(0, 0, 24, 0);
      bodyGrad.addColorStop(0, '#1E293B');
      bodyGrad.addColorStop(0.3, '#475569');
      bodyGrad.addColorStop(0.5, '#E2E8F0');
      bodyGrad.addColorStop(0.8, '#475569');
      bodyGrad.addColorStop(1, '#0F172A');

      ctx.fillStyle = bodyGrad;
      ctx.beginPath();
      ctx.moveTo(12, 0);      // Warhead apex
      ctx.lineTo(18, 14);     // Upper nose cone
      ctx.lineTo(18, 38);     // Cylindrical main body
      ctx.lineTo(6, 38);
      ctx.lineTo(6, 14);
      ctx.closePath();
      ctx.fill();

      // High-Explosive Warhead Tip (Crimson/Orange Plasma Apex)
      const tipGrad = ctx.createLinearGradient(0, 0, 0, 14);
      tipGrad.addColorStop(0, '#FECACA');
      tipGrad.addColorStop(0.35, '#EF4444');
      tipGrad.addColorStop(1, '#B91C1C');

      ctx.fillStyle = tipGrad;
      ctx.beginPath();
      ctx.moveTo(12, 0);
      ctx.lineTo(18, 14);
      ctx.lineTo(6, 14);
      ctx.closePath();
      ctx.fill();

      // Aerodynamic Swept Stabilizer Wings
      ctx.fillStyle = '#991B1B';
      // Left Wing
      ctx.beginPath();
      ctx.moveTo(6, 22);
      ctx.lineTo(0, 40);
      ctx.lineTo(6, 38);
      ctx.closePath();
      ctx.fill();

      // Right Wing
      ctx.beginPath();
      ctx.moveTo(18, 22);
      ctx.lineTo(24, 40);
      ctx.lineTo(18, 38);
      ctx.closePath();
      ctx.fill();

      // Cyber Guidance Sensor Array
      ctx.fillStyle = '#00E5FF';
      ctx.fillRect(10, 16, 4, 3);
      ctx.fillStyle = '#FDE047';
      ctx.fillRect(11, 22, 2, 8);

      this.textures.addCanvas('homing_missile', canvas);
    }

    // 12. Repair Nanite Drone (Orbiting Green Healer)
    if (!this.textures.exists('repair_drone')) {
      const canvas = document.createElement('canvas');
      canvas.width = 24;
      canvas.height = 24;
      const ctx = canvas.getContext('2d');

      ctx.strokeStyle = '#10B981';
      ctx.lineWidth = 2;
      ctx.shadowColor = '#10B981';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(12, 12, 8, 0, Math.PI * 2);
      ctx.stroke();

      // Green Cross
      ctx.fillStyle = '#34D399';
      ctx.fillRect(10, 6, 4, 12);
      ctx.fillRect(6, 10, 12, 4);

      this.textures.addCanvas('repair_drone', canvas);
    }

    // 13. Combat Pickup: Ability Crate (Glowing Cyan Diamond)
    if (!this.textures.exists('pickup_powerup')) {
      const canvas = document.createElement('canvas');
      canvas.width = 24;
      canvas.height = 24;
      const ctx = canvas.getContext('2d');

      ctx.shadowColor = '#00E5FF';
      ctx.shadowBlur = 10;
      ctx.fillStyle = '#00E5FF';
      ctx.beginPath();
      ctx.moveTo(12, 2);
      ctx.lineTo(22, 12);
      ctx.lineTo(12, 22);
      ctx.lineTo(2, 12);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#060919';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('P', 12, 13);

      this.textures.addCanvas('pickup_powerup', canvas);
    }

    // 14. Heavy Boss Laser Bolt (32x16 Crimson/Gold Plasma)
    if (!this.textures.exists('boss_laser')) {
      const canvas = document.createElement('canvas');
      canvas.width = 16;
      canvas.height = 32;
      const ctx = canvas.getContext('2d');

      const grad = ctx.createLinearGradient(0, 0, 0, 32);
      grad.addColorStop(0, '#FFFFFF');
      grad.addColorStop(0.3, '#FF2DFF');
      grad.addColorStop(0.7, '#EF4444');
      grad.addColorStop(1, 'rgba(239, 68, 68, 0)');

      ctx.fillStyle = grad;
      ctx.shadowColor = '#FF2DFF';
      ctx.shadowBlur = 10;
      ctx.fillRect(3, 0, 10, 32);

      this.textures.addCanvas('boss_laser', canvas);
    }

    // 15. Sector 1 Boss: Orion Dreadnought (120x90)
    if (!this.textures.exists('boss_orion')) {
      const canvas = document.createElement('canvas');
      canvas.width = 120;
      canvas.height = 90;
      const ctx = canvas.getContext('2d');

      // Heavy Battleship Chassis
      ctx.fillStyle = '#0E172A';
      ctx.strokeStyle = '#00E5FF';
      ctx.lineWidth = 3;
      ctx.shadowColor = '#00E5FF';
      ctx.shadowBlur = 12;

      ctx.beginPath();
      ctx.moveTo(60, 85);
      ctx.lineTo(95, 55);
      ctx.lineTo(115, 20);
      ctx.lineTo(85, 10);
      ctx.lineTo(60, 25);
      ctx.lineTo(35, 10);
      ctx.lineTo(5, 20);
      ctx.lineTo(25, 55);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Wing Armor Panels
      ctx.fillStyle = '#1E293B';
      ctx.fillRect(30, 28, 60, 24);

      // Dual Forward Battery Turrets
      ctx.fillStyle = '#38BDF8';
      ctx.fillRect(20, 48, 8, 24);
      ctx.fillRect(92, 48, 8, 24);

      // Glowing Fusion Reactor Core
      ctx.fillStyle = '#F59E0B';
      ctx.shadowColor = '#F59E0B';
      ctx.shadowBlur = 14;
      ctx.beginPath();
      ctx.arc(60, 45, 10, 0, Math.PI * 2);
      ctx.fill();

      this.textures.addCanvas('boss_orion', canvas);
    }

    // 16. Sector 2 Boss: Crimson Colossus (130x96)
    if (!this.textures.exists('boss_colossus')) {
      const canvas = document.createElement('canvas');
      canvas.width = 130;
      canvas.height = 96;
      const ctx = canvas.getContext('2d');

      ctx.fillStyle = '#450A0A';
      ctx.strokeStyle = '#EF4444';
      ctx.lineWidth = 3;
      ctx.shadowColor = '#EF4444';
      ctx.shadowBlur = 14;

      // Heavy Hexagonal Juggernaut
      ctx.beginPath();
      ctx.moveTo(65, 92);
      ctx.lineTo(110, 60);
      ctx.lineTo(125, 25);
      ctx.lineTo(80, 8);
      ctx.lineTo(65, 22);
      ctx.lineTo(50, 8);
      ctx.lineTo(5, 25);
      ctx.lineTo(20, 60);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Heavy Plate Reinforcements
      ctx.fillStyle = '#18181B';
      ctx.fillRect(38, 25, 54, 30);

      // Quad Heavy Plasma Pods
      ctx.fillStyle = '#DC2626';
      ctx.fillRect(15, 30, 10, 28);
      ctx.fillRect(105, 30, 10, 28);

      // Pulsing Superheated Ruby Core
      ctx.fillStyle = '#F43F5E';
      ctx.shadowColor = '#F43F5E';
      ctx.shadowBlur = 16;
      ctx.beginPath();
      ctx.arc(65, 48, 12, 0, Math.PI * 2);
      ctx.fill();

      this.textures.addCanvas('boss_colossus', canvas);
    }

    // 17. Sector 3 Boss: Glacial Leviathan (130x100)
    if (!this.textures.exists('boss_leviathan')) {
      const canvas = document.createElement('canvas');
      canvas.width = 130;
      canvas.height = 100;
      const ctx = canvas.getContext('2d');

      ctx.fillStyle = '#082F49';
      ctx.strokeStyle = '#38BDF8';
      ctx.lineWidth = 3;
      ctx.shadowColor = '#38BDF8';
      ctx.shadowBlur = 14;

      // Crystalline Spiked Wings
      ctx.beginPath();
      ctx.moveTo(65, 95);
      ctx.lineTo(95, 60);
      ctx.lineTo(128, 35);
      ctx.lineTo(105, 12);
      ctx.lineTo(65, 30);
      ctx.lineTo(25, 12);
      ctx.lineTo(2, 35);
      ctx.lineTo(35, 60);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Crystal Spikes
      ctx.fillStyle = '#BAE6FD';
      ctx.beginPath();
      ctx.moveTo(65, 40);
      ctx.lineTo(75, 70);
      ctx.lineTo(65, 88);
      ctx.lineTo(55, 70);
      ctx.closePath();
      ctx.fill();

      // Cryo Core
      ctx.fillStyle = '#E0F2FE';
      ctx.shadowColor = '#38BDF8';
      ctx.shadowBlur = 18;
      ctx.beginPath();
      ctx.arc(65, 42, 11, 0, Math.PI * 2);
      ctx.fill();

      this.textures.addCanvas('boss_leviathan', canvas);
    }

    // 18. Sector 4 Boss: Rift Annihilator (140x105)
    if (!this.textures.exists('boss_rift')) {
      const canvas = document.createElement('canvas');
      canvas.width = 140;
      canvas.height = 105;
      const ctx = canvas.getContext('2d');

      ctx.fillStyle = '#1E1B4B';
      ctx.strokeStyle = '#A855F7';
      ctx.lineWidth = 3;
      ctx.shadowColor = '#A855F7';
      ctx.shadowBlur = 15;

      // Swept Dimensional Manta Wings
      ctx.beginPath();
      ctx.moveTo(70, 100);
      ctx.lineTo(110, 65);
      ctx.lineTo(138, 25);
      ctx.lineTo(95, 10);
      ctx.lineTo(70, 32);
      ctx.lineTo(45, 10);
      ctx.lineTo(2, 25);
      ctx.lineTo(30, 65);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Void Tendril Generators
      ctx.fillStyle = '#3B0764';
      ctx.fillRect(40, 30, 60, 32);

      // Swirling Antimatter Singularity Core
      ctx.fillStyle = '#C084FC';
      ctx.shadowColor = '#C084FC';
      ctx.shadowBlur = 20;
      ctx.beginPath();
      ctx.arc(70, 50, 13, 0, Math.PI * 2);
      ctx.fill();

      this.textures.addCanvas('boss_rift', canvas);
    }

    // 19. Sector 5 Apex Boss: Void Overlord (150x115)
    if (!this.textures.exists('boss_overlord')) {
      const canvas = document.createElement('canvas');
      canvas.width = 150;
      canvas.height = 115;
      const ctx = canvas.getContext('2d');

      ctx.fillStyle = '#09090B';
      ctx.strokeStyle = '#FBBF24';
      ctx.lineWidth = 3.5;
      ctx.shadowColor = '#FBBF24';
      ctx.shadowBlur = 16;

      // Sovereign Double-Swept Wings
      ctx.beginPath();
      ctx.moveTo(75, 110);
      ctx.lineTo(115, 75);
      ctx.lineTo(148, 30);
      ctx.lineTo(130, 8);
      ctx.lineTo(100, 16);
      ctx.lineTo(75, 35);
      ctx.lineTo(50, 16);
      ctx.lineTo(20, 8);
      ctx.lineTo(2, 30);
      ctx.lineTo(35, 75);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Imperial Gold Trim Plates
      ctx.fillStyle = '#78350F';
      ctx.fillRect(45, 28, 60, 38);

      // Blinding Quantum Ocular Cannon Eye
      ctx.fillStyle = '#FF2DFF';
      ctx.shadowColor = '#FF2DFF';
      ctx.shadowBlur = 22;
      ctx.beginPath();
      ctx.arc(75, 55, 14, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(75, 55, 5, 0, Math.PI * 2);
      ctx.fill();

      this.textures.addCanvas('boss_overlord', canvas);
    }
  }
}

export default BootScene;
