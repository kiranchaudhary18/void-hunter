import Phaser from 'phaser';
import soundManager from '../managers/SoundManager.js';
import { BOSS_ENCOUNTERS } from '../../data/missionsData.js';

export class SpaceCombatScene extends Phaser.Scene {
  constructor() {
    super('SpaceCombatScene');
  }

  init(data) {
    this.missionId = data?.missionId || 'sector-1-mission-1';
    this.missionName = data?.missionName || 'MISSION 01: RECON PATROL';
    this.mission = data?.mission || null;
    this.selectedShip = data?.ship || { name: 'V-01 ORBITRON', speed: 380, damage: 25 };
    this.callbacks = data?.callbacks || {};

    // Boss Encounter Configuration
    const bossKey = data?.boss || this.mission?.boss;
    this.bossInfo = bossKey ? (typeof bossKey === 'string' ? BOSS_ENCOUNTERS[bossKey] : bossKey) : null;
    this.bossActive = false;
    this.bossSprite = null;
    this.bossHp = 0;
    this.bossMaxHp = 0;
    this.bossPhase = 1;

    // Sector Difficulty Scaling
    const sectorMatch = (this.missionId || '').match(/sector-(\d+)/i);
    this.sectorNum = sectorMatch ? parseInt(sectorMatch[1], 10) : (this.mission?.sectorNumber || 1);
    this.difficultyScale = {
      hpMult: 1 + (this.sectorNum - 1) * 0.22,
      speedMult: 1 + (this.sectorNum - 1) * 0.12,
      fireDelayMult: Math.max(0.68, 1 - (this.sectorNum - 1) * 0.08)
    };
    this.bossTimers = [];
    this.leviathanSpiralAngle = 0;
    this.overlordSpiralAngle = 0;

    // Combat State
    this.playerHealth = 100;
    this.playerMaxHealth = 100;
    this.playerShield = 100;
    this.playerMaxShield = 100;
    this.score = 0;
    this.creditsCollected = 0;
    this.enemiesKilled = 0;
    this.totalEnemiesInMission = 25;
    this.isGameOver = false;
    this.isVictory = false;
    this.isInvulnerable = false;
    this.lastFired = 0;
    this.fireRate = 180; // ms between shots
    this.currentWave = 1;
    this.maxWaves = this.bossInfo ? 3 : 4; // Boss arrives on Wave 3!
    this.isSpawningWave = true; // Prevent update loop from skipping to Wave 2 on startup
    this.elapsedCombatSeconds = 0;

    // Active power-up buffs
    this.activeBuffs = {
      rapidFire: false,
      spreadShot: false,
      shieldPulse: false,
      overdrive: false
    };
  }

