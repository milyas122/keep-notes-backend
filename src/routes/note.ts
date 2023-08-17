import express from "express";
import * as noteApi from "@/api/note";
import passportAuth from "@/middleware/passport-config";

const router = express.Router();

router.post("/", passportAuth, noteApi.createNote); // POST /api/note
router.delete("/", passportAuth, noteApi.deleteNotes); // DELETE /api/note
router.post("/archive", passportAuth, noteApi.archiveNotes); // POST /api/note/archive
router.post("/unarchive", passportAuth, noteApi.unArchiveNotes); // POST /api/note/unarchive
router.post("/pin", passportAuth, noteApi.pinNotes); // POST /api/note/pin
router.post("/unpin", passportAuth, noteApi.unPinNotes); // POST /api/note/unpin

export = router;
