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
    // 2. PLAYER SHIP: S-02 PHOENIX (Striker Interceptor - Heavy Solar Assault) - 128x128
    // =========================================================================
    register('ship_phoenix', 128, 128, (ctx) => {
      // 1. High-Output Quad Solar-Plasma Engine Afterburner Plume
      const fireGlow = ctx.createRadialGradient(64, 114, 2, 64, 114, 26);
      fireGlow.addColorStop(0, '#FFFFFF');
      fireGlow.addColorStop(0.2, '#FEF08A');
      fireGlow.addColorStop(0.5, '#F59E0B');
      fireGlow.addColorStop(0.8, '#DC2626');
      fireGlow.addColorStop(1, 'transparent');
      ctx.fillStyle = fireGlow;
      ctx.fillRect(26, 92, 76, 36);

      // Mach Diamonds in Fiery Thrust Stream
      ctx.fillStyle = '#FFFFFF';
      [104, 112, 120].forEach((y, i) => {
        ctx.globalAlpha = 0.9 - i * 0.25;
        ctx.beginPath();
        ctx.ellipse(50, y, 2.5, 2, 0, 0, Math.PI * 2);
        ctx.ellipse(60, y, 3, 2, 0, 0, Math.PI * 2);
        ctx.ellipse(68, y, 3, 2, 0, 0, Math.PI * 2);
        ctx.ellipse(78, y, 2.5, 2, 0, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1.0;

      // 2. Lower Aerodynamic Keel & Understructure
      ctx.fillStyle = '#080406';
      ctx.beginPath();
      ctx.moveTo(64, 6);
      ctx.lineTo(126, 82);
      ctx.lineTo(112, 100);
      ctx.lineTo(90, 88);
      ctx.lineTo(64, 114);
      ctx.lineTo(38, 88);
      ctx.lineTo(16, 100);
      ctx.lineTo(2, 82);
      ctx.closePath();
      ctx.fill();

      // 3. Primary Swept Delta Wings (Layered Metallic Solar-Crimson Gradient)
      const wingGrad = ctx.createLinearGradient(4, 0, 124, 0);
      wingGrad.addColorStop(0, '#3A090D');
      wingGrad.addColorStop(0.12, '#7F1D1D');
      wingGrad.addColorStop(0.28, '#B91C1C');
      wingGrad.addColorStop(0.48, '#EF4444');
      wingGrad.addColorStop(0.52, '#FCA5A5');
      wingGrad.addColorStop(0.72, '#EF4444');
      wingGrad.addColorStop(0.88, '#7F1D1D');
      wingGrad.addColorStop(1, '#3A090D');
      ctx.fillStyle = wingGrad;
      ctx.beginPath();
      ctx.moveTo(64, 10);
      ctx.lineTo(122, 80);
      ctx.lineTo(108, 96);
      ctx.lineTo(86, 86);
      ctx.lineTo(64, 110);
      ctx.lineTo(42, 86);
      ctx.lineTo(20, 96);
      ctx.lineTo(6, 80);
      ctx.closePath();
      ctx.fill();

      // 4. Outer Armor Chine Facets (Dark Graphite Heat-Shielding)
      ctx.fillStyle = '#140A0D';
      // Left Chine
      ctx.beginPath();
      ctx.moveTo(6, 80);
      ctx.lineTo(36, 56);
      ctx.lineTo(48, 80);
      ctx.lineTo(20, 96);
      ctx.closePath();
      ctx.fill();
      // Right Chine
      ctx.beginPath();
      ctx.moveTo(122, 80);
      ctx.lineTo(92, 56);
      ctx.lineTo(80, 80);
      ctx.lineTo(108, 96);
      ctx.closePath();
      ctx.fill();

      // 5. Glowing Gold/Amber Energy Conduits & Heat Radiator Lines
      ctx.strokeStyle = '#F59E0B';
      ctx.lineWidth = 1.6;
      ctx.shadowColor = '#FBBF24';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.moveTo(64, 28); ctx.lineTo(36, 56); ctx.lineTo(14, 82);
      ctx.moveTo(64, 28); ctx.lineTo(92, 56); ctx.lineTo(114, 82);
      ctx.moveTo(42, 70); ctx.lineTo(24, 90);
      ctx.moveTo(86, 70); ctx.lineTo(104, 90);
      ctx.stroke();
      ctx.shadowBlur = 0;

      // 6. Central Armored Fuselage Spine (Raised Titanium-Ceramic Chassis)
      const fuseGrad = ctx.createLinearGradient(48, 0, 80, 0);
      fuseGrad.addColorStop(0, '#1C1917');
      fuseGrad.addColorStop(0.2, '#292524');
      fuseGrad.addColorStop(0.5, '#F5F5F4');
      fuseGrad.addColorStop(0.8, '#292524');
      fuseGrad.addColorStop(1, '#1C1917');
      ctx.fillStyle = fuseGrad;
      ctx.beginPath();
      ctx.moveTo(64, 8);
      ctx.lineTo(75, 36);
      ctx.lineTo(76, 96);
      ctx.lineTo(64, 108);
      ctx.lineTo(52, 96);
      ctx.lineTo(53, 36);
      ctx.closePath();
      ctx.fill();

      // 7. Structural Armor Panel Seams & Rivets
      ctx.strokeStyle = '#0C0A09';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(64, 10); ctx.lineTo(64, 106);
      ctx.moveTo(53, 40); ctx.lineTo(75, 40);
      ctx.moveTo(52, 72); ctx.lineTo(76, 72);
      ctx.stroke();

      // Micro Heat-Sink Rivets
      ctx.fillStyle = '#78716C';
      [46, 56, 66, 76, 86].forEach((y) => {
        ctx.fillRect(50, y, 1.5, 1.5);
        ctx.fillRect(76, y, 1.5, 1.5);
      });

      // 8. Twin Outer Heavy Thermite Rail Cannons
      const cannonGrad = ctx.createLinearGradient(0, 44, 0, 88);
      cannonGrad.addColorStop(0, '#F5F5F4');
      cannonGrad.addColorStop(0.4, '#57534E');
      cannonGrad.addColorStop(1, '#1C1917');
      ctx.fillStyle = cannonGrad;
      // Left Cannon Assembly
      ctx.fillRect(4, 46, 7, 38);
      ctx.fillRect(3, 72, 9, 6);
      // Right Cannon Assembly
      ctx.fillRect(117, 46, 7, 38);
      ctx.fillRect(116, 72, 9, 6);

      // Glowing Thermite Plasma Muzzle Emitters
      ctx.fillStyle = '#F97316';
      ctx.shadowColor = '#F97316';
      ctx.shadowBlur = 8;
      ctx.fillRect(5, 42, 5, 6);
      ctx.fillRect(118, 42, 5, 6);
      ctx.shadowBlur = 0;

      // 9. Central Dorsal Solar Fusion Core (Pulsing Amber Arc Reactor)
      const coreGrad = ctx.createRadialGradient(64, 76, 1, 64, 76, 7);
      coreGrad.addColorStop(0, '#FFFFFF');
      coreGrad.addColorStop(0.35, '#FEF08A');
      coreGrad.addColorStop(0.7, '#F59E0B');
      coreGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = coreGrad;
      ctx.beginPath();
      ctx.arc(64, 76, 7, 0, Math.PI * 2);
      ctx.fill();

      // 10. Diamond-Cut Amber-Gold Cockpit Canopy
      const glass = ctx.createLinearGradient(54, 24, 74, 64);
      glass.addColorStop(0, '#FEF08A');
      glass.addColorStop(0.3, '#F59E0B');
      glass.addColorStop(0.7, '#D97706');
      glass.addColorStop(1, '#78350F');
      ctx.fillStyle = glass;
      ctx.beginPath();
      ctx.ellipse(64, 42, 7, 19, 0, 0, Math.PI * 2);
      ctx.fill();

      // Pilot Holographic HUD Glare Arc
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.arc(63, 40, 12, -Math.PI * 0.75, -Math.PI * 0.2);
      ctx.stroke();

      // 11. Quad Heavy Vector Thruster Nozzles & Thermal Rings
      [47, 56, 66, 75].forEach((x) => {
        ctx.fillStyle = '#292524';
        ctx.fillRect(x - 3, 96, 6, 10);
        ctx.fillStyle = '#F59E0B';
        ctx.fillRect(x - 2, 103, 4, 3);
      });

      // 12. Tactical Formation Beacons
      ctx.fillStyle = '#EF4444'; // Port red
      ctx.beginPath(); ctx.arc(7, 78, 2.5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#10B981'; // Starboard green
      ctx.beginPath(); ctx.arc(121, 78, 2.5, 0, Math.PI * 2); ctx.fill();
    });

    // =========================================================================
    // 3. PLAYER SHIP: X-03 SHADOW (Ghost Infiltrator - Stealth Interceptor) - 128x128
    // =========================================================================
    register('ship_shadow', 128, 128, (ctx) => {
      // 1. Shrouded Antimatter Ion Plume (Violet/Magenta)
      const warpGlow = ctx.createRadialGradient(64, 114, 2, 64, 114, 24);
      warpGlow.addColorStop(0, '#FFFFFF');
      warpGlow.addColorStop(0.25, '#E879F9');
      warpGlow.addColorStop(0.6, '#9333EA');
      warpGlow.addColorStop(0.85, '#3B0764');
      warpGlow.addColorStop(1, 'transparent');
      ctx.fillStyle = warpGlow;
      ctx.fillRect(32, 94, 64, 34);

      // Mach Diamonds in Stealth Exhaust
      ctx.fillStyle = '#FFFFFF';
      [104, 112].forEach((y, i) => {
        ctx.globalAlpha = 0.85 - i * 0.3;
        ctx.beginPath();
        ctx.ellipse(54, y, 2.5, 2, 0, 0, Math.PI * 2);
        ctx.ellipse(74, y, 2.5, 2, 0, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1.0;

      // 2. Lower Radar-Absorbent Keel & Understructure
      ctx.fillStyle = '#05020A';
      ctx.beginPath();
      ctx.moveTo(64, 8);
      ctx.lineTo(124, 66);
      ctx.lineTo(112, 102);
      ctx.lineTo(84, 90);
      ctx.lineTo(64, 116);
      ctx.lineTo(44, 90);
      ctx.lineTo(16, 102);
      ctx.lineTo(4, 66);
      ctx.closePath();
      ctx.fill();

      // 3. Faceted Stealth Obsidian Armor Wings
      const facetGrad = ctx.createLinearGradient(0, 0, 128, 0);
      facetGrad.addColorStop(0, '#0F091F');
      facetGrad.addColorStop(0.25, '#2E1065');
      facetGrad.addColorStop(0.5, '#581C87');
      facetGrad.addColorStop(0.75, '#2E1065');
      facetGrad.addColorStop(1, '#0F091F');
      ctx.fillStyle = facetGrad;
      ctx.beginPath();
      ctx.moveTo(64, 12);
      ctx.lineTo(118, 66);
      ctx.lineTo(108, 98);
      ctx.lineTo(82, 88);
      ctx.lineTo(64, 110);
      ctx.lineTo(46, 88);
      ctx.lineTo(20, 98);
      ctx.lineTo(10, 66);
      ctx.closePath();
      ctx.fill();

      // 4. Outer Carbon-Nanotube Stealth Chine Facets
      ctx.fillStyle = '#090514';
      ctx.beginPath();
      ctx.moveTo(10, 66); ctx.lineTo(38, 48); ctx.lineTo(48, 76); ctx.lineTo(20, 98);
      ctx.closePath(); ctx.fill();
      ctx.beginPath();
      ctx.moveTo(118, 66); ctx.lineTo(90, 48); ctx.lineTo(80, 76); ctx.lineTo(108, 98);
      ctx.closePath(); ctx.fill();

      // 5. Glowing Violet Void Energy Conduits
      ctx.strokeStyle = '#C084FC';
      ctx.shadowColor = '#C084FC';
      ctx.shadowBlur = 8;
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(64, 24); ctx.lineTo(38, 54); ctx.lineTo(16, 76);
      ctx.moveTo(64, 24); ctx.lineTo(90, 54); ctx.lineTo(112, 76);
      ctx.moveTo(64, 30); ctx.lineTo(64, 102);
      ctx.stroke();
      ctx.shadowBlur = 0;

      // 6. Central Singularity Arc Reactor Core
      const coreGrad = ctx.createRadialGradient(64, 68, 1, 64, 68, 8);
      coreGrad.addColorStop(0, '#FFFFFF');
      coreGrad.addColorStop(0.35, '#E879F9');
      coreGrad.addColorStop(0.7, '#7E22CE');
      coreGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = coreGrad;
      ctx.beginPath(); ctx.arc(64, 68, 8, 0, Math.PI * 2); ctx.fill();

      // 7. Faceted Rose-Quartz Stealth Canopy
      const glass = ctx.createLinearGradient(56, 32, 72, 58);
      glass.addColorStop(0, '#F472B6');
      glass.addColorStop(0.4, '#C026D3');
      glass.addColorStop(1, '#4A044E');
      ctx.fillStyle = glass;
      ctx.beginPath(); ctx.ellipse(64, 44, 5, 16, 0, 0, Math.PI * 2); ctx.fill();

      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 1.6;
      ctx.beginPath(); ctx.arc(63, 42, 10, -Math.PI * 0.75, -Math.PI * 0.2); ctx.stroke();

      // 8. Dual Wingtip Concealed Railguns
      ctx.fillStyle = '#334155';
      ctx.fillRect(8, 56, 5, 24);
      ctx.fillRect(115, 56, 5, 24);
      ctx.fillStyle = '#E879F9';
      ctx.fillRect(9, 52, 3, 5);
      ctx.fillRect(116, 52, 3, 5);

      // 9. Twin Shrouded Exhaust Nozzles
      ctx.fillStyle = '#1E1B4B';
      ctx.fillRect(50, 96, 10, 8);
      ctx.fillRect(68, 96, 10, 8);
      ctx.fillStyle = '#A855F7';
      ctx.fillRect(52, 102, 6, 3);
      ctx.fillRect(70, 102, 6, 3);
    });

    // =========================================================================
    // 4. PLAYER SHIP: R-04 TITAN (Armored Heavy Dreadnought) - 128x128
    // =========================================================================
    register('ship_titan', 128, 128, (ctx) => {
      // 1. Triple Heavy Industrial Combustion Plumes
      [42, 64, 86].forEach((x) => {
        const fire = ctx.createRadialGradient(x, 116, 2, x, 116, 18);
        fire.addColorStop(0, '#FFFFFF');
        fire.addColorStop(0.3, '#F59E0B');
        fire.addColorStop(0.7, '#EA580C');
        fire.addColorStop(1, 'transparent');
        ctx.fillStyle = fire;
        ctx.fillRect(x - 14, 98, 28, 30);
      });

      // 2. Reinforced Heavy Bulkhead Understructure
      ctx.fillStyle = '#060911';
      ctx.fillRect(14, 20, 100, 92);

      // 3. Heavy Titanium-Alloy Armored Citadel
      const steelGrad = ctx.createLinearGradient(12, 0, 116, 0);
      steelGrad.addColorStop(0, '#1E293B');
      steelGrad.addColorStop(0.2, '#334155');
      steelGrad.addColorStop(0.5, '#64748B');
      steelGrad.addColorStop(0.8, '#334155');
      steelGrad.addColorStop(1, '#1E293B');
      ctx.fillStyle = steelGrad;
      ctx.beginPath();
      ctx.moveTo(64, 12);
      ctx.lineTo(108, 30);
      ctx.lineTo(114, 96);
      ctx.lineTo(88, 108);
      ctx.lineTo(64, 114);
      ctx.lineTo(40, 108);
      ctx.lineTo(14, 96);
      ctx.lineTo(20, 30);
      ctx.closePath();
      ctx.fill();

      // Armor Panel Outlines
      ctx.strokeStyle = '#020617';
      ctx.lineWidth = 1.8;
      ctx.stroke();

      // 4. Hazard Warning Chevrons & Sponson Details
      ctx.fillStyle = '#F59E0B';
      ctx.fillRect(26, 44, 14, 4);
      ctx.fillRect(88, 44, 14, 4);
      ctx.fillRect(28, 56, 14, 4);
      ctx.fillRect(86, 56, 14, 4);

      // Heavy Flank Dual Siege Cannons
      const cannonGrad = ctx.createLinearGradient(0, 30, 0, 84);
      cannonGrad.addColorStop(0, '#94A3B8');
      cannonGrad.addColorStop(0.5, '#475569');
      cannonGrad.addColorStop(1, '#0F172A');
      ctx.fillStyle = cannonGrad;
      ctx.fillRect(8, 32, 12, 54);
      ctx.fillRect(108, 32, 12, 54);
      // Muzzle Caps
      ctx.fillStyle = '#F97316';
      ctx.fillRect(10, 28, 8, 5);
      ctx.fillRect(110, 28, 8, 5);

      // 5. Armored Command Bridge with Amber Blast Shields
      const bridgeGrad = ctx.createLinearGradient(50, 38, 78, 54);
      bridgeGrad.addColorStop(0, '#FDE047');
      bridgeGrad.addColorStop(0.4, '#F59E0B');
      bridgeGrad.addColorStop(1, '#78350F');
      ctx.fillStyle = bridgeGrad;
      ctx.fillRect(50, 40, 28, 12);
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 1.2;
      ctx.strokeRect(50, 40, 28, 12);

      // 6. Heavy Reactor Heat Sinks & Micro Rivets
      ctx.fillStyle = '#EA580C';
      ctx.fillRect(54, 72, 20, 6);
      ctx.fillRect(56, 82, 16, 6);

      ctx.fillStyle = '#94A3B8';
      [36, 46, 56, 66, 76, 86].forEach((y) => {
        ctx.fillRect(38, y, 2, 2);
        ctx.fillRect(88, y, 2, 2);
      });

      // 7. Triple Heavy Vector Exhaust Nozzles
      [42, 64, 86].forEach((x) => {
        ctx.fillStyle = '#1E293B';
        ctx.fillRect(x - 7, 102, 14, 10);
        ctx.fillStyle = '#F59E0B';
        ctx.fillRect(x - 5, 108, 10, 4);
      });
    });

    // =========================================================================
    // 5. PLAYER SHIP: Z-05 NOVA (Quantum Flagship Cruiser) - 128x128
    // =========================================================================
    register('ship_nova', 128, 128, (ctx) => {
      // 1. Dual Quantum Hyper-Drive Exhaust Plumes
      [30, 98].forEach((x) => {
        const glow = ctx.createRadialGradient(x, 114, 2, x, 114, 22);
        glow.addColorStop(0, '#FFFFFF');
        glow.addColorStop(0.3, '#38BDF8');
        glow.addColorStop(0.7, '#0284C7');
        glow.addColorStop(1, 'transparent');
        ctx.fillStyle = glow;
        ctx.fillRect(x - 16, 96, 32, 32);
      });

      // 2. Central Antimatter Singularity Core (Radiant Pulsing Sphere)
      const core = ctx.createRadialGradient(64, 62, 2, 64, 62, 26);
      core.addColorStop(0, '#FFFFFF');
      core.addColorStop(0.3, '#00E5FF');
      core.addColorStop(0.65, '#3B82F6');
      core.addColorStop(0.9, '#1E1B4B');
      core.addColorStop(1, 'transparent');
      ctx.fillStyle = core;
      ctx.beginPath(); ctx.arc(64, 62, 26, 0, Math.PI * 2); ctx.fill();

      // Quantum Containment Rings
      ctx.strokeStyle = '#00E5FF';
      ctx.lineWidth = 1.4;
      ctx.shadowColor = '#00E5FF';
      ctx.shadowBlur = 8;
      ctx.beginPath(); ctx.arc(64, 62, 18, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.arc(64, 62, 10, 0, Math.PI * 2); ctx.stroke();
      ctx.shadowBlur = 0;

      // 3. Catamaran Dual-Boom Outriggers (Left & Right)
      const boomGrad = ctx.createLinearGradient(0, 0, 128, 0);
      boomGrad.addColorStop(0, '#0E7490');
      boomGrad.addColorStop(0.2, '#06B6D4');
      boomGrad.addColorStop(0.5, '#CFFAFE');
      boomGrad.addColorStop(0.8, '#06B6D4');
      boomGrad.addColorStop(1, '#0E7490');
      ctx.fillStyle = boomGrad;

      // Left Boom
      ctx.beginPath();
      ctx.moveTo(30, 8);
      ctx.lineTo(42, 36);
      ctx.lineTo(40, 104);
      ctx.lineTo(26, 112);
      ctx.lineTo(16, 98);
      ctx.lineTo(18, 36);
      ctx.closePath();
      ctx.fill();

      // Right Boom
      ctx.beginPath();
      ctx.moveTo(98, 8);
      ctx.lineTo(110, 36);
      ctx.lineTo(112, 98);
      ctx.lineTo(102, 112);
      ctx.lineTo(88, 104);
      ctx.lineTo(86, 36);
      ctx.closePath();
      ctx.fill();

      // 4. Center Bridge Cross-Spans
      const bridgeGrad = ctx.createLinearGradient(36, 0, 92, 0);
      bridgeGrad.addColorStop(0, '#155E75');
      bridgeGrad.addColorStop(0.5, '#E0F2FE');
      bridgeGrad.addColorStop(1, '#155E75');
      ctx.fillStyle = bridgeGrad;
      ctx.fillRect(36, 42, 56, 10);
      ctx.fillRect(36, 80, 56, 12);

      // Forward Quantum Particle Needles
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(29, 2, 3, 10);
      ctx.fillRect(97, 2, 3, 10);

      // Dual Vector Nozzles
      [30, 98].forEach((x) => {
        ctx.fillStyle = '#164E63';
        ctx.fillRect(x - 5, 104, 10, 8);
        ctx.fillStyle = '#00E5FF';
        ctx.fillRect(x - 3, 110, 6, 3);
      });
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
    // 9. ENEMY INTERCEPTOR (Cybernetic Void Scythe Reaper - Facing Down) - 116x116
    // =========================================================================
    register('enemy_interceptor', 116, 116, (ctx) => {
      // 1. Dual Antimatter Warp Exhaust Plumes (Facing Downward Flight, Venting Up)
      const warpGlow = ctx.createRadialGradient(58, 12, 2, 58, 12, 22);
      warpGlow.addColorStop(0, '#FFFFFF');
      warpGlow.addColorStop(0.25, '#F472B6');
      warpGlow.addColorStop(0.6, '#9333EA');
      warpGlow.addColorStop(0.85, '#3B0764');
      warpGlow.addColorStop(1, 'transparent');
      ctx.fillStyle = warpGlow;
      ctx.fillRect(26, 0, 64, 26);

      // 2. Underlying Carbon-Composite Chassis & Underwing Shadow
      ctx.fillStyle = '#06020E';
      ctx.beginPath();
      ctx.moveTo(58, 74);
      ctx.lineTo(112, 112); // Right mandible tip
      ctx.lineTo(116, 36);
      ctx.lineTo(92, 12);
      ctx.lineTo(58, 22);
      ctx.lineTo(24, 12);
      ctx.lineTo(0, 36);
      ctx.lineTo(4, 112);   // Left mandible tip
      ctx.closePath();
      ctx.fill();

      // 3. Faceted Void-Amethyst Predatory Scythe Mandibles
      const bladeGrad = ctx.createLinearGradient(0, 0, 116, 0);
      bladeGrad.addColorStop(0, '#180026');
      bladeGrad.addColorStop(0.15, '#581C87');
      bladeGrad.addColorStop(0.35, '#7E22CE');
      bladeGrad.addColorStop(0.5, '#C084FC');
      bladeGrad.addColorStop(0.65, '#7E22CE');
      bladeGrad.addColorStop(0.85, '#581C87');
      bladeGrad.addColorStop(1, '#180026');
      ctx.fillStyle = bladeGrad;
      ctx.beginPath();
      ctx.moveTo(58, 70);
      ctx.lineTo(108, 108);
      ctx.lineTo(112, 38);
      ctx.lineTo(90, 14);
      ctx.lineTo(58, 24);
      ctx.lineTo(26, 14);
      ctx.lineTo(4, 38);
      ctx.lineTo(8, 108);
      ctx.closePath();
      ctx.fill();

      // 4. Serrated Armor Chine Plates (Dark Graphite Stealth Hull)
      ctx.fillStyle = '#0F081D';
      // Left Chine
      ctx.beginPath();
      ctx.moveTo(8, 108);
      ctx.lineTo(36, 44);
      ctx.lineTo(50, 48);
      ctx.lineTo(20, 96);
      ctx.closePath();
      ctx.fill();
      // Right Chine
      ctx.beginPath();
      ctx.moveTo(108, 108);
      ctx.lineTo(80, 44);
      ctx.lineTo(66, 48);
      ctx.lineTo(96, 96);
      ctx.closePath();
      ctx.fill();

      // 5. Central Armored Fuselage Chassis
      const fuseGrad = ctx.createLinearGradient(34, 0, 82, 0);
      fuseGrad.addColorStop(0, '#0F172A');
      fuseGrad.addColorStop(0.5, '#334155');
      fuseGrad.addColorStop(1, '#0F172A');
      ctx.fillStyle = fuseGrad;
      ctx.beginPath();
      ctx.moveTo(58, 88);
      ctx.lineTo(82, 42);
      ctx.lineTo(76, 22);
      ctx.lineTo(40, 22);
      ctx.lineTo(34, 42);
      ctx.closePath();
      ctx.fill();

      // 6. Glowing Neon-Fuchsia Energy Conduit Lines
      ctx.strokeStyle = '#E879F9';
      ctx.lineWidth = 1.4;
      ctx.shadowColor = '#E879F9';
      ctx.shadowBlur = 6;
      ctx.beginPath();
      ctx.moveTo(58, 24); ctx.lineTo(36, 42); ctx.lineTo(14, 98);
      ctx.moveTo(58, 24); ctx.lineTo(80, 42); ctx.lineTo(102, 98);
      ctx.moveTo(58, 62); ctx.lineTo(32, 78);
      ctx.moveTo(58, 62); ctx.lineTo(84, 78);
      ctx.stroke();
      ctx.shadowBlur = 0;

      // 7. Central Void Singularity Core (Pulsing Dark Energy Reactor)
      const coreGrad = ctx.createRadialGradient(58, 46, 1, 58, 46, 8);
      coreGrad.addColorStop(0, '#FFFFFF');
      coreGrad.addColorStop(0.35, '#E879F9');
      coreGrad.addColorStop(0.7, '#6B21A8');
      coreGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = coreGrad;
      ctx.beginPath();
      ctx.arc(58, 46, 8, 0, Math.PI * 2);
      ctx.fill();

      // 8. Menacing Cybernetic Ocular Slit Scanner (Predator Visor)
      const visorGrad = ctx.createLinearGradient(44, 66, 72, 66);
      visorGrad.addColorStop(0, 'rgba(232, 121, 249, 0)');
      visorGrad.addColorStop(0.25, '#E879F9');
      visorGrad.addColorStop(0.5, '#FFFFFF');
      visorGrad.addColorStop(0.75, '#E879F9');
      visorGrad.addColorStop(1, 'rgba(232, 121, 249, 0)');
      ctx.fillStyle = visorGrad;
      ctx.shadowColor = '#E879F9';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.ellipse(58, 66, 14, 3, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Laser Optic Focal Bead
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(58, 66, 1.8, 0, Math.PI * 2);
      ctx.fill();

      // 9. Mandible Heavy Plasma Beam Projectors
      ctx.fillStyle = '#475569';
      ctx.fillRect(4, 98, 7, 12);
      ctx.fillRect(105, 98, 7, 12);

      // Glowing Violet Plasma Muzzle Emitters
      ctx.fillStyle = '#E879F9';
      ctx.shadowColor = '#E879F9';
      ctx.shadowBlur = 8;
      ctx.fillRect(5, 106, 5, 6);
      ctx.fillRect(106, 106, 5, 6);
      ctx.shadowBlur = 0;

      // 10. Rear Vector Thruster Flaps
      ctx.fillStyle = '#C084FC';
      ctx.fillRect(44, 10, 8, 3);
      ctx.fillRect(64, 10, 8, 3);
    });

    // =========================================================================
    // 10. ENEMY CRUISER (Armored Heavy Battlecruiser - Hex Citadel) - 130x130
    // =========================================================================
    register('enemy_cruiser', 130, 130, (ctx) => {
      // 1. Dual Heavy Ion Exhaust Plumes (Facing Downward Flight, Venting Up)
      [42, 88].forEach((x) => {
        const glow = ctx.createRadialGradient(x, 10, 2, x, 10, 18);
        glow.addColorStop(0, '#FFFFFF');
        glow.addColorStop(0.3, '#F59E0B');
        glow.addColorStop(0.7, '#DC2626');
        glow.addColorStop(1, 'transparent');
        ctx.fillStyle = glow;
        ctx.fillRect(x - 14, 0, 28, 22);
      });

      // 2. Reinforced Hexagonal Heavy Gunmetal Hull
      const hullGrad = ctx.createLinearGradient(8, 0, 122, 0);
      hullGrad.addColorStop(0, '#0A0F1D');
      hullGrad.addColorStop(0.2, '#1E293B');
      hullGrad.addColorStop(0.5, '#64748B');
      hullGrad.addColorStop(0.8, '#1E293B');
      hullGrad.addColorStop(1, '#0A0F1D');
      ctx.fillStyle = hullGrad;
      ctx.beginPath();
      ctx.moveTo(65, 122); // Bow prow
      ctx.lineTo(120, 64);
      ctx.lineTo(124, 18);
      ctx.lineTo(96, 12);
      ctx.lineTo(65, 20);
      ctx.lineTo(34, 12);
      ctx.lineTo(6, 18);
      ctx.lineTo(10, 64);
      ctx.closePath();
      ctx.fill();

      // Reinforced Beveled Armor Plates & Riveted Seams
      ctx.strokeStyle = '#020617';
      ctx.lineWidth = 2.0;
      ctx.stroke();

      // 3. Heavy Twin Flank Artillery Turrets (Left & Right Sponsons)
      const turretGrad = ctx.createLinearGradient(14, 0, 32, 0);
      turretGrad.addColorStop(0, '#0F172A');
      turretGrad.addColorStop(0.5, '#334155');
      turretGrad.addColorStop(1, '#0F172A');
      ctx.fillStyle = turretGrad;
      ctx.fillRect(14, 46, 18, 36);
      ctx.fillRect(98, 46, 18, 36);

      // Twin Gun Barrels with Muzzle Brakes
      ctx.fillStyle = '#94A3B8';
      ctx.fillRect(16, 78, 5, 18);
      ctx.fillRect(25, 78, 5, 18);
      ctx.fillRect(100, 78, 5, 18);
      ctx.fillRect(109, 78, 5, 18);

      // Glowing Plasma Weapon Muzzles
      ctx.fillStyle = '#EF4444';
      ctx.shadowColor = '#EF4444';
      ctx.shadowBlur = 6;
      ctx.fillRect(16, 92, 5, 4);
      ctx.fillRect(25, 92, 5, 4);
      ctx.fillRect(100, 92, 5, 4);
      ctx.fillRect(109, 92, 5, 4);
      ctx.shadowBlur = 0;

      // 4. Armored Command Deck & Amber Sensor Bridge
      const bridgeGrad = ctx.createLinearGradient(50, 38, 80, 52);
      bridgeGrad.addColorStop(0, '#FEF08A');
      bridgeGrad.addColorStop(0.4, '#F59E0B');
      bridgeGrad.addColorStop(1, '#78350F');
      ctx.fillStyle = bridgeGrad;
      ctx.fillRect(50, 38, 30, 14);
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 1.2;
      ctx.strokeRect(50, 38, 30, 14);

      // 5. Pulsing Nuclear Core Reactor Vents
      ctx.fillStyle = '#EA580C';
      ctx.fillRect(52, 68, 26, 10);
      ctx.fillStyle = '#FBBF24';
      ctx.fillRect(56, 71, 18, 4);

      // Micro Greebles & Rivets
      ctx.fillStyle = '#64748B';
      [36, 48, 60, 72, 84].forEach((y) => {
        ctx.fillRect(38, y, 2, 2);
        ctx.fillRect(90, y, 2, 2);
      });
    });

    // =========================================================================
    // 11. ENEMY GUNSHIP (Sniper Railgun Craft - Facing Down) - 120x130
    // =========================================================================
    register('enemy_gunship', 120, 130, (ctx) => {
      // 1. Top Plasma Vent Thruster
      const thruster = ctx.createRadialGradient(60, 10, 2, 60, 10, 16);
      thruster.addColorStop(0, '#FFFFFF');
      thruster.addColorStop(0.35, '#38BDF8');
      thruster.addColorStop(0.7, '#0284C7');
      thruster.addColorStop(1, 'transparent');
      ctx.fillStyle = thruster;
      ctx.fillRect(44, 0, 32, 20);

      // 2. Long Heavy Electromagnetic Railgun Protruding Forward
      const railGrad = ctx.createLinearGradient(54, 0, 66, 0);
      railGrad.addColorStop(0, '#0F172A');
      railGrad.addColorStop(0.3, '#334155');
      railGrad.addColorStop(0.5, '#E2E8F0');
      railGrad.addColorStop(0.7, '#334155');
      railGrad.addColorStop(1, '#0F172A');
      ctx.fillStyle = railGrad;
      ctx.fillRect(56, 14, 8, 108);

      // Glowing Magnetic Accelerator Coils
      ctx.fillStyle = '#00E5FF';
      ctx.shadowColor = '#00E5FF';
      ctx.shadowBlur = 6;
      for (let y = 28; y <= 112; y += 14) {
        ctx.fillRect(53, y, 14, 3.5);
      }
      ctx.shadowBlur = 0;

      // 3. Swept Aerodynamic Stabilizer Fins
      const finGrad = ctx.createLinearGradient(0, 0, 120, 0);
      finGrad.addColorStop(0, '#020617');
      finGrad.addColorStop(0.2, '#1E293B');
      finGrad.addColorStop(0.5, '#334155');
      finGrad.addColorStop(0.8, '#1E293B');
      finGrad.addColorStop(1, '#020617');
      ctx.fillStyle = finGrad;
      ctx.beginPath();
      ctx.moveTo(60, 22);
      ctx.lineTo(116, 44);
      ctx.lineTo(104, 76);
      ctx.lineTo(68, 56);
      ctx.lineTo(52, 56);
      ctx.lineTo(16, 76);
      ctx.lineTo(4, 44);
      ctx.closePath();
      ctx.fill();

      // Precision Multi-Spectrum Targeting Optics (Cybernetic Tri-Eye)
      ctx.fillStyle = '#EF4444';
      ctx.shadowColor = '#EF4444';
      ctx.shadowBlur = 8;
      ctx.beginPath(); ctx.arc(60, 36, 4.5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath(); ctx.arc(60, 36, 2, 0, Math.PI * 2); ctx.fill();
      ctx.shadowBlur = 0;
    });

    // =========================================================================
    // 12. ENEMY ELITE (Shielded Heavy Command Craft) - 130x130
    // =========================================================================
    register('enemy_elite', 130, 130, (ctx) => {
      // 1. Shimmering Hexagonal Shield Matrix (Translucent Cyan Lattice)
      ctx.strokeStyle = 'rgba(0, 229, 255, 0.45)';
      ctx.lineWidth = 1.8;
      ctx.shadowColor = 'rgba(0, 229, 255, 0.6)';
      ctx.shadowBlur = 10;
      ctx.beginPath(); ctx.arc(65, 65, 58, 0, Math.PI * 2); ctx.stroke();
      ctx.shadowBlur = 0;

      // 2. Underlying Dreadnought Hull
      ctx.fillStyle = '#050711';
      ctx.beginPath();
      ctx.moveTo(65, 120);
      ctx.lineTo(122, 52);
      ctx.lineTo(104, 14);
      ctx.lineTo(65, 28);
      ctx.lineTo(26, 14);
      ctx.lineTo(8, 52);
      ctx.closePath();
      ctx.fill();

      // 3. Faceted Gilded Obsidian Armor Carapace
      const eliteGrad = ctx.createLinearGradient(0, 0, 130, 0);
      eliteGrad.addColorStop(0, '#0F172A');
      eliteGrad.addColorStop(0.2, '#1E293B');
      eliteGrad.addColorStop(0.5, '#475569');
      eliteGrad.addColorStop(0.8, '#1E293B');
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

      // Gold-Trim Inlay Lines
      ctx.strokeStyle = '#FBBF24';
      ctx.shadowColor = '#FBBF24';
      ctx.shadowBlur = 8;
      ctx.lineWidth = 2.0;
      ctx.stroke();
      ctx.shadowBlur = 0;

      // 4. Glowing Cybernetic Command Visor (Crimson Slit Scanner)
      const visor = ctx.createLinearGradient(48, 56, 82, 56);
      visor.addColorStop(0, 'rgba(239, 68, 68, 0)');
      visor.addColorStop(0.3, '#EF4444');
      visor.addColorStop(0.5, '#FFFFFF');
      visor.addColorStop(0.7, '#EF4444');
      visor.addColorStop(1, 'rgba(239, 68, 68, 0)');
      ctx.fillStyle = visor;
      ctx.shadowColor = '#EF4444';
      ctx.shadowBlur = 10;
      ctx.beginPath(); ctx.ellipse(65, 56, 16, 4, 0, 0, Math.PI * 2); ctx.fill();
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

    // 20. HOLOGRAPHIC QUANTUM CREDIT TOKEN (32x32)
    register('pickup_credit', 32, 32, (ctx) => {
      // Golden Radial Energy Halo
      const halo = ctx.createRadialGradient(16, 16, 2, 16, 16, 15);
      halo.addColorStop(0, 'rgba(254, 240, 138, 0.9)');
      halo.addColorStop(0.4, 'rgba(245, 158, 11, 0.6)');
      halo.addColorStop(0.8, 'rgba(217, 119, 6, 0.25)');
      halo.addColorStop(1, 'transparent');
      ctx.fillStyle = halo;
      ctx.fillRect(0, 0, 32, 32);

      // Metallic Beveled Hexagon Token Base
      const hexGrad = ctx.createLinearGradient(4, 4, 28, 28);
      hexGrad.addColorStop(0, '#FEF08A');
      hexGrad.addColorStop(0.25, '#F59E0B');
      hexGrad.addColorStop(0.65, '#D97706');
      hexGrad.addColorStop(1, '#78350F');
      ctx.fillStyle = hexGrad;
      ctx.beginPath();
      ctx.moveTo(16, 3);
      ctx.lineTo(28, 9.5);
      ctx.lineTo(28, 22.5);
      ctx.lineTo(16, 29);
      ctx.lineTo(4, 22.5);
      ctx.lineTo(4, 9.5);
      ctx.closePath();
      ctx.fill();

      // Golden Edge Rim
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // Inner Cyber Circuit Tracks
      ctx.strokeStyle = '#FEF08A';
      ctx.lineWidth = 1.0;
      ctx.beginPath();
      ctx.moveTo(16, 8); ctx.lineTo(23, 12); ctx.lineTo(23, 20); ctx.lineTo(16, 24); ctx.lineTo(9, 20); ctx.lineTo(9, 12);
      ctx.closePath();
      ctx.stroke();

      // Central Quantum Nano-Prism Core
      ctx.fillStyle = '#FFFFFF';
      ctx.shadowColor = '#FBBF24';
      ctx.shadowBlur = 6;
      ctx.beginPath();
      ctx.arc(16, 16, 3.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    });

    // 21. MULTIDIMENSIONAL VOID CORE (32x32)
    register('pickup_core', 32, 32, (ctx) => {
      // Violet Singularity Glow
      const glow = ctx.createRadialGradient(16, 16, 2, 16, 16, 15);
      glow.addColorStop(0, '#FFFFFF');
      glow.addColorStop(0.35, '#E879F9');
      glow.addColorStop(0.7, '#7E22CE');
      glow.addColorStop(1, 'transparent');
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, 32, 32);

      // Faceted Quantum Diamond
      const coreGrad = ctx.createLinearGradient(4, 4, 28, 28);
      coreGrad.addColorStop(0, '#F472B6');
      coreGrad.addColorStop(0.5, '#A855F7');
      coreGrad.addColorStop(1, '#3B0764');
      ctx.fillStyle = coreGrad;
      ctx.beginPath();
      ctx.moveTo(16, 4);
      ctx.lineTo(27, 16);
      ctx.lineTo(16, 28);
      ctx.lineTo(5, 16);
      ctx.closePath();
      ctx.fill();

      // Outer Orbital Energy Rings
      ctx.strokeStyle = '#E879F9';
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // Pulsing Singularity Center
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(16, 16, 3, 0, Math.PI * 2);
      ctx.fill();
    });

    // 22. TACTICAL OVERCHARGE NANITE POD (36x36)
    register('pickup_powerup', 36, 36, (ctx) => {
      // Electric Cyan/Blue Shield Halo
      const halo = ctx.createRadialGradient(18, 18, 2, 18, 18, 17);
      halo.addColorStop(0, '#FFFFFF');
      halo.addColorStop(0.35, '#38BDF8');
      halo.addColorStop(0.7, '#0284C7');
      halo.addColorStop(1, 'transparent');
      ctx.fillStyle = halo;
      ctx.fillRect(0, 0, 36, 36);

      // High-Density Nanite Core Cube
      const cubeGrad = ctx.createLinearGradient(6, 6, 30, 30);
      cubeGrad.addColorStop(0, '#0284C7');
      cubeGrad.addColorStop(0.5, '#00E5FF');
      cubeGrad.addColorStop(1, '#0C4A6E');
      ctx.fillStyle = cubeGrad;
      ctx.beginPath();
      ctx.moveTo(18, 6);
      ctx.lineTo(29, 12);
      ctx.lineTo(29, 24);
      ctx.lineTo(18, 30);
      ctx.lineTo(7, 24);
      ctx.lineTo(7, 12);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 1.4;
      ctx.stroke();

      // Central Energy Bolt Glyph
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.moveTo(19, 10);
      ctx.lineTo(14, 18);
      ctx.lineTo(18, 18);
      ctx.lineTo(17, 26);
      ctx.lineTo(22, 17);
      ctx.lineTo(18, 17);
      ctx.closePath();
      ctx.fill();
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
