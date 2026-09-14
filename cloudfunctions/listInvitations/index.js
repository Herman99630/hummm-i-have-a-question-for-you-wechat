const cloud = require("wx-server-sdk");

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

exports.main = async () => {
  const { OPENID } = cloud.getWXContext();
  if (!OPENID) return { ok: false, error: "not_signed_in" };
  const result = await db.collection("invitations").where({ creatorOpenid: OPENID }).orderBy("createdAt", "desc").limit(50).get();
  return {
    ok: true,
    invitations: result.data.map((row) => {
      const expired = row.status === "pending" && row.expiresAt && new Date(row.expiresAt).getTime() < Date.now();
      return {
        id: row._id,
        publicCode: row.publicCode,
        crushName: row.crushName,
        status: expired ? "expired" : row.status,
        createdAt: row.createdAt
      };
    })
  };
};
