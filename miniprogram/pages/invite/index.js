const { extraTimes, activities, foods, labels } = require("../../utils/options");

const copy = {
  zh: {
    tiny: "有一个小问题想问你", homeSub: "装作不在意，其实很期待", yes: "愿意 ❤", no: "不同意",
    noLines: ["咦，你找不到我", "点不到对吧？", "点错地方啦 😌", "想得美！"],
    hold: "等一下，等一下", shock: "你居然真的想和我约会？？你确定吗？真的确定吗？！",
    whisper: "我都做好准备你说点不要了！😭😭", yesYes: "愿意愿意！！！",
    step1: "01 · 挑一个属于我们的时间", dateTitle: "所以什么时候能见到你？", exact: "具体几点可以见到你？", ready: "我可能会提前很久就开始准备。",
    step2: "02 · 以防我们忍不住想早一点见面", otherTitle: "还有什么时间可以见到你？", multi: "可以多选哦。",
    step3: "03 · 约会的快乐环节", activityTitle: "我们一起去干什么？", activitySub: "喜欢的都可以选。",
    step4: "04 · 最重要的问题", foodTitle: "想吃什么呀？", foodSub: "没有错误答案，除了“我不饿”。",
    confirmTitle: "最后确认一下吧", confirmSub: "这是我们说好的约会计划。", date: "日期", time: "时间", backup: "其他见面时间", plans: "约会安排", food: "想吃的东西",
    next: "确认并继续", submit: "我选好啦 ❤", sending: "正在保存…", back: "返回", select: "至少选一个才可以继续哦。",
    preview: "预览模式 · 不会记录答案", finishPreview: "预览完成，返回我的结果页", done: "想快点见到你！", doneSub: "你的选择已经保存好，约会计划也悄悄送达啦。💌", close: "好呀 ❤",
    unavailable: "这个邀请不存在或已经失效。", answered: "这个邀请已经有人回答过啦。", failed: "暂时没有保存成功，请再试一次。", loading: "正在打开这份心动邀请…"
  },
  en: {
    tiny: "A tiny question for you", homeSub: "I promise it’ll be worth saying yes.", yes: "YES, of course ❤", no: "No",
    noLines: ["Ohh, you can't find me", "You can't click, right?", "Wrong place 😌", "Nice try!"],
    hold: "Hold on, hold on", shock: "You actually want to go on a date with me?? Are you sure? Really sure?!",
    whisper: "This is your final chance to make me ridiculously happy.", yesYes: "YES YES!!!",
    step1: "01 · Pick our moment", dateTitle: "When can I see you?", exact: "What exact time can I meet you?", ready: "I’ll start getting ready embarrassingly early.",
    step2: "02 · Just in case", otherTitle: "What other time can I meet you?", multi: "You can always select more than one option.",
    step3: "03 · The fun part", activityTitle: "What activities do you prefer?", activitySub: "Pick every idea that sounds like us.",
    step4: "04 · Most important question", foodTitle: "What should we eat tonight?", foodSub: "There are no wrong answers. Except maybe “I’m not hungry.”",
    confirmTitle: "One last look", confirmSub: "Here’s our little plan, officially on the record.", date: "Date", time: "Time", backup: "Backup moments", plans: "Our plans", food: "Food shortlist",
    next: "Confirm and continue", submit: "All picked! ❤", sending: "Saving our little plan…", back: "Back", select: "Pick at least one option to keep going.",
    preview: "Preview · Answers aren’t recorded", finishPreview: "Finish preview—back to results", done: "I can’t wait to see you.", doneSub: "Your choices are saved and your little date plan is on its way. 💌", close: "See you soon ❤",
    unavailable: "This invitation does not exist or has expired.", answered: "This invitation has already been answered.", failed: "It didn’t save. Please try again.", loading: "Opening this little invitation…"
  }
};

function isoDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

