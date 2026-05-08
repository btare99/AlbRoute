const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb+srv://AlbRoute:RBs4K9jhWj7He99P@cluster0.oaf3kvh.mongodb.net/?appName=Cluster0';

async function cleanup() {
  try {
    console.log('Duke u lidhur me MongoDB...');
    await mongoose.connect(MONGODB_URI);
    
    const db = mongoose.connection.useDb('test');
    const collections = await db.db.listCollections().toArray();
    
    console.log(`Gjeta ${collections.length} koleksione në databazën 'test'.`);
    
    for (const col of collections) {
      console.log(`Duke fshirë koleksionin: ${col.name}...`);
      await db.db.dropCollection(col.name);
    }
    
    // Fshijmë edhe çdo DB tjetër që krijuam gabim me "Linja_"
    const admin = mongoose.connection.db.admin();
    const { databases } = await admin.listDatabases();
    
    for (const d of databases) {
      if (d.name.startsWith('Linja_')) {
        console.log(`Duke fshirë databazën e vjetër: ${d.name}...`);
        const oldDb = mongoose.connection.useDb(d.name);
        await oldDb.db.dropDatabase();
      }
    }

    console.log('Pastrimi përfundoi me sukses!');
    process.exit(0);
  } catch (error) {
    console.error('Gabim gjatë pastrimit:', error);
    process.exit(1);
  }
}

cleanup();
