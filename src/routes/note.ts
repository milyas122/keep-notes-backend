import express from "express";
import * as noteApi from "@/api/note";
import passportAuth from "@/middleware/passport-config";

const router = express.Router();

router.post("/", passportAuth, noteApi.createNote); // POST /api/note
router.get("/", passportAuth, noteApi.getNotes); // GET /api/note
router.delete("/", passportAuth, noteApi.deleteNotes); // DELETE /api/note
router.put("/archive", passportAuth, noteApi.archiveNotes); // PUT /api/note/archive
router.put("/unarchive", passportAuth, noteApi.unArchiveNotes); // PUT /api/note/unarchive
router.put("/pin", passportAuth, noteApi.pinNotes); // PUT /api/note/pin
router.put("/unpin", passportAuth, noteApi.unPinNotes); // PUT /api/note/unpin
router.put("/change-label", passportAuth, noteApi.changeNotesLabel); // PUT /api/note/change-label

export = router;
