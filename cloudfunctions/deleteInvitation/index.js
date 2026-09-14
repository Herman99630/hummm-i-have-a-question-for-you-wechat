const cloud = require("wx-server-sdk");

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

exports.main = async (event) => {
  const { OPENID } = cloud.getWXContext();
  const id = typeof event.id === "string" ? event.id.trim().slice(0, 64) : "";
  if (!OPENID || !id) return { ok: false, error: "invalid_request" };

  try {
    const document = db.collection("invitations").doc(id);
    const result = await document.get();
    const invitation = result.data;
    if (!invitation) return { ok: false, error: "not_found" };
    if (invitation.creatorOpenid !== OPENID) return { ok: false, error: "forbidden" };

    await document.remove();
    return { ok: true };
  } catch (error) {
    console.error("deleteInvitation", error);
    return { ok: false, error: "not_found" };
  }
};