  create() {
    const { width, height } = this.scale;

    // 1. Dual Scrolling Starfields
    this.createStarfields(width, height);

    // 2. Physics Groups
    this.playerLasers = this.physics.add.group({ runChildUpdate: true });
    this.homingMissiles = this.physics.add.group({ runChildUpdate: true });
    this.enemyBullets = this.physics.add.group({ runChildUpdate: true });
    this.enemies = this.physics.add.group({ runChildUpdate: true });
    this.pickups = this.physics.add.group({ runChildUpdate: true });

    // 3. Player Starfighter
    const shipTexture = this.selectedShip.textureKey || 'ship_orbitron';
    this.player = this.physics.add.sprite(width / 2, height - 100, shipTexture);
    this.player.setCollideWorldBounds(true);
    this.player.setDepth(10);
    this.player.setScale(0.88);

    // Forcefield Shield Bubble
    this.shieldSprite = this.add.sprite(this.player.x, this.player.y, 'shield_bubble');
    this.shieldSprite.setDepth(11);
    this.shieldSprite.setScale(0.92);
    this.shieldSprite.setVisible(false);

    // Orbiting Repair Drone Sprite
    this.droneSprite = this.add.sprite(this.player.x, this.player.y, 'repair_drone');
    this.droneSprite.setDepth(12);
    this.droneSprite.setVisible(false);
    this.droneAngle = 0;

    // 4. Input Controls
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
      space: Phaser.Input.Keyboard.KeyCodes.SPACE
    });

    // Number keys 1-8 for all 8 tactical abilities (Section 26)
    this.input.keyboard.on('keydown-ONE', () => this.activatePowerUp('spread_shot'));
    this.input.keyboard.on('keydown-TWO', () => this.activatePowerUp('shield_pulse'));
    this.input.keyboard.on('keydown-THREE', () => this.activatePowerUp('homing_missiles'));
    this.input.keyboard.on('keydown-FOUR', () => this.activatePowerUp('emp_blast'));
    this.input.keyboard.on('keydown-FIVE', () => this.activatePowerUp('emergency_warp'));
    this.input.keyboard.on('keydown-SIX', () => this.activatePowerUp('rapid_fire'));
    this.input.keyboard.on('keydown-SEVEN', () => this.activatePowerUp('repair_drone'));
    this.input.keyboard.on('keydown-EIGHT', () => this.activatePowerUp('overdrive'));

    // Mouse / Touch pointer drag and tap movement (Section 7 Mobile Controls)
    this.input.on('pointerdown', (pointer) => {
      if (!this.isGameOver) {
        this.player.x = Phaser.Math.Clamp(pointer.x, 30, width - 30);
        this.player.y = Phaser.Math.Clamp(pointer.y, 60, height - 60);
      }
    });

    this.input.on('pointermove', (pointer) => {
      if (pointer.isDown && !this.isGameOver) {
        this.player.x = Phaser.Math.Clamp(pointer.x, 30, width - 30);
        this.player.y = Phaser.Math.Clamp(pointer.y, 60, height - 60);
      }
    });

    // 5. Collisions & Overlaps
    // Player lasers hit enemies
    this.physics.add.overlap(this.playerLasers, this.enemies, this.handleLaserHitEnemy, null, this);
    // Homing missiles hit enemies
    this.physics.add.overlap(this.homingMissiles, this.enemies, this.handleMissileHitEnemy, null, this);
    // Enemy bullets hit player
    this.physics.add.overlap(this.enemyBullets, this.player, this.handleBulletHitPlayer, null, this);
    // Enemies ram into player
    this.physics.add.overlap(this.enemies, this.player, this.handleEnemyRamPlayer, null, this);
    // Player collects drops
    this.physics.add.overlap(this.pickups, this.player, this.handleCollectPickup, null, this);

    // Enemy Health Bars Graphics Layer (Rendered above damaged hostiles)
    this.enemyHealthBars = this.add.graphics();
    this.enemyHealthBars.setDepth(15);

    // Initial Wave 1 Announcement
    this.game.events.emit('wave-announcement', {
      wave: 1,
      maxWaves: this.maxWaves
    });

    // 6. Spawn Initial Wave (Wave 1 starts cleanly)
    this.time.delayedCall(850, () => {
      this.spawnWave(1);
      this.isSpawningWave = false;
    });

    // Live Combat Mission Timer (Counts active seconds)
    this.time.addEvent({
      delay: 1000,
      callback: () => {
        if (!this.isGameOver && !this.scene.isPaused()) {
          this.elapsedCombatSeconds++;
          this.emitStats();
        }
      },
      loop: true
    });

    // Shield passive regeneration every second if not damaged
    this.time.addEvent({
      delay: 1000,
      callback: () => {
        if (!this.isGameOver && this.playerShield < this.playerMaxShield) {
          this.playerShield = Math.min(this.playerMaxShield, this.playerShield + 5);
          this.emitStats();
        }
      },
      loop: true
    });

    // Initial stats emit to React HUD
    this.emitStats();
  }

  createStarfields(width, height) {
    // Distant slow starfield
    this.starsSlow = [];
    for (let i = 0; i < 60; i++) {
      const star = this.add.circle(
        Phaser.Math.Between(0, width),
        Phaser.Math.Between(0, height),
        Phaser.Math.Between(1, 1.5),
        0x67E8F9,
        0.5
      );
      this.starsSlow.push(star);
    }

    // Fast foreground starfield
    this.starsFast = [];
    for (let i = 0; i < 40; i++) {
      const star = this.add.circle(
        Phaser.Math.Between(0, width),
        Phaser.Math.Between(0, height),
        Phaser.Math.Between(1.5, 2.5),
        0xFFFFFF,
        0.85
      );
      this.starsFast.push(star);
    }
  }

  update(time, _delta) {
    if (this.isGameOver) return;

    // Scroll Starfield
    this.starsSlow.forEach((s) => {
      s.y += 1.2;
      if (s.y > this.scale.height) s.y = 0;
    });
    this.starsFast.forEach((s) => {
      s.y += 3.2;
      if (s.y > this.scale.height) s.y = 0;
    });

    // Player Movement (Desktop WASD & Arrows)
    const speed = (this.activeBuffs.overdrive ? 1.4 : 1.0) * (this.selectedShip.speed || 380);
    let vx = 0;
    let vy = 0;

    if (this.cursors.left.isDown || this.wasd.left.isDown) vx = -speed;
    else if (this.cursors.right.isDown || this.wasd.right.isDown) vx = speed;

    if (this.cursors.up.isDown || this.wasd.up.isDown) vy = -speed;
    else if (this.cursors.down.isDown || this.wasd.down.isDown) vy = speed;

    this.player.setVelocity(vx, vy);

    // Realistic Twin Plasma Rocket Engine Flares (Player)
    if (this.player && this.player.active && !this.isGameOver) {
      const leftNozzleX = this.player.x - 16;
      const rightNozzleX = this.player.x + 16;
      const nozzleY = this.player.y + 42;
      const isBoosting = vy < 0;

      [leftNozzleX, rightNozzleX].forEach((nx) => {
        // Inner hot white/cyan core jet
        const jet = this.add.circle(
          nx + Phaser.Math.Between(-1, 1),
          nozzleY + Phaser.Math.Between(0, 3),
          isBoosting ? Phaser.Math.Between(4, 6) : Phaser.Math.Between(3, 4),
          0x00E5FF,
          0.95
        );
        jet.setDepth(9);
        this.tweens.add({
          targets: jet,
          y: jet.y + (isBoosting ? Phaser.Math.Between(26, 42) : Phaser.Math.Between(16, 26)),
          scale: 0.1,
          alpha: 0,
          duration: isBoosting ? 160 : 120,
          onComplete: () => jet.destroy()
        });

        // Outer radiant blue/orange afterburner flame
        if (Math.random() < 0.6) {
          const plume = this.add.circle(
            nx + Phaser.Math.Between(-3, 3),
            nozzleY + 8,
            isBoosting ? Phaser.Math.Between(5, 8) : Phaser.Math.Between(4, 6),
            0x3B82F6,
            0.55
          );
          plume.setDepth(8);
          this.tweens.add({
            targets: plume,
            y: plume.y + (isBoosting ? Phaser.Math.Between(35, 55) : Phaser.Math.Between(22, 35)),
            scale: 0.2,
            alpha: 0,
            duration: 220,
            onComplete: () => plume.destroy()
          });
        }
      });
    }

    // Hostile Fleet Ion Trails (Trailing behind incoming enemies)
    this.enemies.getChildren().forEach((enemy) => {
      if (enemy.active && Math.random() < 0.22) {
        const trail = this.add.circle(
          enemy.x + Phaser.Math.Between(-6, 6),
          enemy.y - 25,
          Phaser.Math.Between(2, 4),
          0xEF4444,
          0.55
        );
        trail.setDepth(4);
        this.tweens.add({
          targets: trail,
          y: trail.y - Phaser.Math.Between(15, 25),
          alpha: 0,
          scale: 0.2,
          duration: 250,
          onComplete: () => trail.destroy()
        });
      }
    });

    // Keep shield sprite aligned with player
    this.shieldSprite.setPosition(this.player.x, this.player.y);

    // Orbiting Repair Drone Position
    if (this.droneSprite.visible) {
      this.droneAngle += 0.06;
      const droneRadius = 52;
      this.droneSprite.setPosition(
        this.player.x + Math.cos(this.droneAngle) * droneRadius,
        this.player.y + Math.sin(this.droneAngle) * droneRadius
      );
    }

    // Auto-Targeting & Guidance for Homing Missiles with Rocket Flare Particles
    this.homingMissiles.getChildren().forEach((missile) => {
      // Dynamic rocket engine smoke and spark contrail
      if (Math.random() < 0.75) {
        const spark = this.add.circle(
          missile.x + Phaser.Math.Between(-3, 3),
          missile.y + 34,
          Phaser.Math.Between(3, 5),
          0xF97316,
          0.85
        );
        spark.setDepth(8);
        this.tweens.add({
          targets: spark,
          alpha: 0,
          scale: 0.2,
          y: spark.y + 16,
          duration: 220,
          onComplete: () => spark.destroy()
        });
      }

      let nearestEnemy = null;
      let minDist = 9999;
      this.enemies.getChildren().forEach((enemy) => {
        if (enemy.active) {
          const d = Phaser.Math.Distance.Between(missile.x, missile.y, enemy.x, enemy.y);
          if (d < minDist) {
            minDist = d;
            nearestEnemy = enemy;
          }
        }
      });

      if (nearestEnemy) {
        this.physics.moveToObject(missile, nearestEnemy, 680);
        const angle = Phaser.Math.Angle.Between(missile.x, missile.y, nearestEnemy.x, nearestEnemy.y);
        missile.setRotation(angle + Math.PI / 2);
      }
    });

    // High-Impact Magnetic Pull for Floating Pickups (Section 13)
    const magnetRadius = 240;
    this.pickups.getChildren().forEach((pickup) => {
      if (pickup.active) {
        const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, pickup.x, pickup.y);
        if (dist < magnetRadius) {
          this.physics.moveToObject(pickup, this.player, 420);
        }
      }
    });

    // Render Real-Time Enemy Health Bars Above Hostiles (Matching Reference Space Shooter)
    if (this.enemyHealthBars) {
      this.enemyHealthBars.clear();
      this.enemies.getChildren().forEach((enemy) => {
        const shouldShowBar = (enemy.hasTakenDamage || enemy.hp < enemy.maxHp || enemy.isElite || enemy.texture.key === 'enemy_cruiser');
        if (enemy.active && shouldShowBar && enemy.hp > 0 && enemy.y > -20 && enemy.y < this.scale.height + 20) {
          const barWidth = enemy.isBoss ? 96 : (enemy.isElite || enemy.texture.key === 'enemy_cruiser' ? 52 : 38);
          const barHeight = 5;
          const x = enemy.x - barWidth / 2;
          const y = enemy.y - (enemy.displayHeight / 2) - 10;

          // Outer dark frame with border
          this.enemyHealthBars.fillStyle(0x060919, 0.95);
          this.enemyHealthBars.fillRoundedRect(x - 1, y - 1, barWidth + 2, barHeight + 2, 2);

          // Red health fill proportional to HP (matching reference screenshot)
          const pct = Math.max(0, Math.min(1, enemy.hp / enemy.maxHp));
          const fillColor = pct > 0.45 ? 0xEF4444 : 0xDC2626;
          this.enemyHealthBars.fillStyle(fillColor, 1);
          this.enemyHealthBars.fillRoundedRect(x, y, Math.max(2, barWidth * pct), barHeight, 1);

          // Top highlight line for 3D arcade effect
          this.enemyHealthBars.fillStyle(0xFCA5A5, 0.5);
          this.enemyHealthBars.fillRect(x, y, Math.max(2, barWidth * pct), 1.5);
        }
      });
    }

    // Off-screen enemy bounds checking & wrapping to prevent wave stalling
    this.enemies.getChildren().forEach((enemy) => {
      if (enemy.active && !enemy.isBoss) {
        // If enemy flew past bottom of the combat screen
        if (enemy.y > this.scale.height + 40) {
          enemy.loopCount = (enemy.loopCount || 0) + 1;
          if (enemy.loopCount < 2) {
            // Re-enter from the top for another attack run
            enemy.y = -40;
            enemy.x = Phaser.Math.Between(50, this.scale.width - 50);
          } else {
            // Exited airspace: destroy cleanly so wave can advance
            if (enemy.fireTimer) enemy.fireTimer.remove();
            enemy.destroy();
          }
        }
        // Horizontal screen bounds bounce for interceptors
        if (enemy.x < -30) {
          enemy.x = 20;
          if (enemy.body) enemy.setVelocityX(Math.abs(enemy.body.velocity.x || 80));
        } else if (enemy.x > this.scale.width + 30) {
          enemy.x = this.scale.width - 20;
          if (enemy.body) enemy.setVelocityX(-Math.abs(enemy.body.velocity.x || 80));
        }
      }
    });

    // Clean up out-of-bounds lasers, bullets, and pickups
    this.playerLasers.getChildren().forEach((l) => {
      if (l.active && (l.y < -50 || l.y > this.scale.height + 50 || l.x < -50 || l.x > this.scale.width + 50)) {
        l.destroy();
      }
    });
    this.enemyBullets.getChildren().forEach((b) => {
      if (b.active && (b.y < -50 || b.y > this.scale.height + 50 || b.x < -50 || b.x > this.scale.width + 50)) {
        b.destroy();
      }
    });
    this.pickups.getChildren().forEach((p) => {
      if (p.active && p.y > this.scale.height + 50) {
        p.destroy();
      }
    });

    // Auto-fire / Space fire
    const isFiring = this.cursors.space.isDown || this.wasd.space.isDown || this.input.activePointer.isDown;
    const currentRate = this.activeBuffs.rapidFire ? this.fireRate * 0.45 : this.fireRate;

    if (isFiring && time > this.lastFired + currentRate) {
      this.firePlayerLaser();
      this.lastFired = time;
    }

    // Check wave completion
    if (this.enemies.countActive(true) === 0 && !this.isSpawningWave && !this.isGameOver) {
      if (this.currentWave < this.maxWaves) {
        this.currentWave++;
        this.isSpawningWave = true;
        this.emitStats();
        this.game.events.emit('wave-announcement', {
          wave: this.currentWave,
          maxWaves: this.maxWaves
        });
        soundManager.playPowerUp();
        this.time.delayedCall(1200, () => {
          this.spawnWave(this.currentWave);
          this.isSpawningWave = false;
        });
      } else if (!this.isVictory && !this.bossActive) {
        this.triggerVictory();
      }
    }
  }

  firePlayerLaser() {
    const x = this.player.x;
    const y = this.player.y - 20;

    soundManager.playLaser();

    if (this.activeBuffs.spreadShot) {
      // 5-way spread
      const angles = [-0.35, -0.18, 0, 0.18, 0.35];
      angles.forEach((angle) => {
        const laser = this.playerLasers.create(x, y, 'player_laser');
        laser.setScale(0.95);
        laser.setVelocity(Math.sin(angle) * 700, -Math.cos(angle) * 700);
        laser.setRotation(angle);
      });
    } else {
      // Twin parallel lasers
      const l1 = this.playerLasers.create(x - 14, y, 'player_laser');
      const l2 = this.playerLasers.create(x + 14, y, 'player_laser');
      l1.setScale(0.95);
      l2.setScale(0.95);
      l1.setVelocityY(-750);
      l2.setVelocityY(-750);
    }
  }

  spawnWave(waveNum) {
    const { width } = this.scale;

    // Boss Encounter on Final Wave if boss is present
    if (this.bossInfo && waveNum >= this.maxWaves) {
      this.spawnBoss();
      return;
    }

    switch (waveNum) {
      case 1:
        // 5 Scout Fighters swooping down in V formation
        for (let i = 0; i < 5; i++) {
          const offsetX = (i - 2) * 55;
          const enemy = this.createEnemy('enemy_scout', width / 2 + offsetX, -40 - Math.abs(i - 2) * 30, 40, 50);
          enemy.setVelocity(0, 110);
        }
        break;

      case 2:
        // 4 Scouts + 2 Fast Interceptors
        for (let i = 0; i < 4; i++) {
          const enemy = this.createEnemy('enemy_scout', 60 + i * ((width - 120) / 3), -30 - i * 20, 45, 50);
          enemy.setVelocity(0, 130);
        }
        for (let i = 0; i < 2; i++) {
          const enemy = this.createEnemy('enemy_interceptor', i === 0 ? 80 : width - 80, -90, 80, 100);
          enemy.setVelocity(i === 0 ? 60 : -60, 170);
        }
        break;

      case 3:
        // 1 Armored Cruiser + 1 Long-Range Gunship + 3 Interceptors
        const cruiser = this.createEnemy('enemy_cruiser', width / 2, -70, 350, 300);
        cruiser.setVelocity(0, 50);
        cruiser.setCollideWorldBounds(true);
        cruiser.setBounce(1);

        // Cruiser periodically fires burst of 3 bullets
        this.time.addEvent({
          delay: 1400,
          callback: () => {
            if (cruiser.active) {
              this.fireEnemyBullet(cruiser.x, cruiser.y + 30, 0, 220);
              this.fireEnemyBullet(cruiser.x - 15, cruiser.y + 25, -60, 200);
              this.fireEnemyBullet(cruiser.x + 15, cruiser.y + 25, 60, 200);
            }
          },
          repeat: 12
        });

        this.createEnemy('enemy_gunship', width * 0.3, -50, 150, 200);

        for (let i = 0; i < 3; i++) {
          const enemy = this.createEnemy('enemy_interceptor', 80 + i * ((width - 160) / 2), -120 - i * 25, 80, 100);
          enemy.setVelocity(0, 150);
        }
        break;

      case 4:
        // Elite Wave: 1 Elite Enemy + 2 Long-Range Gunships + 3 Scouts
        this.createEnemy('enemy_elite', width / 2, -60, 240, 450);
        this.createEnemy('enemy_gunship', width * 0.22, -80, 150, 200);
        this.createEnemy('enemy_gunship', width * 0.78, -80, 150, 200);

        for (let i = 0; i < 3; i++) {
          this.createEnemy('enemy_scout', 80 + i * ((width - 160) / 2), -140 - i * 30, 50, 50).setVelocity(0, 140);
        }
        break;

      case 5:
      default:
        // Combined Fleet: 1 Elite + 1 Cruiser + 2 Gunships + 3 Interceptors
        this.createEnemy('enemy_elite', width / 2, -60, 260, 450);
        this.createEnemy('enemy_cruiser', width * 0.75, -80, 350, 300).setVelocity(-30, 45);
        this.createEnemy('enemy_gunship', width * 0.25, -90, 150, 200);

        for (let i = 0; i < 3; i++) {
          this.createEnemy('enemy_interceptor', 80 + i * ((width - 160) / 2), -160, 90, 120).setVelocity(Phaser.Math.Between(-30, 30), 165);
        }
        break;
    }
  }

  clearBossTimers() {
    if (this.bossTimers && this.bossTimers.length) {
      this.bossTimers.forEach((t) => {
        if (t && t.remove) t.remove();
      });
      this.bossTimers = [];
    }
  }

  spawnBoss() {
    this.bossActive = true;
    this.clearBossTimers();
    this.bossHp = this.bossInfo.hp || 1500;
    this.bossMaxHp = this.bossHp;
    this.bossPhase = 1;
    const { width } = this.scale;

    // Audio & Screen Alert
    soundManager.playBossAlarm();
    soundManager.playHaptic("bossAlarm");
    this.cameras.main.shake(450, 0.025);

    // Flashing Warning Text on Screen
    const warningText = this.add.text(width / 2, 220, `⚠️ WARNING: ${this.bossInfo.name} DETECTED ⚠️`, {
      fontFamily: 'Orbitron, sans-serif',
      fontSize: '20px',
      color: '#EF4444',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5).setDepth(25);

    this.tweens.add({
      targets: warningText,
      alpha: 0,
      yoyo: true,
      repeat: 3,
      duration: 350,
      onComplete: () => warningText.destroy()
    });

    // Create Boss Sprite
    const texture = this.bossInfo.textureKey || 'boss_orion';
    this.bossSprite = this.enemies.create(width / 2, -100, texture);
    this.bossSprite.hp = this.bossHp;
    this.bossSprite.maxHp = this.bossMaxHp;
    this.bossSprite.scoreValue = 2000;
    this.bossSprite.isBoss = true;
    this.bossSprite.setDepth(8);
    this.bossSprite.setScale(1.05);
    this.bossSprite.setCollideWorldBounds(true);
    this.bossSprite.setBounce(1);

    // Entrance Animation
    this.tweens.add({
      targets: this.bossSprite,
      y: 140,
      duration: 2200,
      ease: 'Power2',
      onComplete: () => {
        if (!this.bossSprite || !this.bossSprite.active) return;
        this.bossSprite.setVelocityX(85);
        this.startBossCombatLoop();
      }
    });

    this.emitStats();
  }

  startBossCombatLoop() {
    this.clearBossTimers();
    const bossId = this.bossInfo?.id || '';

    if (bossId === 'boss-colossus') {
      this.startColossusBossLoop();
    } else if (bossId === 'boss-leviathan') {
      this.startLeviathanBossLoop();
    } else if (bossId === 'boss-rift') {
      this.startRiftBossLoop();
    } else if (bossId === 'boss-overlord') {
      this.startOverlordBossLoop();
    } else {
      this.startOrionBossLoop();
    }
  }

  // Sector 1: Orion Dreadnought (Twin Heavy Lasers + Forward Torpedo Salvo)
  startOrionBossLoop() {
    const isP2 = this.bossPhase === 2;
    // 1. Dual Heavy Laser Battery
    const laserTimer = this.time.addEvent({
      delay: isP2 ? 950 : 1400,
      callback: () => {
        if (!this.bossSprite || !this.bossSprite.active) return;
        soundManager.playBossLaser();
        const b1 = this.enemyBullets.create(this.bossSprite.x - 38, this.bossSprite.y + 36, 'boss_laser');
        const b2 = this.enemyBullets.create(this.bossSprite.x + 38, this.bossSprite.y + 36, 'boss_laser');
        const spd = isP2 ? 360 : 300;
        if (b1) { b1.setVelocityY(spd); b1.checkWorldBounds = true; b1.outOfBoundsKill = true; }
        if (b2) { b2.setVelocityY(spd); b2.checkWorldBounds = true; b2.outOfBoundsKill = true; }
      },
      loop: true
    });
    this.bossTimers.push(laserTimer);

    // 2. Spread Salvo
    const spreadTimer = this.time.addEvent({
      delay: isP2 ? 2200 : 2800,
      callback: () => {
        if (!this.bossSprite || !this.bossSprite.active) return;
        soundManager.playEnemyLaser();
        const angles = isP2 ? [-0.55, -0.28, 0, 0.28, 0.55] : [-0.35, 0, 0.35];
        angles.forEach((ang) => {
          const bullet = this.enemyBullets.create(this.bossSprite.x, this.bossSprite.y + 24, 'enemy_bullet');
          if (bullet) {
            bullet.setVelocity(Math.sin(ang) * 240, Math.cos(ang) * 240);
            bullet.checkWorldBounds = true;
            bullet.outOfBoundsKill = true;
          }
        });
      },
      loop: true
    });
    this.bossTimers.push(spreadTimer);

    // Phase 2 Carpet Bombs
    if (isP2) {
      const bombTimer = this.time.addEvent({
        delay: 3200,
        callback: () => {
          if (!this.bossSprite || !this.bossSprite.active) return;
          [-50, 0, 50].forEach((off) => {
            const b = this.enemyBullets.create(this.bossSprite.x + off, this.bossSprite.y + 20, 'enemy_bullet');
            if (b) { b.setVelocity(off * 1.2, 190); b.checkWorldBounds = true; b.outOfBoundsKill = true; }
          });
        },
        loop: true
      });
      this.bossTimers.push(bombTimer);
    }
  }

  // Sector 2: Crimson Colossus (Armor Plating, Quad Cannons, 8/12-Way Radial Shockwaves)
  startColossusBossLoop() {
    const isP2 = this.bossPhase === 2;
    // 1. Alternating Quad Heavy Plasma
    let barrelToggle = false;
    const plasmaTimer = this.time.addEvent({
      delay: isP2 ? 800 : 1100,
      callback: () => {
        if (!this.bossSprite || !this.bossSprite.active) return;
        soundManager.playBossLaser();
        const offsets = barrelToggle ? [-45, -15] : [15, 45];
        barrelToggle = !barrelToggle;
        offsets.forEach((off) => {
          const b = this.enemyBullets.create(this.bossSprite.x + off, this.bossSprite.y + 35, 'boss_laser');
          if (b) { b.setVelocity(0, 320); b.checkWorldBounds = true; b.outOfBoundsKill = true; }
        });
      },
      loop: true
    });
    this.bossTimers.push(plasmaTimer);

    // 2. Radial Shockwave Rings (8-way in P1, 12-way in P2)
    const ringTimer = this.time.addEvent({
      delay: isP2 ? 2100 : 2900,
      callback: () => {
        if (!this.bossSprite || !this.bossSprite.active) return;
        soundManager.playEnemyLaser();
        const count = isP2 ? 12 : 8;
        const spd = isP2 ? 230 : 190;
        for (let i = 0; i < count; i++) {
          const ang = (i * Math.PI * 2) / count;
          const b = this.enemyBullets.create(this.bossSprite.x, this.bossSprite.y + 20, 'enemy_bullet');
          if (b) {
            b.setVelocity(Math.cos(ang) * spd, Math.sin(ang) * spd);
            b.checkWorldBounds = true;
            b.outOfBoundsKill = true;
          }
        }
      },
      loop: true
    });
    this.bossTimers.push(ringTimer);

    // P2: Targeted Crimson Flak
    if (isP2) {
      const flakTimer = this.time.addEvent({
        delay: 2600,
        callback: () => {
          if (!this.bossSprite || !this.bossSprite.active || !this.player || this.isGameOver) return;
          const ang = Phaser.Math.Angle.Between(this.bossSprite.x, this.bossSprite.y, this.player.x, this.player.y);
          [-0.18, 0, 0.18].forEach((offset) => {
            const b = this.enemyBullets.create(this.bossSprite.x, this.bossSprite.y + 25, 'boss_laser');
            if (b) {
              b.setVelocity(Math.cos(ang + offset) * 310, Math.sin(ang + offset) * 310);
              b.checkWorldBounds = true;
              b.outOfBoundsKill = true;
            }
          });
        },
        loop: true
      });
      this.bossTimers.push(flakTimer);
    }
  }

  // Sector 3: Glacial Leviathan (Continuous Rotating Spiral Bullet Hell & Frost Sweeps)
  startLeviathanBossLoop() {
    const isP2 = this.bossPhase === 2;
    // 1. Continuous Rotating Spiral Vortex
    const spiralTimer = this.time.addEvent({
      delay: isP2 ? 140 : 190,
      callback: () => {
        if (!this.bossSprite || !this.bossSprite.active) return;
        this.leviathanSpiralAngle += 0.26;
        const arms = isP2 ? 4 : 3;
        const step = (Math.PI * 2) / arms;
        for (let i = 0; i < arms; i++) {
          const ang = this.leviathanSpiralAngle + i * step;
          const b = this.enemyBullets.create(this.bossSprite.x, this.bossSprite.y + 20, 'enemy_bullet');
          if (b) {
            b.setVelocity(Math.cos(ang) * 210, Math.sin(ang) * 210);
            b.checkWorldBounds = true;
            b.outOfBoundsKill = true;
          }
        }
      },
      loop: true
    });
    this.bossTimers.push(spiralTimer);

    // 2. Dual Counter-Rotating Spiral in Phase 2
    if (isP2) {
      const counterSpiral = this.time.addEvent({
        delay: 220,
        callback: () => {
          if (!this.bossSprite || !this.bossSprite.active) return;
          const counterAngle = -this.leviathanSpiralAngle * 1.1;
          for (let i = 0; i < 3; i++) {
            const ang = counterAngle + (i * Math.PI * 2) / 3;
            const b = this.enemyBullets.create(this.bossSprite.x, this.bossSprite.y + 20, 'boss_laser');
            if (b) {
              b.setVelocity(Math.cos(ang) * 190, Math.sin(ang) * 190);
              b.checkWorldBounds = true;
              b.outOfBoundsKill = true;
            }
          }
        },
        loop: true
      });
      this.bossTimers.push(counterSpiral);
    }

    // 3. Sweeping Frost Beam fan
    const beamTimer = this.time.addEvent({
      delay: 3400,
      callback: () => {
        if (!this.bossSprite || !this.bossSprite.active) return;
        soundManager.playBossLaser();
        for (let a = -0.55; a <= 0.55; a += 0.22) {
          const b = this.enemyBullets.create(this.bossSprite.x, this.bossSprite.y + 30, 'boss_laser');
          if (b) {
            b.setVelocity(Math.sin(a) * 280, Math.cos(a) * 280);
            b.checkWorldBounds = true;
            b.outOfBoundsKill = true;
          }
        }
      },
      loop: true
    });
    this.bossTimers.push(beamTimer);
  }

  // Sector 4: Rift Annihilator (3 Phases: Quantum Warp Dash, Dimensional Ripples, Desperation Void Collapse)
  startRiftBossLoop() {
    const phase = this.bossPhase;
    // 1. Quantum Warp Dash (Blinks across screen quadrants)
    const warpTimer = this.time.addEvent({
      delay: phase === 3 ? 1900 : 3200,
      callback: () => {
        if (!this.bossSprite || !this.bossSprite.active) return;
        const { width } = this.scale;
        const targetX = Phaser.Math.Between(width * 0.2, width * 0.8);
        this.cameras.main.flash(120, 124, 58, 237);
        soundManager.playWarpJump();
        this.bossSprite.setPosition(targetX, 135);
        // Instant crossfire salvo upon exit
        [-0.45, -0.22, 0, 0.22, 0.45].forEach((a) => {
          const b = this.enemyBullets.create(this.bossSprite.x, this.bossSprite.y + 25, 'boss_laser');
          if (b) {
            b.setVelocity(Math.sin(a) * 310, Math.cos(a) * 310);
            b.checkWorldBounds = true;
            b.outOfBoundsKill = true;
          }
        });
      },
      loop: true
    });
    this.bossTimers.push(warpTimer);

    // 2. Dimensional Ripple Wave (Expanding circular ripples)
    const rippleTimer = this.time.addEvent({
      delay: phase === 3 ? 1800 : 2600,
      callback: () => {
        if (!this.bossSprite || !this.bossSprite.active) return;
        soundManager.playEnemyLaser();
        const rays = phase === 3 ? 14 : 10;
        for (let i = 0; i < rays; i++) {
          const ang = (i * Math.PI * 2) / rays;
          const b = this.enemyBullets.create(this.bossSprite.x, this.bossSprite.y + 20, 'enemy_bullet');
          if (b) {
            b.setVelocity(Math.cos(ang) * (phase === 3 ? 240 : 200), Math.sin(ang) * (phase === 3 ? 240 : 200));
            b.checkWorldBounds = true;
            b.outOfBoundsKill = true;
          }
        }
      },
      loop: true
    });
    this.bossTimers.push(rippleTimer);

    // Phase 3 Void Rain
    if (phase === 3) {
      const rainTimer = this.time.addEvent({
        delay: 600,
        callback: () => {
          if (!this.bossSprite || !this.bossSprite.active) return;
          const rx = Phaser.Math.Between(40, this.scale.width - 40);
          const b = this.enemyBullets.create(rx, 20, 'enemy_bullet');
          if (b) { b.setVelocity(0, 220); b.checkWorldBounds = true; b.outOfBoundsKill = true; }
        },
        loop: true
      });
      this.bossTimers.push(rainTimer);
    }
  }

  // Sector 5: Void Overlord (The Apex Sovereign - 3 Dynamic Bullet Hell Phases)
  startOverlordBossLoop() {
    const phase = this.bossPhase;
    // 1. Continuous Rotating Galaxy Vortex
    const vortexTimer = this.time.addEvent({
      delay: phase === 3 ? 110 : (phase === 2 ? 150 : 190),
      callback: () => {
        if (!this.bossSprite || !this.bossSprite.active) return;
        this.overlordSpiralAngle += phase === 3 ? 0.38 : 0.28;
        const arms = phase === 3 ? 5 : 4;
        for (let i = 0; i < arms; i++) {
          const ang = this.overlordSpiralAngle + (i * Math.PI * 2) / arms;
          const b = this.enemyBullets.create(this.bossSprite.x, this.bossSprite.y + 25, 'enemy_bullet');
          if (b) {
            b.setVelocity(Math.cos(ang) * 230, Math.sin(ang) * 230);
            b.checkWorldBounds = true;
            b.outOfBoundsKill = true;
          }
        }
      },
      loop: true
    });
    this.bossTimers.push(vortexTimer);

    // 2. Heavy Antimatter Beams
    const beamTimer = this.time.addEvent({
      delay: phase === 3 ? 1200 : 1800,
      callback: () => {
        if (!this.bossSprite || !this.bossSprite.active) return;
        soundManager.playBossLaser();
        [-40, 0, 40].forEach((off) => {
          const b = this.enemyBullets.create(this.bossSprite.x + off, this.bossSprite.y + 35, 'boss_laser');
          if (b) {
            b.setVelocity(off * 0.8, 360);
            b.checkWorldBounds = true;
            b.outOfBoundsKill = true;
          }
        });
      },
      loop: true
    });
    this.bossTimers.push(beamTimer);

    // 3. Antimatter Nova (Phase 2 & 3: 16-point to 20-point starburst)
    if (phase >= 2) {
      const novaTimer = this.time.addEvent({
        delay: phase === 3 ? 2000 : 2700,
        callback: () => {
          if (!this.bossSprite || !this.bossSprite.active) return;
          soundManager.playExplosion(false);
          const rays = phase === 3 ? 20 : 16;
          for (let i = 0; i < rays; i++) {
            const ang = (i * Math.PI * 2) / rays;
            const b = this.enemyBullets.create(this.bossSprite.x, this.bossSprite.y + 20, 'boss_laser');
            if (b) {
              b.setVelocity(Math.cos(ang) * 250, Math.sin(ang) * 250);
              b.checkWorldBounds = true;
              b.outOfBoundsKill = true;
            }
          }
        },
        loop: true
      });
      this.bossTimers.push(novaTimer);
    }
  }

  destroyBoss() {
    this.bossActive = false;
    this.clearBossTimers();
    soundManager.playHaptic("bossDefeat");

    this.score += 2500;
    this.enemiesKilled++;

    // Chain Explosions & Screenshake
    for (let i = 0; i < 5; i++) {
      this.time.delayedCall(i * 180, () => {
        soundManager.playExplosion(true);
        this.cameras.main.shake(140, 0.02);
      });
    }

    // High Value Boss Loot Drops
    for (let i = 0; i < 6; i++) {
      this.spawnPickup(this.bossSprite.x + (i - 2.5) * 18, this.bossSprite.y + Phaser.Math.Between(-15, 20));
    }
    // Drop guaranteed energy cores
    for (let i = 0; i < 3; i++) {
      const p = this.pickups.create(this.bossSprite.x + (i - 1) * 25, this.bossSprite.y, 'pickup_core');
      p.pickupType = 'core';
      p.pickupVal = 1;
      p.setVelocityY(80);
    }

    this.bossSprite.destroy();
    this.emitStats();

    // Trigger Victory after chain explosions
    this.time.delayedCall(1600, () => {
      if (!this.isVictory) this.triggerVictory();
    });
  }

  createEnemy(texture, x, y, health, scoreVal) {
    const scaledHp = Math.round(health * (this.difficultyScale?.hpMult || 1));
    const scaledScore = Math.round(scoreVal * (1 + ((this.sectorNum || 1) - 1) * 0.15));
    const enemy = this.enemies.create(x, y, texture);
    enemy.hp = scaledHp;
    enemy.maxHp = scaledHp;
    enemy.scoreValue = scaledScore;
    enemy.setDepth(5);
    enemy.setScale(0.82); // Optimized scale for mobile visibility and clarity

    // Section 9: Long-Range Gunship AI (maintains distance, snipes player)
    if (texture === 'enemy_gunship') {
      enemy.isGunship = true;
      enemy.setVelocity(Phaser.Math.Between(-60, 60), 65);
      enemy.setCollideWorldBounds(true);
      enemy.setBounce(1);

      // Settle at high altitude and strafe
      this.time.delayedCall(1400, () => {
        if (enemy.active && enemy.body) {
          enemy.setVelocityY(0);
          enemy.setVelocityX(Phaser.Math.Between(55, 85) * (Math.random() < 0.5 ? 1 : -1));
        }
      });

      const fireTimer = this.time.addEvent({
        delay: 1700,
        callback: () => {
          if (enemy.active && this.player && !this.isGameOver) {
            // Targeted sniper laser aimed directly at player starfighter
            const angle = Phaser.Math.Angle.Between(enemy.x, enemy.y, this.player.x, this.player.y);
            this.fireEnemyBullet(enemy.x, enemy.y + 18, Math.cos(angle) * 320, Math.sin(angle) * 320);
          }
        },
        loop: true
      });
      enemy.fireTimer = fireTimer;
      return enemy;
    }

    // Section 9: Elite Enemy AI (Heavy Shielded Craft)
    if (texture === 'enemy_elite') {
      enemy.isElite = true;
      enemy.setVelocity(0, 65);
      enemy.setCollideWorldBounds(true);
      enemy.setBounce(1);

      // Periodic dual plasma volley
      const fireTimer = this.time.addEvent({
        delay: 1800,
        callback: () => {
          if (enemy.active && !this.isGameOver) {
            this.fireEnemyBullet(enemy.x - 18, enemy.y + 22, -55, 230);
            this.fireEnemyBullet(enemy.x + 18, enemy.y + 22, 55, 230);
          }
        },
        loop: true
      });
      enemy.fireTimer = fireTimer;
      return enemy;
    }

    // AI periodic firing for Scouts and Cruisers
    const fireInterval = texture === 'enemy_cruiser' ? 2000 : Phaser.Math.Between(1800, 3200);
    const fireTimer = this.time.addEvent({
      delay: fireInterval,
      callback: () => {
        if (enemy.active && enemy.y > 20 && enemy.y < this.scale.height - 100) {
          this.fireEnemyBullet(enemy.x, enemy.y + 16, 0, 240);
        }
      },
      loop: true
    });
    enemy.fireTimer = fireTimer;

    return enemy;
  }

  fireEnemyBullet(x, y, vx, vy) {
    soundManager.playEnemyLaser();
    const b = this.enemyBullets.create(x, y, 'enemy_bullet');
    b.setVelocity(vx, vy);
    b.checkWorldBounds = true;
    b.outOfBoundsKill = true;
  }

  handleLaserHitEnemy(laser, enemy) {
    laser.destroy();
    const damage = (this.activeBuffs.overdrive ? 1.5 : 1.0) * (this.selectedShip.damage || 25);
    
    if (enemy.isBoss) {
      this.bossHp = Math.max(0, this.bossHp - damage);
      enemy.hp = this.bossHp;

      // Multi-Phase Boss Transitions (2-phase or 3-phase)
      const isThreePhase = this.bossInfo?.phases === 3;
      if (isThreePhase) {
        if (this.bossPhase === 1 && this.bossHp <= this.bossMaxHp * 0.65) {
          this.bossPhase = 2;
          soundManager.playBossAlarm();
          soundManager.playHaptic("bossAlarm");
          this.cameras.main.shake(350, 0.025);
          if (enemy.body) enemy.setVelocityX(enemy.body.velocity.x * 1.35);
          const { width } = this.scale;
          this.createEnemy('enemy_interceptor', width * 0.25, -30, 75, 100).setVelocity(0, 150);
          this.createEnemy('enemy_interceptor', width * 0.75, -30, 75, 100).setVelocity(0, 150);
          this.startBossCombatLoop();
        } else if (this.bossPhase === 2 && this.bossHp <= this.bossMaxHp * 0.30) {
          this.bossPhase = 3;
          soundManager.playBossAlarm();
          soundManager.playHaptic("bossAlarm");
          this.cameras.main.shake(450, 0.035);
          if (enemy.body) enemy.setVelocityX(enemy.body.velocity.x * 1.5);
          const { width } = this.scale;
          this.createEnemy('enemy_elite', width * 0.5, -40, 200, 300);
          this.startBossCombatLoop();
        }
      } else {
        if (this.bossPhase === 1 && this.bossHp <= this.bossMaxHp * 0.5) {
          this.bossPhase = 2;
          soundManager.playBossAlarm();
          soundManager.playHaptic("bossAlarm");
          this.cameras.main.shake(350, 0.025);
          if (enemy.body) enemy.setVelocityX(enemy.body.velocity.x * 1.4);
          const { width } = this.scale;
          this.createEnemy('enemy_scout', width * 0.2, -30, 45, 50).setVelocity(0, 130);
          this.createEnemy('enemy_scout', width * 0.8, -30, 45, 50).setVelocity(0, 130);
          this.startBossCombatLoop();
        }
      }

      enemy.setTint(0xFF2DFF);
      this.time.delayedCall(60, () => {
        if (enemy.active) enemy.clearTint();
      });

      this.emitStats();

      if (this.bossHp <= 0) {
        this.destroyBoss();
      }
      return;
    }

    enemy.hasTakenDamage = true;
    enemy.hp -= damage;

    // Flash hit
    enemy.setTint(0xFFFFFF);
    this.time.delayedCall(50, () => {
      if (enemy.active) enemy.clearTint();
    });

    if (enemy.hp <= 0) {
      this.destroyEnemy(enemy);
    }
  }

  destroyEnemy(enemy) {
    if (enemy.fireTimer) enemy.fireTimer.remove();

    this.score += enemy.scoreValue;
    this.enemiesKilled++;
    soundManager.playExplosion(enemy.texture.key === 'enemy_cruiser' || enemy.isElite);

    // Floating Arcade Score Text Popup
    this.showFloatingText(enemy.x, enemy.y, `+${enemy.scoreValue}`, '#00E5FF');

    // High Value Loot Drops Based on Enemy Tier
    if (enemy.isElite) {
      this.elitesKilled = (this.elitesKilled || 0) + 1;
      const core = this.pickups.create(enemy.x, enemy.y, 'pickup_core');
      core.pickupType = 'core';
      core.pickupVal = 1;
      core.setVelocityY(80);

      // Multiple coins for Elite kill
      for (let i = 0; i < 3; i++) {
        const p = this.pickups.create(enemy.x + (i - 1) * 16, enemy.y + Phaser.Math.Between(-10, 10), 'pickup_credit');
        p.pickupType = 'credit';
        p.pickupVal = Phaser.Math.Between(8, 15);
        p.setVelocityY(85);
      }
    } else if (enemy.texture.key === 'enemy_cruiser') {
      // 2-3 credit coins for Cruiser kill
      for (let i = 0; i < 2; i++) {
        const p = this.pickups.create(enemy.x + (i - 0.5) * 18, enemy.y, 'pickup_credit');
        p.pickupType = 'credit';
        p.pickupVal = Phaser.Math.Between(5, 12);
        p.setVelocityY(90);
      }
    } else {
      // 75% Drop Chance for standard enemies
      this.spawnPickup(enemy.x, enemy.y);
    }

    enemy.destroy();
    this.emitStats();
  }

  spawnPickup(x, y) {
    const roll = Math.random();
    if (roll < 0.72) {
      // Credit coin
      const p = this.pickups.create(x, y, 'pickup_credit');
      p.pickupType = 'credit';
      p.pickupVal = Phaser.Math.Between(4, 12);
      p.setVelocityY(90);
    } else if (roll < 0.84) {
      // Energy Core (Gems)
      const p = this.pickups.create(x, y, 'pickup_core');
      p.pickupType = 'core';
      p.pickupVal = 1;
      p.setVelocityY(80);
    } else if (roll < 0.95) {
      // Shield restore
      const p = this.pickups.create(x, y, 'pickup_shield');
      p.pickupType = 'shield';
      p.pickupVal = 30;
      p.setVelocityY(85);
    }
  }

  // Floating Arcade Combat Text Popups (Score & Credits)
  showFloatingText(x, y, text, color = '#FDE047') {
    const popup = this.add.text(x, y, text, {
      fontFamily: 'Orbitron, sans-serif',
      fontSize: '13px',
      fontStyle: 'bold',
      color: color,
      stroke: '#060919',
      strokeThickness: 3
    }).setOrigin(0.5).setDepth(30);

    this.tweens.add({
      targets: popup,
      y: y - 36,
      alpha: 0,
      duration: 650,
      ease: 'Power1',
      onComplete: () => popup.destroy()
    });
  }

  handleCollectPickup(player, pickup) {
    soundManager.playPickup(pickup.pickupType);

    if (pickup.pickupType === 'credit') {
      this.creditsCollected += pickup.pickupVal;
      this.score += pickup.pickupVal * 20;
      this.showFloatingText(pickup.x, pickup.y, `+${pickup.pickupVal} CR`, '#FBBF24');
    } else if (pickup.pickupType === 'core') {
      this.creditsCollected += 25;
      this.showFloatingText(pickup.x, pickup.y, `+CORE`, '#C084FC');
    } else if (pickup.pickupType === 'shield') {
      this.playerShield = Math.min(this.playerMaxShield, this.playerShield + pickup.pickupVal);
      this.showFloatingText(pickup.x, pickup.y, `+SHIELD`, '#00E5FF');
    }

    pickup.destroy();
    this.emitStats();
  }

  handleBulletHitPlayer(player, bullet) {
    bullet.destroy();
    this.damagePlayer(15);
  }

  handleEnemyRamPlayer(player, enemy) {
    this.destroyEnemy(enemy);
    this.damagePlayer(35);
  }

  damagePlayer(amount) {
    if (this.isInvulnerable || this.isGameOver) return;

    soundManager.playShieldHit();
    soundManager.playHaptic('hit');
    this.cameras.main.shake(120, 0.015);

    // Shield absorbs first
    if (this.playerShield > 0) {
      const absorbed = Math.min(this.playerShield, amount);
      this.playerShield -= absorbed;
      amount -= absorbed;
    }

    // Remainder hits hull health
    if (amount > 0) {
      this.playerHealth = Math.max(0, this.playerHealth - amount);
    }

    // Temporary i-frames (600ms)
    this.isInvulnerable = true;
    this.player.setAlpha(0.4);
    this.time.delayedCall(600, () => {
      this.isInvulnerable = false;
      this.player.setAlpha(1.0);
    });

    this.emitStats();

    if (this.playerHealth <= 0) {
      this.triggerDefeat();
    } else if (this.playerHealth <= this.playerMaxHealth * 0.25) {
      soundManager.playCriticalAlarm();
    }
  }

  // Trigger Combat Defeat (Prompts Revive / Ad in React)
  triggerDefeat() {
    this.isGameOver = true;
    this.player.setVelocity(0, 0);
    soundManager.playExplosion(true);
    soundManager.playHaptic('defeat');
    this.cameras.main.shake(300, 0.03);

    if (this.callbacks.onGameOver) {
      this.callbacks.onGameOver({
        score: this.score,
        creditsCollected: this.creditsCollected,
        enemiesKilled: this.enemiesKilled,
        waveReached: this.currentWave,
        canRevive: true
      });
    }
  }

  // Revive Player (When user watches rewarded ad or uses revive)
  revivePlayer() {
    this.isGameOver = false;
    this.playerHealth = this.playerMaxHealth;
    this.playerShield = this.playerMaxShield;

    // 3 seconds super invulnerability shield
    this.isInvulnerable = true;
    this.shieldSprite.setVisible(true);
    this.player.setAlpha(0.7);

    this.time.delayedCall(3000, () => {
      this.isInvulnerable = false;
      this.shieldSprite.setVisible(false);
      this.player.setAlpha(1.0);
    });

    this.emitStats();
  }

  triggerVictory() {
    this.isVictory = true;
    this.isGameOver = true;
    this.player.setVelocity(0, -250);
    soundManager.playVictoryFanfare(); // Hyperspace jump forward

    // Calculate dynamic 1 to 3 Star Rating (Section 19 Criteria)
    let earnedStars = 1; // Star 1: Mission Completed (Base)
    if (this.enemiesKilled >= 10 || this.score >= 3500) {
      earnedStars++; // Star 2: Combat Mastery (Destroy 10+ Hostiles or High Score)
    }
    if (this.playerHealth >= 70 && this.elapsedCombatSeconds <= 90) {
      earnedStars++; // Star 3: Ace Pilot Defense & Speed (Hull >= 70% in under 90s)
    }

    if (this.callbacks.onVictory) {
      this.callbacks.onVictory({
        score: this.score,
        creditsEarned: this.creditsCollected + 100, // +100 mission clear bonus
        enemiesKilled: this.enemiesKilled,
        stars: earnedStars,
        healthRemaining: Math.round(this.playerHealth),
        durationSeconds: Math.max(12, Math.round(this.elapsedCombatSeconds))
      });
    }
  }

  handleMissileHitEnemy(missile, enemy) {
    const blastX = missile.x;
    const blastY = missile.y;
    missile.destroy();
    soundManager.playExplosion(true);

    // Shockwave Blast Ring Graphic
    const shockwave = this.add.circle(blastX, blastY, 12, 0xF97316, 0.9);
    shockwave.setDepth(20);
    this.tweens.add({
      targets: shockwave,
      scale: 7,
      alpha: 0,
      duration: 380,
      ease: 'Power2',
      onComplete: () => shockwave.destroy()
    });

    this.cameras.main.shake(180, 0.02);

    // Area-of-Effect Splash Damage (Splash 45 damage to all hostiles within 90px)
    this.enemies.getChildren().forEach((other) => {
      if (other.active && other !== enemy) {
        const dist = Phaser.Math.Distance.Between(blastX, blastY, other.x, other.y);
        if (dist < 90) {
          other.hp -= 45;
          other.setTint(0xF97316);
          this.time.delayedCall(70, () => {
            if (other.active) other.clearTint();
          });
          if (other.hp <= 0) this.destroyEnemy(other);
        }
      }
    });

    if (enemy.isBoss) {
      this.bossHp = Math.max(0, this.bossHp - 95);
      enemy.hp = this.bossHp;
      enemy.setTint(0xF97316);
      this.time.delayedCall(70, () => {
        if (enemy.active) enemy.clearTint();
      });
      this.emitStats();
      if (this.bossHp <= 0) {
        this.destroyBoss();
      }
      return;
    }

    enemy.hp -= 95;
    enemy.setTint(0xF97316);
    this.time.delayedCall(70, () => {
      if (enemy.active) enemy.clearTint();
    });

    if (enemy.hp <= 0) {
      this.destroyEnemy(enemy);
    }
  }

  // Section 26: Complete Implementation of All 8 Mandatory Power-Ups
  activatePowerUp(abilityId) {
    soundManager.playPowerUp();

    switch (abilityId) {
      // 1. Shield Pulse: 8s impenetrable forcefield
      case 'shield_pulse':
        soundManager.playShieldHit();
        soundManager.playHaptic('powerup');
        this.isInvulnerable = true;
        this.shieldSprite.setVisible(true);
        this.activeBuffs.shieldPulse = true;
        this.time.delayedCall(8000, () => {
          this.isInvulnerable = false;
          this.shieldSprite.setVisible(false);
          this.activeBuffs.shieldPulse = false;
        });
        break;

      // 2. Rapid Fire: 10s 2.2x firing speed, automatically restores
      case 'rapid_fire':
        soundManager.playPowerUp();
        soundManager.playHaptic('powerup');
        this.activeBuffs.rapidFire = true;
        this.time.delayedCall(10000, () => {
          this.activeBuffs.rapidFire = false;
        });
        break;

      // 3. Spread Shot: 12s 5-way angled spread cannons
      case 'spread_shot':
        soundManager.playPowerUp();
        soundManager.playHaptic('powerup');
        this.activeBuffs.spreadShot = true;
        this.time.delayedCall(12000, () => {
          this.activeBuffs.spreadShot = false;
        });
        break;

      // 4. Homing Missiles: Launches 4 auto-seeking rockets
      case 'homing_missiles':
        soundManager.playHomingMissiles();
        for (let i = 0; i < 4; i++) {
          const offsetX = (i - 1.5) * 30;
          const missile = this.homingMissiles.create(
            this.player.x + offsetX,
            this.player.y - 15,
            'homing_missile'
          );
          missile.setScale(1.05); // Enhanced visibility scale for tactical rocket
          missile.setVelocity(offsetX * 10, -450);
          missile.checkWorldBounds = true;
          missile.outOfBoundsKill = true;
        }
        break;

      // 5. EMP Blast: Screen-wide bullet clear + 180 area damage
      case 'emp_blast':
        soundManager.playEmpBlast();
        this.cameras.main.flash(250, 0, 229, 255);
        this.cameras.main.shake(150, 0.02);
        this.enemyBullets.clear(true, true);
        this.enemies.getChildren().forEach((e) => {
          e.hp -= 180;
          e.setTint(0x00E5FF);
          this.time.delayedCall(120, () => {
            if (e.active) e.clearTint();
          });
          if (e.hp <= 0) this.destroyEnemy(e);
        });
        break;

      // 6. Repair Drone: Deploys nanite drone restoring 50 HP (clamped to maxHealth)
      case 'repair_drone':
        soundManager.playPickup('core');
        soundManager.playHaptic('powerup');
        this.droneSprite.setVisible(true);
        let pulses = 0;
        const healTimer = this.time.addEvent({
          delay: 1000,
          callback: () => {
            pulses++;
            this.playerHealth = Math.min(this.playerMaxHealth, this.playerHealth + 10);
            this.emitStats();
            if (pulses >= 5) {
              healTimer.remove();
              this.droneSprite.setVisible(false);
            }
          },
          loop: true
        });
        break;

      // 7. Overdrive: 10s reactor overdrive (Speed 1.4x, Damage 1.5x, Firing Rate 1.4x)
      case 'overdrive':
        soundManager.playPowerUp();
        soundManager.playHaptic('powerup');
        this.activeBuffs.overdrive = true;
        this.player.setTint(0xFF2DFF);
        this.time.delayedCall(10000, () => {
          this.activeBuffs.overdrive = false;
          if (this.player.active) this.player.clearTint();
        });
        break;

      // 8. Emergency Warp: Instant teleport to safe bottom coordinate with 2.5s i-frames
      case 'emergency_warp':
        soundManager.playWarpJump();
        this.cameras.main.flash(180, 255, 255, 255);
        const safeX = Phaser.Math.Between(80, this.scale.width - 80);
        const safeY = this.scale.height - 120;
        this.player.setPosition(safeX, safeY);

        this.isInvulnerable = true;
        this.player.setAlpha(0.35);
        this.time.delayedCall(2500, () => {
          this.isInvulnerable = false;
          this.player.setAlpha(1.0);
        });
        break;
    }
  }

  emitStats() {
    if (this.callbacks.onStatsUpdate) {
      this.callbacks.onStatsUpdate({
        health: this.playerHealth,
        maxHealth: this.playerMaxHealth,
        shield: this.playerShield,
        maxShield: this.playerMaxShield,
        score: this.score,
        credits: this.creditsCollected,
        enemiesKilled: this.enemiesKilled,
        currentWave: this.currentWave,
        maxWaves: this.maxWaves,
        elapsedTime: this.elapsedCombatSeconds,
        boss: (this.bossActive && this.bossSprite && this.bossSprite.active) ? {
          name: this.bossInfo?.name || 'SECTOR BOSS',
          hp: this.bossHp,
          maxHp: this.bossMaxHp,
          phase: this.bossPhase
        } : null
      });
    }
  }
}

export default SpaceCombatScene;
