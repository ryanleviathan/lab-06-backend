const express = require('express');
const cors = require('cors');
const client = require('./client.js');
const app = express();
const morgan = require('morgan');
const ensureAuth = require('./auth/ensure-auth');
const createAuthRoutes = require('./auth/create-auth-routes');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan('dev')); // http logging

const authRoutes = createAuthRoutes();

// setup authentication routes to give user an auth token
// creates a /auth/signin and a /auth/signup POST route. 
// each requires a POST body with a .email and a .password
app.use('/auth', authRoutes);

// everything that starts with "/api" below here requires an auth token!
app.use('/api', ensureAuth);

// and now every request that has a token in the Authorization header will have a `req.userId` property for us to see who's talking
app.get('/api/test', (req, res) => {
  res.json({
    message: `in this proctected route, we get the user's id like so: ${req.userId}`
  });
});

app.get('/cars', async(req, res) => {
  try {
    const data = await client.query(`
    SELECT cars.id, cars.name, makes.name as make, cars.model, cars.cool_factor, cars.img, cars.owns
    from cars
    join makes
    on makes.id = cars.make_id
    order by cars.id asc
    `);
    
    res.json(data.rows);
  } catch(e) {
    
    res.status(500).json({ error: e.message });
  }
});

app.get('/makes', async(req, res) => {
  try {
    const data = await client.query(`
    SELECT * from makes
    `);
    
    res.json(data.rows);
  } catch(e) {
    
    res.status(500).json({ error: e.message });
  }
});

app.get('/cars/:id', async(req, res) => {
  try {

    const carId = req.params.id;

    const data = await client.query(`
    SELECT cars.id, cars.name, makes.name as make, cars.model, cars.cool_factor, cars.img, cars.owns
    from cars
    join makes
    on makes.id = cars.make_id
    where cars.id = $1
    `, [carId]);
    
    res.json(data.rows[0]);
  } catch(e) {
    
    res.status(500).json({ error: e.message });
  }
});

app.post('/cars/', async(req, res) => {
  try {

    const newName = req.body.name;
    const newMakeId = req.body.make_id;
    const newModel = req.body.model;
    const newCoolFactor = req.body.cool_factor;
    const newImg = req.body.img;
    const newOwnsBool = req.body.owns;
    const newOwnerId = req.body.owner_id;

    const data = await client.query(`
    INSERT INTO cars (name, make_id, model, cool_factor, img, owns, owner_id) 
    VALUES ($1, $2, $3, $4, $5, $6, $7) 
    RETURNING *`, [newName, newMakeId, newModel, newCoolFactor, newImg, newOwnsBool, newOwnerId]);
    
    res.json(data.rows[0]);
  } catch(e) {
    
    res.status(500).json({ error: e.message });
  }
});

app.put('/cars/:id', async(req, res) => {
  try {

    const newName = req.body.name;
    const newMakeId = req.body.make_id;
    const newModel = req.body.model;
    const newCoolFactor = req.body.cool_factor;
    const newImg = req.body.img;
    const newOwnsBool = req.body.owns;
    const newOwnerId = req.body.owner_id;

    const data = await client.query(`
    UPDATE cars 
    SET name = $1, 
    make_id = $2, 
    model = $3, 
    cool_factor = $4, 
    img = $5, 
    owns = $6, 
    owner_id = $7 
    WHERE cars.id = $8
    RETURNING *`, 
    [newName, newMakeId, newModel, newCoolFactor, newImg, newOwnsBool, newOwnerId, req.params.id]);
    
    res.json(data.rows[0]);
  } catch(e) {
    
    res.status(500).json({ error: e.message });
  }
});

app.delete('/cars/:id', async(req, res) => {
  try {

    const carId = req.params.id;

    const data = await client.query(`
    DELETE from cars 
    WHERE cars.id=$1 
    RETURNING *`, [carId]);
    
    res.json(data.rows[0]);
  } catch(e) {
    
    res.status(500).json({ error: e.message });
  }
});

app.use(require('./middleware/error'));

module.exports = app;
