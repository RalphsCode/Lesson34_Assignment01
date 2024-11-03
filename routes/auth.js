const Router = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const {SECRET_KEY} = require("../config");

const router = new Router();

/** POST /login - login: {username, password} => {token}
 *
 * Make sure to update their last-login!
 *
 **/
router.post("/login", async function (req, res, next) {
    try { 
        const {username, password} = req.body;
        const valid = await User.authenticate(username, password);
        if (valid) {
                User.updateLoginTimestamp(username);
                let token = jwt.sign({username}, SECRET_KEY);  // Assign payload = username
                return res.json({token});
            };
        } catch (err) { 
        console.log("ERROR:", err); } 
    });



/** POST /register - register user: registers, logs in, and returns token.
 *
 * {username, password, first_name, last_name, phone} => {token}.
 *
 *  Make sure to update their last-login!
 */

router.post('/register', async function(req, res, next) {
    try {
        const {username, password, first_name, last_name, phone} = req.body;
        const user = await User.register({username, password, first_name, last_name, phone});
        if (user) {
            User.updateLoginTimestamp(user.username);
            let token = jwt.sign({username}, SECRET_KEY);
            return res.json({token});};
        return res.json({"error":"Could not find a user in register route."})
    } catch(err) {
        next(err);
    }
})

module.exports = router;