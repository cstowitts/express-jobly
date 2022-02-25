"use strict";

/** Convenience middleware to handle common auth cases in routes. */

const jwt = require("jsonwebtoken");
const { user } = require("pg/lib/defaults");
const { SECRET_KEY } = require("../config");
const { UnauthorizedError } = require("../expressError");


/** Middleware: Authenticate user.
 *
 * If a token was provided, verify it, and, if valid, store the token payload
 * on res.locals (this will include the username and isAdmin field.)
 *
 * It's not an error if no token was provided or if the token is not valid.
 */

function authenticateJWT(req, res, next) {
  try {
    const authHeader = req.headers && req.headers.authorization;
    if (authHeader) {
      const token = authHeader.replace(/^[Bb]earer /, "").trim();
      res.locals.user = jwt.verify(token, SECRET_KEY);
    }
    return next();
  } catch (err) {
    return next();
  }
}

/** Middleware to use when they must be logged in.
 *
 * If not, raises Unauthorized.
 */

function ensureLoggedIn(req, res, next) {
  try {
    if (!res.locals.user) throw new UnauthorizedError();
    return next();
  } catch (err) {
    return next(err);
  }
}
/** Middleware to authorize admin user
 *
 * if not admin user, raises Unauthorized
 */

function ensureAdmin(req, res, next) {
  const user = res.locals.user;
  try {
    if (!user || user.isAdmin === false) {
      throw new UnauthorizedError();
    } else {
      return next();
    }
  } catch (err) {
    return next(err);
  }
}

/** Middleware to authorize same user
 * or admin user
 *
 * if neither admin, or same, raises Unauthorized
 */

function ensureCorrectUser(req, res, next) {
  const user = res.locals.user;
  console.log("Res locals user: ", user.username);
  console.log("Params user: ", req.params.username);
  console.log("Are users same?" , user.username === req.params.username);
  try {
    if (!user || user.username !== req.params.username || user.isAdmin === false) {
      throw new UnauthorizedError();
    } else {
      return next();
    }
  } catch (err) {
    return next(err);
  }


module.exports = {
  authenticateJWT,
  ensureLoggedIn,
  ensureAdmin,
  ensureCorrectUser
};
