import React, { useEffect, useRef } from 'react';

/**
 * Real In-Game Starfighter Canvas Renderer
 * Directly executes the exact vector artwork routines used in Phaser 3 SpaceCombatScene.
 * Guarantees 100% visual parity between the flight deck/hangar and actual combat gameplay.
 */

function drawOrbitron(ctx, _time = 0) {

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
    
}

function drawPhoenix(ctx, _time = 0) {

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
    
}

function drawShadow(ctx, _time = 0) {

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
    
}

function drawTitan(ctx, _time = 0) {

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
    
}

function drawNova(ctx, _time = 0) {

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
    
}

export const StarfighterCanvas = ({
  shipId = 'v01-orbitron',
  shipCode = '',
  size = 200,
  width,
  height,
  animated = true,
  className = '',
  style = {}
}) => {
  const canvasRef = useRef(null);
  const animFrameRef = useRef(null);

  const canvasWidth = width || size;
  const canvasHeight = height || size;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = canvasWidth * dpr;
    canvas.height = canvasHeight * dpr;

    const s = ((shipId || '') + ' ' + (shipCode || '')).toLowerCase();
    let drawFn = drawOrbitron;
    if (s.includes('phoenix') || s.includes('s02') || s.includes('s-02')) drawFn = drawPhoenix;
    else if (s.includes('shadow') || s.includes('x03') || s.includes('x-03')) drawFn = drawShadow;
    else if (s.includes('titan') || s.includes('r04') || s.includes('r-04')) drawFn = drawTitan;
    else if (s.includes('nova') || s.includes('z05') || s.includes('z-05')) drawFn = drawNova;

    let startTime = performance.now();

    const render = (now) => {
      const elapsed = (now - startTime) / 1000;
      ctx.save();
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const scale = (Math.min(canvasWidth, canvasHeight) / 128) * dpr;
      const offsetX = (canvas.width - 128 * scale) / 2;
      const offsetY = (canvas.height - 128 * scale) / 2;

      ctx.translate(offsetX, offsetY);
      ctx.scale(scale, scale);

      drawFn(ctx, elapsed);

      ctx.restore();

      if (animated) {
        animFrameRef.current = requestAnimationFrame(render);
      }
    };

    if (animated) {
      animFrameRef.current = requestAnimationFrame(render);
    } else {
      render(performance.now());
    }

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [shipId, shipCode, canvasWidth, canvasHeight, animated]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{
        width: canvasWidth,
        height: canvasHeight,
        display: 'block',
        pointerEvents: 'none',
        ...style
      }}
    />
  );
};

export default StarfighterCanvas;
