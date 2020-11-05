const client = require('../lib/client');
// import our seed data:
const cars = require('./cars.js');
const makes = require('./makes.js');
const usersData = require('./users.js');
const { getEmoji } = require('../lib/emoji.js');

run();

async function run() {

  try {
    await client.connect();

    const users = await Promise.all(
      usersData.map(user => {
        return client.query(`
                      INSERT INTO users (email, hash)
                      VALUES ($1, $2)
                      RETURNING *;
                  `,
        [user.email, user.hash]);
      })
    );

    await Promise.all(
      makes.map(make => {
        return client.query(`
                      INSERT INTO makes (name)
                      VALUES ($1)
                      RETURNING *;
                  `,
        [make.name]);
      })
    );
      
    const user = users[0].rows[0];

    await Promise.all(
      cars.map(car => {
        return client.query(`
                    INSERT INTO cars (name, make_id, model, cool_factor, img, owns, owner_id)
                    VALUES ($1, $2, $3, $4, $5, $6, $7);
                `,
        [car.name, car.make_id, car.model, car.cool_factor, car.img, car.owns, user.id]);
      })
    );
    

    console.log('seed data load complete', getEmoji(), getEmoji(), getEmoji());
  }
  catch(err) {
    console.log(err);
  }
  finally {
    client.end();
  }
    
}
