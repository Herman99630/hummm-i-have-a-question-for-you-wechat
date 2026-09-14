const extraTimes = [
  { key: "tonight", zh: "今晚，如果你有空", en: "Tonight, if you're free" },
  { key: "afternoon", zh: "今天下午", en: "This afternoon" },
  { key: "ten-minutes", zh: "十分钟后 👀", en: "10 minutes later 👀" },
  { key: "after-work", zh: "等你忙完", en: "After your last meeting" },
  { key: "rainy-evening", zh: "下一个下雨的晚上", en: "The next rainy evening" },
  { key: "miss-me", zh: "任何一个你想我的时候", en: "Whenever you miss me" },
  { key: "weekend", zh: "下一个我们都有空的周末", en: "Our next free weekend" },
  { key: "after-yes", zh: "就在你说愿意之后", en: "Right after you say yes" }
];

const activities = [
  { key: "dinner", emoji: "🍽️", zh: "吃一顿精致晚餐", en: "Fancy dinner" },
  { key: "movie", emoji: "🎬", zh: "一起看电影", en: "Movie night" },
  { key: "cozy-show", emoji: "📺", zh: "窝在一起追剧", en: "A cozy show night" },
  { key: "walk", emoji: "🌙", zh: "出去散散步", en: "Take a walk" },
  { key: "drink", emoji: "🍸", zh: "小酌一杯", en: "Grab a drink" },
  { key: "museum", emoji: "🎨", zh: "逛逛展览", en: "Museum date" },
  { key: "karaoke", emoji: "🎤", zh: "两个人去唱K", en: "Karaoke for two" },
  { key: "sunset", emoji: "🌅", zh: "一起看日落", en: "Watch the sunset" }
];

const foods = [
  { key: "stir-fry", emoji: "🥘", zh: "中式小炒", en: "Stir fry" },
  { key: "hotpot", emoji: "🍲", zh: "火锅", en: "Hotpot" },
  { key: "sushi", emoji: "🍣", zh: "寿司", en: "Sushi" },
  { key: "italian", emoji: "🍝", zh: "意大利菜", en: "Italian" },
  { key: "tacos", emoji: "🌮", zh: "墨西哥卷饼", en: "Tacos" },
  { key: "ramen", emoji: "🍜", zh: "拉面", en: "Ramen" },
  { key: "steak", emoji: "🥩", zh: "牛排", en: "Steak" },
  { key: "pizza", emoji: "🍕", zh: "披萨", en: "Pizza" },
  { key: "thai", emoji: "🍛", zh: "泰国菜", en: "Thai food" },
  { key: "burgers", emoji: "🍔", zh: "汉堡", en: "Burgers" },
  { key: "cafe", emoji: "🥐", zh: "去可爱的咖啡店", en: "Cute café" },
  { key: "surprise", emoji: "🎲", zh: "你来决定", en: "Surprise me" }
];

function labels(keys, options, language) {
  const map = {};
  options.forEach((item) => { map[item.key] = item[language] || item.zh; });
  return (keys || []).map((key) => map[key] || key).join(" · ") || "—";
}

module.exports = { extraTimes, activities, foods, labels };
