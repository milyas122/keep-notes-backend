import express from "express";
import userRoutes from "./user";
import noteRoutes from "./note";

const router = express.Router();

router.use("/auth", userRoutes);
router.use("/note", noteRoutes);

export = router;
