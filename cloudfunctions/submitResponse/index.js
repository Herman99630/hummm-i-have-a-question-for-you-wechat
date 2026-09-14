const cloud = require("wx-server-sdk");

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();
const _ = db.command;

const allowedTimes = ["tonight", "afternoon", "ten-minutes", "after-work", "rainy-evening", "miss-me", "weekend", "after-yes"];
const allowedActivities = ["dinner", "movie", "cozy-show", "walk", "drink", "museum", "karaoke", "sunset"];
const allowedFoods = ["stir-fry", "hotpot", "sushi", "italian", "tacos", "ramen", "steak", "pizza", "thai", "burgers", "cafe", "surprise"];

function validList(value, allowed) {
  return Array.isArray(value) && value.length > 0 && value.length <= allowed.length && value.every((item) => allowed.includes(item));
}

exports.main = async (event) => {
  const { OPENID } = cloud.getWXContext();
  const code = typeof event.code === "string" ? event.code.trim().slice(0, 32) : "";
  const response = event.response || {};
  if (!OPENID || !code || !/^\d{4}-\d{2}-\d{2}$/.test(response.date || "") || !/^([01]\d|2[0-3]):[0-5]\d$/.test(response.time || "")
    || !validList(response.backupTimes, allowedTimes) || !validList(response.activities, allowedActivities) || !validList(response.foods, allowedFoods)) {
    return { ok: false, error: "invalid_response" };
  }

  const found = await db.collection("invitations").where({ publicCode: code }).limit(1).get();
  if (!found.data.length) return { ok: false, error: "not_found" };
  const invitation = found.data[0];
  if (invitation.creatorOpenid === OPENID) return { ok: false, error: "owner_preview_cannot_submit" };
  if (invitation.expiresAt && new Date(invitation.expiresAt).getTime() < Date.now()) return { ok: false, error: "expired" };
  if (invitation.status !== "pending") return { ok: false, error: "already_answered" };

  const safeResponse = {
    date: response.date,
    dateLabel: typeof response.dateLabel === "string" ? response.dateLabel.slice(0, 80) : response.date,
    time: response.time,
    backupTimes: response.backupTimes,
    activities: response.activities,
    foods: response.foods,
    language: response.language === "en" ? "en" : "zh",
    responderOpenid: OPENID,
    submittedAt: new Date()
  };
  const updated = await db.collection("invitations").where({ _id: invitation._id, status: "pending" }).update({
    data: { status: "answered", response: _.set(safeResponse), answeredAt: new Date() }
  });
  if (!updated.stats || updated.stats.updated !== 1) return { ok: false, error: "already_answered" };
  return { ok: true };
};
