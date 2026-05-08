const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb+srv://AlbRoute:RBs4K9jhWj7He99P@cluster0.oaf3kvh.mongodb.net/?appName=Cluster0';

const ALL_ROUTES = [
  '1A', '1B', '2', '3A', '3B', '3C', '4', '5A', '5B', '6', '8A', '8B', '8C', 
  '9A', '9B', '10A', '10B', '10C', '11', '12', '13A', '13B', '15A', '15B', '16A', '16B'
];

const CATEGORIES = ['Autobusat', 'Shoferet', 'Faturinot', 'Operatoret'];

async function init() {
  try {
    console.log('Duke u lidhur me MongoDB...');
    await mongoose.connect(MONGODB_URI);
    
    for (const routeId of ALL_ROUTES) {
      console.log(`Duke inicializuar Databazën: ${routeId}...`);
      const db = mongoose.connection.useDb(routeId);
      
      for (const cat of CATEGORIES) {
        // Krijojmë koleksionin duke futur një dokument të përkohshëm dhe duke e fshirë (për të detyruar krijimin e DB)
        // Ose përdorim createCollection
        try {
          await db.createCollection(cat);
          console.log(`  - Krijuar koleksioni: ${cat}`);
        } catch (e) {
          // Nëse ekziston, thjesht vazhdo
        }
      }
    }

    console.log('Inicializimi përfundoi me sukses!');
    process.exit(0);
  } catch (error) {
    console.error('Gabim gjatë inicializimit:', error);
    process.exit(1);
  }
}

init();
