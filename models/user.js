/** User class for message.ly */
const bcrypt = require("bcrypt");
const { BCRYPT_WORK_FACTOR } = require("../config");
const ExpressError = require("../expressError");
const db = require("../db");

/** User of the site. */

class User {

  /** register new user -- returns
   *    {username, password, first_name, last_name, phone}
   */

  static async register({username, password, first_name, last_name, phone}) { 
    try {
      const hashedPW = await bcrypt.hash( password, BCRYPT_WORK_FACTOR);
      const result = await db.query(
        `INSERT INTO users (username,
    password,
    first_name,
    last_name,
    phone,
    join_at, 
    last_login_at
    ) VALUES ($1, $2, $3, $4, $5, current_timestamp, current_timestamp) RETURNING username, password, first_name, last_name, phone`, [username, hashedPW, first_name, last_name, phone]
      )
      return result.rows[0];
    } catch(err) {
      console.log(err);
    }
  }

  /** Authenticate: is this username/password valid? Returns boolean. */

  static async authenticate(username, password) { 
    try {
      const result = await db.query(`SELECT password FROM users
      WHERE username = $1`, [username]);
    if (!result.rows[0]) {
      throw new ExpressError("Username / Password Invalid", 400);
    };
    if (await bcrypt.compare(password, result.rows[0].password) === true) {
      return true;
    };
    throw new ExpressError("Username / Password Invalid", 400);
  } catch(err) {
    console.log(err)
  }

    }

  /** Update last_login_at for user */

  static async updateLoginTimestamp(username) {
    try {
      const result = await db.query(`UPDATE users SET last_login_at = current_timestamp 
        WHERE username = $1`, [username]);
      if (result) { 
        return true 
      } else {
        throw new ExpressError("Invalid username", 400)
      };

    } catch(err) {
      console.log(err)
    }
   }

  /** All: basic info on all users:
   * [{username, first_name, last_name, phone}, ...] */

  static async all() { 
    try {
      const results = await db.query(`
        SELECT username, first_name, last_name, phone
        FROM users`)
        return results.rows;
    } catch(err) {
      next(err);
    }
  }

  /** Get: get user by username
   *
   * returns {username,
   *          first_name,
   *          last_name,
   *          phone,
   *          join_at,
   *          last_login_at } */

  static async get(username) { 
    try {
      const result = await db.query(`
        SELECT username,
             first_name,
             last_name,
             phone,
             join_at,
             last_login_at 
        FROM users
        WHERE username = $1`,
      [username]);
      if (result.rows[0]) {
        return result.rows[0];
      } else {
        throw new ExpressError("User not found", 404);
      }
    } catch(err) {
      next(err);
    }
  }

  /** Return messages from this user.
   *
   * [{id, to_user, body, sent_at, read_at}]
   *
   * where to_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesFrom(username) { 
    try {
      const results = await db.query(`
        SELECT 
        m.id, 
        m.to_username,
        u.first_name,
        u.last_name,
        u.phone, 
        m.body, 
        m.sent_at, 
        m.read_at 
        FROM messages AS m JOIN users AS u
        ON u.username = m.to_username
        WHERE m.from_username = $1 ORDER BY m.sent_at desc`, [username]);
        if (results.rows) {
          let formatted = results.rows.map(val => ({
            id: val.id, 
            to_user: {
              username: val.to_username, 
              first_name: val.first_name, 
              last_name: val.last_name, 
              phone: val.phone
            },
               message: val.body, 
               sent: val.sent_at, 
               read: val.read_at
               })   )     

          return formatted;
        } else {
          throw new ExpressError("User not found", 404);
        }
    } catch(err) {
      next(err);
    }
  }

  /** Return messages to this user.
   *
   * [{id, from_user, body, sent_at, read_at}]
   *
   * where from_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesTo(username) { 
    try {
      const results = await db.query(`
        SELECT 
        m.id, 
        m.from_username,
        u.first_name,
        u.last_name,
        u.phone, 
        m.body, 
        m.sent_at, 
        m.read_at 
        FROM messages AS m JOIN users AS u
        ON u.username = m.from_username
        WHERE m.to_username = $1 ORDER BY m.sent_at desc`, [username]);
        if (results.rows) {
          let formatted = results.rows.map(val => ({
            id: val.id, 
            from_user: {
              username: val.from_username, 
              first_name: val.first_name, 
              last_name: val.last_name, 
              phone: val.phone
            },
               message: val.body, 
               sent: val.sent_at, 
               read: val.read_at
               })   )     

          return formatted;
        } else {
          throw new ExpressError("User not found", 404);
        }
    } catch(err) {
      next(err);
    }
  }
}  // END Class User


module.exports = User;