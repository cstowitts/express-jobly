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
  try {

    if(!user){
      throw new UnauthorizedError();
    }

    const user = res.locals.user;

    if (user && user.isAdmin === true) {
      return next();
    }
      throw new UnauthorizedError();
  } catch (err) {
    return next(err);
  }
}

/** Middleware to authorize same user
 * or admin user
 *
 * if neither admin, or same, raises Unauthorized
 */

//update function name adminOrSameUser
//update to check if res.locals.user before accessing it
function ensureCorrectUser(req, res, next) {
  const user = res.locals.user;

  const loggedInSameUser = user && (user.username === req.params.username);

  const loggedInAdmin = user && (user.isAdmin === true);

  try {
    if (loggedInSameUser === true || loggedInAdmin == true){
      return next();
    }
    throw new UnauthorizedError();

  } catch (err) {
  return next(err);
  }
}



module.exports = {
  authenticateJWT,
  ensureLoggedIn,
  ensureAdmin,
  ensureCorrectUser
};
