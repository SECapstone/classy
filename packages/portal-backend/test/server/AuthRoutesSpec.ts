import {expect} from "chai";
import "mocha";

import Log from "../../../common/Log";

import BackendServer from "../../src/server/BackendServer";
import {DatabaseController} from "../../src/controllers/DatabaseController";
import {AuthTransportPayload} from "../../../common/types/PortalTypes";
import {Test} from "../GlobalSpec";
import restify = require('restify');

const request = require('supertest');

describe('Auth Routes', function () {

    const TIMEOUT = 1000 * 10;

    var app: restify.Server = null;

    var server: BackendServer = null;

    // let oldOrg: string | null = null;
    before(async () => {
        Log.test('AuthRoutes::before - start');

        // oldOrg = Config.getInstance().getProp(ConfigKey.org);
        // Config.getInstance().setProp(ConfigKey.name, ConfigCourses.classytest); // force testing environment


        let db = DatabaseController.getInstance();
        // await db.clearData(); // nuke everything

        // NOTE: need to start up server WITHOUT HTTPS for testing or strange errors crop up
        server = new BackendServer(false);

        return server.start().then(function () {
            Log.test('AuthRoutes::before - server started');
            app = server.getServer();
        }).catch(function (err) {
            Log.test('AuthRoutes::before - server might already be started: ' + err);
        });
    });

    after(function () {
        Log.test('AuthRoutes::after - start');
        return server.stop();
    });

    it('Should be able to get some credentials for an admin', async function () {

        const dc: DatabaseController = DatabaseController.getInstance();

        let auth = await dc.getAuth(Test.USERNAMEADMIN);
        expect(auth).to.not.be.null;

        let response = null;
        let body: AuthTransportPayload;
        const url = '/getCredentials';
        try {
            Log.test('Making request');
            response = await request(app).get(url).set('user', auth.personId).set('token', auth.token);
            Log.test('Response received');
            body = response.body;
        } catch (err) {
            Log.test('ERROR: ' + err);
        }
        Log.test('checking assertions on: response');

        Log.test(response.status + " -> " + JSON.stringify(body));
        expect(response.status).to.equal(200);
        expect(body.success).to.not.be.undefined;
        expect(body.success.personId).to.equal(auth.personId);
        expect(body.success.token).to.equal(auth.token);
    }).timeout(TIMEOUT);

    it('Should be able to get some credentials for a student', async function () {

        const dc: DatabaseController = DatabaseController.getInstance();

        let auth = await dc.getAuth(Test.USERNAME1);
        expect(auth).to.not.be.null;

        let response = null;
        let body: AuthTransportPayload;
        const url = '/getCredentials';
        try {
            Log.test('Making request');
            response = await request(app).get(url).set('user', auth.personId).set('token', auth.token);
            Log.test('Response received');
            body = response.body;
        } catch (err) {
            Log.test('ERROR: ' + err);
        }
        Log.test('checking assertions on: response');

        Log.test(response.status + " -> " + JSON.stringify(body));
        expect(response.status).to.equal(200);
        expect(body.success).to.not.be.undefined;
        expect(body.success.personId).to.equal(auth.personId);
        expect(body.success.token).to.equal(auth.token);
    }).timeout(TIMEOUT);

    it('Should fail to get credentials if the token is bad', async function () {

        const dc: DatabaseController = DatabaseController.getInstance();

        let auth = await dc.getAuth(Test.USERNAMEADMIN);
        expect(auth).to.not.be.null;

        let response = null;
        let body: AuthTransportPayload;
        const url = '/getCredentials';
        try {
            response = await request(app).get(url).set('user', auth.personId).set('token', 'totallyINVALIDtoken');
            body = response.body;
        } catch (err) {
            Log.test('ERROR: ' + err);
        }
        Log.test(response.status + " -> " + JSON.stringify(body));
        expect(response.status).to.equal(400);
        expect(body.failure).to.not.be.undefined;
    });

    it('Should be able to logout a student', async function () {

        const dc: DatabaseController = DatabaseController.getInstance();

        let auth = await dc.getAuth(Test.USERNAME1);
        expect(auth).to.not.be.null;

        let response = null;
        let body: AuthTransportPayload;
        const url = '/logout';
        try {
            Log.test('Making request');
            response = await request(app).get(url).set('user', auth.personId).set('token', auth.token);
            Log.test('Response received');
            body = response.body;
        } catch (err) {
            Log.test('ERROR: ' + err);
        }
        Log.test('checking assertions on: response');

        Log.test(response.status + " -> " + JSON.stringify(body));
        expect(response.status).to.equal(200);
        expect(body.success).to.not.be.undefined;
    }).timeout(TIMEOUT);

});