Page({
  data: {
    loading: true,
    fatal: "",
    language: "zh",
    t: copy.zh,
    invitation: null,
    code: "",
    previewMode: false,
    step: 0,
    noText: "不同意",
    noX: 0,
    noY: 0,
    date: "",
    minDate: "",
    maxDate: "",
    time: "19:00",
    extraTimes: [],
    activities: [],
    foods: [],
    selectedTimes: [],
    selectedActivities: [],
    selectedFoods: [],
    selectedDateLabel: "",
    selectedTimeLabel: "",
    backupLabel: "",
    activitiesLabel: "",
    foodsLabel: "",
    sending: false,
    error: "",
    showDone: false
  },

  onLoad(options) {
    const today = new Date();
    const max = new Date(today.getFullYear() + 3, today.getMonth(), today.getDate());
    const language = wx.getStorageSync("language") || "zh";
    this.setData({
      code: options.code || "",
      language,
      t: copy[language],
      date: isoDate(today),
      minDate: isoDate(today),
      maxDate: isoDate(max),
      time: "19:00",
      previewMode: options.preview === "1"
    });
    this.localizeOptions();
    this.refreshSummary();
    this.loadInvitation();
  },

  async loadInvitation() {
    if (!this.data.code) {
      this.setData({ loading: false, fatal: this.data.t.unavailable });
      return;
    }
    try {
      const result = await wx.cloud.callFunction({ name: "getInvitation", data: { code: this.data.code } });
      if (!result.result || !result.result.ok) {
        const message = result.result && result.result.reason === "answered" ? this.data.t.answered : this.data.t.unavailable;
        this.setData({ fatal: message, loading: false });
        return;
      }
      const invitation = result.result.invitation;
      const language = invitation.language === "en" ? "en" : "zh";
      this.setData({
        invitation,
        language,
        t: copy[language],
        previewMode: this.data.previewMode || invitation.isOwner,
        noText: copy[language].no,
        loading: false
      });
      wx.setStorageSync("language", language);
      this.localizeOptions();
      this.refreshSummary();
      wx.setNavigationBarTitle({ title: language === "zh" ? "有一个小问题" : "A Little Question" });
    } catch (error) {
      console.error("getInvitation", error);
      this.setData({ loading: false, fatal: this.data.t.unavailable });
    }
  },

  toggleLanguage() {
    const language = this.data.language === "zh" ? "en" : "zh";
    this.setData({ language, t: copy[language], noText: copy[language].no });
    wx.setStorageSync("language", language);
    this.localizeOptions();
    this.refreshSummary();
  },

  localizeOptions() {
    const language = this.data.language;
    const selectedTimes = this.data.selectedTimes;
    const selectedActivities = this.data.selectedActivities;
    const selectedFoods = this.data.selectedFoods;
    this.setData({
      extraTimes: extraTimes.map((item) => ({ ...item, label: item[language], selected: selectedTimes.includes(item.key) })),
      activities: activities.map((item) => ({ ...item, label: item[language], selected: selectedActivities.includes(item.key) })),
      foods: foods.map((item) => ({ ...item, label: item[language], selected: selectedFoods.includes(item.key) }))
    });
  },

  next() {
    if (this.data.step < 6) this.setData({ step: this.data.step + 1, error: "" });
  },

  back() {
    if (this.data.step > 0) this.setData({ step: this.data.step - 1, error: "" });
    else wx.navigateBack({ delta: 1 });
  },

  dodgeNo() {
    const lines = this.data.t.noLines;
    this.setData({
      noText: lines[Math.floor(Math.random() * lines.length)],
      noX: Math.round((Math.random() - 0.5) * 230),
      noY: Math.round((Math.random() - 0.5) * 120)
    });
  },

  changeDate(event) { this.setData({ date: event.detail.value }); this.refreshSummary(); },
  changeTime(event) { this.setData({ time: event.detail.value }); this.refreshSummary(); },

  toggleChoice(event) {
    const group = event.currentTarget.dataset.group;
    const key = event.currentTarget.dataset.key;
    const field = group === "times" ? "selectedTimes" : group === "activities" ? "selectedActivities" : "selectedFoods";
    const current = this.data[field];
    const next = current.includes(key) ? current.filter((value) => value !== key) : current.concat(key);
    this.setData({ [field]: next, error: "" });
    this.localizeOptions();
    this.refreshSummary();
  },

  continueChoices() {
    const step = this.data.step;
    const valid = step === 3 ? this.data.selectedTimes.length : step === 4 ? this.data.selectedActivities.length : this.data.selectedFoods.length;
    if (!valid) {
      this.setData({ error: this.data.t.select });
      return;
    }
    this.next();
  },

  refreshSummary() {
    const language = this.data.language;
    const date = new Date(`${this.data.date}T12:00:00`);
    const selectedDateLabel = Number.isNaN(date.getTime()) ? this.data.date : date.toLocaleDateString(language === "zh" ? "zh-CN" : "en-US", { year: "numeric", month: "long", day: "numeric", weekday: "long" });
    this.setData({
      selectedDateLabel,
      selectedTimeLabel: this.data.time,
      backupLabel: labels(this.data.selectedTimes, extraTimes, language),
      activitiesLabel: labels(this.data.selectedActivities, activities, language),
      foodsLabel: labels(this.data.selectedFoods, foods, language)
    });
  },

  async submit() {
    if (this.data.previewMode) {
      wx.redirectTo({ url: `/pages/result/index?id=${this.data.invitation.id}` });
      return;
    }
    if (this.data.sending) return;
    this.setData({ sending: true, error: "" });
    try {
      const result = await wx.cloud.callFunction({
        name: "submitResponse",
        data: {
          code: this.data.code,
          response: {
            date: this.data.date,
            dateLabel: this.data.selectedDateLabel,
            time: this.data.time,
            backupTimes: this.data.selectedTimes,
            activities: this.data.selectedActivities,
            foods: this.data.selectedFoods,
            language: this.data.language
          }
        }
      });
      if (!result.result || !result.result.ok) throw new Error(result.result && result.result.error);
      this.setData({ showDone: true });
    } catch (error) {
      console.error("submitResponse", error);
      this.setData({ error: this.data.t.failed });
    } finally {
      this.setData({ sending: false });
    }
  },

  closeDone() {
    wx.reLaunch({ url: "/pages/index/index" });
  }
});
