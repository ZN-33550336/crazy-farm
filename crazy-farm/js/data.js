/* ============================================================================
 * 瘋狂農場•果實計算器 — 資料與設定模組 (Calibrated Game Data & Config)
 * 相容 file:// 雙擊開啟與 GitHub Pages 部署
 * ============================================================================ */
(function (global) {
  "use strict";

  global.GAME_DATA = {"versions":{"crops_version":143,"mutations_version":37},"crops":[{"name":"灰壤豆","quality":"灰色","maxWeight":3.4,"growthSpeed":180,"specialMutation":null,"priceCoefficient":1375.9391,"sortOrder":0},{"name":"土豆","quality":"灰色","maxWeight":11.9,"growthSpeed":28.5,"specialMutation":"薯片","priceCoefficient":26.2837,"sortOrder":1},{"name":"香菇","quality":"灰色","maxWeight":3.4,"growthSpeed":133,"specialMutation":null,"priceCoefficient":688.7738,"sortOrder":2},{"name":"番茄","quality":"灰色","maxWeight":10.2,"growthSpeed":33.33,"specialMutation":null,"priceCoefficient":66.2818,"sortOrder":3},{"name":"波斯菊","quality":"灰色","maxWeight":34,"growthSpeed":17,"specialMutation":null,"priceCoefficient":43.5454,"sortOrder":4},{"name":"月光草","quality":"灰色","maxWeight":3.4,"growthSpeed":111,"specialMutation":null,"priceCoefficient":345.1004,"sortOrder":5},{"name":"月番茄","quality":"绿色","maxWeight":10.2,"growthSpeed":111,"specialMutation":null,"priceCoefficient":663.0498,"sortOrder":6},{"name":"大豆","quality":"绿色","maxWeight":3.4,"growthSpeed":275,"specialMutation":null,"priceCoefficient":2583.0373,"sortOrder":7},{"name":"月灯草","quality":"绿色","maxWeight":5.1,"growthSpeed":205,"specialMutation":null,"priceCoefficient":1496.9466,"sortOrder":8},{"name":"黄瓜","quality":"绿色","maxWeight":13.6,"growthSpeed":50,"specialMutation":"黄瓜蛇","priceCoefficient":215.3072,"sortOrder":9},{"name":"竹子","quality":"绿色","maxWeight":136,"growthSpeed":7.5,"specialMutation":null,"priceCoefficient":12.2478,"sortOrder":10},{"name":"西瓜","quality":"蓝色","maxWeight":170,"growthSpeed":6,"specialMutation":"方形","priceCoefficient":10.7111,"sortOrder":11},{"name":"梨","quality":"蓝色","maxWeight":13.6,"growthSpeed":75,"specialMutation":null,"priceCoefficient":483.8679,"sortOrder":12},{"name":"橘子","quality":"蓝色","maxWeight":13.6,"growthSpeed":75,"specialMutation":null,"priceCoefficient":538.0993,"sortOrder":13},{"name":"蓝莓","quality":"蓝色","maxWeight":40.8,"growthSpeed":27.99,"specialMutation":null,"priceCoefficient":113.8638,"sortOrder":14},{"name":"玉米","quality":"蓝色","maxWeight":40.8,"growthSpeed":27.78,"specialMutation":null,"priceCoefficient":103.5146,"sortOrder":15},{"name":"白菜","quality":"蓝色","maxWeight":10.2,"growthSpeed":80,"specialMutation":null,"priceCoefficient":579.6116,"sortOrder":16},{"name":"花生","quality":"蓝色","maxWeight":5.1,"growthSpeed":207.11,"specialMutation":null,"priceCoefficient":2813.584,"sortOrder":17},{"name":"牵牛花","quality":"蓝色","maxWeight":5.1,"growthSpeed":200,"specialMutation":null,"priceCoefficient":2113.5728,"sortOrder":18},{"name":"棉花","quality":"蓝色","maxWeight":5.1,"growthSpeed":200,"specialMutation":null,"priceCoefficient":2574.6375,"sortOrder":19},{"name":"银辉苔","quality":"蓝色","maxWeight":5.1,"growthSpeed":280,"specialMutation":null,"priceCoefficient":3040.3725,"sortOrder":20},{"name":"月环树","quality":"蓝色","maxWeight":20.4,"growthSpeed":58,"specialMutation":null,"priceCoefficient":322.1718,"sortOrder":21},{"name":"苹果","quality":"紫色","maxWeight":37.4,"growthSpeed":40.5,"specialMutation":"糖葫芦","priceCoefficient":188.799,"sortOrder":22},{"name":"石榴","quality":"紫色","maxWeight":20.4,"growthSpeed":83.5,"specialMutation":null,"priceCoefficient":526.8633,"sortOrder":23},{"name":"月莓","quality":"紫色","maxWeight":8.5,"growthSpeed":375,"specialMutation":null,"priceCoefficient":3925.2664,"sortOrder":24},{"name":"星叶菜","quality":"紫色","maxWeight":10.2,"growthSpeed":416,"specialMutation":null,"priceCoefficient":3971.3932,"sortOrder":25},{"name":"香蕉","quality":"紫色","maxWeight":10.2,"growthSpeed":280,"specialMutation":"香蕉猴","priceCoefficient":2486.5362,"sortOrder":26},{"name":"车厘子","quality":"紫色","maxWeight":10.2,"growthSpeed":166,"specialMutation":null,"priceCoefficient":1655.8519,"sortOrder":27},{"name":"柿子","quality":"紫色","maxWeight":37.4,"growthSpeed":45.51,"specialMutation":null,"priceCoefficient":235.9062,"sortOrder":28},{"name":"椰子","quality":"紫色","maxWeight":40.8,"growthSpeed":32.5,"specialMutation":null,"priceCoefficient":144.923,"sortOrder":29},{"name":"南瓜","quality":"紫色","maxWeight":204,"growthSpeed":6.5,"specialMutation":"万圣夜","priceCoefficient":12.9627,"sortOrder":30},{"name":"龙眼","quality":"紫色","maxWeight":8.5,"growthSpeed":438.78,"specialMutation":null,"priceCoefficient":4343.6874,"sortOrder":31},{"name":"草莓","quality":"金色","maxWeight":8.5,"growthSpeed":888,"specialMutation":"连体","priceCoefficient":8727.9755,"sortOrder":32},{"name":"荔枝","quality":"金色","maxWeight":23.8,"growthSpeed":135,"specialMutation":null,"priceCoefficient":790.0566,"sortOrder":33},{"name":"菠菜","quality":"金色","maxWeight":20.4,"growthSpeed":495.76,"specialMutation":null,"priceCoefficient":3861.3768,"sortOrder":34},{"name":"柚子","quality":"金色","maxWeight":61.2,"growthSpeed":67.34,"specialMutation":null,"priceCoefficient":225.3807,"sortOrder":35},{"name":"液光藤","quality":"金色","maxWeight":20.4,"growthSpeed":520,"specialMutation":null,"priceCoefficient":3516.6614,"sortOrder":36},{"name":"月核树","quality":"金色","maxWeight":17,"growthSpeed":460,"specialMutation":null,"priceCoefficient":3389.4578,"sortOrder":37},{"name":"猕猴桃","quality":"金色","maxWeight":13.6,"growthSpeed":278,"specialMutation":null,"priceCoefficient":2151.6753,"sortOrder":38},{"name":"榴莲","quality":"金色","maxWeight":61.2,"growthSpeed":55.55,"specialMutation":null,"priceCoefficient":202.8554,"sortOrder":39},{"name":"葡萄","quality":"至臻","maxWeight":10.2,"growthSpeed":2400,"specialMutation":null,"priceCoefficient":24839.9745,"sortOrder":40},{"name":"蟠桃","quality":"至臻","maxWeight":20.4,"growthSpeed":1333.33,"specialMutation":null,"priceCoefficient":8783.9561,"sortOrder":41},{"name":"星空玫瑰","quality":"至臻","maxWeight":10.2,"growthSpeed":2966.6,"specialMutation":null,"priceCoefficient":33129.1179,"sortOrder":42},{"name":"月影梅","quality":"至臻","maxWeight":3.4,"growthSpeed":4022.5,"specialMutation":null,"priceCoefficient":77401.7981,"sortOrder":43},{"name":"大王菊","quality":"至臻","maxWeight":10.2,"growthSpeed":2400,"specialMutation":null,"priceCoefficient":24848.7857,"sortOrder":44},{"name":"惊奇菇","quality":"至臻","maxWeight":10.2,"growthSpeed":2400,"specialMutation":null,"priceCoefficient":49708.0001,"sortOrder":45},{"name":"月兔","quality":"至臻","maxWeight":23.8,"growthSpeed":1523,"specialMutation":null,"priceCoefficient":11151.968,"sortOrder":46},{"name":"魔鬼朝天椒","quality":"至臻","maxWeight":10.2,"growthSpeed":2400,"specialMutation":null,"priceCoefficient":33110.323,"sortOrder":47},{"name":"月蟾蜍","quality":"至臻","maxWeight":34,"growthSpeed":990,"specialMutation":null,"priceCoefficient":9797.3968,"sortOrder":48},{"name":"芦荟","quality":"至臻","maxWeight":10.2,"growthSpeed":2169.8,"specialMutation":null,"priceCoefficient":54680.2945,"sortOrder":49},{"name":"向日葵","quality":"至臻","maxWeight":51,"growthSpeed":80,"specialMutation":"笑日葵","priceCoefficient":370.3857,"sortOrder":50},{"name":"仙人掌象","quality":"至臻","maxWeight":34,"growthSpeed":720,"specialMutation":null,"priceCoefficient":9524.9248,"sortOrder":51},{"name":"红包树","quality":"至臻","maxWeight":5.1,"growthSpeed":5125,"specialMutation":null,"priceCoefficient":83180.1399,"sortOrder":52},{"name":"火龙狗","quality":"至臻","maxWeight":34,"growthSpeed":1084.43,"specialMutation":null,"priceCoefficient":10889.6528,"sortOrder":53},{"name":"松果","quality":"至臻","maxWeight":17,"growthSpeed":570,"specialMutation":null,"priceCoefficient":4618.5543,"sortOrder":54},{"name":"幻月花","quality":"至臻","maxWeight":23.8,"growthSpeed":1142.5,"specialMutation":null,"priceCoefficient":8364.9561,"sortOrder":55},{"name":"彼岸花","quality":"至臻","maxWeight":10.2,"growthSpeed":2908.5,"specialMutation":null,"priceCoefficient":49674.0134,"sortOrder":56},{"name":"马蹄莲","quality":"至臻","maxWeight":17,"growthSpeed":575,"specialMutation":null,"priceCoefficient":5081.0896,"sortOrder":57},{"name":"铃兰幽幽","quality":"至臻","maxWeight":23.8,"growthSpeed":1400,"specialMutation":null,"priceCoefficient":12086.5815,"sortOrder":58},{"name":"听歌的柿黛拉","quality":"金色","maxWeight":42.5,"growthSpeed":88,"specialMutation":null,"priceCoefficient":775.952,"sortOrder":59},{"name":"跳舞的柿黛拉","quality":"至臻","maxWeight":45.2,"growthSpeed":800,"specialMutation":null,"priceCoefficient":8787.9847,"sortOrder":60},{"name":"秋水仙","quality":"至臻","maxWeight":34,"growthSpeed":705.882,"specialMutation":null,"priceCoefficient":10349.5256,"sortOrder":61},{"name":"银杏","quality":"至臻","maxWeight":5.1,"growthSpeed":4318.1438,"specialMutation":null,"priceCoefficient":93000,"sortOrder":62,"isNew":true,"newOrder":1},{"name":"沉静的疯象南瓜","quality":"至臻","maxWeight":45.2,"growthSpeed":800,"specialMutation":null,"priceCoefficient":8787.9847,"sortOrder":59.5,"isNew":true,"newOrder":2},{"name":"雪莲","quality":"至臻","maxWeight":10.2,"growthSpeed":2400,"specialMutation":null,"priceCoefficient":56993.9613,"sortOrder":64,"isNew":true,"newOrder":3},{"name":"藏红花","quality":"金色","maxWeight":20.4,"growthSpeed":571.77,"specialMutation":null,"priceCoefficient":4274,"sortOrder":65,"isNew":true,"newOrder":1},{"name":"灵芝","quality":"金色","maxWeight":61.2,"growthSpeed":0,"specialMutation":null,"priceCoefficient":303.7,"sortOrder":66,"isNew":true,"newOrder":2},{"name":"迷路的疯象南瓜","quality":"金色","maxWeight":42.5,"growthSpeed":0,"specialMutation":null,"priceCoefficient":940.31,"sortOrder":67,"isNew":true,"newOrder":3},{"name":"芒果","quality":"紫色","maxWeight":8.5,"growthSpeed":0,"specialMutation":null,"priceCoefficient":4946,"sortOrder":68,"isNew":true,"newOrder":1}],"mutations":[{"name":"霓虹","color":"彩色","groupKey":"rare","isActive":true,"sortOrder":0,"multiplier":18,"shareBitIndex":30},{"name":"薯片","color":"紫色","groupKey":"special","isActive":true,"sortOrder":0,"multiplier":1.5,"shareBitIndex":5},{"name":"星环","color":"紫色","groupKey":"past","isActive":true,"sortOrder":0,"multiplier":10,"shareBitIndex":15},{"name":"橙钻","color":"金色","groupKey":"common","isActive":true,"sortOrder":1,"multiplier":18,"shareBitIndex":43},{"name":"幻彩","color":"金色","groupKey":"color","isActive":true,"sortOrder":0,"multiplier":3,"shareBitIndex":42},{"name":"亮晶晶","color":"紫色","groupKey":"intermediate","isActive":true,"sortOrder":4,"multiplier":10,"shareBitIndex":14},{"name":"星空","color":"彩色","groupKey":"quality","isActive":true,"sortOrder":0,"multiplier":40,"shareBitIndex":3},{"name":"流火","color":"金色","groupKey":"rare","isActive":true,"sortOrder":2,"multiplier":15,"shareBitIndex":23},{"name":"方形","color":"紫色","groupKey":"special","isActive":true,"sortOrder":1,"multiplier":1.5,"shareBitIndex":6},{"name":"流光","color":"彩色","groupKey":"quality","isActive":true,"sortOrder":1,"multiplier":30,"shareBitIndex":4},{"name":"异彩","color":"蓝色","groupKey":"color","isActive":true,"sortOrder":1,"multiplier":1.5,"shareBitIndex":44},{"name":"瓷化","color":"紫色","groupKey":"common","isActive":true,"sortOrder":5,"multiplier":8,"shareBitIndex":13},{"name":"琥珀","color":"蓝色","groupKey":"intermediate","isActive":true,"sortOrder":12,"multiplier":4.5,"shareBitIndex":45},{"name":"水晶","color":"金色","groupKey":"quality","isActive":true,"sortOrder":2,"multiplier":20,"shareBitIndex":2},{"name":"故障","color":"蓝色","groupKey":"past","isActive":true,"sortOrder":2,"multiplier":5,"shareBitIndex":41},{"name":"糖葫芦","color":"紫色","groupKey":"special","isActive":true,"sortOrder":2,"multiplier":1.5,"shareBitIndex":7},{"name":"彩尘","color":"蓝色","groupKey":"past","isActive":true,"sortOrder":2,"multiplier":5,"shareBitIndex":46},{"name":"太阳耀斑","color":"蓝色","groupKey":"intermediate","isActive":true,"sortOrder":8,"multiplier":5,"shareBitIndex":34},{"name":"日蚀","color":"紫色","groupKey":"rare","isActive":true,"sortOrder":3,"multiplier":10,"shareBitIndex":24},{"name":"连体","color":"紫色","groupKey":"special","isActive":true,"sortOrder":3,"multiplier":1.5,"shareBitIndex":8},{"name":"金","color":"蓝色","groupKey":"quality","isActive":true,"sortOrder":3,"multiplier":10,"shareBitIndex":1},{"name":"哈基咪","color":"蓝色","groupKey":"past","isActive":true,"sortOrder":3,"multiplier":5,"shareBitIndex":40},{"name":"冰冻","color":"绿色","groupKey":"common","isActive":true,"sortOrder":14,"multiplier":4,"shareBitIndex":17},{"name":"暗雾","color":"蓝色","groupKey":"rare","isActive":true,"sortOrder":6,"multiplier":6,"shareBitIndex":25},{"name":"陶化","color":"绿色","groupKey":"intermediate","isActive":true,"sortOrder":13,"multiplier":4,"shareBitIndex":38},{"name":"惊魂夜","color":"蓝色","groupKey":"past","isActive":true,"sortOrder":4,"multiplier":5,"shareBitIndex":33},{"name":"落雷","color":"绿色","groupKey":"common","isActive":true,"sortOrder":15,"multiplier":3,"shareBitIndex":16},{"name":"银","color":"绿色","groupKey":"quality","isActive":true,"sortOrder":4,"multiplier":3,"shareBitIndex":0},{"name":"彩虹","color":"蓝色","groupKey":"rare","isActive":true,"sortOrder":11,"multiplier":5,"shareBitIndex":28},{"name":"结霜","color":"灰色","groupKey":"intermediate","isActive":true,"sortOrder":20,"multiplier":2,"shareBitIndex":37},{"name":"黄瓜蛇","color":"金色","groupKey":"special","isActive":true,"sortOrder":4,"multiplier":2,"shareBitIndex":9},{"name":"沙尘","color":"灰色","groupKey":"intermediate","isActive":true,"sortOrder":18,"multiplier":2,"shareBitIndex":35},{"name":"极光","color":"蓝色","groupKey":"rare","isActive":true,"sortOrder":9,"multiplier":5,"shareBitIndex":32},{"name":"金币","color":"蓝色","groupKey":"past","isActive":true,"sortOrder":5,"multiplier":5,"shareBitIndex":39},{"name":"万圣夜","color":"金色","groupKey":"special","isActive":true,"sortOrder":5,"multiplier":2,"shareBitIndex":10},{"name":"潮湿","color":"灰色","groupKey":"common","isActive":true,"sortOrder":23,"multiplier":1,"shareBitIndex":20},{"name":"血月","color":"蓝色","groupKey":"past","isActive":true,"sortOrder":6,"multiplier":5,"shareBitIndex":27},{"name":"香蕉猴","color":"金色","groupKey":"special","isActive":true,"sortOrder":6,"multiplier":2,"shareBitIndex":11},{"name":"覆雪","color":"灰色","groupKey":"common","isActive":true,"sortOrder":22,"multiplier":2,"shareBitIndex":19},{"name":"生机","color":"灰色","groupKey":"intermediate","isActive":true,"sortOrder":17,"multiplier":2,"shareBitIndex":22},{"name":"荧光","color":"蓝色","groupKey":"rare","isActive":true,"sortOrder":10,"multiplier":5,"shareBitIndex":29},{"name":"迷雾","color":"灰色","groupKey":"common","isActive":true,"sortOrder":21,"multiplier":2,"shareBitIndex":21},{"name":"笑日葵","color":"彩色","groupKey":"special","isActive":true,"sortOrder":7,"multiplier":10,"shareBitIndex":12},{"name":"幽魂","color":"蓝色","groupKey":"past","isActive":true,"sortOrder":7,"multiplier":5,"shareBitIndex":31},{"name":"灼热","color":"灰色","groupKey":"intermediate","isActive":true,"sortOrder":19,"multiplier":2,"shareBitIndex":36},{"name":"颤栗","color":"灰色","groupKey":"common","isActive":true,"sortOrder":24,"multiplier":1,"shareBitIndex":18},{"name":"陨石","color":"绿色","groupKey":"past","isActive":true,"sortOrder":10,"multiplier":3,"shareBitIndex":26},{"name":"花雨","color":"紫色","groupKey":"rare","isActive":true,"sortOrder":6,"multiplier":7,"shareBitIndex":47,"isNew":true},{"name":"幽幽南瓜","color":"蓝色","groupKey":"past","isActive":true,"sortOrder":1,"multiplier":5,"shareBitIndex":48},{"name":"火烧云","color":"蓝色","groupKey":"past","isActive":true,"sortOrder":1,"multiplier":5,"shareBitIndex":49,"isNew":true}]};

  const displayNames = {
        至臻: "至臻", 彩色: "至臻",
        秋水仙: "秋水仙", 雪莲: "雪蓮", 沉静的疯象南瓜: "沉靜的瘋象南瓜", 银杏: "銀杏", 芒果: "芒果", 迷路的疯象南瓜: "迷路的瘋象南瓜", 灵芝: "靈芝", 藏红花: "藏紅花", 花雨: "花雨", 花语: "花雨", 幽幽南瓜: "幽幽南瓜", 火烧云: "火燒雲", 土豆: "馬鈴薯", 月灯草: "月燈草", 黄瓜: "黃瓜", 蓝莓: "藍莓",
        牵牛花: "牽牛花", 银辉苔: "銀輝苔", 月环树: "月環樹", 苹果: "蘋果", 星叶菜: "星葉菜",
        车厘子: "櫻桃", 龍櫻: "櫻桃", 龙眼: "龍眼", 猕猴桃: "奇異果", 獼猴桃: "奇異果", 榴莲: "榴槤", 惊奇菇: "驚奇菇",
        芦荟: "蘆薈", 红包树: "紅包樹", 火龙狗: "火龍狗", 马蹄莲: "馬蹄蓮", 铃兰幽幽: "鈴蘭幽幽",
        听歌的柿黛拉: "聽歌的柿黛拉", 跳舞的柿黛拉: "跳舞的柿黛拉", 绿色: "綠色", 蓝色: "藍色",
        星环: "星環", 橙钻: "橙鑽", 异彩: "異彩", 糖葫芦: "糖葫蘆", 彩尘: "彩塵",
        太阳耀斑: "太陽耀斑", 日蚀: "日蝕", 连体: "連體", 冰冻: "冰凍", 暗雾: "暗霧",
        惊魂夜: "驚魂夜", 银: "銀", 结霜: "結霜", 黄瓜蛇: "黃瓜蛇", 沙尘: "沙塵",
        极光: "極光", 金币: "金幣", 万圣夜: "萬聖夜", 潮湿: "潮濕", 生机: "生機",
        荧光: "螢光", 迷雾: "迷霧", 灼热: "灼熱", 颤栗: "顫慄", 陨石: "隕石", 薯片: "洋芋片",
      };

  const characterMap = {
        莲: "蓮", 沉: "沉", 静: "靜", 疯: "瘋", 象: "象", 芝: "芝", 藏: "藏", 灯: "燈", 黄: "黃", 蓝: "藍", 牵: "牽", 银: "銀", 环: "環", 树: "樹",
        苹: "蘋", 叶: "葉", 车: "車", 龙: "龍", 猕: "獼", 惊: "驚", 芦: "蘆",
        红: "紅", 马: "馬", 铃: "鈴", 兰: "蘭", 听: "聽", 绿: "綠", 钻: "鑽",
        异: "異", 尘: "塵", 阳: "陽", 蚀: "蝕", 连: "連", 冻: "凍", 雾: "霧",
        圣: "聖", 湿: "濕", 机: "機", 荧: "螢", 热: "熱", 颤: "顫", 栗: "慄", 陨: "隕", 烧: "燒", 云: "雲",
      };

  const CROP_IMAGE_MAP = {
  "灰壤豆": "新灰壤豆.png",
  "土豆": "土豆.png",
  "香菇": "香菇.png",
  "番茄": "番茄.png",
  "波斯菊": "波斯菊.png",
  "月光草": "新月光草.png",
  "月番茄": "新月番茄.png",
  "大豆": "大豆.png",
  "月灯草": "新月灯草.png",
  "黄瓜": "黄瓜.png",
  "竹子": "竹子.png",
  "西瓜": "西瓜.png",
  "梨": "梨.png",
  "橘子": "橘子.png",
  "蓝莓": "蓝莓.png",
  "玉米": "玉米.png",
  "白菜": "白菜.png",
  "花生": "花生.png",
  "牵牛花": "牵牛花.png",
  "棉花": "棉花.png",
  "银辉苔": "新银辉苔.png",
  "月环树": "新月环果.png",
  "苹果": "苹果.png",
  "石榴": "石榴.png",
  "月莓": "新月莓.png",
  "星叶菜": "新星叶菜.png",
  "香蕉": "香蕉.png",
  "车厘子": "车厘子.png",
  "柿子": "柿子.png",
  "椰子": "椰子.png",
  "南瓜": "南瓜.png",
  "龙眼": "龙眼.png",
  "草莓": "草莓.png",
  "荔枝": "荔枝.png",
  "菠菜": "菠菜.png",
  "柚子": "柚子.png",
  "液光藤": "新液光藤.png",
  "月核树": "新月核果.png",
  "猕猴桃": "猕猴桃.png",
  "榴莲": "榴莲.png",
  "葡萄": "葡萄.png",
  "蟠桃": "蟠桃.png",
  "星空玫瑰": "新星空玫瑰.png",
  "月影梅": "新月影梅.png",
  "大王菊": "大王菊.png",
  "惊奇菇": "惊奇菇.png",
  "月兔": "新月兔.png",
  "魔鬼朝天椒": "魔鬼朝天椒.png",
  "月蟾蜍": "新月蟾蜍.png",
  "芦荟": "芦荟.png",
  "向日葵": "向日葵.png",
  "仙人掌象": "仙人掌象.png",
  "红包树": "新红包果.png",
  "火龙狗": "火龙狗.png",
  "松果": "松果.png",
  "幻月花": "新幻月花.png",
  "彼岸花": "新彼岸花.png",
  "马蹄莲": "新马蹄莲.png",
  "铃兰幽幽": "铃兰悠悠.png",
  "听歌的柿黛拉": "新听歌的柿黛拉.png",
  "跳舞的柿黛拉": "跳舞的柿黛拉.png",
  "秋水仙": "秋水仙.png",
  "银杏": "银杏.png",
  "沉静的疯象南瓜": "沉静的疯象南瓜.png",
  "雪莲": "雪莲.png",
  "藏红花": "藏红花.png",
  "灵芝": "灵芝.png",
  "迷路的疯象南瓜": "迷路的疯象南瓜.png",
  "芒果": "芒果.png"
};

  const QUALITY_MOODS = {
    "至臻": {
      dark:  { primary: "#34e2d8", secondary: "#f4c553", rim: "#b76cff", glow: 1.0, iridescent: 0.72 },
      light: { primary: "#0d9488", secondary: "#d97706", rim: "#7c3aed", glow: 0.65, iridescent: 0.55 }
    },
    "金色": {
      dark:  { primary: "#f5c443", secondary: "#ff9b38", rim: "#ffe58f", glow: 0.92, iridescent: 0.20 },
      light: { primary: "#d97706", secondary: "#f59e0b", rim: "#b45309", glow: 0.60, iridescent: 0.15 }
    },
    "紫色": {
      dark:  { primary: "#b76cff", secondary: "#f472b6", rim: "#60a5fa", glow: 0.88, iridescent: 0.35 },
      light: { primary: "#7c3aed", secondary: "#db2777", rim: "#4f46e5", glow: 0.55, iridescent: 0.25 }
    },
    "藍色": {
      dark:  { primary: "#38bdf8", secondary: "#24d0c6", rim: "#818cf8", glow: 0.82, iridescent: 0.15 },
      light: { primary: "#0284c7", secondary: "#0d9488", rim: "#4f46e5", glow: 0.50, iridescent: 0.10 }
    },
    "蓝色": {
      dark:  { primary: "#38bdf8", secondary: "#24d0c6", rim: "#818cf8", glow: 0.82, iridescent: 0.15 },
      light: { primary: "#0284c7", secondary: "#0d9488", rim: "#4f46e5", glow: 0.50, iridescent: 0.10 }
    },
    "綠色": {
      dark:  { primary: "#38e888", secondary: "#2dd4bf", rim: "#a3e635", glow: 0.78, iridescent: 0.12 },
      light: { primary: "#059669", secondary: "#0d9488", rim: "#16a34a", glow: 0.48, iridescent: 0.08 }
    },
    "绿色": {
      dark:  { primary: "#38e888", secondary: "#2dd4bf", rim: "#a3e635", glow: 0.78, iridescent: 0.12 },
      light: { primary: "#059669", secondary: "#0d9488", rim: "#16a34a", glow: 0.48, iridescent: 0.08 }
    },
    "灰色": {
      dark:  { primary: "#94a3b8", secondary: "#64748b", rim: "#cbd5e1", glow: 0.65, iridescent: 0.05 },
      light: { primary: "#475569", secondary: "#64748b", rim: "#94a3b8", glow: 0.42, iridescent: 0.05 }
    },
    "星空": {
      dark:  { primary: "#6366f1", secondary: "#22d3ee", rim: "#f472b6", glow: 1.15, iridescent: 1.0 },
      light: { primary: "#4338ca", secondary: "#0891b2", rim: "#be185d", glow: 0.75, iridescent: 0.85 }
    },
    "流光": {
      dark:  { primary: "#f472b6", secondary: "#22d3ee", rim: "#facc15", glow: 1.12, iridescent: 0.95 },
      light: { primary: "#db2777", secondary: "#0891b2", rim: "#ca8a04", glow: 0.72, iridescent: 0.80 }
    },
    "水晶": {
      dark:  { primary: "#fb923c", secondary: "#f43f5e", rim: "#fde047", glow: 1.02, iridescent: 0.45 },
      light: { primary: "#ea580c", secondary: "#e11d48", rim: "#d97706", glow: 0.65, iridescent: 0.35 }
    },
    "金": {
      dark:  { primary: "#38bdf8", secondary: "#f5c443", rim: "#93c5fd", glow: 0.95, iridescent: 0.20 },
      light: { primary: "#0369a1", secondary: "#d97706", rim: "#2563eb", glow: 0.60, iridescent: 0.15 }
    },
    "银": {
      dark:  { primary: "#4ade80", secondary: "#94a3b8", rim: "#bbf7d0", glow: 0.82, iridescent: 0.12 },
      light: { primary: "#15803d", secondary: "#64748b", rim: "#059669", glow: 0.52, iridescent: 0.08 }
    }
  };

  global.FARM_CONFIG = {
    TOOL_STATE: { liuxingzhang: true, huanxingji: true },
    STORAGE_KEYS: {
      SOUND: "farm_sound_pref",
      COMPARE: "farm_compare_pref",
      SORT_MODE: "farm_sort_mode_pref",
      SORT_DIR: "farm_sort_dir_pref",
      DECIMALS: "farm_decimals_pref",
      AUTOCLEAR_2: "farm_autoclear_2_pref",
      AUTOCLEAR_MORE: "farm_autoclear_more_pref",
      PRICE_DECIMALS: "farm_price_decimals_pref",
      COMPARE_PRICE_DECIMALS: "farm_compare_price_decimals_pref",
      THEME: "farm_theme_pref",
      GYRO: "farm_gyro_pref",
      HIDE_TIP: "farm_hide_tip_pref",
      HIDE_CALC_TIP: "farm_hide_calc_tip_pref",
      CUSTOM_MUTATIONS: "farm_custom_mutations_v350",
      GRAPHICS: "farm_graphics_pref",
      LEGACY_UI: "farm_legacy_ui_pref"
    },
    RECIPES: [
      { ingredients: ["生机", "潮湿"], result: "琥珀" },
      { ingredients: ["亮晶晶", "琥珀"], result: "橙钻" },
      { ingredients: ["沙尘", "潮湿"], result: "陶化" },
      { ingredients: ["陶化", "灼热"], result: "瓷化" },
      { ingredients: ["潮湿", "结霜"], result: "冰冻" },
      { ingredients: ["太阳耀斑", "灼热"], result: "流火" }
    ],
    qualityOrder: ["星空", "流光", "水晶", "金", "银"],
    cropQualityRank: { 彩色: 6, 至臻: 6, 金色: 5, 紫色: 4, 藍色: 3, 綠色: 2, 灰色: 1, 蓝色: 3, 绿色: 2 },
    NO_COLOR_MUTATION_CROPS: new Set([
      "火龙狗", "火龍狗", "火龙果", "火龍果",
      "跳舞的柿黛拉",
      "听歌的柿黛拉", "聽歌的柿黛拉",
      "沉静的疯象南瓜", "沉靜的瘋象南瓜",
      "迷路的疯象南瓜", "迷路的瘋象南瓜",
      "铃兰幽幽", "鈴蘭幽幽",
      "红包树", "紅包樹",
      "月蟾蜍",
      "月兔",
      "仙人掌象",
      "惊奇菇", "驚奇菇",
      "魔鬼朝天椒"
    ]),
    FLOW_WEATHER_MUTATIONS: [
      "流火", "霓虹", "橙钻", "花雨", "日蚀", "冰冻", "暗雾", "陶化", "落雷", "彩虹", "极光", "覆雪", "荧光", "迷雾", "颤栗", "潮湿"
    ],
    PORCELAIN_WEATHER_MUTATIONS: [
      "瓷化", "霓虹", "橙钻", "太阳耀斑", "花雨", "日蚀", "冰冻", "暗雾", "落雷", "彩虹", "极光", "覆雪", "荧光", "迷雾", "颤栗", "潮湿"
    ],
    displayNames,
    characterMap,
    CROP_IMAGE_MAP,
    QUALITY_MOODS
  };
})(window);
