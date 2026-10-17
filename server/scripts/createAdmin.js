import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import User from '../src/models/User.js';
import PlayerProfile from '../src/models/PlayerProfile.js';
import PlayerShip from '../src/models/PlayerShip.js';
import { ECONOMY_CONFIG } from '../src/config/gameConfig.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load server .env
dotenv.config({ path: path.join(__dirname, '../.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/void_hunter';

/**
 * Parse CLI flags: --email, --password, --name
 */
function parseArgs() {
  const args = process.argv.slice(2);
  const params = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--email' && args[i + 1]) {
      params.email = args[++i];
    } else if (args[i] === '--password' && args[i + 1]) {
      params.password = args[++i];
    } else if (args[i] === '--name' && args[i + 1]) {
      params.name = args[++i];
    }
  }
  return {
    email: params.email || process.env.ADMIN_EMAIL,
    password: params.password || process.env.ADMIN_PASSWORD,
    name: params.name || process.env.ADMIN_NAME || 'Commander Admiral'
  };
}

async function bootstrapAdmin() {
  const { email, password, name } = parseArgs();

  if (!email || !password) {
    console.error('\n❌ Error: Missing required credentials.');
    console.log('\nUsage:');
    console.log('  node scripts/createAdmin.js --name "Admin Pilot" --email "admin@voidhunter.com" --password "StrongSecret123!"');
    console.log('\nOr set environment variables:');
    console.log('  ADMIN_EMAIL=admin@voidhunter.com ADMIN_PASSWORD=StrongSecret123! npm run create-admin\n');
    process.exit(1);
  }

  if (password.length < 6) {
    console.error('\n❌ Error: Password must be at least 6 characters long.\n');
    process.exit(1);
  }

  console.log('Connecting to database...');
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB.');

  try {
    let user = await User.findOne({ email });

    if (user) {
      console.log(`User ${email} already exists. Elevating account to 'admin' role...`);
      user.role = 'admin';
      user.password = password; // pre-save hook will hash
      await user.save();
      console.log(`✅ Success: User ${email} has been promoted to administrator.`);
    } else {
      console.log(`Creating new administrator account: ${email}...`);
      user = await User.create({
        name,
        email,
        password,
        role: 'admin'
      });

      // Initialize profile
      await PlayerProfile.create({
        user: user._id,
        pilotRank: 'Supreme Commander',
        level: 10,
        xp: 15000,
        xpToNextLevel: 25000,
        selectedShipId: 'v01-orbitron',
        credits: 50000,
        energyCores: 250,
        velopRewardCoins: 100
      });

      // Initialize fleet
      const ships = [
        { user: user._id, shipId: 'v01-orbitron', isUnlocked: true, unlockedAt: new Date() },
        { user: user._id, shipId: 's02-phoenix', isUnlocked: true, unlockedAt: new Date() },
        { user: user._id, shipId: 'x03-shadow', isUnlocked: true, unlockedAt: new Date() },
        { user: user._id, shipId: 'r04-titan', isUnlocked: true, unlockedAt: new Date() },
        { user: user._id, shipId: 'z05-nova', isUnlocked: true, unlockedAt: new Date() }
      ];
      await PlayerShip.insertMany(ships);

      console.log(`✅ Success: Administrator account created for ${email}.`);
    }

    console.log(`Callsign: ${user.name}`);
    console.log(`Role: ${user.role}`);
    console.log('Security clearance: FULL LEVEL 5 ACCESS');
  } catch (err) {
    console.error('Failed to create/elevate administrator:', err);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('Database connection closed.');
  }
}

bootstrapAdmin();
