const express = require('express')
const router = express.Router();
const { createUser, loginUserCtrl, getallUser, getsingleUser, deleteUser, updatedUser } = require("../controller/userCtrl");
const {authMiddleware, isAdmin} = require('../middlewares/authMiddleware');

router.post("/register", createUser);
router.post("/login", loginUserCtrl);
router.get("/all-users", getallUser);
router.get("/:id", authMiddleware, isAdmin, getsingleUser);
router.delete("/:id", deleteUser);
router.put("/edit-user", authMiddleware, updatedUser);


module.exports = router;