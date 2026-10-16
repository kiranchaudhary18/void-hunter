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

    // Forcefield Shield Bubble
    this.shieldSprite = this.add.sprite(this.player.x, this.player.y, 'shield_bubble');
    this.shieldSprite.setDepth(11);
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

    // Number keys 1-4 for abilities
    this.input.keyboard.on('keydown-ONE', () => this.activatePowerUp('spread_shot'));
    this.input.keyboard.on('keydown-TWO', () => this.activatePowerUp('shield_pulse'));
    this.input.keyboard.on('keydown-THREE', () => this.activatePowerUp('homing_missiles'));
    this.input.keyboard.on('keydown-FOUR', () => this.activatePowerUp('emp_blast'));

    // Mouse / Touch pointer drag
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

    // 6. Spawn Initial Wave
    this.time.delayedCall(800, () => this.spawnWave(this.currentWave));

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

  update(time, delta) {
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

    // Keep shield sprite aligned with player
    this.shieldSprite.setPosition(this.player.x, this.player.y);

    // Orbiting Repair Drone Position
    if (this.droneSprite.visible) {
      this.droneAngle += 0.06;
      const droneRadius = 45;
      this.droneSprite.setPosition(
        this.player.x + Math.cos(this.droneAngle) * droneRadius,
        this.player.y + Math.sin(this.droneAngle) * droneRadius
      );
    }

    // Auto-Targeting & Guidance for Homing Missiles
    this.homingMissiles.getChildren().forEach((missile) => {
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
        this.physics.moveToObject(missile, nearestEnemy, 650);
        const angle = Phaser.Math.Angle.Between(missile.x, missile.y, nearestEnemy.x, nearestEnemy.y);
        missile.setRotation(angle + Math.PI / 2);
      }
    });

    // Magnetic Attraction for Floating Pickups (Section 13)
    const magnetRadius = 160;
    this.pickups.getChildren().forEach((pickup) => {
      if (pickup.active) {
        const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, pickup.x, pickup.y);
        if (dist < magnetRadius) {
          this.physics.moveToObject(pickup, this.player, 360);
        }
      }
    });

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
        laser.setVelocity(Math.sin(angle) * 700, -Math.cos(angle) * 700);
        laser.setRotation(angle);
      });
    } else {
      // Twin parallel lasers
      const l1 = this.playerLasers.create(x - 12, y, 'player_laser');
      const l2 = this.playerLasers.create(x + 12, y, 'player_laser');
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
        // 1 Armored Cruiser + 4 Interceptors
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

        for (let i = 0; i < 4; i++) {
          const enemy = this.createEnemy('enemy_interceptor', 70 + i * ((width - 140) / 3), -120 - i * 25, 80, 100);
          enemy.setVelocity(0, 150);
        }
        break;

      case 4:
        // Elite Wave: 2 Cruisers + 4 Scouts + 2 Interceptors
        for (let i = 0; i < 2; i++) {
          const c = this.createEnemy('enemy_cruiser', width * (i === 0 ? 0.3 : 0.7), -70 - i * 40, 320, 300);
          c.setVelocity(i === 0 ? 40 : -40, 55);
        }
        for (let i = 0; i < 4; i++) {
          this.createEnemy('enemy_scout', 50 + i * ((width - 100) / 3), -140 - i * 30, 50, 50).setVelocity(0, 140);
        }
        for (let i = 0; i < 2; i++) {
          this.createEnemy('enemy_interceptor', i === 0 ? 70 : width - 70, -100, 80, 100).setVelocity(i === 0 ? 50 : -50, 160);
        }
        break;

      case 5:
      default:
        // Heavy Fleet: 2 Cruisers + 5 Scouts + 3 Interceptors
        for (let i = 0; i < 2; i++) {
          const c = this.createEnemy('enemy_cruiser', width * (i === 0 ? 0.28 : 0.72), -80, 380, 350);
          c.setVelocity(i === 0 ? 35 : -35, 50);
        }
        for (let i = 0; i < 5; i++) {
          this.createEnemy('enemy_scout', 40 + i * ((width - 80) / 4), -120 - i * 25, 50, 50).setVelocity(0, 145);
        }
        for (let i = 0; i < 3; i++) {
          this.createEnemy('enemy_interceptor', 80 + i * ((width - 160) / 2), -160, 90, 120).setVelocity(Phaser.Math.Between(-40, 40), 165);
        }
        break;
    }
  }

  spawnBoss() {
    this.bossActive = true;
    this.bossHp = this.bossInfo.hp || 1500;
    this.bossMaxHp = this.bossHp;
    this.bossPhase = 1;
    const { width } = this.scale;

    // Audio & Screen Alert
    soundManager.playBossAlarm();
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
    // 1. Dual Heavy Laser Battery
    this.bossLaserTimer = this.time.addEvent({
      delay: 1500,
      callback: () => {
        if (!this.bossSprite || !this.bossSprite.active) return;
        soundManager.playBossLaser();
        const b1 = this.enemyBullets.create(this.bossSprite.x - 36, this.bossSprite.y + 36, 'boss_laser');
        const b2 = this.enemyBullets.create(this.bossSprite.x + 36, this.bossSprite.y + 36, 'boss_laser');
        if (b1) {
          b1.setVelocityY(300);
          b1.checkWorldBounds = true;
          b1.outOfBoundsKill = true;
        }
        if (b2) {
          b2.setVelocityY(300);
          b2.checkWorldBounds = true;
          b2.outOfBoundsKill = true;
        }
      },
      loop: true
    });

    // 2. Radial Turret Pattern
    this.bossRadialTimer = this.time.addEvent({
      delay: 2800,
      callback: () => {
        if (!this.bossSprite || !this.bossSprite.active) return;
        soundManager.playEnemyLaser();
        const angles = this.bossPhase === 2 ? [-0.6, -0.3, 0, 0.3, 0.6] : [-0.35, 0, 0.35];
        angles.forEach((ang) => {
          const bullet = this.enemyBullets.create(this.bossSprite.x, this.bossSprite.y + 24, 'enemy_bullet');
          if (bullet) {
            bullet.setVelocity(Math.sin(ang) * 220, Math.cos(ang) * 220);
            bullet.checkWorldBounds = true;
            bullet.outOfBoundsKill = true;
          }
        });
      },
      loop: true
    });
  }

  destroyBoss() {
    this.bossActive = false;
    if (this.bossLaserTimer) this.bossLaserTimer.remove();
    if (this.bossRadialTimer) this.bossRadialTimer.remove();

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
    const enemy = this.enemies.create(x, y, texture);
    enemy.hp = health;
    enemy.maxHp = health;
    enemy.scoreValue = scoreVal;
    enemy.setDepth(5);

    // AI periodic firing
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

      // Phase 2 Transition (at 50% health)
      if (this.bossPhase === 1 && this.bossHp <= this.bossMaxHp * 0.5) {
        this.bossPhase = 2;
        soundManager.playBossAlarm();
        this.cameras.main.shake(350, 0.025);
        // Boss enrages: speeds up and summons 2 escort scouts
        if (enemy.body) enemy.setVelocityX(enemy.body.velocity.x * 1.4);
        const { width } = this.scale;
        this.createEnemy('enemy_scout', width * 0.2, -30, 45, 50).setVelocity(0, 130);
        this.createEnemy('enemy_scout', width * 0.8, -30, 45, 50).setVelocity(0, 130);
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
    soundManager.playExplosion(enemy.texture.key === 'enemy_cruiser');

    // Chance to drop combat pickup (Credits, Core, Shield)
    this.spawnPickup(enemy.x, enemy.y);

    enemy.destroy();
    this.emitStats();
  }

  spawnPickup(x, y) {
    const roll = Math.random();
    if (roll < 0.35) {
      // Credit coin
      const p = this.pickups.create(x, y, 'pickup_credit');
      p.pickupType = 'credit';
      p.pickupVal = Phaser.Math.Between(2, 8);
      p.setVelocityY(90);
    } else if (roll < 0.45) {
      // Energy Core (Gems)
      const p = this.pickups.create(x, y, 'pickup_core');
      p.pickupType = 'core';
      p.pickupVal = 1;
      p.setVelocityY(80);
    } else if (roll < 0.55) {
      // Shield or health restore
      const p = this.pickups.create(x, y, 'pickup_shield');
      p.pickupType = 'shield';
      p.pickupVal = 30;
      p.setVelocityY(85);
    }
  }

  handleCollectPickup(player, pickup) {
    soundManager.playPickup(pickup.pickupType);

    if (pickup.pickupType === 'credit') {
      this.creditsCollected += pickup.pickupVal;
      this.score += pickup.pickupVal * 20;
    } else if (pickup.pickupType === 'core') {
      this.creditsCollected += 15;
    } else if (pickup.pickupType === 'shield') {
      this.playerShield = Math.min(this.playerMaxShield, this.playerShield + pickup.pickupVal);
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
    }
  }

  // Trigger Combat Defeat (Prompts Revive / Ad in React)
  triggerDefeat() {
    this.isGameOver = true;
    this.player.setVelocity(0, 0);
    soundManager.playExplosion(true);
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
    this.player.setVelocity(0, -250); // Hyperspace jump forward

    if (this.callbacks.onVictory) {
      this.callbacks.onVictory({
        score: this.score,
        creditsEarned: this.creditsCollected + 100, // +100 mission clear bonus
        enemiesKilled: this.enemiesKilled,
        stars: this.playerHealth > 80 ? 3 : this.playerHealth > 40 ? 2 : 1
      });
    }
  }

  handleMissileHitEnemy(missile, enemy) {
    missile.destroy();
    soundManager.playExplosion(false);

    if (enemy.isBoss) {
      this.bossHp = Math.max(0, this.bossHp - 85);
      enemy.hp = this.bossHp;
      enemy.setTint(0xF97316);
      this.time.delayedCall(60, () => {
        if (enemy.active) enemy.clearTint();
      });
      this.emitStats();
      if (this.bossHp <= 0) {
        this.destroyBoss();
      }
      return;
    }

    enemy.hp -= 85;
    enemy.setTint(0xF97316);
    this.time.delayedCall(60, () => {
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
        this.activeBuffs.rapidFire = true;
        this.time.delayedCall(10000, () => {
          this.activeBuffs.rapidFire = false;
        });
        break;

      // 3. Spread Shot: 12s 5-way angled spread cannons
      case 'spread_shot':
        this.activeBuffs.spreadShot = true;
        this.time.delayedCall(12000, () => {
          this.activeBuffs.spreadShot = false;
        });
        break;

      // 4. Homing Missiles: Launches 4 auto-seeking rockets
      case 'homing_missiles':
        for (let i = 0; i < 4; i++) {
          const offsetX = (i - 1.5) * 24;
          const missile = this.homingMissiles.create(
            this.player.x + offsetX,
            this.player.y - 15,
            'homing_missile'
          );
          missile.setVelocity(offsetX * 10, -450);
          missile.checkWorldBounds = true;
          missile.outOfBoundsKill = true;
        }
        break;

      // 5. EMP Blast: Screen-wide bullet clear + 180 area damage
      case 'emp_blast':
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
        this.activeBuffs.overdrive = true;
        this.player.setTint(0xFF2DFF);
        this.time.delayedCall(10000, () => {
          this.activeBuffs.overdrive = false;
          if (this.player.active) this.player.clearTint();
        });
        break;

      // 8. Emergency Warp: Instant teleport to safe bottom coordinate with 2.5s i-frames
      case 'emergency_warp':
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
