const expect = require('expect');
const request = require('supertest');
const {ObjectID} = require('mongodb');

const {app} = require('./../server');
const {Pigeon, Profile, User, ChatProfile } = require('@softwaresamurai/pigeon-mongo-models');
const {pigeons, populatePigeons, profiles, populateProfiles, users, populateUsers, chatProfiles, populateChatProfiles} = require('./seed/seed');
const {tokens} = require('./seed/seed');

beforeEach(populateUsers);
beforeEach(populatePigeons);
beforeEach(populateProfiles);
beforeEach(populateChatProfiles);

describe('POST /pigeons', () => {
    const _creator = users[0]._id;
    const body = 'Fly pigeon! Fly!';
    const encounterDate = 1451520000;
    const title = 'First pigeon unleashed';
    const to = 'Pigeon Whisperer';
    const from = users[0].email;

    it('should create a new pigeon', (done) => {

        const pigeon = new Pigeon({body, encounterDate, title, to, from, _creator});
        request(app)
            .post(`/pigeons?token=${tokens[0]}`)
            .send(pigeon)
            .expect(200)
            .expect((res) => {
                expect(res.body.pigeon._owner).toBe(pigeon._owner);
                expect(res.body.pigeon.body).toBe(pigeon.body);
                expect(res.body.pigeon.encounterDate).toBe(pigeon.encounterDate);
                expect(res.body.pigeon.title).toBe(pigeon.title);
                expect(res.body.pigeon.to).toBe(pigeon.to);
                expect(res.body.pigeon.from).toBe(pigeon.from);

                //check DB
                Pigeon.find()
                    .then((pigeons) => {
                        expect(pigeons.length).toBe(3);
                        expect(pigeons[pigeons.length-1]._owner).toBe(pigeon._owner);
                        expect(pigeons[pigeons.length-1].body).toBe(pigeon.body);
                        expect(pigeons[pigeons.length-1].encounterDate).toBe(pigeon.encounterDate);
                        expect(pigeons[pigeons.length-1].title).toBe(pigeon.title);
                        expect(pigeons[pigeons.length-1].to).toBe(pigeon.to);
                        expect(pigeons[pigeons.length-1].from).toBe(pigeon.from);
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

        const body = '';
        const _creator = users[0]._id;
        const pigeon = new Pigeon({body, encounterDate, title, to, _creator});

        request(app)
            .post(`/pigeons?token=${tokens[0]}`)
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
            .get(`/pigeons?token=${tokens[0]}`)
            .expect(200)
            .expect((res) => {
                expect(res.body.pigeons.length).toBe(2);
            }).end(done);
    });

});

// describe('GET /pigeons/owner/:id', () => {
//     it('should get pigeons that belong to an owner', (done) => {
//         request(app)
//             .get(`/pigeons/owner/${users[0]._id.toHexString()}`)
//             .set('x-auth', users[0].tokens[0].token)
//             .expect(200)
//             .expect((res) => {
//                 expect(res.body.pigeons.length).toBe(1);
//                 expect(res.body.pigeons[0]._creator.toString()).toBe(users[0]._id.toString())
//             }).end(done);
//     });
//
// });


describe('GET /pigeons/:id', () => {

    it('should get a pigeon with requested id', (done) => {

        request(app)
            .get(`/pigeons/${pigeons[0]._id.toHexString()}?token=${tokens[0]}`)
            //.set('x-auth', users[0].tokens[0].token)
            .expect(200)
            .expect((res) => {
                expect(res.body.pigeon).toHaveProperty('title', pigeons[0].title);
                expect(res.body.pigeon).toHaveProperty('body', pigeons[0].body);
                expect(res.body.pigeon).toHaveProperty('encounterDate', pigeons[0].encounterDate);
                expect(res.body.pigeon).toHaveProperty('to', pigeons[0].to);
                expect(res.body.pigeon).toHaveProperty('from', pigeons[0].from);
            })
            .end(done);

    });

    it('should respond with an error when invalid id is passed', (done) => {
        request(app)
            .get(`/pigeons/${pigeons[0]._id.toHexString().concat('111')}?token=${tokens[0]}`)
            .expect(400)
            .end(done);
    });
});

//delete
describe('DELETE /pigeons/:id', () => {

    it('should delete the pigeon with the requested id', (done) => {
        request(app)
            .delete(`/pigeons/${pigeons[0]._id.toHexString()}?token=${tokens[0]}`)
            .expect(200)
            .expect((res) => {
                expect(res.body.pigeon).toHaveProperty('_creator', pigeons[0]._creator.toString());
                expect(res.body.pigeon).toHaveProperty('title', pigeons[0].title);
                expect(res.body.pigeon).toHaveProperty('body', pigeons[0].body);
                expect(res.body.pigeon).toHaveProperty('encounterDate', pigeons[0].encounterDate);
                expect(res.body.pigeon).toHaveProperty('to', pigeons[0].to);
                expect(res.body.pigeon).toHaveProperty('from', pigeons[0].from);

            })
            .end((e) => {
                if(e){
                    done(e);
                } else {
                    //check to make sure it has been removed from the db
                    Pigeon.findOne({_id: pigeons[0]._id.toHexString()})
                        .then((pigeon) => {
                            expect(pigeon).toBe(null);
                            done();
                        })
                        .catch((e) => {
                            done(e);
                        });
                }
            });
    });

    it('should return 404 error if pigeon does not exist', (done) => {

        const id = new ObjectID().toHexString();

        request(app)
            .delete(`/pigeons/${id}?token=${tokens[0]}`)
            .expect(404)
            .end(done);
    });

    it('should return 400 error if pigeon id is invalid', (done) => {

        const id = new ObjectID().toHexString().concat('1');

        request(app)
            .delete(`/pigeons/${id}?token=${tokens[0]}`)
            .expect(400)
            .end(done);
    });

    it('should not allow non-creators to delete pigeons', (done) => {
        request(app)
            .delete(`/pigeons/${pigeons[0]._id.toHexString()}?token=${tokens[1]}`)
            .expect(404)
            .end((err) => {
                if(err){
                    expect(400);
                    return done(err);
                }

                //check that the deletion did not happen
                Pigeon.findById(pigeons[0]._id.toHexString())
                    .then((pigeon) => {
                        expect(pigeon).toBeTruthy();
                        done();
                }).catch((e) => {
                    done(e);
                });
            });
    });
});

describe('PATCH /pigeons/:id', () => {

    const changes = {encounterDate: 1, title: "New Title", body: "New body", to: "New Person"};

    it('should update the pigeon', (done) => {

        request(app)
            .patch(`/pigeons/${pigeons[0]._id.toHexString()}?token=${tokens[0]}`)
            .send(changes)
            .expect(200)
            .expect((res) => {
                expect(res.body.pigeon).toBeTruthy();
                expect(res.body.pigeon).toHaveProperty('title', changes.title);
                expect(res.body.pigeon).toHaveProperty('body', changes.body);
                expect(res.body.pigeon).toHaveProperty('encounterDate', changes.encounterDate);
                expect(res.body.pigeon).toHaveProperty('to', changes.to);
                expect(res.body.pigeon).toHaveProperty('from',);
            })
            .end(done);
    });

    it('should not allow other users to update the pigeon', (done) => {

        request(app)
            .patch(`/pigeons/${pigeons[0]._id.toHexString()}?token=${tokens[1]}`)
            .send(changes)
            .expect(404)
            .end(done);
    });

});

describe('POST /profile', () => {

    const profile = {
        username:"Unique849",
        firstName:"Hector",
        lastName:"Garcia",
        descriptors:['brunette'],
        locationTimes:[
            {country:'Thailand', city:'Phuket', place:'Siam no. 1', fromDate: 1478612334000, toDate: 1481204334000},
            {country:'India', city:'Bombay', place:'Indian gate', fromDate: 1478612335000, toDate: 1481204336000},
            {country:'Australia', city:'Sydney', place:'Sydney Harbour', fromDate: 1478812334000, toDate: 1489204334000}
        ]
    };

    it('should create a new profile', (done) => {

        //need to remove existing profile for users[0]
        Profile.findOneAndRemove({_owner: users[0]._id}).then(() => {

            request(app)
                .post(`/profile?token=${tokens[0]}`)
                .send(profile)
                .expect(200)
                .expect((res) => {
                    expect(res.body.profile._owner).toBe(users[0]._id.toString());
                    expect(res.body.profile.username).toBe(profile.username);
                    expect(res.body.profile.firstName).toBe(profile.firstName);
                    expect(res.body.profile.lastName).toBe(profile.lastName);
                    expect(res.body.profile.descriptors).toEqual(expect.arrayContaining(profile.descriptors));

                    Profile.findOne({_owner: users[0]._id})
                        .then((p) => {
                            //expect(p._owner).toBe(users[0]._id);
                            expect(p.username).toBe(profile.username);
                            expect(p.firstName).toBe(profile.firstName);
                            expect(p.lastName).toBe(profile.lastName);
                            expect(typeof p.created === 'number').toBe(true);
                            expect(p.descriptors).toEqual(expect.arrayContaining(profile.descriptors));
                            done();
                        }).catch((e) => done(e));

                })
                .end((err) => {
                    if (err) {
                        done(err);
                    }
                });
        });


    });



    it('should not create a profile with an invalid body', (done) => {

        profile.lastName = "";
        profile.firstName = "";
        profile.username = 39404;

        request(app)
            .post(`/profile?token=${tokens[0]}`)
            .send(profile)
            .expect(400)
            .end(done);
    });

    it('should only allow unique _owner ids in each profile on creation', (done) => {

        profile.lastName = "Garcia";
        profile.firstName = "Hector";
        profile.username = "Hectorinoooooo";
        profile._owner = profiles[0]._owner;

        request(app)
            .post(`/profile?token=${tokens[0]}`)
            .send(profile)
            .expect(400)
            .end(done);
    });

    it('should make sure profiles are created with unique usernames', (done) => {

        profile._owner = "Placeholder owner 3";
        profile.username = profiles[0].username;

        request(app)
            .post(`/profile?token=${tokens[0]}`)
            .send(profile)
            .expect(400)
            .end(done);
    });

});

describe('GET /profile/me', () => {

    it('should get profile with the specified _owner', (done) => {

        request(app)
            .get(`/profile/me?token=${tokens[0]}`)
            .expect(200)
            .expect((res) => {
                //expect(res.body.profile.locationTimes).toMatchObject(profiles[0].locationTimes);
                expect(res.body.profile).toHaveProperty('_owner', profiles[0]._owner.toString());
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

});

describe('DELETE /profile/me', () => {

    it('should delete the profile with specified id', (done) => {

        request(app)
            .delete(`/profile/me?token=${tokens[0]}`)
            .expect(200)
            .expect((res) => {
                expect(res.body.profile).toHaveProperty('_owner', profiles[0]._owner.toString());
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

});

describe('PATCH /profile/me', () => {

    const updatedProfile = {
        _owner: users[0]._id,
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

    it('should update the profile', (done) => {

        request(app)
            .patch(`/profile/me?token=${tokens[0]}`)
            //.set('x-auth', users[0].tokens[0].token)
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

//Users
describe('POST /users/', () => {

    it('should create a new user', (done) => {

        const email = 'newemail@email.com';
        const password = 'password123';

        request(app)
            .post('/users')
            .send({email, password})
            .expect(200)
            .expect((res) => {
                expect(res.headers['x-auth']).toBeTruthy();
                expect(res.body.user._id).toBeTruthy();
                expect(res.body.user.email).toBe(email);})
            .end((err) => {
                if(err){
                    return done(err);
                }
                User.findOne({email}).then((user) => {
                    expect(user).toBeTruthy();
                    expect(user.password).not.toBe(password);
                    done();
                }).catch((e) => done(e));
            });
    });

});

describe('POST /users/login', () => {

    it('should create a new token for the user', (done) => {

        const email = 'hectorino@gmail.com';
        const password = 'password1';

        request(app)
            .post('/users/login')
            .send({email, password})
            .expect(200)
            .expect((res) => {
                User.findByCredentials(email, password)
                    .then((user) => {
                        //expect(user.tokens.length).toBe(2);
                    }).catch((e) => done(e))
            }).end((err) => {
                if (err) {
                    done(err);
                }
                done();
            });
    });

});

describe('POST /chats/profile', () => {

    it('should create a new chatProfile', (done) => {

        ChatProfile.findOneAndRemove({_owner: chatProfiles[0]._owner})
            .then(() => {
                request(app)
                    .post(`/chats/profile?token=${tokens[0]}`)
                    .send()
                    .expect(200)
                    .expect((res) => {
                        expect(res.body.chats._id).toBeTruthy();
                        expect(res.body.chats._owner).toBe(chatProfiles[0]._owner);
                        expect(res.body.chats.chats).toEqual([]);
                    })
                    .end((err) => {
                        if (err) {
                            done(err);
                        }
                        ChatProfile.findOne({ _owner: chatProfiles[0]._owner})
                            .then((savedChatProfile) => {
                                expect(savedChatProfile._owner).toBe(chatProfiles[0]._owner);
                                expect(savedChatProfile.chats).toBe([]);
                                done();
                            })
                            .catch((e) => done(err));
                    });
            });

    });
});
//
// describe('GET /chat/profile', () => {
//     it('should get the chatProfile', (done) => {
//
//     });
// });

// describe('DELETE /users/me/token', () => {
//
//     it('should remove a token from the user for logging out', (done) => {
//         request(app)
//             .delete('/users/me/token')
//             //.set('x-auth', users[0].tokens[0].token)
//             .expect(200)
//             .end((err) => {
//                 if(err){
//                     done(err);
//                 }
//                 User.findById(users[0]._id)
//                     .then((user) => {
//                         expect(user.tokens.length).toBe(0);
//                         done();
//                     }).catch((err) => {done(err);});
//             });
//         });
// });


