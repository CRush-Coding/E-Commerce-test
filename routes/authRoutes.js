const express = require('express')
const router = express.Router();
const { createUser, loginUserCtrl, getallUser, getsingleUser, deleteUser } = require("../controller/userCtrl");

router.post("/register", createUser);
router.post("/login", loginUserCtrl);
router.get("/all-users", getallUser);
router.get("/:id", getsingleUser);
router.delete("/:id", deleteUser);


module.exports = router;