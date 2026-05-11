const mongoose = require('mongoose');

async function checkData() {
  const MONGODB_URI = 'mongodb+srv://AlbRoute:RBs4K9jhWj7He99P@cluster0.oaf3kvh.mongodb.net/?appName=Cluster0';
  
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    
    const db = mongoose.connection.useDb('Global');
    const buses = await db.collection('Autobusat').find({ status: 'Aktiv' }).toArray();
    
    console.log('\n--- DATA RECEIVED FROM GLOBAL/AUTOBUSAT ---');
    console.log(JSON.stringify(buses, null, 2));
    console.log('--- END OF DATA ---\n');
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkData();
