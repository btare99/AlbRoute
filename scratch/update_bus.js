const mongoose = require('mongoose');

async function updateBus() {
  const MONGODB_URI = 'mongodb+srv://AlbRoute:RBs4K9jhWj7He99P@cluster0.oaf3kvh.mongodb.net/?appName=Cluster0';
  
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    
    const db = mongoose.connection.useDb('Global');
    
    const result = await db.collection('Autobusat').updateOne(
      { plate: 'AB 242 CD' },
      { 
        $set: { 
          routeId: 'L1A', // MATCHING THE FRONTEND ID 'L1A'
          status: 'Aktiv'
        } 
      }
    );
    
    console.log('Update result:', result);
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

updateBus();
