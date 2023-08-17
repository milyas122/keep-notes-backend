import express from "express";
import * as labelApi from "@/api/label";
import passportAuth from "@/middleware/passport-config";

const router = express.Router();

router.post("/", passportAuth, labelApi.createLabel); // POST /api/labels

export = router;
