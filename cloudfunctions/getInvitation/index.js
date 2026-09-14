const cloud = require("wx-server-sdk");

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

exports.main = async (event) => {
  const { OPENID } = cloud.getWXContext();
  const code = typeof event.code === "string" ? event.code.trim().slice(0, 32) : "";
  if (!code) return { ok: false, reason: "missing" };
  const result = await db.collection("invitations").where({ publicCode: code }).limit(1).get();
  if (!result.data.length) return { ok: false, reason: "missing" };
  const row = result.data[0];
  const expired = row.expiresAt && new Date(row.expiresAt).getTime() < Date.now();
  if (expired) return { ok: false, reason: "expired" };
  if (row.status !== "pending" && row.creatorOpenid !== OPENID) return { ok: false, reason: "answered" };
  return {
    ok: true,
    invitation: {
      id: row._id,
      publicCode: row.publicCode,
      creatorName: row.creatorName,
      crushName: row.crushName,
      personalNote: row.personalNote || "",
      language: row.language || "zh",
      isOwner: row.creatorOpenid === OPENID
    }
  };
};
