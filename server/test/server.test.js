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
                expect(res.body.body).toBe(pigeon.body);
                expect(res.body.encounterDate).toBe(pigeon.encounterDate);
                expect(res.body.title).toBe(pigeon.title);
                expect(res.body.to).toBe(pigeon.to);

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
