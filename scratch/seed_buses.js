const mongoose = require('mongoose');

async function seed() {
  const MONGODB_URI = 'mongodb+srv://AlbRoute:RBs4K9jhWj7He99P@cluster0.oaf3kvh.mongodb.net/?appName=Cluster0';
  
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    
    // Connect to the 'Global' database where buses are stored
    const db = mongoose.connection.useDb('Global');
    
    console.log('Fetching current fleet from DB...');
    const currentBuses = await db.collection('Autobusat').find({}).toArray();
    
    console.log('\n--- LIVE FLEET STATUS ---');
    console.log(`Total buses: ${currentBuses.length}`);
    
    if (currentBuses.length === 0) {
      console.log('No buses found in database.');
    } else {
      currentBuses.forEach((b, i) => {
        console.log(`${i + 1}. [Linja: ${b.routeId}] Targa: ${b.plate || b.id} | Status: ${b.status || 'Aktiv'}`);
      });
    }
    
    console.log('\nOperation completed.');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

seed();
