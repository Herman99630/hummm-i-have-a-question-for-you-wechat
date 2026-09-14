const cloud = require("wx-server-sdk");
const crypto = require("crypto");

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

function clean(value, max) {
  return typeof value === "string" ? value.replace(/[<>]/g, "").trim().slice(0, max) : "";
}

function makeCode() {
  return crypto.randomBytes(9).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

exports.main = async (event) => {
  const { OPENID } = cloud.getWXContext();
  const creatorName = clean(event.creatorName, 30);
  const crushName = clean(event.crushName, 30);
  const personalNote = clean(event.personalNote, 200);
  const language = event.language === "en" ? "en" : "zh";
  if (!OPENID || !creatorName || !crushName) return { ok: false, error: "invalid_input" };

  let publicCode = "";
  for (let attempt = 0; attempt < 4; attempt += 1) {
    const candidate = makeCode();
    const existing = await db.collection("invitations").where({ publicCode: candidate }).limit(1).get();
    if (!existing.data.length) { publicCode = candidate; break; }
  }
  if (!publicCode) return { ok: false, error: "code_generation_failed" };

  const createdAt = new Date();
  const expiresAt = new Date(createdAt.getTime() + 30 * 24 * 60 * 60 * 1000);
  const document = {
    publicCode,
    creatorOpenid: OPENID,
    creatorName,
    crushName,
    personalNote: personalNote || "",
    language,
    status: "pending",
    response: {},
    createdAt,
    answeredAt: null,
    expiresAt
  };
  const added = await db.collection("invitations").add({ data: document });
  return {
    ok: true,
    invitation: { id: added._id, publicCode, creatorName, crushName, language, createdAt: createdAt.toISOString() }
  };
};
