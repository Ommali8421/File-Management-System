const bcrypt = require('bcrypt');
const { getDb } = require('./database');

async function seed() {
  const db = await getDb();
  const username = 'Om Mali';
  const password = 'password123';
  
  const existingUser = await db.get('SELECT * FROM users WHERE username = ?', [username]);
  if (!existingUser) {
    const hashedPassword = await bcrypt.hash(password, 10);
    await db.run('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword]);
    console.log('Demo user created: Om Mali / password123');
  } else {
    console.log('Demo user already exists.');
  }
}

seed().catch(console.error);
