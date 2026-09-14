const copy = {
  zh: {
    eyebrow: "想约就约，怂的部分交给我",
    title: "你负责心动，我负责开口",
    bridge: "有点紧张，但还是想约你——没关系，我陪你",
    body: "写下你们的名字，生成一份专属邀请。TA 选日期、活动和想吃的，答案只给你看。",
    start: "别怂，开始吧",
    noAccount: "无需注册，微信身份自动保护结果",
    creatorTitle: "创建你的心动邀请",
    creatorSub: "生成后直接分享给 TA，收到回复后在这里查看。",
    yourName: "你的名字",
    yourPlaceholder: "比如：Herman",
    theirName: "TA 的名字",
    theirPlaceholder: "比如：小可爱",
    note: "想对 TA 说的话（选填）",
    notePlaceholder: "悄悄写一句只给 TA 看的话…",
    create: "生成专属邀请",
    creating: "正在生成…",
    ready: "邀请准备好啦！",
    readyBody: "点击下面的按钮，把小程序卡片发给 TA。发完后回来就能查看结果。",
    share: "分享给 TA",
    preview: "先自己预览",
    result: "查看我的结果",
    another: "再创建一份",
    myInvites: "我发出的邀请",
    waiting: "等待回应",
    answered: "已经回复",
    expired: "已过期",
    refresh: "下拉刷新状态",
    empty: "还没有邀请，勇敢一次试试看。",
    invalid: "请把你和 TA 的名字填写完整。",
    failed: "暂时没有创建成功，请稍后再试。"
  },
  en: {
    eyebrow: "Want the date? I’ll handle the nerves.",
    title: "You bring the butterflies. I’ll ask the question.",
    bridge: "A little nervous, but you still want to ask—don’t worry, I’ve got you.",
    body: "Add your names to create a private invitation. They choose the date, activities, and food—the answer is visible only to you.",
    start: "Be brave—let’s do it",
    noAccount: "No account needed. WeChat keeps your results private.",
    creatorTitle: "Create your date invitation",
    creatorSub: "Share it with someone special, then return here for their answer.",
    yourName: "Your name",
    yourPlaceholder: "e.g. Herman",
    theirName: "Their name",
    theirPlaceholder: "e.g. Cutie",
    note: "A note for them (optional)",
    notePlaceholder: "Write something only they will see…",
    create: "Create my invitation",
    creating: "Creating…",
    ready: "Your invitation is ready!",
    readyBody: "Send the Mini Program card to your date. Come back here to see their response.",
    share: "Share with them",
    preview: "Preview invitation",
    result: "View my results",
    another: "Create another",
    myInvites: "My invitations",
    waiting: "Waiting",
    answered: "Answered",
    expired: "Expired",
    refresh: "Pull down to refresh",
    empty: "No invitations yet. Try one brave little click.",
    invalid: "Please complete both names.",
    failed: "We couldn’t create it just now. Please try again."
  }
};

Page({
  data: {
    language: "zh",
    t: copy.zh,
    stage: "cover",
    creatorName: "",
    crushName: "",
    personalNote: "",
    creating: false,
    error: "",
    invitation: null,
    invitations: [],
    loadingList: false
  },

  onLoad() {
    const language = wx.getStorageSync("language") || "zh";
    this.setLanguage(language);
    this.loadInvitations();
  },

  onShow() {
    if (this.data.stage !== "cover") this.loadInvitations();
  },

  onPullDownRefresh() {
    this.loadInvitations().finally(() => wx.stopPullDownRefresh());
  },

  setLanguage(language) {
    getApp().globalData.language = language;
    wx.setStorageSync("language", language);
    this.setData({ language, t: copy[language] });
    wx.setNavigationBarTitle({ title: language === "zh" ? "心动邀请" : "A Little Question" });
  },

  toggleLanguage() {
    this.setLanguage(this.data.language === "zh" ? "en" : "zh");
  },

  begin() { this.setData({ stage: "create", error: "" }); },
  backToCover() { this.setData({ stage: "cover", error: "" }); },
  updateCreator(event) { this.setData({ creatorName: event.detail.value }); },
  updateCrush(event) { this.setData({ crushName: event.detail.value }); },
  updateNote(event) { this.setData({ personalNote: event.detail.value }); },

  async createInvitation() {
    const creatorName = this.data.creatorName.trim();
    const crushName = this.data.crushName.trim();
    if (!creatorName || !crushName) {
      this.setData({ error: this.data.t.invalid });
      return;
    }
    this.setData({ creating: true, error: "" });
    try {
      const result = await wx.cloud.callFunction({
        name: "createInvitation",
        data: {
          creatorName,
          crushName,
          personalNote: this.data.personalNote.trim(),
          language: this.data.language
        }
      });
      if (!result.result || !result.result.ok) throw new Error(result.result && result.result.error);
      this.setData({ invitation: result.result.invitation, stage: "ready" });
      await this.loadInvitations();
    } catch (error) {
      console.error("createInvitation", error);
      this.setData({ error: this.data.t.failed });
    } finally {
      this.setData({ creating: false });
    }
  },

  async loadInvitations() {
    this.setData({ loadingList: true });
    try {
      const result = await wx.cloud.callFunction({ name: "listInvitations" });
      if (result.result && result.result.ok) {
        const language = this.data.language;
        const invitations = result.result.invitations.map((item) => ({
          ...item,
          statusLabel: item.status === "answered" ? copy[language].answered : item.status === "expired" ? copy[language].expired : copy[language].waiting,
          createdLabel: this.formatDate(item.createdAt)
        }));
        this.setData({ invitations });
      }
    } catch (error) {
      console.warn("listInvitations", error);
    } finally {
      this.setData({ loadingList: false });
    }
  },

  formatDate(value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return `${date.getFullYear()}.${date.getMonth() + 1}.${date.getDate()}`;
  },

  openPreview() {
    wx.navigateTo({ url: `/pages/invite/index?code=${this.data.invitation.publicCode}&preview=1` });
  },

  openCurrentResult() {
    wx.navigateTo({ url: `/pages/result/index?id=${this.data.invitation.id}` });
  },

  openResult(event) {
    wx.navigateTo({ url: `/pages/result/index?id=${event.currentTarget.dataset.id}` });
  },

  resetForm() {
    wx.showModal({
      title: this.data.language === "zh" ? "再创建一份邀请？" : "Create another invitation?",
      content: this.data.language === "zh" ? "当前邀请仍会保留在结果列表中。" : "Your current invitation will stay in your results.",
      confirmText: this.data.language === "zh" ? "继续创建" : "Continue",
      cancelText: this.data.language === "zh" ? "先等等" : "Not now",
      success: ({ confirm }) => {
        if (confirm) this.setData({ stage: "create", creatorName: "", crushName: "", personalNote: "", invitation: null, error: "" });
      }
    });
  },

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
