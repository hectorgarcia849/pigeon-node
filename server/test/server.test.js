const expect = require('expect');
const request = require('supertest');
const {ObjectID} = require('mongodb');

const {app} = require('./../server');
const {Pigeon} = require('./../models/pigeon');
const {Profile} = require('./../models/profile');
const {pigeons, populatePigeons, profiles, populateProfiles} = require('./seed/seed');

beforeEach(populatePigeons);
beforeEach(populateProfiles);

describe('POST /pigeons', () => {

    const body = 'Fly pigeon! Fly!';
    const encounterDate = 1451520000;
    const title = 'First pigeon unleashed';
    const to = 'Pigeon Whisperer';

    it('should create a new pigeon', (done) => {

        const pigeon = new Pigeon({body, encounterDate, title, to});

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

describe('POST /profile/', () => {

    var profile = new Profile({
        _owner:"Placeholder owner3",
        username:"Hectorious849",
        firstName:"Hector",
        lastName:"Garcia",
        created: new Date().getTime(),
        descriptors:['brunette'],
        locationTimes:[
            {country:'Thailand', city:'Phuket', place:'Siam no. 1', fromDate: 1478612334000, toDate: 1481204334000},
            {country:'India', city:'Bombay', place:'Indian gate', fromDate: 1478612335000, toDate: 1481204336000},
            {country:'Australia', city:'Sydney', place:'Sydney Harbour', fromDate: 1478812334000, toDate: 1489204334000}
        ]
    });

    it('should create a new profile', (done) => {

        request(app)
            .post('/profile')
            .send(profile)
            .expect(200)
            .expect((res) => {
                expect(res.body.profile._owner).toBe(profile._owner);
                expect(res.body.profile.username).toBe(profile.username);
                expect(res.body.profile.firstName).toBe(profile.firstName);
                expect(res.body.profile.lastName).toBe(profile.lastName);
                expect(res.body.profile.created).toBe(profile.created);
                expect(res.body.profile.descriptors).toEqual(expect.arrayContaining(profile.descriptors));
                //profile.locationTimes.forEach((locationTime) => {expect(res.body.profile.locationTimes).toContain(locationTime)});
                //expect(res.body.profile.locationTimes).toBe(profile.locationTimes);

            })
            .end((err) => {
                if (err) {
                    done(err);
                }
                Profile.findOne({_owner:profile._owner})
                    .then((p) => {
                        expect(p._owner).toBe(profile._owner);
                        expect(p.username).toBe(profile.username);
                        expect(p.firstName).toBe(profile.firstName);
                        expect(p.lastName).toBe(profile.lastName);
                        expect(p.created).toBe(profile.created);
                        expect(p.descriptors).toEqual(expect.arrayContaining(profile.descriptors));
                        //expect(p.locationTimes).toBe(profile.locationTimes);
                        done();
                    }).catch((e) => done(e));
            });
        });

    it('should not create a profile with an invalid body', (done) => {

        profile.lastName = "";
        profile.firstName = "";
        profile.username = 39404;

        request(app)
            .post('/profile')
            .send(profile)
            .expect(400)
            .end(done);
    });

    it('should prevent the creation of profiles that share _owner', (done) => {

        profile.lastName = "Garcia";
        profile.firstName = "Hector";
        profile.username = "Hectorinoooooo";
        profile._owner = profiles[0]._owner;

        request(app)
            .post('/profile')
            .send(profile)
            .expect(400)
            .end(done);
    });

    it('should make sure profiles are created with unique usernames', (done) => {

        profile._owner = "Placeholder owner 3";
        profile.username = profiles[0].username;

        request(app)
            .post('/profile')
            .send(profile)
            .expect(400)
            .end(done);
    });

});

describe('GET /profile/:id', () => {

    it('should get profile with the specified _owner', (done) => {

        request(app)
            .get(`/profile/${profiles[0]._owner}`)
            .expect(200)
            .expect((res) => {
                //expect(res.body.profile.locationTimes).toMatchObject(profiles[0].locationTimes);
                expect(res.body.profile).toHaveProperty('_owner', profiles[0]._owner);
                expect(res.body.profile).toHaveProperty('username', profiles[0].username);
                expect(res.body.profile).toHaveProperty('firstName', profiles[0].firstName);
                expect(res.body.profile).toHaveProperty('lastName', profiles[0].lastName);
                expect(res.body.profile).toHaveProperty('created', profiles[0].created);
                done();
            })
            .end((err) => {
                if(err) {done(err)};
            });
    });

    it('should not retreive a profile if invalid id given', (done) => {

        request(app)
            .get(`/profiles/${123}`)
            .expect(404) //need to update status code responses once auth implemented
            .end(done);

    });

});

describe('DELETE /profile/:id', () => {

    it('should delete the profile with specified id', (done) => {

        request(app)
            .delete(`/profile/${profiles[0]._owner}`)
            .expect(200)
            .expect((res) => {
                expect(res.body.profile).toHaveProperty('_owner', profiles[0]._owner);
                expect(res.body.profile).toHaveProperty('username', profiles[0].username);
                expect(res.body.profile).toHaveProperty('firstName', profiles[0].firstName);
                expect(res.body.profile).toHaveProperty('lastName', profiles[0].lastName);
                expect(res.body.profile).toHaveProperty('created', profiles[0].created);
            })
            .end((e) => {
                if(e){
                    done(e);
                }

                Profile.findOne({_owner: profiles[0]._owner})
                    .then((res) => {
                        expect(res).toBeNull();
                        done();
                });
            });
    });

    it('should return status 400 if invalid id passed', (done) => {

        request(app)
            .delete(`/profile/${'123'}`)
            .expect(404) //need to update status code responses once auth implemented
            .end(done);

    });


});

describe('PATCH /profile/:id', () => {

    it('should update the profile', (done) => {
        const updatedProfile = {
            username: "New USERRRR",
            firstName: "Real First Name",
            lastName: "Real Last Name",
            descriptors: ['real descriptor', 'another real descriptor'],
            locationTimes: [
                {country:'Thailand', city:'Bangkok', place:'Siam no. 2', fromDate: 1478612335000, toDate: 1481204335000},
                {country:'India', city:'New Delhi', place:'India gate', fromDate: 1478612335000, toDate: 1481204336000},
                {country:'Australia', city:'Tasmania', place:'Winery', fromDate: 1478812334000, toDate: 1489204334000}
            ]
        };

        request(app)
            .patch(`/profile/${profiles[0]._owner}`)
            .send(updatedProfile)
            .expect(200)
            .expect((res) => {
                expect(res.body.profile.username).toBe(updatedProfile.username);
                expect(res.body.profile.firstName).toBe(updatedProfile.firstName);
                expect(res.body.profile.lastName).toBe(updatedProfile.lastName);
                expect(res.body.profile.descriptors).toEqual(expect.arrayContaining(updatedProfile.descriptors));
            })
            .end((e) => {
                if(e){
                    done(e);
                }
                Profile.findOne({_owner: profiles[0]._owner})
                    .then((profile) => {
                        expect(profile.username).toBe(updatedProfile.username);
                        expect(profile.firstName).toBe(updatedProfile.firstName);
                        expect(profile.lastName).toBe(updatedProfile.lastName);
                        expect(profile.descriptors).toEqual(expect.arrayContaining(updatedProfile.descriptors));
                        done();
                    }).catch((e) => done(e));
            });
    });

});