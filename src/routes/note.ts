import express from "express";
import * as noteApi from "@/api/note";
import passportAuth from "@/middleware/passport-config";

const router = express.Router();

router.post("/", passportAuth, noteApi.createNote); // POST /api/note
router.delete("/", passportAuth, noteApi.deleteNotes); // DELETE /api/note

export = router;
