const supertest = require('supertest');
const expect = require('chai').expect;
const async = require('async');
const app = require('../app');
const counter = require('../functional/counter'); // Counter function

before(function (done) {
    // Init data folder counter data before tests
    counter._initDataFiles().then(() => {
        done();
    });
});

after(function (done) {
    // Re-initialize data folder counter data after tests
    counter._initDataFiles().then(() => {
        done();
    });
});

// Begin test routes/api.js
describe('#Test HTTP GET data API', () => {
    describe('#1 Request with valid ID user=1', function () {
        this.timeout(5000);
        it(`Should return status 200, with JSON data with 'result' attribute.`, done => {
            supertest(app)
                .get('/api/data')
                .query({ user: 1 })
                .expect(200)
                .end((err, res) => {
                    if (err) {
                        return done(err);
                    }
                    expect(res.body.hasOwnProperty('result')).to.be.equal(true);
                    counter._setCounterToZero();
                    return done();
                });
        });
    });
    describe('#2 Request with invalid ID user=1001', function () {
        this.timeout(5000);
        it(`Should return status 403, with Error message JSON data.`, done => {
            supertest(app)
                .get('/api/data')
                .query({ user: 1001 })
                .expect(403)
                .end((err, res) => {
                    if (err) {
                        return done(err);
                    }
                    expect(res.body.Error).to.be.equal('Your user parameter is invalid.');
                    return done();
                });
        });
    });
    describe('#3 Request with same valid ID exceeds rate limit', function () {
        this.timeout(10000);
        it(`Should return status 403, with invalid count JSON data.`, done => {
            // Try request 6 times with same user ID to exceed rate limit
            let request = supertest(app);
            async.series([
                function (cb) { request.get('/api/data').query({ user: 2 }).end(cb); },
                function (cb) { request.get('/api/data').query({ user: 2 }).end(cb); },
                function (cb) { request.get('/api/data').query({ user: 2 }).end(cb); },
                function (cb) { request.get('/api/data').query({ user: 2 }).end(cb); },
                function (cb) { request.get('/api/data').query({ user: 2 }).end(cb); },
                function (cb) { request.get('/api/data').query({ user: 2 }).expect(403, cb); },
            ], (err, res) => {
                if (err) {
                    return done(err);
                }
                expect(res[5].body.ID).to.be.greaterThan(5);
                counter._setCounterToZero();
                return done();
            });
        });
    });
    describe('#4 Request with same IP exceeds rate limit', function () {
        this.timeout(10000);
        it(`Should return status 403, with invalid count JSON data.`, done => {
            // Try request 11 times with same user IP to exceed rate limit
            let request = supertest(app);
            async.series([
                function (cb) { request.get('/api/data').query({ user: 3 }).end(cb); },
                function (cb) { request.get('/api/data').query({ user: 3 }).end(cb); },
                function (cb) { request.get('/api/data').query({ user: 3 }).end(cb); },
                function (cb) { request.get('/api/data').query({ user: 3 }).end(cb); },
                function (cb) { request.get('/api/data').query({ user: 3 }).end(cb); },
                function (cb) { request.get('/api/data').query({ user: 3 }).end(cb); },
                function (cb) { request.get('/api/data').query({ user: 3 }).end(cb); },
                function (cb) { request.get('/api/data').query({ user: 3 }).end(cb); },
                function (cb) { request.get('/api/data').query({ user: 3 }).end(cb); },
                function (cb) { request.get('/api/data').query({ user: 3 }).end(cb); },
                function (cb) { request.get('/api/data').query({ user: 3 }).expect(403, cb); },
            ], (err, res) => {
                if (err) {
                    return done(err);
                }
                expect(res[10].body.IP).to.be.greaterThan(10);
                return done();
            });
        });
    });
});