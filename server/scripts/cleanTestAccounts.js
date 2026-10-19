import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

async function clean() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/void-hunter');
  const db = mongoose.connection.db;

  const testUsers = await db.collection('users').find({
    email: { $regex: '^(pilota_|pilotb_|hacker_|invariant_|admin_\\d+)', $options: 'i' }
  }).toArray();

  console.log('Found ' + testUsers.length + ' test runner artifact users to purge.');
  const testUserIds = testUsers.map(u => u._id);

  if (testUserIds.length > 0) {
    const resP = await db.collection('playerprofiles').deleteMany({ user: { $in: testUserIds } });
    const resM = await db.collection('playermissionprogresses').deleteMany({ user: { $in: testUserIds } });
    const resG = await db.collection('gamesessions').deleteMany({ user: { $in: testUserIds } });
    const resW = await db.collection('wallettransactions').deleteMany({ user: { $in: testUserIds } });
    const resR = await db.collection('rewardtransactions').deleteMany({ user: { $in: testUserIds } });
    const resS = await db.collection('playerships').deleteMany({ user: { $in: testUserIds } });
    const resU = await db.collection('users').deleteMany({ _id: { $in: testUserIds } });

    console.log('Cleaned: ' + resU.deletedCount + ' users, ' + resP.deletedCount + ' profiles');
  }

  const allProfiles = await db.collection('playerprofiles').find({}).toArray();
  const allUserIds = (await db.collection('users').find({}).toArray()).map(u => u._id.toString());
  const orphanProfiles = allProfiles.filter(p => !p.user || !allUserIds.includes(p.user.toString()));
  if (orphanProfiles.length > 0) {
    const resOrphan = await db.collection('playerprofiles').deleteMany({
      _id: { $in: orphanProfiles.map(p => p._id) }
    });
    console.log('Deleted ' + resOrphan.deletedCount + ' orphaned player profiles.');
  }

  const remaining = await db.collection('users').find({}).toArray();
  console.log('\nRemaining verified accounts (' + remaining.length + '):');
  for (const u of remaining) {
    const p = await db.collection('playerprofiles').findOne({ user: u._id });
    console.log('- ' + u.name + ' (' + u.email + ') | Score: ' + (p?.stats?.totalScore || 0) + ' | Ship: ' + (p?.selectedShipId || 'v01-orbitron'));
  }

  await mongoose.disconnect();
  console.log('Database cleanup completed.');
  process.exit(0);
}

clean().catch(err => {
  console.error('Error during cleanup:', err);
  process.exit(1);
});
