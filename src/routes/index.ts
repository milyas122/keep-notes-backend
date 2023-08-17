import express from "express";
import userRoutes from "./user";
import noteRoutes from "./note";
import labelRoutes from "./label";

const router = express.Router();

router.use("/auth", userRoutes);
router.use("/notes", noteRoutes);
router.use("/labels", labelRoutes);

export = router;
