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
    // Start combat scene immediately after textures are registered
    this.scene.start('SpaceCombatScene');
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
    register('ship_orbitron', 128, 128, (ctx) => {
      // Background Engine Glow
      const engineGlow = ctx.createRadialGradient(64, 108, 2, 64, 108, 18);
      engineGlow.addColorStop(0, '#FFFFFF');
      engineGlow.addColorStop(0.3, '#00E5FF');
      engineGlow.addColorStop(0.7, '#2563EB');
      engineGlow.addColorStop(1, 'transparent');
      ctx.fillStyle = engineGlow;
      ctx.fillRect(40, 92, 48, 36);

      // Wing Shadow / Under-structure
      ctx.fillStyle = '#060B18';
      ctx.beginPath();
      ctx.moveTo(64, 14);
      ctx.lineTo(122, 94);
      ctx.lineTo(104, 106);
      ctx.lineTo(82, 94);
      ctx.lineTo(64, 114);
      ctx.lineTo(46, 94);
      ctx.lineTo(24, 106);
      ctx.lineTo(6, 94);
      ctx.closePath();
      ctx.fill();

      // Swept Delta Wings (Titanium Alloy Gradient)
      const wingGrad = ctx.createLinearGradient(6, 0, 122, 0);
      wingGrad.addColorStop(0, '#0F172A');
      wingGrad.addColorStop(0.2, '#334155');
      wingGrad.addColorStop(0.4, '#64748B');
      wingGrad.addColorStop(0.5, '#94A3B8');
      wingGrad.addColorStop(0.6, '#64748B');
      wingGrad.addColorStop(0.8, '#334155');
      wingGrad.addColorStop(1, '#0F172A');
      ctx.fillStyle = wingGrad;
      ctx.beginPath();
      ctx.moveTo(64, 18);
      ctx.lineTo(118, 90);
      ctx.lineTo(102, 102);
      ctx.lineTo(80, 90);
      ctx.lineTo(64, 108);
      ctx.lineTo(48, 90);
      ctx.lineTo(26, 102);
      ctx.lineTo(10, 90);
      ctx.closePath();
      ctx.fill();

      // Wing Armor Panels (Cyan Accent Trim)
      ctx.fillStyle = '#00E5FF';
      ctx.shadowColor = '#00E5FF';
      ctx.shadowBlur = 8;
      // Left Wing Accent
      ctx.beginPath();
      ctx.moveTo(34, 60);
      ctx.lineTo(18, 86);
      ctx.lineTo(26, 98);
      ctx.lineTo(42, 84);
      ctx.closePath();
      ctx.fill();
      // Right Wing Accent
      ctx.beginPath();
      ctx.moveTo(94, 60);
      ctx.lineTo(110, 86);
      ctx.lineTo(102, 98);
      ctx.lineTo(86, 84);
      ctx.closePath();
      ctx.fill();
      ctx.shadowBlur = 0;

      // Heavy Fuselage Center Chassis
      const fuseGrad = ctx.createLinearGradient(48, 0, 80, 0);
      fuseGrad.addColorStop(0, '#1E293B');
      fuseGrad.addColorStop(0.25, '#475569');
      fuseGrad.addColorStop(0.5, '#CBD5E1');
      fuseGrad.addColorStop(0.75, '#475569');
      fuseGrad.addColorStop(1, '#1E293B');
      ctx.fillStyle = fuseGrad;
      ctx.beginPath();
      ctx.moveTo(64, 12);
      ctx.lineTo(76, 44);
      ctx.lineTo(74, 98);
      ctx.lineTo(64, 106);
      ctx.lineTo(54, 98);
      ctx.lineTo(52, 44);
      ctx.closePath();
      ctx.fill();

      // Panel Lines & Seams
      ctx.strokeStyle = '#0F172A';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(64, 16); ctx.lineTo(64, 102);
      ctx.moveTo(56, 48); ctx.lineTo(72, 48);
      ctx.moveTo(54, 76); ctx.lineTo(74, 76);
      ctx.stroke();

      // Wingtip Heavy Plasma Cannons
      const cannonGrad = ctx.createLinearGradient(0, 0, 0, 100);
      cannonGrad.addColorStop(0, '#94A3B8');
      cannonGrad.addColorStop(1, '#0F172A');
      ctx.fillStyle = cannonGrad;
      // Left Cannon
      ctx.fillRect(8, 54, 6, 36);
      ctx.fillStyle = '#00E5FF';
      ctx.fillRect(9, 52, 4, 4);
      // Right Cannon
      ctx.fillStyle = cannonGrad;
      ctx.fillRect(114, 54, 6, 36);
      ctx.fillStyle = '#00E5FF';
      ctx.fillRect(115, 52, 4, 4);

      // Glass Cockpit Canopy (Deep Blue with Specular White Glare Arc)
      const glassGrad = ctx.createLinearGradient(56, 30, 72, 65);
      glassGrad.addColorStop(0, '#0284C7');
      glassGrad.addColorStop(0.5, '#0369A1');
      glassGrad.addColorStop(1, '#082F49');
      ctx.fillStyle = glassGrad;
      ctx.beginPath();
      ctx.ellipse(64, 46, 6, 18, 0, 0, Math.PI * 2);
      ctx.fill();

      // Specular Glass Reflection
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.arc(63, 44, 12, -Math.PI * 0.7, -Math.PI * 0.2);
      ctx.stroke();

      // Twin Thruster Nozzles
      ctx.fillStyle = '#334155';
      ctx.fillRect(52, 98, 8, 8);
      ctx.fillRect(68, 98, 8, 8);
      ctx.fillStyle = '#F59E0B';
      ctx.fillRect(54, 104, 4, 3);
      ctx.fillRect(70, 104, 4, 3);

      // Navigation Beacons
      ctx.fillStyle = '#EF4444';
      ctx.beginPath(); ctx.arc(11, 90, 2.5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#22C55E';
      ctx.beginPath(); ctx.arc(117, 90, 2.5, 0, Math.PI * 2); ctx.fill();
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
      // Outer Soft Plasma Aura
      const outerGlow = ctx.createRadialGradient(12, 20, 2, 12, 20, 18);
      outerGlow.addColorStop(0, 'rgba(0, 229, 255, 0.9)');
      outerGlow.addColorStop(0.5, 'rgba(2, 132, 199, 0.4)');
      outerGlow.addColorStop(1, 'transparent');
      ctx.fillStyle = outerGlow;
      ctx.fillRect(0, 0, 24, 40);

      // High-Energy Plasma Bolt Body
      const boltGrad = ctx.createLinearGradient(12, 4, 12, 60);
      boltGrad.addColorStop(0, '#FFFFFF');
      boltGrad.addColorStop(0.2, '#38BDF8');
      boltGrad.addColorStop(0.8, '#0284C7');
      boltGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = boltGrad;
      ctx.beginPath();
      ctx.moveTo(12, 4);
      ctx.lineTo(17, 16);
      ctx.lineTo(16, 56);
      ctx.lineTo(8, 56);
      ctx.lineTo(7, 16);
      ctx.closePath();
      ctx.fill();

      // White-Hot Blinding Core
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.ellipse(12, 14, 3, 10, 0, 0, Math.PI * 2);
      ctx.fill();
    });

    // =========================================================================
    // 8. ENEMY SCOUT (Stealth Dive Bomber - Facing Down) - 110x110
    // =========================================================================
    register('enemy_scout', 110, 110, (ctx) => {
      // Ion Engine Glow (Top)
      const ionGlow = ctx.createRadialGradient(55, 16, 2, 55, 16, 16);
      ionGlow.addColorStop(0, '#FEF08A');
      ionGlow.addColorStop(0.4, '#EA580C');
      ionGlow.addColorStop(1, 'transparent');
      ctx.fillStyle = ionGlow;
      ctx.fillRect(35, 2, 40, 25);

      // Swept Raider Wings (Facing Down)
      const scoutGrad = ctx.createLinearGradient(10, 0, 100, 0);
      scoutGrad.addColorStop(0, '#7F1D1D');
      scoutGrad.addColorStop(0.3, '#DC2626');
      scoutGrad.addColorStop(0.5, '#EF4444');
      scoutGrad.addColorStop(0.7, '#DC2626');
      scoutGrad.addColorStop(1, '#7F1D1D');
      ctx.fillStyle = scoutGrad;
      ctx.beginPath();
      ctx.moveTo(55, 100);  // Nose pointing down
      ctx.lineTo(102, 28);
      ctx.lineTo(88, 16);
      ctx.lineTo(68, 30);
      ctx.lineTo(55, 18);
      ctx.lineTo(42, 30);
      ctx.lineTo(22, 16);
      ctx.lineTo(8, 28);
      ctx.closePath();
      ctx.fill();

      // Gunmetal Armor Overlay
      ctx.fillStyle = '#1E293B';
      ctx.beginPath();
      ctx.moveTo(55, 90);
      ctx.lineTo(84, 34);
      ctx.lineTo(66, 38);
      ctx.lineTo(55, 28);
      ctx.lineTo(44, 38);
      ctx.lineTo(26, 34);
      ctx.closePath();
      ctx.fill();

      // Glowing Cyclops Sensor Visor
      ctx.fillStyle = '#EF4444';
      ctx.shadowColor = '#EF4444';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.ellipse(55, 62, 7, 12, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(55, 62, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Wingtip Blaster Pods
      ctx.fillStyle = '#475569';
      ctx.fillRect(8, 26, 5, 22);
      ctx.fillRect(97, 26, 5, 22);
      ctx.fillStyle = '#EF4444';
      ctx.fillRect(9, 46, 3, 4);
      ctx.fillRect(98, 46, 3, 4);
    });

    // =========================================================================
    // 9. ENEMY INTERCEPTOR (Scissor-Wing Mandible Raider) - 116x116
    // =========================================================================
    register('enemy_interceptor', 116, 116, (ctx) => {
      // Mandible Strike Blades (Facing Down)
      const bladeGrad = ctx.createLinearGradient(0, 0, 116, 0);
      bladeGrad.addColorStop(0, '#581C87');
      bladeGrad.addColorStop(0.3, '#7E22CE');
      bladeGrad.addColorStop(0.5, '#A855F7');
      bladeGrad.addColorStop(0.7, '#7E22CE');
      bladeGrad.addColorStop(1, '#581C87');
      ctx.fillStyle = bladeGrad;

      // Dual Forward Mandibles
      ctx.beginPath();
      // Left Mandible
      ctx.moveTo(34, 104);
      ctx.lineTo(46, 32);
      ctx.lineTo(16, 24);
      ctx.lineTo(8, 70);
      ctx.closePath();
      ctx.fill();

      // Right Mandible
      ctx.beginPath();
      ctx.moveTo(82, 104);
      ctx.lineTo(108, 70);
      ctx.lineTo(100, 24);
      ctx.lineTo(70, 32);
      ctx.closePath();
      ctx.fill();

      // Central Command Bridge
      ctx.fillStyle = '#0F172A';
      ctx.beginPath();
      ctx.moveTo(58, 86);
      ctx.lineTo(76, 36);
      ctx.lineTo(58, 22);
      ctx.lineTo(40, 36);
      ctx.closePath();
      ctx.fill();

      // Glowing Plasma Core
      ctx.fillStyle = '#E879F9';
      ctx.shadowColor = '#C084FC';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(58, 52, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    });

    // =========================================================================
    // 10. ENEMY CRUISER (Heavy Armored Battlecruiser) - 130x130
    // =========================================================================
    register('enemy_cruiser', 130, 130, (ctx) => {
      // Heavy Steel Armor Hull
      const hullGrad = ctx.createLinearGradient(10, 0, 120, 0);
      hullGrad.addColorStop(0, '#1E293B');
      hullGrad.addColorStop(0.5, '#64748B');
      hullGrad.addColorStop(1, '#1E293B');
      ctx.fillStyle = hullGrad;
      ctx.beginPath();
      ctx.moveTo(65, 114);
      ctx.lineTo(116, 56);
      ctx.lineTo(122, 22);
      ctx.lineTo(92, 16);
      ctx.lineTo(65, 24);
      ctx.lineTo(38, 16);
      ctx.lineTo(8, 22);
      ctx.lineTo(14, 56);
      ctx.closePath();
      ctx.fill();

      // Reinforced Armor Plates & Seams
      ctx.strokeStyle = '#0F172A';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Heavy Gun Turrets (Left & Right)
      ctx.fillStyle = '#334155';
      ctx.fillRect(20, 52, 10, 28);
      ctx.fillRect(100, 52, 10, 28);
      ctx.fillStyle = '#EF4444';
      ctx.fillRect(22, 78, 6, 4);
      ctx.fillRect(102, 78, 6, 4);

      // Armored Command Bridge
      ctx.fillStyle = '#F59E0B';
      ctx.shadowColor = '#FBBF24';
      ctx.shadowBlur = 6;
      ctx.fillRect(55, 48, 20, 10);
      ctx.shadowBlur = 0;
    });

    // =========================================================================
    // 11. ENEMY GUNSHIP (Sniper Railgun Craft) - 120x130
    // =========================================================================
    register('enemy_gunship', 120, 130, (ctx) => {
      // Long Electromagnetic Railgun Barrel extending past nose
      const railGrad = ctx.createLinearGradient(56, 0, 64, 0);
      railGrad.addColorStop(0, '#334155');
      railGrad.addColorStop(0.5, '#94A3B8');
      railGrad.addColorStop(1, '#334155');
      ctx.fillStyle = railGrad;
      ctx.fillRect(57, 18, 6, 100);

      // Glowing Magnetic Accelerator Coils
      ctx.fillStyle = '#00E5FF';
      ctx.shadowColor = '#00E5FF';
      ctx.shadowBlur = 8;
      for (let y = 35; y <= 100; y += 15) {
        ctx.fillRect(55, y, 10, 3);
      }
      ctx.shadowBlur = 0;

      // Stabilizer Wings
      ctx.fillStyle = '#1E293B';
      ctx.beginPath();
      ctx.moveTo(60, 25);
      ctx.lineTo(112, 45);
      ctx.lineTo(104, 75);
      ctx.lineTo(68, 55);
      ctx.lineTo(52, 55);
      ctx.lineTo(16, 75);
      ctx.lineTo(8, 45);
      ctx.closePath();
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
    // 13. HOSTILE PLASMA PROJECTILE (24x36)
    // =========================================================================
    register('enemy_bullet', 24, 36, (ctx) => {
      const grad = ctx.createRadialGradient(12, 18, 2, 12, 18, 14);
      grad.addColorStop(0, '#FFFFFF');
      grad.addColorStop(0.3, '#FEF08A');
      grad.addColorStop(0.7, '#EF4444');
      grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(12, 18, 11, 0, Math.PI * 2);
      ctx.fill();
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
