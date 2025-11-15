const express = require("express");
const router = express.Router();

router.use("/", require("./validation"));
router.use("/schedules", require("./schedules.js"));
router.use("/courses", require("./courses"));
router.use("/reviews", require("./reviews"));

module.exports = router;
