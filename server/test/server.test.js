const expect = require('expect');
const request = require('supertest');
const {ObjectID} = require('mongodb');

const {app} = require('./../server');
const {Pigeon} = require('./../models/pigeon');
const {pigeons, populatePigeons} = require('./seed/seed');

beforeEach(populatePigeons);

describe('POST /pigeons', () => {

    var body = 'Fly pigeon! Fly!';
    var encounterDate = 1451520000;
    var title = 'First pigeon unleashed';
    var to = 'Pigeon Whisperer';

    it('should create a new pigeon', (done) => {

        var pigeon = new Pigeon({body, encounterDate, title, to});

        request(app)
            .post('/pigeons')
            .send(pigeon)
            .expect(200)
            .expect((res) => {
                expect(res.body.pigeon.body).toBe(pigeon.body);
                expect(res.body.pigeon.encounterDate).toBe(pigeon.encounterDate);
                expect(res.body.pigeon.title).toBe(pigeon.title);
                expect(res.body.pigeon.to).toBe(pigeon.to);

                //check DB
                Pigeon.find()
                    .then((pigeons) => {
                        expect(pigeons.length).toBe(3);
                        expect(pigeons[pigeons.length-1].body).toBe(body);
                        expect(pigeons[pigeons.length-1].encounterDate).toBe(encounterDate);
                        expect(pigeons[pigeons.length-1].title).toBe(title);
                        expect(pigeons[pigeons.length-1].to).toBe(to);
                        done();
                    })
                    .catch((e) => done(e));
            })
            .end((err) => {
                if(err){
                    return done(err);
                }
            });
    });

    it('should not create a pigeon with invalid body', (done) => {

        var body = '';
        var pigeon = new Pigeon({body, encounterDate, title, to});

        request(app)
            .post('/pigeons')
            .send(pigeon)
            .expect(400)
            .end((err, res) => {
                if(err){
                    return done(err);
                }

                Pigeon.find().then((pigeons) => {
                    expect(pigeons.length).toBe(2);
                    done();
                }).catch((e) => done(e));
            });
    });
});

describe('GET /pigeons', () => {

    it('should get all pigeons', (done) => {

        request(app)
            .get('/pigeons')
            .expect(200)
            .expect((res) => {
                expect(res.body.pigeons.length).toBe(2);
            }).end(done);
    });

});

describe('GET /pigeons/:id', () => {

    it('should get a pigeon with requested id', (done) => {

        request(app)
            .get(`/pigeons/${pigeons[0]._id.toHexString()}`)
            .expect(200)
            .expect((res) => {
                expect(res.body.pigeon).toHaveProperty('title', pigeons[0].title);
                expect(res.body.pigeon).toHaveProperty('body', pigeons[0].body);
                expect(res.body.pigeon).toHaveProperty('encounterDate', pigeons[0].encounterDate);
                expect(res.body.pigeon).toHaveProperty('to', pigeons[0].to);
            })
            .end(done);

    });

    it('should respond with an error when invalid id is passed', (done) => {
        request(app)
            .get(`/pigeons/${pigeons[0]._id.toHexString().concat('111')}`)
            .expect(400)
            .end(done);
    });
});

//delete
describe('DELETE /pigeons/:id', () => {

    it('should delete the pigeon with the requested id', (done) => {
        request(app)
            .delete(`/pigeons/${pigeons[0]._id.toHexString()}`)
            .expect(200)
            .expect((res) => {
                expect(res.body.pigeon).toHaveProperty('title', pigeons[0].title);
                expect(res.body.pigeon).toHaveProperty('body', pigeons[0].body);
                expect(res.body.pigeon).toHaveProperty('encounterDate', pigeons[0].encounterDate);
                expect(res.body.pigeon).toHaveProperty('to', pigeons[0].to);
            })
            .end((e) => {
                if(e){
                    done(e);
                }
                //check to make sure it has been removed from the db
                Pigeon.findOne({_id: pigeons[0]._id.toHexString()})
                    .then((pigeon) => {
                        expect(pigeon).toBe(null);
                        done();
                    })
                    .catch((e) => {
                        done(e);
                    });
            });
    });

    it('should return 404 error if pigeon does not exist', (done) => {

        var id = new ObjectID().toHexString();

        request(app)
            .delete(`/pigeons/${id}`)
            .expect(404)
            .end(done);
    })

    it('should return 400 error if pigeon id is invalid', (done) => {

        var id = new ObjectID().toHexString().concat('1');

        request(app)
            .delete(`/pigeons/${id}`)
            .expect(400)
            .end(done);
    });

});

describe('PATCH /pigeons/:id', () => {

    it('should update the pigeon', (done) => {

        var changes = {encounterDate: 1, title: "New Title", body: "New body", to: "New Person"};

        request(app)
            .patch(`/pigeons/${pigeons[0]._id.toHexString()}`)
            .send(changes)
            .expect(200)
            .expect((res) => {
                expect(res.body.pigeon).toBeTruthy();
                expect(res.body.pigeon).toHaveProperty('title', changes.title);
                expect(res.body.pigeon).toHaveProperty('body', changes.body);
                expect(res.body.pigeon).toHaveProperty('encounterDate', changes.encounterDate);
                expect(res.body.pigeon).toHaveProperty('to', changes.to);
                expect(res.body.pigeon).toHaveProperty('from');
            })
            .end(done);
    });

});
