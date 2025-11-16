const express = require("express");
const router = express.Router();

router.use("/", require("./validation"));
router.use("/schedules", require("./schedules.js"));
router.use("/courses", require("./courses"));
router.use("/reviews", require("./reviews"));
router.use("/auth", require("./auth"));
router.use("/accounts", require("./accounts"));

module.exports = router;
