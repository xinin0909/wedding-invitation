# 💍 婚礼请柬 Web 项目

一个精美的婚礼请柬网页，支持翻页动画、背景音乐、花瓣飘落特效和嘉宾回复功能。

## 🎨 功能特性

| 功能 | 说明 |
|------|------|
| 📖 翻页式请柬 | 支持向上滑动/滚轮/键盘切换页面 |
| 🎵 背景音乐 | 可开关的背景音乐播放器 |
| 🌸 花瓣飘落 | 多种形状、颜色、大小的花瓣飘落动画 |
| 📸 相册轮播 | 5张照片滑动轮播，自动播放 |
| 🖼️ 图片懒加载 | IntersectionObserver 懒加载，预加载相邻照片 |
| 🚫 禁止缩放 | 禁用双指缩放、双击缩放、照片放大 |
| 📱 微信分享 | 自定义分享卡片标题/描述/缩略图 |
| ✨ 字体放大 | 全局字体 +15%，更适合阅读 |
| 💌 嘉宾回复 | RSVP 表单，收集出席信息 |
| 📍 地图导航 | 点击跳转到婚礼地点地图 |
| 📱 全端适配 | 完美适配手机和桌面端 |

## 📂 项目结构

```
wedding-invitation/
├── index.html              # 主页面
├── README.md               # 说明文档
└── assets/
    ├── css/
    │   ├── style.css        # 主样式文件
    │   └── petals.css       # 花瓣特效样式
    ├── js/
    │   ├── main.js          # 主逻辑（翻页/音乐/RSVP）
    │   ├── petals.js        # 花瓣飘落系统
    │   ├── gallery.js       # 相册轮播组件
    │   ├── lazy-loader.js   # 图片懒加载
    │   └── wechat-share.js  # 微信分享卡片+禁用缩放
    ├── images/
    │   ├── photo1.jpg        # 婚纱照1（请替换）
    │   ├── photo2.jpg        # 婚纱照2（请替换）
    │   ├── photo3.jpg        # 婚纱照3（请替换）
    │   ├── photo4.jpg        # 婚纱照4（请替换）
    │   └── photo5.jpg        # 婚纱照5（请替换）
    └── music/
        └── bgm.mp3          # 背景音乐（请替换为你的音乐）
```

## 🚀 快速开始

### 1. 下载项目
将整个 `wedding-invitation` 文件夹下载到本地。

### 2. 替换素材
将以下文件替换为你自己的内容：

- **`assets/images/photo1~5.jpg`** → 婚纱照（建议尺寸 1080×1440，至少放1张，最多5张）
- **`assets/music/bgm.mp3`** → 你的背景音乐

> 相册支持 1~5 张照片轮播，如果只有1张照片，只放 `photo1.jpg` 即可。
> 不存在的照片文件会自动显示占位图，不影响使用。

### 3. 编辑婚礼信息
打开 `index.html`，修改以下内容：

#### 新人名字（封面页）
```html
<span class="name-zh">嘉豪</span>  <!-- 改成新郎名字 -->
<span class="name-zh">婉清</span>  <!-- 改成新娘名字 -->
```

#### 新人信息（信息页）
```html
<p class="couple-name">嘉豪</p>
<p class="couple-parent">父亲 张明 · 母亲 李华</p>

<p class="couple-name">婉清</p>
<p class="couple-parent">父亲 王强 · 母亲 刘梅</p>
```

#### 婚礼日期地点
```html
<span class="detail-value">2026年10月6日 农历八月十五</span>
<span class="detail-value">上午 11:28</span>
<span class="detail-value">杭州西湖国宾馆 · 百合厅</span>
<span class="detail-value">杭州市西湖区杨公堤18号</span>
```

### 4. 本地预览
直接用浏览器打开 `index.html` 即可预览。

> ⚠️ 由于浏览器安全策略，背景音乐自动播放可能受限。首次点击页面后音乐才会播放。

## 📱 如何部署

### 方案一：静态托管（推荐）
将整个文件夹上传到任一静态托管服务：

- **GitHub Pages**（免费）
- **Vercel**（免费）
- **Netlify**（免费）
- 阿里云 OSS / 腾讯云 COS

### 方案二：内网穿透
如果你想在微信中分享预览：
1. 使用 ngrok 或 localtunnel 将本地服务暴露到公网
2. 生成临时 URL 分享给好友测试

### 微信分享配置
如需在微信中分享，请添加微信 JSSDK 配置（需在微信开放平台绑定域名）。

## 🎨 自定义配色

在 `assets/css/style.css` 中修改 CSS 变量：

```css
:root {
    --color-primary: #d4756b;      /* 主色：玫瑰粉 */
    --color-primary-light: #e8a098;
    --color-primary-dark: #b8594f;
    --color-gold: #c9a96e;          /* 强调色：金色 */
    --color-gold-light: #e0c896;
    /* ... 更多变量 */
}
```

## 🔧 花瓣特效配置

在 `assets/js/petals.js` 中修改配置：

```javascript
const CONFIG = {
    maxPetals: 35,         // 最大花瓣数量
    spawnInterval: 280,     // 生成间隔(ms)
    minSize: 12,            // 最小尺寸
    maxSize: 28,            // 最大尺寸
    minDuration: 8,         // 下落时间(s)
    // ...
};
```

## 📝 浏览器兼容性

| 浏览器 | 支持版本 |
|--------|----------|
| Chrome | 80+ |
| Firefox | 75+ |
| Safari | 13+ |
| Edge | 80+ |
| iOS Safari | 13+ |
| Android Chrome | 80+ |

> ⚠️ `backdrop-filter`（毛玻璃效果）在部分 Android 浏览器上可能不生效。

## 💡 提示

1. **照片建议**：使用竖版婚纱照（3:4 比例），文件大小控制在 1MB 以内
2. **音乐建议**：选择轻柔浪漫的纯音乐，文件大小控制在 5MB 以内
3. **花瓣密度**：可根据喜好调整 `maxPetals` 数值（15-50 为宜）
4. **微信授权**：如需收集微信用户信息，需要后端支持

---

祝你新婚快乐！🎉
