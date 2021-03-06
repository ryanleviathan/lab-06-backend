require('dotenv').config();

const { execSync } = require('child_process');

const fakeRequest = require('supertest');
const app = require('../lib/app');
const client = require('../lib/client');

describe('app routes', () => {
  describe('routes', () => {
    let token;
  
    beforeAll(async done => {
      execSync('npm run setup-db');
  
      client.connect();
  
      const signInData = await fakeRequest(app)
        .post('/auth/signup')
        .send({
          email: 'jon@user.com',
          password: '1234'
        });
      
      token = signInData.body.token;
  
      return done();
    });
  
    afterAll(done => {
      return client.end(done);
    });

    test('returns cars', async() => {

      const expectation = [
        {
          id: 1,
          name: 'Fernando',
          make: 'Ferrari',
          model: 'LaFerrari',
          cool_factor: 10,
          img: 'https://api.ferrarinetwork.ferrari.com/v2/network-content/medias/resize/5ddb97392cdb32285a799dfa-laferrari-2013-share?apikey=9QscUiwr5n0NhOuQb463QEKghPrVlpaF&width=1080',
          owns: false
        },
        {
          id: 2,
          name: 'Levis',
          make: 'BMW',
          model: 'Z3',
          cool_factor: 7,
          img: 'https://cvluxurycars.com/wp-content/uploads/2019/05/1997-BMW-Z3-Atlantic-Blue-7.jpg',
          owns: true
        },
        {
          id: 3,
          name: 'Lewis',
          make: 'Toyota',
          model: 'Prius',
          cool_factor: 0,
          img: 'https://o.aolcdn.com/images/dims3/GLOB/legacy_thumbnail/800x450/format/jpg/quality/85/http://www.blogcdn.com/www.autoblog.com/media/2009/05/prius2010_rev000_opt.jpg',
          owns: true
        }
      ];

      const data = await fakeRequest(app)
        .get('/cars')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);
    });

    test('returns one car', async() => {

      const expectation =
        {
          id: 1,
          name: 'Fernando',
          make: 'Ferrari',
          model: 'LaFerrari',
          cool_factor: 10,
          img: 'https://api.ferrarinetwork.ferrari.com/v2/network-content/medias/resize/5ddb97392cdb32285a799dfa-laferrari-2013-share?apikey=9QscUiwr5n0NhOuQb463QEKghPrVlpaF&width=1080',
          owns: false
        };

      const data = await fakeRequest(app)
        .get('/cars/1')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);
    });

    test('adds one car to db and returns it', async() => {

      const expectation =
        {
          id: 4,
          name: 'Larry',
          make_id: 3,
          model: 'AE86',
          cool_factor: 9,
          img: 'https://cdn.shopify.com/s/files/1/1063/6350/products/78529309_521411808440697_6383374592261488640_n_8d35f07f-396e-46cd-90e5-798d47fd3c11_1000x1000.jpg?v=1575005512',
          owner_id: 1,
          owns: false
        };

      const data = await fakeRequest(app)
        .post('/cars/')
        .send(expectation)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);
    
      const allCars =  await fakeRequest(app)
        .get('/cars')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);
      expect(allCars.body.length).toEqual(4);
    });

    test('updates resource', async() => {

      const expectation =
        {
          id: 3,
          name: 'Francis',
          make_id: 3,
          model: 'Prius',
          cool_factor: 5,
          img: 'https://o.aolcdn.com/images/dims3/GLOB/legacy_thumbnail/800x450/format/jpg/quality/85/http://www.blogcdn.com/www.autoblog.com/media/2009/05/prius2010_rev000_opt.jpg',
          owner_id: 1,
          owns: true
        };

      const data = await fakeRequest(app)
        .put('/cars/3')
        .send(expectation)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);
    });

    test('deletes car from db', async() => {

      const expectation =
      {
        id: 4,
        name: 'Larry',
        make_id: 3,
        model: 'AE86',
        cool_factor: 9,
        img: 'https://cdn.shopify.com/s/files/1/1063/6350/products/78529309_521411808440697_6383374592261488640_n_8d35f07f-396e-46cd-90e5-798d47fd3c11_1000x1000.jpg?v=1575005512',
        owner_id: 1,
        owns: false
      };

      const data = await fakeRequest(app)
        .delete('/cars/4')
        .send(expectation)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);

      const allCars =  await fakeRequest(app)
        .get('/cars')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);
      expect(allCars.body.length).toEqual(3);
    });
  });
});
