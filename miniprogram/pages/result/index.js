const { extraTimes, activities, foods, labels } = require("../../utils/options");

const copy = {
  zh: {
    private: "你的私密结果页", waiting: "正在等待心动回应", replied: "回复啦！",
    waitingBody: "把邀请卡片发给 TA。对方提交后，完整答案会出现在这里。",
    safety: "只有创建邀请的微信账号可以查看此页。", share: "分享邀请给 TA", preview: "预览 TA 看到的页面",
    date: "日期", time: "具体时间", backup: "其他见面时间", activities: "约会活动", food: "想吃的东西",
    final: "想快点见到你！", saved: "答案已经安全保存。", home: "返回首页", refresh: "下拉刷新结果",
    loading: "正在查看结果…", denied: "没有找到结果，或这不是你创建的邀请。",
    manage: "管理这条邀请", deleteTitle: "永久删除这条邀请？",
    deleteBody: "删除后，邀请链接、双方名字和全部答案都会永久消失，无法恢复。",
    deleteSuccess: "邀请已删除", deleteFailed: "暂时无法删除，请稍后再试。"
  },
  en: {
    private: "Your private results", waiting: "Waiting for a lovely reply", replied: "replied!",
    waitingBody: "Send the invitation card to your date. Their complete answer will appear here.",
    safety: "Only the WeChat account that created this invitation can see this page.", share: "Share invitation", preview: "Preview their invitation",
    date: "Date", time: "Exact time", backup: "Backup moments", activities: "Activities", food: "Food shortlist",
    final: "I can’t wait to see you.", saved: "The answer is safely saved.", home: "Back home", refresh: "Pull down to refresh",
    loading: "Opening your result…", denied: "No result was found, or this invitation belongs to another account.",
    manage: "Manage invitation", deleteTitle: "Delete this invitation?",
    deleteBody: "The link, both names, and every answer will be permanently deleted. This cannot be undone.",
    deleteSuccess: "Invitation deleted", deleteFailed: "We couldn’t delete it just now. Please try again."
  }
};

Page({
  data: {
    id: "",
    loading: true,
    error: "",
    language: "zh",
    t: copy.zh,
    invitation: null,
    response: null,
    backupLabel: "—",
    activitiesLabel: "—",
    foodsLabel: "—"
  },

  onLoad(options) {
    const language = wx.getStorageSync("language") || "zh";
    this.setData({ id: options.id || "", language, t: copy[language] });
    this.loadResult();
  },

  onPullDownRefresh() {
    this.loadResult().finally(() => wx.stopPullDownRefresh());
  },

  async loadResult() {
    if (!this.data.id) {
      this.setData({ loading: false, error: this.data.t.denied });
      return;
    }
    this.setData({ loading: true, error: "" });
    try {
      const result = await wx.cloud.callFunction({ name: "getResult", data: { id: this.data.id } });
      if (!result.result || !result.result.ok) throw new Error(result.result && result.result.error);
      const invitation = result.result.invitation;
      const language = invitation.language === "en" ? "en" : "zh";
      const response = invitation.response || null;
      this.setData({
        invitation,
        response,
        language,
        t: copy[language],
        backupLabel: response ? labels(response.backupTimes, extraTimes, language) : "—",
        activitiesLabel: response ? labels(response.activities, activities, language) : "—",
        foodsLabel: response ? labels(response.foods, foods, language) : "—",
        loading: false
      });
      wx.setNavigationBarTitle({ title: language === "zh" ? "我的结果" : "My Result" });
    } catch (error) {
      console.error("getResult", error);
      this.setData({ loading: false, error: this.data.t.denied });
    }
  },

  preview() {
    wx.navigateTo({ url: `/pages/invite/index?code=${this.data.invitation.publicCode}&preview=1` });
  },

  deleteInvitation() {
    wx.showModal({
      title: this.data.t.deleteTitle,
      content: this.data.t.deleteBody,
      confirmText: this.data.language === "zh" ? "永久删除" : "Delete",
      confirmColor: "#b91c45",
      cancelText: this.data.language === "zh" ? "取消" : "Cancel",
      success: async ({ confirm }) => {
        if (!confirm) return;
        wx.showLoading({ title: this.data.language === "zh" ? "正在删除" : "Deleting", mask: true });
        try {
          const result = await wx.cloud.callFunction({ name: "deleteInvitation", data: { id: this.data.id } });
          if (!result.result || !result.result.ok) throw new Error(result.result && result.result.error);
          wx.showToast({ title: this.data.t.deleteSuccess, icon: "success" });
          setTimeout(() => this.home(), 700);
        } catch (error) {
          console.error("deleteInvitation", error);
          wx.showToast({ title: this.data.t.deleteFailed, icon: "none" });
        } finally {
          wx.hideLoading();
        }
      }
    });
  },

  home() { wx.reLaunch({ url: "/pages/index/index" }); },

  onShareAppMessage() {
    const invitation = this.data.invitation;
    if (!invitation) return { title: "有一个小问题想问你", path: "/pages/index/index" };
    return {
      title: this.data.language === "zh" ? `${invitation.crushName}，有一个小问题想问你 💌` : `${invitation.crushName}, a little question for you 💌`,
      path: `/pages/invite/index?code=${invitation.publicCode}`,
      imageUrl: "/images/share-card.png"
    };
  }
});
