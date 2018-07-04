import {expect} from "chai";
import "mocha";

import Config from "../../common/Config";
import {ClassPortal, IClassPortal} from "../src/autotest/ClassPortal";
import {Backend} from "../../portal-backend/src/Backend";
import Log from "../../common/Log";

const loadFirst = require('./GlobalSpec');

describe("ClassPortal Service", () => {
    Config.getInstance();

    let cp: IClassPortal;
    const classId = "secapstone";
    const CURRENT_DEFAULT_DELIV = "d2";

    let backend: Backend = null;
    before(function () {
        Log.test("ClassPortalSpec::before() - start");
        backend = new Backend();
        backend.start();
    });

    after(function () {
        Log.test("ClassPortalSpec::after() - start");
        backend.stop();
    });

    beforeEach(function () {
        cp = new ClassPortal();
    });

    // NOTE: if this fails it could be because the ClassPortal Backend has not been started yet
    it("Should be able for a staff user to be staff.", async () => {
        try {
            const actual = await cp.isStaff("rtholmes");
            expect(actual.isStaff).to.equal(true);
            expect(actual.isAdmin).to.equal(true);
        } catch (err) {
            expect.fail("Should not happen");
        }
    });

    it("Should be able for a non-staff user to not be staff.", async () => {
        try {
            const actual = await cp.isStaff("student");
            expect(actual.isStaff).to.equal(false);
            expect(actual.isAdmin).to.equal(false);
        } catch (err) {
            expect.fail("Should not happen");
        }
    });

    it("Should be able for invalid user to not be staff.", async () => {
        try {
            const actual = await cp.isStaff("foo");
            expect(actual.isStaff).to.equal(false);
            expect(actual.isAdmin).to.equal(false);
        } catch (err) {
            expect.fail("Should not happen");
        }
    });

    it("Should return false for non-staff.", async () => {
        try {
            let actual = await cp.isStaff(null);
            expect(actual.isStaff).to.equal(false);
            expect(actual.isAdmin).to.equal(false);
            actual = await cp.isStaff(undefined);
            expect(actual.isStaff).to.equal(false);
            expect(actual.isAdmin).to.equal(false);
            actual = await cp.isStaff("");
            expect(actual.isStaff).to.equal(false);
            expect(actual.isAdmin).to.equal(false);
        } catch (err) {
            expect.fail("Should not happen");
        }
    });

    it("Should return the test delay in seconds for a course.", async () => {
        try {
            const res = await cp.getContainerDetails("d0");
            expect(res).to.not.be.null;
            const actual = res.studentDelay;
            expect(actual).to.equal(43200);
        } catch (err) {
            expect.fail("Should not happen");
        }
    });


    it("Should return a container id for an existing course.", async () => {
        try {
            const res = await cp.getContainerDetails("d0");
            const actual = res.dockerImage;
            expect(actual).to.equal("secapstone-grader");
        } catch (err) {
            expect.fail("Should not happen");
        }
    });

    it("Should return a null container id if delivId does not exist.", async () => {
        try {
            const res = await cp.getContainerDetails("d9997");
            expect(res).to.equal(null);
        } catch (err) {
            expect.fail("Should not happen");
        }
    });

    it("Should return a default deliverable if the course has one.", async () => {
        try {
            const actual = await cp.getDefaultDeliverableId();
            expect(actual.defaultDeliverable).to.equal("d0");
        } catch (err) {
            expect.fail("Should not happen");
        }
    });

});
