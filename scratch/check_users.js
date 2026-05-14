const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb+srv://AlbRoute:RBs4K9jhWj7He99P@cluster0.oaf3kvh.mongodb.net/?appName=Cluster0';

async function check() {
  await mongoose.connect(MONGODB_URI);
  const db = mongoose.connection.useDb('Global');
  const collection = db.collection('Udhetaret');
  const users = await collection.find({}).toArray();
  console.log("Users in DB:", users.map(u => ({ email: u.email, hasPassword: !!u.password })));
  process.exit(0);
}
check();
