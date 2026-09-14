const cloud = require("wx-server-sdk");

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

exports.main = async (event) => {
  const { OPENID } = cloud.getWXContext();
  const id = typeof event.id === "string" ? event.id : "";
  if (!OPENID || !id) return { ok: false, error: "not_found" };
  try {
    const result = await db.collection("invitations").doc(id).get();
    const row = result.data;
    if (!row || row.creatorOpenid !== OPENID) return { ok: false, error: "forbidden" };
    return {
      ok: true,
      invitation: {
        id: row._id,
        publicCode: row.publicCode,
        creatorName: row.creatorName,
        crushName: row.crushName,
        personalNote: row.personalNote || "",
        language: row.language || "zh",
        status: row.status,
        response: row.response || null,
        createdAt: row.createdAt,
        answeredAt: row.answeredAt || null
      }
    };
  } catch (error) {
    return { ok: false, error: "not_found" };
  }
};
