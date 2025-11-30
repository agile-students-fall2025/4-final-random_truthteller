import express from "express";
import validationRouter from "./validation.js";
import schedulesRouter from "./schedules.js";
import coursesRouter from "./courses.js";
import reviewsRouter from "./reviews.js";
import authRouter from "./auth.js";
import accountsRouter from "./accounts.js";

const router = express.Router();

router.use("/", validationRouter);
router.use("/schedules", schedulesRouter);
router.use("/courses", coursesRouter);
router.use("/reviews", reviewsRouter);
router.use("/auth", authRouter);
router.use("/accounts", accountsRouter);

export default router;
