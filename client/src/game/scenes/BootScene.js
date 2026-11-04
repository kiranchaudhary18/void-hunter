import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  preload() {
    // Generate high-definition, realistic sci-fi game textures procedurally
    this.createProceduralTextures();
  }

  create() {
    // Retrieve combat parameters set by GameContainer registry and start combat scene cleanly once
    const combatData = this.game.registry.get('combatData');
    this.scene.start('SpaceCombatScene', combatData);
  }

  createProceduralTextures() {
    // Helper to create and register canvas texture
    const register = (key, width, height, drawFn) => {
      if (this.textures.exists(key)) return;
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      drawFn(ctx, width, height);
      this.textures.addCanvas(key, canvas);
    };

    // =========================================================================
    // 1. PLAYER SHIP: V-01 ORBITRON (Balanced Fighter) - 128x128
    // =========================================================================
    // =========================================================================
    // 1. PLAYER SHIP: S-01 ORBITRON (High-Tech Apex Starfighter) - 128x128
    // =========================================================================
    register('ship_orbitron', 128, 128, (ctx) => {
      // 1. High-Output Twin Hyper-Ion Afterburner Plume
      const plumeGlow = ctx.createRadialGradient(64, 114, 2, 64, 114, 26);
      plumeGlow.addColorStop(0, '#FFFFFF');
      plumeGlow.addColorStop(0.2, '#00E5FF');
      plumeGlow.addColorStop(0.55, '#2563EB');
      plumeGlow.addColorStop(0.85, '#1E1B4B');
      plumeGlow.addColorStop(1, 'transparent');
      ctx.fillStyle = plumeGlow;
      ctx.fillRect(28, 92, 72, 36);

      // 2. Mach Diamonds in Engine Exhaust
      ctx.fillStyle = '#FFFFFF';
      [104, 112, 120].forEach((y, i) => {
        ctx.globalAlpha = 0.9 - i * 0.25;
        ctx.beginPath();
        ctx.ellipse(54, y, 3, 2, 0, 0, Math.PI * 2);
        ctx.ellipse(74, y, 3, 2, 0, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1.0;

      // 3. Lower Stealth Keel & Aerodynamic Understructure
      ctx.fillStyle = '#030712';
      ctx.beginPath();
      ctx.moveTo(64, 6);
      ctx.lineTo(126, 94);
      ctx.lineTo(110, 112);
      ctx.lineTo(84, 98);
      ctx.lineTo(64, 118);
      ctx.lineTo(44, 98);
      ctx.lineTo(18, 112);
      ctx.lineTo(2, 94);
      ctx.closePath();
      ctx.fill();

      // 4. Primary Swept Titanium Delta Wings (Layered Metallic Sheen)
      const wingGrad = ctx.createLinearGradient(4, 0, 124, 0);
      wingGrad.addColorStop(0, '#0B1329');
      wingGrad.addColorStop(0.12, '#1E293B');
      wingGrad.addColorStop(0.28, '#334155');
      wingGrad.addColorStop(0.48, '#94A3B8');
      wingGrad.addColorStop(0.52, '#F1F5F9');
      wingGrad.addColorStop(0.72, '#334155');
      wingGrad.addColorStop(0.88, '#1E293B');
      wingGrad.addColorStop(1, '#0B1329');
      ctx.fillStyle = wingGrad;
      ctx.beginPath();
      ctx.moveTo(64, 10);
      ctx.lineTo(122, 90);
      ctx.lineTo(108, 106);
      ctx.lineTo(82, 94);
      ctx.lineTo(64, 112);
      ctx.lineTo(46, 94);
      ctx.lineTo(20, 106);
      ctx.lineTo(6, 90);
      ctx.closePath();
      ctx.fill();

      // 5. Outer Armor Chine Facets (Dark Carbon-Composite)
      ctx.fillStyle = '#080E1C';
      // Left Facet
      ctx.beginPath();
      ctx.moveTo(6, 90);
      ctx.lineTo(34, 64);
      ctx.lineTo(46, 88);
      ctx.lineTo(20, 106);
      ctx.closePath();
      ctx.fill();
      // Right Facet
      ctx.beginPath();
      ctx.moveTo(122, 90);
      ctx.lineTo(94, 64);
      ctx.lineTo(82, 88);
      ctx.lineTo(108, 106);
      ctx.closePath();
      ctx.fill();

      // 6. Active Plasma Energy Conduits & Wing Embellishments
      ctx.strokeStyle = '#00E5FF';
      ctx.lineWidth = 1.6;
      ctx.shadowColor = '#00E5FF';
      ctx.shadowBlur = 6;
      ctx.beginPath();
      // Wing conduits
      ctx.moveTo(64, 30); ctx.lineTo(34, 64); ctx.lineTo(16, 92);
      ctx.moveTo(64, 30); ctx.lineTo(94, 64); ctx.lineTo(112, 92);
      // Lateral energy vents
      ctx.moveTo(42, 78); ctx.lineTo(24, 98);
      ctx.moveTo(86, 78); ctx.lineTo(104, 98);
      ctx.stroke();
      ctx.shadowBlur = 0;

      // 7. Central Armored Fuselage Chassis (Raised Spined Hull)
      const fuseGrad = ctx.createLinearGradient(48, 0, 80, 0);
      fuseGrad.addColorStop(0, '#0F172A');
      fuseGrad.addColorStop(0.2, '#1E293B');
      fuseGrad.addColorStop(0.5, '#E2E8F0');
      fuseGrad.addColorStop(0.8, '#1E293B');
      fuseGrad.addColorStop(1, '#0F172A');
      ctx.fillStyle = fuseGrad;
      ctx.beginPath();
      ctx.moveTo(64, 8);
      ctx.lineTo(76, 36);
      ctx.lineTo(77, 96);
      ctx.lineTo(64, 110);
      ctx.lineTo(51, 96);
      ctx.lineTo(52, 36);
      ctx.closePath();
      ctx.fill();

      // 8. Fuselage Armor Seams, Spines & Rivet Details
      ctx.strokeStyle = '#020617';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(64, 10); ctx.lineTo(64, 108);
      ctx.moveTo(52, 42); ctx.lineTo(76, 42);
      ctx.moveTo(51, 72); ctx.lineTo(77, 72);
      ctx.stroke();

      // Micro Heat-Sink Rivets
      ctx.fillStyle = '#64748B';
      [46, 56, 66, 76, 86].forEach((y) => {
        ctx.fillRect(49, y, 1.5, 1.5);
        ctx.fillRect(77, y, 1.5, 1.5);
      });

      // 9. Twin Heavy Wingtip Rail Cannons
      const cannonGrad = ctx.createLinearGradient(0, 48, 0, 94);
      cannonGrad.addColorStop(0, '#E2E8F0');
      cannonGrad.addColorStop(0.4, '#475569');
      cannonGrad.addColorStop(1, '#0F172A');
      ctx.fillStyle = cannonGrad;
      // Left Cannon Barrel
      ctx.fillRect(4, 50, 7, 40);
      ctx.fillRect(3, 80, 9, 6);
      // Right Cannon Barrel
      ctx.fillRect(117, 50, 7, 40);
      ctx.fillRect(116, 80, 9, 6);

      // Glowing Plasma Muzzle Tips
      ctx.fillStyle = '#00E5FF';
      ctx.shadowColor = '#00E5FF';
      ctx.shadowBlur = 8;
      ctx.fillRect(5, 46, 5, 6);
      ctx.fillRect(118, 46, 5, 6);
      ctx.shadowBlur = 0;

      // 10. Central Glowing Fusion Core (Dorsal Spine Arc Reactor)
      const coreGrad = ctx.createRadialGradient(64, 76, 1, 64, 76, 7);
      coreGrad.addColorStop(0, '#FFFFFF');
      coreGrad.addColorStop(0.4, '#00E5FF');
      coreGrad.addColorStop(0.8, '#2563EB');
      coreGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = coreGrad;
      ctx.beginPath();
      ctx.arc(64, 76, 7, 0, Math.PI * 2);
      ctx.fill();

      // 11. Multi-Faceted Sapphire Cockpit Canopy
      const canopyGrad = ctx.createLinearGradient(54, 26, 74, 66);
      canopyGrad.addColorStop(0, '#38BDF8');
      canopyGrad.addColorStop(0.35, '#0284C7');
      canopyGrad.addColorStop(0.7, '#0369A1');
      canopyGrad.addColorStop(1, '#082F49');
      ctx.fillStyle = canopyGrad;
      ctx.beginPath();
      ctx.ellipse(64, 42, 8, 20, 0, 0, Math.PI * 2);
      ctx.fill();

      // Pilot Holographic HUD Glare Arc
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.lineWidth = 2.0;
      ctx.beginPath();
      ctx.arc(63, 40, 13, -Math.PI * 0.75, -Math.PI * 0.2);
      ctx.stroke();

      // 12. Twin Vector Thruster Nozzles & Thermal Rings
      ctx.fillStyle = '#1E293B';
      ctx.fillRect(49, 96, 11, 10);
      ctx.fillRect(68, 96, 11, 10);
      ctx.fillStyle = '#F59E0B';
      ctx.fillRect(50, 104, 9, 3);
      ctx.fillRect(69, 104, 9, 3);

      // 13. Tactical Formation Strobe Beacons
      ctx.fillStyle = '#EF4444'; // Port red
      ctx.beginPath(); ctx.arc(7, 88, 3, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#10B981'; // Starboard green
      ctx.beginPath(); ctx.arc(121, 88, 3, 0, Math.PI * 2); ctx.fill();
    });

    // =========================================================================
    // 2. PLAYER SHIP: S-02 PHOENIX (Striker Interceptor) - 128x128
    // =========================================================================
    register('ship_phoenix', 128, 128, (ctx) => {
      // Fiery Engine Glow
      const fireGlow = ctx.createRadialGradient(64, 108, 2, 64, 108, 22);
      fireGlow.addColorStop(0, '#FFFFFF');
      fireGlow.addColorStop(0.3, '#FBBF24');
      fireGlow.addColorStop(0.7, '#EF4444');
      fireGlow.addColorStop(1, 'transparent');
      ctx.fillStyle = fireGlow;
      ctx.fillRect(36, 92, 56, 36);

      // Swept Crimson Razor Wings
      const wingGrad = ctx.createLinearGradient(0, 0, 128, 0);
      wingGrad.addColorStop(0, '#7F1D1D');
      wingGrad.addColorStop(0.2, '#B91C1C');
      wingGrad.addColorStop(0.5, '#EF4444');
      wingGrad.addColorStop(0.8, '#B91C1C');
      wingGrad.addColorStop(1, '#7F1D1D');
      ctx.fillStyle = wingGrad;
      ctx.beginPath();
      ctx.moveTo(64, 8);
      ctx.lineTo(124, 82);
      ctx.lineTo(108, 98);
      ctx.lineTo(88, 86);
      ctx.lineTo(64, 112);
      ctx.lineTo(40, 86);
      ctx.lineTo(20, 98);
      ctx.lineTo(4, 82);
      ctx.closePath();
      ctx.fill();

      // Gold Trim Inlays
      ctx.fillStyle = '#F59E0B';
      ctx.shadowColor = '#FBBF24';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.moveTo(64, 16);
      ctx.lineTo(72, 42);
      ctx.lineTo(112, 82);
      ctx.lineTo(104, 88);
      ctx.lineTo(68, 52);
      ctx.lineTo(64, 75);
      ctx.lineTo(60, 52);
      ctx.lineTo(24, 88);
      ctx.lineTo(16, 82);
      ctx.lineTo(56, 42);
      ctx.closePath();
      ctx.fill();
      ctx.shadowBlur = 0;

      // Dark Carbon Fuselage
      ctx.fillStyle = '#1C1917';
      ctx.beginPath();
      ctx.moveTo(64, 12);
      ctx.lineTo(74, 45);
      ctx.lineTo(70, 98);
      ctx.lineTo(64, 106);
      ctx.lineTo(58, 98);
      ctx.lineTo(54, 45);
      ctx.closePath();
      ctx.fill();

      // Cockpit Canopy (Amber Gold with Specular Highlight)
      const glass = ctx.createLinearGradient(58, 28, 70, 60);
      glass.addColorStop(0, '#FEF08A');
      glass.addColorStop(0.5, '#F59E0B');
      glass.addColorStop(1, '#78350F');
      ctx.fillStyle = glass;
      ctx.beginPath();
      ctx.ellipse(64, 44, 5, 16, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.arc(63, 42, 10, -Math.PI * 0.7, -Math.PI * 0.2);
      ctx.stroke();

      // Quad Rear Thrusters
      [48, 56, 68, 76].forEach((x) => {
        ctx.fillStyle = '#44403C';
        ctx.fillRect(x - 2, 98, 5, 8);
        ctx.fillStyle = '#F97316';
        ctx.fillRect(x - 1, 104, 3, 4);
      });
    });

    // =========================================================================
    // 3. PLAYER SHIP: X-03 SHADOW (Ghost Infiltrator) - 128x128
    // =========================================================================
    register('ship_shadow', 128, 128, (ctx) => {
      // Violet Warp Core Glow
      const warpGlow = ctx.createRadialGradient(64, 70, 2, 64, 70, 30);
      warpGlow.addColorStop(0, 'rgba(216, 180, 254, 0.9)');
      warpGlow.addColorStop(0.5, 'rgba(147, 51, 234, 0.5)');
      warpGlow.addColorStop(1, 'transparent');
      ctx.fillStyle = warpGlow;
      ctx.fillRect(34, 40, 60, 60);

      // Stealth Faceted Hull (Matte Charcoal & Violet)
      ctx.fillStyle = '#090514';
      ctx.beginPath();
      ctx.moveTo(64, 10);
      ctx.lineTo(122, 64);
      ctx.lineTo(110, 100);
      ctx.lineTo(84, 88);
      ctx.lineTo(64, 114);
      ctx.lineTo(44, 88);
      ctx.lineTo(18, 100);
      ctx.lineTo(6, 64);
      ctx.closePath();
      ctx.fill();

      // Angular Armor Facets
      const facetGrad = ctx.createLinearGradient(0, 0, 128, 128);
      facetGrad.addColorStop(0, '#1E1B4B');
      facetGrad.addColorStop(0.5, '#3B0764');
      facetGrad.addColorStop(1, '#0F172A');
      ctx.fillStyle = facetGrad;
      ctx.beginPath();
      ctx.moveTo(64, 14);
      ctx.lineTo(114, 66);
      ctx.lineTo(82, 84);
      ctx.lineTo(64, 106);
      ctx.lineTo(46, 84);
      ctx.lineTo(14, 66);
      ctx.closePath();
      ctx.fill();

      // Violet Energy Conduits
      ctx.strokeStyle = '#C084FC';
      ctx.shadowColor = '#A855F7';
      ctx.shadowBlur = 10;
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(64, 20); ctx.lineTo(64, 95);
      ctx.moveTo(64, 35); ctx.lineTo(100, 70);
      ctx.moveTo(64, 35); ctx.lineTo(28, 70);
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Cockpit Sensor Slit
      ctx.fillStyle = '#F472B6';
      ctx.shadowColor = '#F472B6';
      ctx.shadowBlur = 6;
      ctx.beginPath();
      ctx.ellipse(64, 45, 3, 12, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    });

    // =========================================================================
    // 4. PLAYER SHIP: R-04 TITAN (Armored Dreadnought) - 128x128
    // =========================================================================
    register('ship_titan', 128, 128, (ctx) => {
      // Heavy Steel Armor Plating with Rivets
      const steelGrad = ctx.createLinearGradient(10, 0, 118, 0);
      steelGrad.addColorStop(0, '#1E293B');
      steelGrad.addColorStop(0.3, '#475569');
      steelGrad.addColorStop(0.5, '#94A3B8');
      steelGrad.addColorStop(0.7, '#475569');
      steelGrad.addColorStop(1, '#1E293B');

      ctx.fillStyle = '#0B0F19';
      ctx.fillRect(20, 24, 88, 86);

      ctx.fillStyle = steelGrad;
      ctx.beginPath();
      ctx.moveTo(64, 16);
      ctx.lineTo(106, 32);
      ctx.lineTo(112, 94);
      ctx.lineTo(88, 104);
      ctx.lineTo(64, 112);
      ctx.lineTo(40, 104);
      ctx.lineTo(16, 94);
      ctx.lineTo(22, 32);
      ctx.closePath();
      ctx.fill();

      // Industrial Hazard Chevrons (Orange/Black)
      ctx.fillStyle = '#F97316';
      ctx.fillRect(26, 40, 14, 4);
      ctx.fillRect(88, 40, 14, 4);
      ctx.fillRect(28, 50, 14, 4);
      ctx.fillRect(86, 50, 14, 4);

      // Heavy Twin Gun Sponsons
      ctx.fillStyle = '#334155';
      ctx.fillRect(10, 36, 12, 44);
      ctx.fillRect(106, 36, 12, 44);

      // Armored Command Bridge
      ctx.fillStyle = '#F59E0B';
      ctx.shadowColor = '#FBBF24';
      ctx.shadowBlur = 8;
      ctx.fillRect(52, 42, 24, 8);
      ctx.shadowBlur = 0;

      // Triple Heavy Thrusters
      [42, 64, 86].forEach((x) => {
        ctx.fillStyle = '#0F172A';
        ctx.fillRect(x - 6, 102, 12, 10);
        ctx.fillStyle = '#EA580C';
        ctx.fillRect(x - 4, 108, 8, 4);
      });
    });

    // =========================================================================
    // 5. PLAYER SHIP: Z-05 NOVA (Quantum Experimental) - 128x128
    // =========================================================================
    register('ship_nova', 128, 128, (ctx) => {
      // Central Antimatter Singularity Core (Pulsing Gradient)
      const core = ctx.createRadialGradient(64, 60, 4, 64, 60, 26);
      core.addColorStop(0, '#FFFFFF');
      core.addColorStop(0.3, '#06B6D4');
      core.addColorStop(0.7, '#A855F7');
      core.addColorStop(1, 'transparent');
      ctx.fillStyle = core;
      ctx.beginPath();
      ctx.arc(64, 60, 26, 0, Math.PI * 2);
      ctx.fill();

      // Catamaran Twin-Boom Outriggers (Left & Right)
      const boomGrad = ctx.createLinearGradient(0, 0, 128, 0);
      boomGrad.addColorStop(0, '#0E7490');
      boomGrad.addColorStop(0.5, '#67E8F9');
      boomGrad.addColorStop(1, '#0E7490');

      // Left Boom
      ctx.fillStyle = boomGrad;
      ctx.beginPath();
      ctx.moveTo(28, 10);
      ctx.lineTo(40, 36);
      ctx.lineTo(38, 104);
      ctx.lineTo(24, 110);
      ctx.lineTo(16, 96);
      ctx.lineTo(18, 36);
      ctx.closePath();
      ctx.fill();

      // Right Boom
      ctx.beginPath();
      ctx.moveTo(100, 10);
      ctx.lineTo(110, 36);
      ctx.lineTo(112, 96);
      ctx.lineTo(104, 110);
      ctx.lineTo(90, 104);
      ctx.lineTo(88, 36);
      ctx.closePath();
      ctx.fill();

      // Center Bridge Arch
      ctx.fillStyle = '#164E63';
      ctx.fillRect(38, 54, 52, 12);
      ctx.fillRect(38, 82, 52, 10);
    });

    // =========================================================================
    // 6. REALISTIC TACTICAL HOMING MISSILE (36x84)
    // =========================================================================
    register('homing_missile', 36, 84, (ctx) => {
      // 3D Cylindrical Shaded Fuselage
      const bodyGrad = ctx.createLinearGradient(10, 0, 26, 0);
      bodyGrad.addColorStop(0, '#1E293B');
      bodyGrad.addColorStop(0.3, '#475569');
      bodyGrad.addColorStop(0.5, '#F1F5F9'); // Bright longitudinal specular shine
      bodyGrad.addColorStop(0.8, '#475569');
      bodyGrad.addColorStop(1, '#0F172A');
      ctx.fillStyle = bodyGrad;
      ctx.beginPath();
      ctx.moveTo(18, 4);       // Apex
      ctx.lineTo(25, 20);      // Warhead base
      ctx.lineTo(25, 62);      // Tail
      ctx.lineTo(11, 62);
      ctx.lineTo(11, 20);
      ctx.closePath();
      ctx.fill();

      // Aerodynamic Conical Warhead (Crimson Strike Tip)
      const warhead = ctx.createLinearGradient(11, 4, 25, 20);
      warhead.addColorStop(0, '#EF4444');
      warhead.addColorStop(1, '#991B1B');
      ctx.fillStyle = warhead;
      ctx.beginPath();
      ctx.moveTo(18, 4);
      ctx.lineTo(25, 20);
      ctx.lineTo(11, 20);
      ctx.closePath();
      ctx.fill();

      // Hazard Stripes & Arming Bands
      ctx.fillStyle = '#F59E0B';
      ctx.fillRect(11, 24, 14, 3);
      ctx.fillStyle = '#000000';
      ctx.fillRect(11, 27, 14, 2);
      ctx.fillStyle = '#F59E0B';
      ctx.fillRect(11, 29, 14, 3);

      // 4 Cruciform Delta Stabilizing Fins
      ctx.fillStyle = '#334155';
      // Left Fin
      ctx.beginPath();
      ctx.moveTo(11, 48); ctx.lineTo(2, 66); ctx.lineTo(11, 62);
      ctx.closePath(); ctx.fill();
      // Right Fin
      ctx.beginPath();
      ctx.moveTo(25, 48); ctx.lineTo(34, 66); ctx.lineTo(25, 62);
      ctx.closePath(); ctx.fill();

      // Rocket Exhaust Flare
      const rocketFlame = ctx.createLinearGradient(18, 62, 18, 84);
      rocketFlame.addColorStop(0, '#FFFFFF');
      rocketFlame.addColorStop(0.3, '#FBBF24');
      rocketFlame.addColorStop(0.7, '#EA580C');
      rocketFlame.addColorStop(1, 'transparent');
      ctx.fillStyle = rocketFlame;
      ctx.beginPath();
      ctx.moveTo(13, 62);
      ctx.lineTo(18, 84);
      ctx.lineTo(23, 62);
      ctx.closePath();
      ctx.fill();
    });

    // =========================================================================
    // 7. HIGH ENERGY PLAYER LASER (24x64)
    // =========================================================================
    register('player_laser', 24, 64, (ctx) => {
      // Outer Soft Electric Cyan Plasma Aura
      const outerGlow = ctx.createRadialGradient(12, 18, 2, 12, 18, 16);
      outerGlow.addColorStop(0, 'rgba(0, 229, 255, 0.95)');
      outerGlow.addColorStop(0.4, 'rgba(14, 165, 233, 0.5)');
      outerGlow.addColorStop(1, 'transparent');
      ctx.fillStyle = outerGlow;
      ctx.fillRect(0, 0, 24, 42);

      // High-Energy Aerodynamic Plasma Needle
      const boltGrad = ctx.createLinearGradient(12, 2, 12, 62);
      boltGrad.addColorStop(0, '#FFFFFF');
      boltGrad.addColorStop(0.15, '#67E8F9');
      boltGrad.addColorStop(0.7, '#0284C7');
      boltGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = boltGrad;
      ctx.beginPath();
      ctx.moveTo(12, 2);
      ctx.lineTo(18, 14);
      ctx.lineTo(16, 58);
      ctx.lineTo(8, 58);
      ctx.lineTo(6, 14);
      ctx.closePath();
      ctx.fill();

      // Brilliant White-Hot Laser Core
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.ellipse(12, 12, 3.5, 11, 0, 0, Math.PI * 2);
      ctx.fill();
    });

    // =========================================================================
    // 8. ENEMY SCOUT (Cybernetic Void Predator Raider - Facing Down) - 110x110
    // =========================================================================
    register('enemy_scout', 110, 110, (ctx) => {
      // 1. Dual Heavy Ion Exhaust Plumes (Facing Downward Flight, Venting Upwards)
      const plumeGlow = ctx.createRadialGradient(55, 12, 2, 55, 12, 22);
      plumeGlow.addColorStop(0, '#FFFFFF');
      plumeGlow.addColorStop(0.25, '#F59E0B');
      plumeGlow.addColorStop(0.6, '#DC2626');
      plumeGlow.addColorStop(0.85, '#7F1D1D');
      plumeGlow.addColorStop(1, 'transparent');
      ctx.fillStyle = plumeGlow;
      ctx.fillRect(24, 0, 62, 28);

      // 2. Underlying Carbon-Composite Chassis & Underwing Shadow
      ctx.fillStyle = '#080A10';
      ctx.beginPath();
      ctx.moveTo(55, 106); // Piercing forward prow
      ctx.lineTo(108, 22);
      ctx.lineTo(94, 10);
      ctx.lineTo(72, 24);
      ctx.lineTo(55, 12);
      ctx.lineTo(38, 24);
      ctx.lineTo(16, 10);
      ctx.lineTo(2, 22);
      ctx.closePath();
      ctx.fill();

      // 3. Menacing Obsidian-Crimson Primary Wings (Predatory Faceted Armor)
      const scoutGrad = ctx.createLinearGradient(4, 0, 106, 0);
      scoutGrad.addColorStop(0, '#1E0A12');
      scoutGrad.addColorStop(0.18, '#7F1D1D');
      scoutGrad.addColorStop(0.35, '#991B1B');
      scoutGrad.addColorStop(0.5, '#EF4444');
      scoutGrad.addColorStop(0.65, '#991B1B');
      scoutGrad.addColorStop(0.82, '#7F1D1D');
      scoutGrad.addColorStop(1, '#1E0A12');
      ctx.fillStyle = scoutGrad;
      ctx.beginPath();
      ctx.moveTo(55, 102);
      ctx.lineTo(104, 24);
      ctx.lineTo(92, 14);
      ctx.lineTo(70, 26);
      ctx.lineTo(55, 16);
      ctx.lineTo(40, 26);
      ctx.lineTo(18, 14);
      ctx.lineTo(6, 24);
      ctx.closePath();
      ctx.fill();

      // 4. Serrated Armor Plating Plates (Dark Gunmetal Stealth Chines)
      ctx.fillStyle = '#0F172A';
      // Left Mandible Armor Plate
      ctx.beginPath();
      ctx.moveTo(55, 90);
      ctx.lineTo(26, 32);
      ctx.lineTo(44, 38);
      ctx.lineTo(55, 26);
      ctx.closePath();
      ctx.fill();
      // Right Mandible Armor Plate
      ctx.beginPath();
      ctx.moveTo(55, 90);
      ctx.lineTo(84, 32);
      ctx.lineTo(66, 38);
      ctx.lineTo(55, 26);
      ctx.closePath();
      ctx.fill();

      // 5. Glowing Crimson Energy Conduit Seams
      ctx.strokeStyle = '#FF1E27';
      ctx.lineWidth = 1.4;
      ctx.shadowColor = '#FF1E27';
      ctx.shadowBlur = 6;
      ctx.beginPath();
      ctx.moveTo(55, 26); ctx.lineTo(30, 36); ctx.lineTo(12, 28);
      ctx.moveTo(55, 26); ctx.lineTo(80, 36); ctx.lineTo(98, 28);
      ctx.moveTo(55, 68); ctx.lineTo(28, 52);
      ctx.moveTo(55, 68); ctx.lineTo(82, 52);
      ctx.stroke();
      ctx.shadowBlur = 0;

      // 6. Central Void Singularity Core (Dark Pulsing Reactor)
      const coreGrad = ctx.createRadialGradient(55, 46, 1, 55, 46, 8);
      coreGrad.addColorStop(0, '#FFFFFF');
      coreGrad.addColorStop(0.3, '#FF1E27');
      coreGrad.addColorStop(0.7, '#7F1D1D');
      coreGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = coreGrad;
      ctx.beginPath();
      ctx.arc(55, 46, 8, 0, Math.PI * 2);
      ctx.fill();

      // 7. Intimidating Cybernetic Ocular Slit Scanner (Apex Predator Visor)
      const visorGrad = ctx.createLinearGradient(40, 68, 70, 68);
      visorGrad.addColorStop(0, 'rgba(255, 30, 39, 0)');
      visorGrad.addColorStop(0.25, '#FF1E27');
      visorGrad.addColorStop(0.5, '#FFFFFF');
      visorGrad.addColorStop(0.75, '#FF1E27');
      visorGrad.addColorStop(1, 'rgba(255, 30, 39, 0)');
      ctx.fillStyle = visorGrad;
      ctx.shadowColor = '#FF1E27';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.ellipse(55, 68, 16, 3.5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Precision Targeting Optic Bead
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(55, 68, 2, 0, Math.PI * 2);
      ctx.fill();

      // 8. Dual Heavy Wingtip Siege Plasma Cannons
      const gunGrad = ctx.createLinearGradient(0, 20, 0, 58);
      gunGrad.addColorStop(0, '#64748B');
      gunGrad.addColorStop(0.5, '#1E293B');
      gunGrad.addColorStop(1, '#020617');
      ctx.fillStyle = gunGrad;
      // Left Cannon
      ctx.fillRect(4, 22, 7, 34);
      // Right Cannon
      ctx.fillRect(99, 22, 7, 34);

      // Glowing Plasma Weapon Muzzles
      ctx.fillStyle = '#FF1E27';
      ctx.shadowColor = '#FF1E27';
      ctx.shadowBlur = 8;
      ctx.fillRect(5, 52, 5, 6);
      ctx.fillRect(100, 52, 5, 6);
      ctx.shadowBlur = 0;

      // 9. Rear Vector Thruster Flaps
      ctx.fillStyle = '#F59E0B';
      ctx.fillRect(41, 10, 8, 3);
      ctx.fillRect(61, 10, 8, 3);
    });

    // =========================================================================
    // 9. ENEMY INTERCEPTOR (Mandible Predator Raider - Violet & Dark Steel)
    // =========================================================================
    register('enemy_interceptor', 116, 116, (ctx) => {
      // 1. Top Warp Drive Glow
      const warpGlow = ctx.createRadialGradient(58, 14, 2, 58, 14, 18);
      warpGlow.addColorStop(0, '#FFFFFF');
      warpGlow.addColorStop(0.4, '#C084FC');
      warpGlow.addColorStop(0.8, '#7E22CE');
      warpGlow.addColorStop(1, 'transparent');
      ctx.fillStyle = warpGlow;
      ctx.fillRect(36, 0, 44, 24);

      // 2. Predatory Scythe Mandibles (Facing Down)
      const bladeGrad = ctx.createLinearGradient(0, 0, 116, 0);
      bladeGrad.addColorStop(0, '#3B0764');
      bladeGrad.addColorStop(0.2, '#6B21A8');
      bladeGrad.addColorStop(0.5, '#A855F7');
      bladeGrad.addColorStop(0.8, '#6B21A8');
      bladeGrad.addColorStop(1, '#3B0764');
      ctx.fillStyle = bladeGrad;

      // Dual Forward-Reaching Mandibles
      ctx.beginPath();
      ctx.moveTo(58, 70);
      ctx.lineTo(108, 108);  // Right mandible tip
      ctx.lineTo(114, 38);
      ctx.lineTo(92, 16);
      ctx.lineTo(58, 26);
      ctx.lineTo(24, 16);
      ctx.lineTo(2, 38);
      ctx.lineTo(8, 108);    // Left mandible tip
      ctx.closePath();
      ctx.fill();

      // 3. Central Armored Fuselage Chassis
      ctx.fillStyle = '#0F172A';
      ctx.beginPath();
      ctx.moveTo(58, 88);
      ctx.lineTo(84, 40);
      ctx.lineTo(76, 20);
      ctx.lineTo(40, 20);
      ctx.lineTo(32, 40);
      ctx.closePath();
      ctx.fill();

      // 4. Glowing Void Singularity Core
      ctx.fillStyle = '#E879F9';
      ctx.beginPath();
      ctx.arc(58, 48, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(58, 48, 4, 0, Math.PI * 2);
      ctx.fill();

      // Mandible Plasma Emitter Tips
      ctx.fillStyle = '#C084FC';
      ctx.fillRect(6, 102, 5, 8);
      ctx.fillRect(105, 102, 5, 8);
    });

    // =========================================================================
    // 10. ENEMY CRUISER (Armored Heavy Battlecruiser - Hex Citadel)
    // =========================================================================
    register('enemy_cruiser', 130, 130, (ctx) => {
      // 1. Reinforced Hexagonal Heavy Gunmetal Hull
      const hullGrad = ctx.createLinearGradient(8, 0, 122, 0);
      hullGrad.addColorStop(0, '#0F172A');
      hullGrad.addColorStop(0.25, '#334155');
      hullGrad.addColorStop(0.5, '#64748B');
      hullGrad.addColorStop(0.75, '#334155');
      hullGrad.addColorStop(1, '#0F172A');
      ctx.fillStyle = hullGrad;
      ctx.beginPath();
      ctx.moveTo(65, 118);
      ctx.lineTo(118, 62);
      ctx.lineTo(124, 20);
      ctx.lineTo(94, 14);
      ctx.lineTo(65, 22);
      ctx.lineTo(36, 14);
      ctx.lineTo(6, 20);
      ctx.lineTo(12, 62);
      ctx.closePath();
      ctx.fill();

      // 2. Reinforced Beveled Armor Plates & Riveted Seams
      ctx.strokeStyle = '#020617';
      ctx.lineWidth = 2.2;
      ctx.stroke();

      // 3. Heavy Twin Flank Artillery Turrets (Left & Right)
      ctx.fillStyle = '#1E293B';
      ctx.fillRect(16, 50, 14, 32);
      ctx.fillRect(100, 50, 14, 32);
      // Twin Gun Barrels
      ctx.fillStyle = '#94A3B8';
      ctx.fillRect(18, 80, 4, 14);
      ctx.fillRect(24, 80, 4, 14);
      ctx.fillRect(102, 80, 4, 14);
      ctx.fillRect(108, 80, 4, 14);

      // 4. Armored Command Deck & Amber Sensor Bridge
      ctx.fillStyle = '#F59E0B';
      ctx.fillRect(52, 42, 26, 12);
      ctx.fillStyle = '#FEF08A';
      ctx.fillRect(56, 45, 18, 5);

      // 5. Pulsing Nuclear Core Reactor Vents
      ctx.fillStyle = '#EA580C';
      ctx.fillRect(54, 70, 22, 8);
      ctx.fillStyle = '#FBBF24';
      ctx.fillRect(58, 72, 14, 4);
    });

    // =========================================================================
    // 11. ENEMY GUNSHIP (Sniper Railgun Craft)
    // =========================================================================
    register('enemy_gunship', 120, 130, (ctx) => {
      // 1. Long Electromagnetic Railgun Protruding Forward
      const railGrad = ctx.createLinearGradient(55, 0, 65, 0);
      railGrad.addColorStop(0, '#1E293B');
      railGrad.addColorStop(0.5, '#CBD5E1');
      railGrad.addColorStop(1, '#1E293B');
      ctx.fillStyle = railGrad;
      ctx.fillRect(57, 16, 6, 104);

      // 2. Glowing Magnetic Accelerator Coils
      ctx.fillStyle = '#00E5FF';
      for (let y = 30; y <= 105; y += 15) {
        ctx.fillRect(54, y, 12, 3);
      }

      // 3. Stabilizer Armor Fins
      ctx.fillStyle = '#0F172A';
      ctx.beginPath();
      ctx.moveTo(60, 24);
      ctx.lineTo(114, 46);
      ctx.lineTo(104, 78);
      ctx.lineTo(68, 56);
      ctx.lineTo(52, 56);
      ctx.lineTo(16, 78);
      ctx.lineTo(6, 46);
      ctx.closePath();
      ctx.fill();

      // Precision Targeting Optic
      ctx.fillStyle = '#EF4444';
      ctx.beginPath();
      ctx.arc(60, 36, 4, 0, Math.PI * 2);
      ctx.fill();
    });

    // =========================================================================
    // 12. ENEMY ELITE (Shielded Heavy Command Craft) - 130x130
    // =========================================================================
    register('enemy_elite', 130, 130, (ctx) => {
      // Hexagonal Shield Matrix (Translucent Cyan Lattice)
      ctx.strokeStyle = 'rgba(0, 229, 255, 0.4)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(65, 65, 58, 0, Math.PI * 2);
      ctx.stroke();

      // Gold-Trimmed Obsidian Hull
      const eliteGrad = ctx.createLinearGradient(0, 0, 130, 0);
      eliteGrad.addColorStop(0, '#0F172A');
      eliteGrad.addColorStop(0.5, '#334155');
      eliteGrad.addColorStop(1, '#0F172A');
      ctx.fillStyle = eliteGrad;
      ctx.beginPath();
      ctx.moveTo(65, 116);
      ctx.lineTo(118, 50);
      ctx.lineTo(102, 18);
      ctx.lineTo(65, 32);
      ctx.lineTo(28, 18);
      ctx.lineTo(12, 50);
      ctx.closePath();
      ctx.fill();

      // Gold Trim
      ctx.strokeStyle = '#FBBF24';
      ctx.shadowColor = '#FBBF24';
      ctx.shadowBlur = 8;
      ctx.lineWidth = 2.5;
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Glowing Core Eye
      ctx.fillStyle = '#EF4444';
      ctx.shadowColor = '#EF4444';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(65, 58, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    });

    // =========================================================================
    // 13. HOSTILE HYPER-PLASMA LANCE (24x36 - Downward Projectile)
    // =========================================================================
    register('enemy_bullet', 24, 36, (ctx) => {
      // 1. Outer Ionization Sheath & Crimson Glow
      const glowGrad = ctx.createRadialGradient(12, 22, 2, 12, 22, 12);
      glowGrad.addColorStop(0, '#FFFFFF');
      glowGrad.addColorStop(0.25, '#FF2D55');
      glowGrad.addColorStop(0.65, '#EF4444');
      glowGrad.addColorStop(0.9, '#7F1D1D');
      glowGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.ellipse(12, 20, 11, 14, 0, 0, Math.PI * 2);
      ctx.fill();

      // 2. Trailing Supersonic Plasma Exhaust Tail (Facing Upward at Tail)
      const tailGrad = ctx.createLinearGradient(0, 0, 0, 24);
      tailGrad.addColorStop(0, 'transparent');
      tailGrad.addColorStop(0.4, 'rgba(239, 68, 68, 0.45)');
      tailGrad.addColorStop(0.8, '#FF1E27');
      tailGrad.addColorStop(1, '#FEF08A');
      ctx.fillStyle = tailGrad;
      ctx.beginPath();
      ctx.moveTo(12, 2);
      ctx.lineTo(19, 20);
      ctx.lineTo(12, 33); // Arrow tip
      ctx.lineTo(5, 20);
      ctx.closePath();
      ctx.fill();

      // 3. Piercing White-Hot Sabot Core (Needle Spike)
      const coreGrad = ctx.createLinearGradient(0, 10, 0, 34);
      coreGrad.addColorStop(0, '#FEF08A');
      coreGrad.addColorStop(0.5, '#FFFFFF');
      coreGrad.addColorStop(1, '#FEF08A');
      ctx.fillStyle = coreGrad;
      ctx.beginPath();
      ctx.moveTo(12, 8);
      ctx.lineTo(15, 22);
      ctx.lineTo(12, 34); // Razor needle point
      ctx.lineTo(9, 22);
      ctx.closePath();
      ctx.fill();

      // 4. Supersonic Energy Shock Ring
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.ellipse(12, 22, 6, 2, 0, 0, Math.PI * 2);
      ctx.stroke();
    });

    // =========================================================================
    // 14. HEAVY BOSS LASER BEAM (44x96)
    // =========================================================================
    register('boss_laser', 44, 96, (ctx) => {
      const grad = ctx.createLinearGradient(22, 0, 22, 96);
      grad.addColorStop(0, '#FFFFFF');
      grad.addColorStop(0.2, '#F43F5E');
      grad.addColorStop(0.7, '#9333EA');
      grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.ellipse(22, 48, 12, 44, 0, 0, Math.PI * 2);
      ctx.fill();
    });

    // =========================================================================
    // 15. SECTOR 1 BOSS: ORION DREADNOUGHT (240x240)
    // =========================================================================
    register('boss_orion', 240, 240, (ctx) => {
      // Massive Titanium Armored Fortress
      const hull = ctx.createLinearGradient(20, 0, 220, 0);
      hull.addColorStop(0, '#0F172A');
      hull.addColorStop(0.3, '#334155');
      hull.addColorStop(0.5, '#64748B');
      hull.addColorStop(0.7, '#334155');
      hull.addColorStop(1, '#0F172A');
      ctx.fillStyle = hull;
      ctx.beginPath();
      ctx.moveTo(120, 210);
      ctx.lineTo(215, 95);
      ctx.lineTo(230, 40);
      ctx.lineTo(170, 30);
      ctx.lineTo(120, 48);
      ctx.lineTo(70, 30);
      ctx.lineTo(10, 40);
      ctx.lineTo(25, 95);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#00E5FF';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Twin Heavy Rotary Laser Turrets (Facing Down)
      ctx.fillStyle = '#1E293B';
      ctx.fillRect(48, 80, 24, 70);
      ctx.fillRect(168, 80, 24, 70);
      ctx.fillStyle = '#EF4444';
      ctx.fillRect(52, 146, 16, 6);
      ctx.fillRect(172, 146, 16, 6);

      // Glowing Central Reactor Core
      const reactor = ctx.createRadialGradient(120, 110, 5, 120, 110, 35);
      reactor.addColorStop(0, '#FFFFFF');
      reactor.addColorStop(0.3, '#00E5FF');
      reactor.addColorStop(0.8, '#7C3AED');
      reactor.addColorStop(1, 'transparent');
      ctx.fillStyle = reactor;
      ctx.beginPath();
      ctx.arc(120, 110, 32, 0, Math.PI * 2);
      ctx.fill();
    });

    // =========================================================================
    // 16. SECTOR 2 BOSS: CRIMSON COLOSSUS (240x240)
    // =========================================================================
    register('boss_colossus', 240, 240, (ctx) => {
      ctx.fillStyle = '#991B1B';
      ctx.beginPath();
      ctx.moveTo(120, 215);
      ctx.lineTo(225, 120);
      ctx.lineTo(210, 35);
      ctx.lineTo(120, 55);
      ctx.lineTo(30, 35);
      ctx.lineTo(15, 120);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#F59E0B';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Magma Core
      const magma = ctx.createRadialGradient(120, 115, 4, 120, 115, 38);
      magma.addColorStop(0, '#FEF08A');
      magma.addColorStop(0.4, '#EF4444');
      magma.addColorStop(1, 'transparent');
      ctx.fillStyle = magma;
      ctx.beginPath();
      ctx.arc(120, 115, 34, 0, Math.PI * 2);
      ctx.fill();
    });

    // =========================================================================
    // 17. SECTOR 3 BOSS: GLACIAL LEVIATHAN (240x240)
    // =========================================================================
    register('boss_leviathan', 240, 240, (ctx) => {
      const ice = ctx.createLinearGradient(0, 0, 240, 240);
      ice.addColorStop(0, '#0284C7');
      ice.addColorStop(0.5, '#E0F2FE');
      ice.addColorStop(1, '#0369A1');
      ctx.fillStyle = ice;
      ctx.beginPath();
      ctx.moveTo(120, 220);
      ctx.lineTo(220, 80);
      ctx.lineTo(170, 25);
      ctx.lineTo(120, 50);
      ctx.lineTo(70, 25);
      ctx.lineTo(20, 80);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#38BDF8';
      ctx.lineWidth = 2.5;
      ctx.stroke();
    });

    // =========================================================================
    // 18. SECTOR 4 BOSS: RIFT ANNIHILATOR (240x240)
    // =========================================================================
    register('boss_rift', 240, 240, (ctx) => {
      ctx.fillStyle = '#0F0926';
      ctx.beginPath();
      ctx.moveTo(120, 220);
      ctx.lineTo(230, 60);
      ctx.lineTo(190, 20);
      ctx.lineTo(120, 45);
      ctx.lineTo(50, 20);
      ctx.lineTo(10, 60);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#D946EF';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Violet Singularity
      const sing = ctx.createRadialGradient(120, 110, 5, 120, 110, 36);
      sing.addColorStop(0, '#FFFFFF');
      sing.addColorStop(0.3, '#E879F9');
      sing.addColorStop(0.7, '#6B21A8');
      sing.addColorStop(1, 'transparent');
      ctx.fillStyle = sing;
      ctx.beginPath();
      ctx.arc(120, 110, 34, 0, Math.PI * 2);
      ctx.fill();
    });

    // =========================================================================
    // 19. SECTOR 5 BOSS: VOID OVERLORD (Apex Sovereign) - 250x250
    // =========================================================================
    register('boss_overlord', 250, 250, (ctx) => {
      ctx.fillStyle = '#050714';
      ctx.beginPath();
      ctx.moveTo(125, 235);
      ctx.lineTo(240, 85);
      ctx.lineTo(210, 25);
      ctx.lineTo(125, 55);
      ctx.lineTo(40, 25);
      ctx.lineTo(10, 85);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#FBBF24';
      ctx.lineWidth = 3.5;
      ctx.stroke();

      // Triple Overlord Fusion Cores
      [75, 125, 175].forEach((x) => {
        const core = ctx.createRadialGradient(x, 105, 3, x, 105, 20);
        core.addColorStop(0, '#FFFFFF');
        core.addColorStop(0.4, '#F43F5E');
        core.addColorStop(0.8, '#7C3AED');
        core.addColorStop(1, 'transparent');
        ctx.fillStyle = core;
        ctx.beginPath();
        ctx.arc(x, 105, 18, 0, Math.PI * 2);
        ctx.fill();
      });
    });

    // =========================================================================
    // 20. PICKUPS & FX: SHIELD BUBBLE, DRONE, CREDIT, CORE, POWERUP, SPARK
    // =========================================================================
    register('shield_bubble', 128, 128, (ctx) => {
      ctx.strokeStyle = '#00E5FF';
      ctx.shadowColor = '#00E5FF';
      ctx.shadowBlur = 14;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(64, 64, 58, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = 'rgba(0, 229, 255, 0.12)';
      ctx.beginPath();
      ctx.arc(64, 64, 56, 0, Math.PI * 2);
      ctx.fill();
    });

    register('repair_drone', 48, 48, (ctx) => {
      ctx.fillStyle = '#10B981';
      ctx.beginPath();
      ctx.arc(24, 24, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(21, 14, 6, 20);
      ctx.fillRect(14, 21, 20, 6);
    });

    register('pickup_credit', 32, 32, (ctx) => {
      const grad = ctx.createRadialGradient(16, 16, 2, 16, 16, 14);
      grad.addColorStop(0, '#FEF08A');
      grad.addColorStop(0.5, '#F59E0B');
      grad.addColorStop(1, '#B45309');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(16, 16, 13, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#FBBF24';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 13px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('$', 16, 16);
    });

    register('pickup_core', 32, 32, (ctx) => {
      const grad = ctx.createRadialGradient(16, 16, 2, 16, 16, 14);
      grad.addColorStop(0, '#E879F9');
      grad.addColorStop(0.5, '#A855F7');
      grad.addColorStop(1, '#6B21A8');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(16, 16, 13, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.moveTo(16, 6); ctx.lineTo(24, 16); ctx.lineTo(16, 26); ctx.lineTo(8, 16);
      ctx.closePath(); ctx.fill();
    });

    register('pickup_powerup', 36, 36, (ctx) => {
      ctx.fillStyle = '#3B82F6';
      ctx.beginPath();
      ctx.arc(18, 18, 16, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#60A5FA';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 16px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('P', 18, 18);
    });

    register('spark', 16, 16, (ctx) => {
      const grad = ctx.createRadialGradient(8, 8, 0, 8, 8, 8);
      grad.addColorStop(0, '#FFFFFF');
      grad.addColorStop(0.4, '#FDE047');
      grad.addColorStop(0.8, '#EA580C');
      grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(8, 8, 7, 0, Math.PI * 2);
      ctx.fill();
    });
  }
}

export default BootScene;
