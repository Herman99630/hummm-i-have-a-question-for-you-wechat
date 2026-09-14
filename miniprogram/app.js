const nunitoFont = require("./fonts/nunito");

App({
  onLaunch() {
    wx.loadFontFace({
      global: true,
      family: "Heart Nunito",
      source: 'url("' + nunitoFont + '")'
    });

    if (!wx.cloud) {
      wx.showModal({
        title: "微信版本过低",
        content: "请升级微信后再使用这个小程序。",
        showCancel: false
      });
      return;
    }
    wx.cloud.init({ traceUser: true });
  },
  globalData: {
    language: "zh"
  }
});
