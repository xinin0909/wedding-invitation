/**
 * 弹幕祝福语系统
 * Danmaku Blessing System
 * 
 * 半透明气泡从屏幕两侧飘过，显示虚拟用户头像 + 名称 + 祝福语
 */
(function () {
    'use strict';

    // ==================== 虚拟用户列表 ====================
    const USERS = [
        { name: '张伟',   color: '#e8a098' },
        { name: '李娜',   color: '#c9a96e' },
        { name: '王芳',   color: '#d4756b' },
        { name: '刘洋',   color: '#8fb3c7' },
        { name: '陈静',   color: '#e0c896' },
        { name: '杨帆',   color: '#b8c9a8' },
        { name: '赵磊',   color: '#c7a8d4' },
        { name: '黄敏',   color: '#e8b8a0' },
        { name: '周杰',   color: '#a8c7d4' },
        { name: '吴婷',   color: '#d4a8b8' },
        { name: '徐明',   color: '#a8d4b8' },
        { name: '孙丽',   color: '#d4b8a8' },
        { name: '马超',   color: '#b8a8d4' },
        { name: '朱琳',   color: '#a8b8d4' },
        { name: '胡刚',   color: '#d4c8a8' },
        { name: '郭雪',   color: '#a8d4c8' },
        { name: '何鑫',   color: '#c8a8d4' },
        { name: '高媛',   color: '#d4a8c8' },
        { name: '林峰',   color: '#a8c8d4' },
        { name: '罗丹',   color: '#c8d4a8' },
        { name: '梁宇',   color: '#e0b896' },
        { name: '宋佳',   color: '#b8e0c8' },
        { name: '郑凯',   color: '#c8b8e0' },
        { name: '谢颖',   color: '#e0c8b8' },
        { name: '韩雪',   color: '#b8c8e0' },
        { name: '唐磊',   color: '#d4a8a8' },
        { name: '冯洁',   color: '#a8d4d4' },
        { name: '于洋',   color: '#d4d4a8' },
        { name: '董雯',   color: '#a8a8d4' },
        { name: '萧然',   color: '#d4a8b8' },
    ];

    // ==================== 祝福语列表 ====================
    const BLESSINGS = [
        '百年好合 · 永结同心',
        '新婚快乐 · 幸福美满',
        '佳偶天成 · 琴瑟和鸣',
        '愿你们白头偕老',
        '执子之手 · 与子偕老',
        '良缘永结 · 同心同德',
        '花好月圆 · 喜结良缘',
        '永浴爱河 · 恩爱绵长',
        '心心相印 · 相敬如宾',
        '天作之合 · 比翼双飞',
        '鸾凤和鸣 · 枝繁叶茂',
        '情比金坚 · 爱如朝阳',
        '举案齐眉 · 相濡以沫',
        '幸福像花儿一样绽放',
        '愿爱情如初见般美好',
        '祝福你们 · 幸福一生',
        '一路有你 · 芬芳满径',
        '爱的故事 · 从此开始',
        '往后余生 · 都是你们',
        '岁月静好 · 现世安稳',
    ];

    // ==================== 配置 ====================
    const CONFIG = {
        interval: 2800,
        minDuration: 8,
        maxDuration: 12,
        minTop: 12,
        maxTop: 82,
        fontSizeVariation: true,
        maxBubbles: 6,
    };

    // ==================== 工具函数 ====================
    function pickRandom(arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    }

    // 生成 SVG 首字母头像（Data URI，无需外部图片）
    function generateAvatar(name, color) {
        const initial = name.charAt(0);
        const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">
            <defs>
                <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style="stop-color:${color};stop-opacity:0.9"/>
                    <stop offset="100%" style="stop-color:${color};stop-opacity:0.6"/>
                </linearGradient>
            </defs>
            <circle cx="32" cy="32" r="30" fill="url(#g)"/>
            <text x="32" y="42" text-anchor="middle" font-size="28" font-family="'Noto Serif SC',serif" fill="#ffffff" font-weight="600">${initial}</text>
        </svg>`;
        return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
    }

    // ==================== 弹幕系统 ====================
    class DanmakuSystem {
        constructor(container) {
            this.container = container;
            this.timer = null;
            this.activeBubbles = new Set();
            this.running = false;
            // 预生成头像缓存
            this.avatarCache = {};
            USERS.forEach((u) => {
                this.avatarCache[u.name] = generateAvatar(u.name, u.color);
            });
        }

        start() {
            if (this.running) return;
            this.running = true;
            this.spawn();
            this.timer = setInterval(() => {
                this.spawn();
            }, CONFIG.interval);
        }

        stop() {
            this.running = false;
            if (this.timer) {
                clearInterval(this.timer);
                this.timer = null;
            }
            this.activeBubbles.forEach((bubble) => {
                if (bubble.parentNode) {
                    bubble.parentNode.removeChild(bubble);
                }
            });
            this.activeBubbles.clear();
        }

        spawn() {
            if (this.activeBubbles.size >= CONFIG.maxBubbles) return;

            const user = pickRandom(USERS);
            const text = pickRandom(BLESSINGS);
            const fromRight = Math.random() > 0.5;
            const top = CONFIG.minTop + Math.random() * (CONFIG.maxTop - CONFIG.minTop);
            const duration = CONFIG.minDuration + Math.random() * (CONFIG.maxDuration - CONFIG.minDuration);
            const fontSizeScale = CONFIG.fontSizeVariation ? (0.85 + Math.random() * 0.3) : 1;
            const avatarUrl = this.avatarCache[user.name];

            const bubble = document.createElement('div');
            bubble.className = 'danmaku-bubble';
            bubble.style.top = top + '%';
            bubble.style.fontSize = `calc(${0.82 * fontSizeScale}rem * var(--font-scale, 1.15))`;
            bubble.style.animation = `${fromRight ? 'danmaku-scroll-right' : 'danmaku-scroll-left'} ${duration}s linear forwards`;

            // 内部结构：头像 + (名称 + 祝福语)
            bubble.innerHTML = `
                <img class="danmaku-avatar" src="${avatarUrl}" alt="">
                <div class="danmaku-text">
                    <span class="danmaku-name">${user.name}</span>
                    <span class="danmaku-msg">${text}</span>
                </div>
            `;

            this.container.appendChild(bubble);
            this.activeBubbles.add(bubble);

            // 动画结束后移除
            bubble.addEventListener('animationend', () => {
                if (bubble.parentNode) {
                    bubble.parentNode.removeChild(bubble);
                }
                this.activeBubbles.delete(bubble);
            });

            // 安全清理
            setTimeout(() => {
                if (bubble.parentNode) {
                    bubble.parentNode.removeChild(bubble);
                }
                this.activeBubbles.delete(bubble);
            }, (duration + 2) * 1000);
        }

        burst(count) {
            for (let i = 0; i < count; i++) {
                setTimeout(() => this.spawn(), i * 400);
            }
        }
    }

    // ==================== 初始化 ====================
    function init() {
        const container = document.getElementById('danmaku-layer');
        if (!container) return;

        const system = new DanmakuSystem(container);
        window._danmakuSystem = system;

        setTimeout(() => {
            system.start();
        }, 2000);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
