// server.cjs — Project X API (Gitpod-ready, CommonJS)
const express = require("express");
const cors = require("cors");
const { WebSocketServer } = require("ws");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

// Detect and print public URL from first request
let printedUrl = false;
function logFromRequest(req) {
  if (printedUrl) return;
  const host = req.headers.host; // e.g. 3000-yourworkspaceid.ws-us108.gitpod.io
  if (host) {
    const proto = req.headers["x-forwarded-proto"] || "https";
    const base = `${proto}://${host}`;
    console.log(`\n🌐 Public URL: ${base}`);
    console.log(`📄 OpenAPI: ${base}/openapi.json\n`);
    printedUrl = true;
  }
}

// Serve OpenAPI
app.get("/openapi.json", (req, res) => {
  logFromRequest(req);
  res.sendFile(path.join(__dirname, "openapi.json"));
});

// Simple home page
app.get("/", (req, res) => {
  logFromRequest(req);
  res.type("html").send(`<!doctype html><meta name=viewport content=\"width=device-width,initial-scale=1\"><h1>Project X API</h1><p>Public URL printed in console.</p><p><a href=\"/openapi.json\">OpenAPI</a></p>`);
});

// Shared-port WebSocket
const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`✅ Listening on :${port}`);
  console.log("👉 If URL isn't visible yet, open the Preview tab once.");
});
const wss = new WebSocketServer({ server });
wss.on("connection", () => console.log("🔌 UI connected to WebSocket"));

function broadcast(event, payload) {
  const msg = JSON.stringify({ event, payload });
  wss.clients.forEach((c) => c.readyState === 1 && c.send(msg));
}

// ---- Endpoints (match your OpenAPI) ----
app.post("/startCombat", (req, res) => {
  const { party, enemies, universe, musicTheme } = req.body || {};
  broadcast("combatStarted", { party, enemies, universe, musicTheme });
  res.json({ status: "ok" });
});

app.post("/endCombat", (req, res) => {
  broadcast("combatEnded", {});
  res.json({ status: "ok" });
});

app.post("/updateBossPhase", (req, res) => {
  const { phaseNumber, pseudoCutsceneText } = req.body || {};
  if (pseudoCutsceneText) broadcast("cutscene", { text: pseudoCutsceneText });
  broadcast("bossPhaseChanged", { phase: phaseNumber });
  res.json({ status: "ok" });
});

app.post("/triggerCutscene", (req, res) => {
  const { text, art } = req.body || {};
  broadcast("cutscene", { text, art });
  res.json({ status: "ok" });
});

app.post("/playBanterLine", (req, res) => {
  const { character, line } = req.body || {};
  broadcast("banterLine", { character, line });
  res.json({ status: "ok" });
});

app.post("/queueBanter", (req, res) => {
  const { lines } = req.body || {};
  broadcast("banterQueue", { lines });
  res.json({ status: "ok" });
});

app.post("/playVoiceLine", (req, res) => {
  const { character, line, voiceId } = req.body || {};
  broadcast("voiceLine", { character, line, voiceId });
  res.json({ status: "ok" });
});

app.post("/updateRelationship", (req, res) => {
  const { from, to, change } = req.body || {};
  broadcast("relationshipChanged", { from, to, change });
  res.json({ status: "ok" });
});

app.post("/setUniverseUI", (req, res) => {
  const { universe, styleTheme } = req.body || {};
  broadcast("universeUIChanged", { universe, styleTheme });
  res.json({ status: "ok" });
});

app.post("/setCharacterPortrait", (req, res) => {
  const { character, state, portraitUrl, expression } = req.body || {};
  broadcast("portraitChanged", { character, state, portraitUrl, expression });
  res.json({ status: "ok" });
});

app.post("/playBattleIntroAnimation", (req, res) => {
  const { animationType = "x-slash" } = req.body || {};
  broadcast("battleIntroAnimation", { animationType });
  res.json({ status: "ok" });
});

app.post("/playMusic", (req, res) => {
  const { src, fadeMs } = req.body || {};
  broadcast("musicPlay", { src, fadeMs });
  res.json({ status: "ok" });
});

app.post("/setMusicPhase", (req, res) => {
  const { phase, src } = req.body || {};
  broadcast("musicPhase", { phase, src });
  res.json({ status: "ok" });
});

app.post("/layerMusic", (req, res) => {
  const { action, layerId, src } = req.body || {};
  broadcast("musicLayer", { action, layerId, src });
  res.json({ status: "ok" });
});

app.post("/activateWorldMechanic", (req, res) => {
  const { universe, event, payload } = req.body || {};
  broadcast("worldMechanic", { universe, event, payload });
  res.json({ status: "ok" });
});

app.post("/storyTriggerCombat", (req, res) => {
  const { storyText, triggerPhrase = "Begin combat" } = req.body || {};
  if ((storyText || "").includes(triggerPhrase)) {
    broadcast("combatStartedFromStory", { storyText, triggerPhrase });
  }
  res.json({ status: "ok" });
});
