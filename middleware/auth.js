/** Middleware for handling req authorization for routes. */

const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");
const db = require("../db");

/** Middleware: Authenticate user. */

function authenticateJWT(req, res, next) {
  try {
    const tokenFromBody = req.body._token;
    const payload = jwt.verify(tokenFromBody, SECRET_KEY);  // payload = username (routes/auth.js)
    req.user = payload; // create a current user
    return next();
  } catch (err) {
    return next();
  }
}

/** Middleware: Requires user is authenticated. */

function ensureLoggedIn(req, res, next) {
  if (!req.user) {
    return next({ status: 401, message: "Unauthorized" });
  } else {
    return next();
  }
}

/** Middleware: Requires correct username. */

function ensureCorrectUser(req, res, next) {
  try {
    if (req.user.username === req.params.username) {
      return next();
    } else {
      return next({ status: 401, message: "Unauthorized" });
    }
  } catch (err) {
    // errors would happen here if we made a request and req.user is undefined
    return next({ status: 401, message: "Unauthorized" });
  }
}

/** Middleware: Requires user to be message recipient. */

async function ensureRecipient(req, res, next) {
  try {
    const result = await db.query(`
      SELECT to_username FROM messages
      WHERE id = $1`, [req.params.id]);
    if (req.user.username === result.rows[0].to_username) {
      return next();
    } else {
      return next({ status: 401, message: "Unauthorized" });
    }
  } catch (err) {
    // errors would happen here if we made a request and req.user is undefined
    return next({ status: 401, message: "Unauthorized" });
  }
}

// end

module.exports = {
  authenticateJWT,
  ensureLoggedIn,
  ensureCorrectUser,
  ensureRecipient
};
