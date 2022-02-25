"use strict";

const jwt = require("jsonwebtoken");
const { UnauthorizedError } = require("../expressError");
const {
  authenticateJWT,
  ensureLoggedIn,
  ensureAdmin,
  ensureCorrectUser,
} = require("./auth");


const { SECRET_KEY } = require("../config");
const testJwt = jwt.sign({ username: "test", isAdmin: false }, SECRET_KEY);
const badJwt = jwt.sign({ username: "test", isAdmin: false }, "wrong");

const sameUser = {username: "same", isAdmin: false};
const adminUser = { username: "admin", isAdmin: true};
const notAdminUser = { username: "notAdmin", isAdmin: false};

describe("authenticateJWT", function () {
  test("works: via header", function () {
    expect.assertions(2);
    const req = { headers: { authorization: `Bearer ${testJwt}` } };
    const res = { locals: {} };
    const next = function (err) {
      expect(err).toBeFalsy();
    };
    authenticateJWT(req, res, next);
    expect(res.locals).toEqual({
      user: {
        iat: expect.any(Number),
        username: "test",
        isAdmin: false,
      },
    });
  });

  test("works: no header", function () {
    expect.assertions(2);
    const req = {};
    const res = { locals: {} };
    const next = function (err) {
      expect(err).toBeFalsy();
    };
    authenticateJWT(req, res, next);
    expect(res.locals).toEqual({});
  });

  test("works: invalid token", function () {
    expect.assertions(2);
    const req = { headers: { authorization: `Bearer ${badJwt}` } };
    const res = { locals: {} };
    const next = function (err) {
      expect(err).toBeFalsy();
    };
    authenticateJWT(req, res, next);
    expect(res.locals).toEqual({});
  });
});


describe("ensureLoggedIn", function () {
  test("works", function () {
    expect.assertions(1);
    const req = {};
    const res = { locals: { user: { username: "test" } } };
    const next = function (err) {
      expect(err).toBeFalsy();
    };
    ensureLoggedIn(req, res, next);
  });

  test("unauth if no login", function () {
    expect.assertions(1);
    const req = {};
    const res = { locals: {} };
    const next = function (err) {
      expect(err instanceof UnauthorizedError).toBeTruthy();
    };
    ensureLoggedIn(req, res, next);
  });
});

describe("ensureAdmin", function(){
  test("works: isAdmin", function(){
    expect.assertions(1);

    const req = {};
    const res = { locals: { user: adminUser } };
    const next = function (err) {
      expect(err).toBeFalsy();
    }

    ensureAdmin(req, res, next);
  });

  test("fails: notAdminUser, unauth", function(){
    expect.assertions(2);

    const req = {};
    const res = { locals: { user: notAdminUser } };
    const next = function (err) {
      expect(err).toBeTruthy();
      expect(err instanceof UnauthorizedError).toBeTruthy();
    }

    ensureAdmin(req, res, next);

  });

});

describe("ensureCorrectUser", function(){
  test("works: isAdmin", function(){
    expect.assertions(1);

    const req = { params: { username: adminUser.username}};
    const res = { locals: { user: adminUser } };
    const next = function (err) {
      expect(err).toBeFalsy();
    }

    ensureCorrectUser(req, res, next);

  });

  test("works: same user", function(){
    expect.assertions(1);

    const req = { params: { username: sameUser.username}};
    const res = { locals: { user: sameUser } };
    const next = function (err) {
      expect(err).toBeFalsy();
    }

    ensureCorrectUser(req, res, next);
  });

  test("fails: not admin or same user", function(){
    expect.assertions(2);

    const req = { params: { username: notAdminUser.username}};
    const res = { locals: { user: notAdminUser } };
    const next = function (err) {
      expect(err).toBeTruthy();
      expect(err instanceof UnauthorizedError).toBeTruthy();
    }

    ensureCorrectUser(req, res, next);
  });
})
