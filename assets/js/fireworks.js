/**
 * 烟花特效系统
 * Fireworks Effect System
 * 
 * 点击按钮或提交RSVP时触发烟花绽放
 */
(function () {
    'use strict';

    // ==================== 烟花配置 ====================
    const COLORS = [
        '#d4756b', '#e8a098', '#c9a96e', '#e0c896',
        '#f4c2c2', '#f8d7d3', '#ffd700', '#ff6b6b',
        '#ff8a80', '#ffb74d', '#fff176', '#e8a5d0',
    ];

    class FireworksSystem {
        constructor() {
            this.container = null;
            this.running = false;
            this._ensureContainer();
        }

        _ensureContainer() {
            if (this.container) return;
            this.container = document.createElement('div');
            this.container.id = 'fireworks-layer';
            this.container.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:300;overflow:hidden;';
            document.body.appendChild(this.container);
        }

        // 在指定位置发射一发烟花
        launch(x, y) {
            this._ensureContainer();
            if (x === undefined) x = 20 + Math.random() * 60; // vw 百分比
            if (y === undefined) y = 20 + Math.random() * 40; // vh 百分比

            const launchX = (x / 100) * window.innerWidth;
            const launchY = (y / 100) * window.innerHeight;

            // 创建上升轨迹
            this._createRocket(launchX, launchY);
        }

        _createRocket(targetX, targetY) {
            const rocket = document.createElement('div');
            rocket.style.cssText = `
                position: absolute;
                bottom: 0;
                left: ${targetX}px;
                width: 3px;
                height: 3px;
                background: #ffd700;
                border-radius: 50%;
                box-shadow: 0 0 6px #ffd700, 0 0 12px rgba(255,215,0,0.5);
                pointer-events: none;
            `;

            this.container.appendChild(rocket);

            const duration = 600 + Math.random() * 300;
            const startTime = performance.now();

            const animate = (now) => {
                const elapsed = now - startTime;
                const progress = Math.min(elapsed / duration, 1);
                const easeProgress = 1 - Math.pow(1 - progress, 3); // ease-out

                const currentY = window.innerHeight - (window.innerHeight - targetY) * easeProgress;
                rocket.style.bottom = (window.innerHeight - currentY) + 'px';

                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    rocket.remove();
                    this._explode(targetX, targetY);
                }
            };
            requestAnimationFrame(animate);
        }

        _explode(x, y) {
            const particleCount = 28 + Math.floor(Math.random() * 20);
            const color = COLORS[Math.floor(Math.random() * COLORS.length)];
            const color2 = COLORS[Math.floor(Math.random() * COLORS.length)];

            for (let i = 0; i < particleCount; i++) {
                const angle = (Math.PI * 2 * i) / particleCount + (Math.random() - 0.5) * 0.3;
                const velocity = 60 + Math.random() * 80;
                const particleColor = Math.random() > 0.5 ? color : color2;
                const size = 2 + Math.random() * 3;

                const particle = document.createElement('div');
                particle.style.cssText = `
                    position: absolute;
                    left: ${x}px;
                    top: ${y}px;
                    width: ${size}px;
                    height: ${size}px;
                    background: ${particleColor};
                    border-radius: 50%;
                    box-shadow: 0 0 ${size * 3}px ${particleColor};
                    pointer-events: none;
                    will-change: transform, opacity;
                `;

                this.container.appendChild(particle);

                const duration = 800 + Math.random() * 600;
                const startTime = performance.now();
                const gravity = 0.15;
                let vx = Math.cos(angle) * velocity;
                let vy = Math.sin(angle) * velocity;
                let px = 0, py = 0;

                const animate = (now) => {
                    const elapsed = now - startTime;
                    const progress = elapsed / duration;

                    if (progress >= 1) {
                        particle.remove();
                        return;
                    }

                    vy += gravity;
                    px += vx * 0.016;
                    py += vy * 0.016;

                    const opacity = 1 - progress;
                    const scale = 1 - progress * 0.5;

                    particle.style.transform = `translate(${px}px, ${py}px) scale(${scale})`;
                    particle.style.opacity = opacity;

                    requestAnimationFrame(animate);
                };
                requestAnimationFrame(animate);
            }

            // 中心闪光
            const flash = document.createElement('div');
            flash.style.cssText = `
                position: absolute;
                left: ${x}px;
                top: ${y}px;
                width: 40px;
                height: 40px;
                margin: -20px 0 0 -20px;
                background: radial-gradient(circle, rgba(255,255,255,0.9) 0%, transparent 70%);
                border-radius: 50%;
                pointer-events: none;
            `;
            this.container.appendChild(flash);
            flash.animate([
                { transform: 'scale(0.3)', opacity: 1 },
                { transform: 'scale(2)', opacity: 0 }
            ], { duration: 400, easing: 'ease-out' }).onfinish = () => flash.remove();
        }

        // 连续发射多发烟花
        burst(count) {
            this._ensureContainer();
            for (let i = 0; i < count; i++) {
                setTimeout(() => {
                    this.launch();
                }, i * 250);
            }
        }

        // 从底部两侧同时发射
        celebrate() {
            this._ensureContainer();
            // 左侧
            this.launch(15 + Math.random() * 20, 20 + Math.random() * 30);
            // 右侧
            setTimeout(() => this.launch(65 + Math.random() * 20, 20 + Math.random() * 30), 200);
            // 中间
            setTimeout(() => this.launch(35 + Math.random() * 30, 15 + Math.random() * 25), 400);
            // 再次两侧
            setTimeout(() => {
                this.launch(20 + Math.random() * 15, 25 + Math.random() * 20);
                this.launch(65 + Math.random() * 15, 25 + Math.random() * 20);
            }, 700);
        }
    }

    // ==================== 导出 ====================
    window.FireworksSystem = FireworksSystem;

    // 自动初始化
    document.addEventListener('DOMContentLoaded', () => {
        if (!window._fireworksSystem) {
            window._fireworksSystem = new FireworksSystem();
        }
    });

})();
