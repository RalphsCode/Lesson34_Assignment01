const Router = require("express").Router;
const Message = require("../models/message");
const {ensureLoggedIn, ensureCorrectUser, ensureRecipient} = require("../middleware/auth");

const router = new Router();

/** GET /:id - get detail of message.
 *
 * => {message: {id,
 *               body,
 *               sent_at,
 *               read_at,
 *               from_user: {username, first_name, last_name, phone},
 *               to_user: {username, first_name, last_name, phone}}
 *
 * Make sure that the currently-logged-in users is either the to or from user.
 *
 **/
router.get("/:id", ensureLoggedIn, ensureCorrectUser, async (req, res, next) => {
    try{
        result = await Message.get(req.params.id);
        return res.json({message:result});
    } catch(err) {
        next(err);
    }
})


/** POST / - post message.
 *
 * {to_username, body} =>
 *   {message: {id, from_username, to_username, body, sent_at}}
 *
 **/
router.post("/", ensureLoggedIn, async (req, res, next) => {
    try {
        const {from_username, to_username, body} = req.body;
        const result = await Message.create({from_username, to_username, body});
        res.json({message:result});
    } catch(err) {
        next(err);
    }
})

/** POST/:id/read - mark message as read:
 *
 *  => {message: {id, read_at}}
 *
 * Make sure that the only the intended recipient can mark as read.
 *
 **/
router.post("/:id", ensureRecipient, async (req, res, next) => {
    try {

    const result = await Message.markRead(req.params.id);
    return res.json({message: result});
} catch(err) {
    next(err);
}
});

module.exports = router;