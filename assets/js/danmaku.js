/**
 * 弹幕祝福语系统
 * Danmaku Blessing System
 * 
 * 半透明气泡从屏幕两侧飘过，显示静态祝福语
 */
(function () {
    'use strict';

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
        interval: 2800,          // 每条弹幕间隔 ms
        minDuration: 8,           // 最短飘过时间 s
        maxDuration: 12,          // 最长飘过时间 s
        minTop: 12,               // 最上方位置 %
        maxTop: 82,               // 最下方位置 %
        fontSizeVariation: true,  // 字号随机变化
    };

    // ==================== 弹幕系统 ====================
    class DanmakuSystem {
        constructor(container) {
            this.container = container;
            this.timer = null;
            this.activeBubbles = new Set();
            this.running = false;
        }

        start() {
            if (this.running) return;
            this.running = true;

            // 立即发一条
            this.spawn();

            // 定时发射
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
            // 清理现有弹幕
            this.activeBubbles.forEach((bubble) => {
                if (bubble.parentNode) {
                    bubble.parentNode.removeChild(bubble);
                }
            });
            this.activeBubbles.clear();
        }

        spawn() {
            if (this.activeBubbles.size >= 6) return; // 限制同时存在数量

            const text = BLESSINGS[Math.floor(Math.random() * BLESSINGS.length)];
            const fromRight = Math.random() > 0.5;
            const top = CONFIG.minTop + Math.random() * (CONFIG.maxTop - CONFIG.minTop);
            const duration = CONFIG.minDuration + Math.random() * (CONFIG.maxDuration - CONFIG.minDuration);
            const fontSizeScale = CONFIG.fontSizeVariation ? (0.85 + Math.random() * 0.3) : 1;

            const bubble = document.createElement('div');
            bubble.className = 'danmaku-bubble';
            bubble.textContent = text;
            bubble.style.top = top + '%';
            bubble.style.fontSize = `calc(${0.82 * fontSizeScale}rem * var(--font-scale, 1.15))`;
            bubble.style.animation = `${fromRight ? 'danmaku-scroll-right' : 'danmaku-scroll-left'} ${duration}s linear forwards`;

            this.container.appendChild(bubble);
            this.activeBubbles.add(bubble);

            // 动画结束后移除
            bubble.addEventListener('animationend', () => {
                if (bubble.parentNode) {
                    bubble.parentNode.removeChild(bubble);
                }
                this.activeBubbles.delete(bubble);
            });

            // 安全清理（防止意外残留）
            setTimeout(() => {
                if (bubble.parentNode) {
                    bubble.parentNode.removeChild(bubble);
                }
                this.activeBubbles.delete(bubble);
            }, (duration + 2) * 1000);
        }

        // 首次进入时爆发效果
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

        // 延迟启动，等封面动画结束
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
