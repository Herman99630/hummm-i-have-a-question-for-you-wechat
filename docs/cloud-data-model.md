# 云数据库结构

集合：`invitations`

```js
{
  _id: "自动生成",
  publicCode: "分享路径使用的随机编码",
  creatorOpenid: "创建者 OpenID，仅云函数读取",
  creatorName: "创建者名称",
  crushName: "受邀者名称",
  personalNote: "可选留言",
  language: "zh | en",
  status: "pending | answered",
  response: {
    date: "YYYY-MM-DD",
    dateLabel: "本地化日期",
    time: "HH:mm",
    backupTimes: [],
    activities: [],
    foods: [],
    language: "zh | en",
    responderOpenid: "回答者 OpenID",
    submittedAt: "Date"
  },
  createdAt: "Date",
  answeredAt: "Date | null",
  expiresAt: "Date"
}
```

客户端不应直接读写此集合。集合权限设为“仅管理员可读写”，由云函数根据当前微信用户的 OpenID 执行权限判断。
