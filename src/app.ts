import express from "express";

const app = express();

app.get("/", (_, res) => res.json({ message: "Google Keep Notes API" }));

export default app;
