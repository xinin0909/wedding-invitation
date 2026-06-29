/**
 * 花瓣飘落特效系统
 * Petal Falling Effect System
 * 
 * 支持多种花瓣形态、颜色、大小、速度组合
 * 支持风力方向变化、密度控制
 */

(function () {
    'use strict';

    // ==================== 配置 ====================
    const CONFIG = {
        maxPetals: 35,          // 同屏最大花瓣数
        spawnInterval: 280,     // 生成间隔(ms)
        minSize: 12,            // 最小花瓣大小
        maxSize: 28,            // 最大花瓣大小
        minDuration: 8,         // 最小下落时间(s)
        maxDuration: 14,        // 最大下落时间(s)
        minSwayDuration: 2,     // 最小摇摆周期(s)
        maxSwayDuration: 5,     // 最大摇摆周期(s)
        colors: [
            { fill: '#f4c2c2', stroke: '#e8a098', opacity: 0.85 },  // 浅粉
            { fill: '#e8a098', stroke: '#d4756b', opacity: 0.8 },   // 玫瑰粉
            { fill: '#f8d7d3', stroke: '#e8a098', opacity: 0.7 },   // 淡粉
            { fill: '#fce4ec', stroke: '#f4c2c2', opacity: 0.6 },   // 极淡粉
            { fill: '#e0c896', stroke: '#c9a96e', opacity: 0.7 },   // 金色
            { fill: '#f0d0a0', stroke: '#c9a96e', opacity: 0.6 },   // 浅金
            { fill: '#d4756b', stroke: '#b8594f', opacity: 0.75 },  // 深玫瑰
            { fill: '#ffffff', stroke: '#f4c2c2', opacity: 0.5 },   // 白色
        ],
        shapes: ['sakura', 'rose', 'petal-simple', 'petal-double'],
        shapeWeights: [0.3, 0.25, 0.3, 0.15],  // 各形状的权重
        windEnabled: true,
        windChangeInterval: 5000,  // 风向变化间隔(ms)
    };

    // ==================== SVG 花瓣形状 ====================
    const SHAPES = {
        // 樱花形状
        sakura: (color) => `
            <svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
                <g fill="${color.fill}" stroke="${color.stroke}" stroke-width="0.5" opacity="${color.opacity}">
                    <path d="M20 5 Q24 8 24 14 Q24 18 20 20 Q16 18 16 14 Q16 8 20 5Z"/>
                    <path d="M20 5 Q24 8 24 14 Q24 18 20 20 Q16 18 16 14 Q16 8 20 5Z" transform="rotate(72 20 20)"/>
                    <path d="M20 5 Q24 8 24 14 Q24 18 20 20 Q16 18 16 14 Q16 8 20 5Z" transform="rotate(144 20 20)"/>
                    <path d="M20 5 Q24 8 24 14 Q24 18 20 20 Q16 18 16 14 Q16 8 20 5Z" transform="rotate(216 20 20)"/>
                    <path d="M20 5 Q24 8 24 14 Q24 18 20 20 Q16 18 16 14 Q16 8 20 5Z" transform="rotate(288 20 20)"/>
                    <circle cx="20" cy="20" r="2" fill="${color.stroke}" stroke="none"/>
                </g>
            </svg>
        `,

        // 玫瑰花瓣形状
        rose: (color) => `
            <svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
                <g fill="${color.fill}" stroke="${color.stroke}" stroke-width="0.5" opacity="${color.opacity}">
                    <path d="M20 8 Q12 12 10 20 Q10 28 16 32 Q20 34 24 32 Q30 28 30 20 Q28 12 20 8Z"/>
                    <path d="M20 12 Q15 15 14 20 Q14 25 17 28 Q20 29 23 28 Q26 25 26 20 Q25 15 20 12Z" fill="${color.stroke}" opacity="0.5"/>
                    <path d="M20 15 Q17 17 17 20 Q17 23 19 25 Q20 26 21 25 Q23 23 23 20 Q23 17 20 15Z" fill="${color.fill}" opacity="0.8"/>
                </g>
            </svg>
        `,

        // 简单花瓣形状
        'petal-simple': (color) => `
            <svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
                <g fill="${color.fill}" stroke="${color.stroke}" stroke-width="0.5" opacity="${color.opacity}">
                    <path d="M20 5 Q25 15 25 22 Q25 32 20 35 Q15 32 15 22 Q15 15 20 5Z"/>
                    <path d="M20 10 Q22 18 22 24 Q22 30 20 32 Q18 30 18 24 Q18 18 20 10Z" fill="${color.stroke}" opacity="0.3"/>
                </g>
            </svg>
        `,

        // 双层花瓣
        'petal-double': (color) => `
            <svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
                <g fill="${color.fill}" stroke="${color.stroke}" stroke-width="0.5" opacity="${color.opacity}">
                    <path d="M20 5 Q26 12 27 20 Q26 28 20 35 Q14 28 13 20 Q14 12 20 5Z"/>
                    <path d="M20 10 Q24 15 24 20 Q24 25 20 30 Q16 25 16 20 Q16 15 20 10Z" fill="${color.stroke}" opacity="0.4"/>
                    <ellipse cx="20" cy="20" rx="2" ry="4" fill="${color.fill}" opacity="0.6"/>
                </g>
            </svg>
        `,
    };

    // ==================== 花瓣类 ====================
    class Petal {
        constructor(container) {
            this.container = container;
            this.element = document.createElement('div');
            this.element.className = 'petal petal-shadow';
            this.active = false;
        }

        spawn() {
            const color = CONFIG.colors[Math.floor(Math.random() * CONFIG.colors.length)];
            const shape = this._pickShape();
            const size = CONFIG.minSize + Math.random() * (CONFIG.maxSize - CONFIG.minSize);
            const startX = Math.random() * 100; // 起始X位置(vw)
            const duration = CONFIG.minDuration + Math.random() * (CONFIG.maxDuration - CONFIG.minDuration);
            const swayDuration = CONFIG.minSwayDuration + Math.random() * (CONFIG.maxSwayDuration - CONFIG.minSwayDuration);
            const styleClass = 'style-' + (1 + Math.floor(Math.random() * 3));
            const delay = Math.random() * 2;

            this.element.className = `petal petal-shadow ${styleClass}`;
            this.element.style.left = startX + 'vw';
            this.element.style.width = size + 'px';
            this.element.style.height = size + 'px';
            this.element.style.animationDuration = `${duration}s, ${swayDuration}s`;
            this.element.style.animationDelay = `${delay}s, ${delay}s`;
            this.element.innerHTML = SHAPES[shape](color);

            this.container.appendChild(this.element);
            this.active = true;

            // 动画结束后移除
            this.timeout = setTimeout(() => {
                this.remove();
            }, (duration + delay + 1) * 1000);
        }

        remove() {
            if (this.element.parentNode) {
                this.element.parentNode.removeChild(this.element);
            }
            this.active = false;
            if (this.timeout) {
                clearTimeout(this.timeout);
                this.timeout = null;
            }
        }

        _pickShape() {
            const r = Math.random();
            let cumulative = 0;
            for (let i = 0; i < CONFIG.shapes.length; i++) {
                cumulative += CONFIG.shapeWeights[i];
                if (r < cumulative) return CONFIG.shapes[i];
            }
            return CONFIG.shapes[0];
        }
    }

    // ==================== 花瓣系统 ====================
    class PetalSystem {
        constructor(container) {
            this.container = container;
            this.petals = [];
            this.running = false;
            this.spawnTimer = null;
            this.activeCount = 0;

            // 预创建花瓣对象池
            for (let i = 0; i < CONFIG.maxPetals; i++) {
                this.petals.push(new Petal(container));
            }
        }

        start() {
            if (this.running) return;
            this.running = true;

            // 初始批量生成
            const initialBatch = Math.min(8, CONFIG.maxPetals);
            for (let i = 0; i < initialBatch; i++) {
                setTimeout(() => this._spawn(), i * 200);
            }

            // 持续生成
            this.spawnTimer = setInterval(() => {
                this._spawn();
            }, CONFIG.spawnInterval);
        }

        stop() {
            this.running = false;
            if (this.spawnTimer) {
                clearInterval(this.spawnTimer);
                this.spawnTimer = null;
            }
        }

        burst(count) {
            // 爆发式生成（用于特殊时刻）
            count = count || 20;
            for (let i = 0; i < count; i++) {
                setTimeout(() => this._spawn(), i * 50);
            }
        }

        _spawn() {
            if (!this.running) return;

            this.activeCount = this.petals.filter(p => p.active).length;
            if (this.activeCount >= CONFIG.maxPetals) return;

            const petal = this.petals.find(p => !p.active);
            if (petal) {
                petal.spawn();
            }
        }

        clear() {
            this.petals.forEach(p => p.remove());
        }

        setDensity(maxPetals) {
            CONFIG.maxPetals = maxPetals;
        }
    }

    // ==================== 导出 ====================
    window.PetalSystem = PetalSystem;

    // ==================== 自动启动 ====================
    document.addEventListener('DOMContentLoaded', () => {
        const container = document.getElementById('petal-container');
        if (container) {
            const system = new PetalSystem(container);
            system.start();
            window._petalSystem = system;  // 全局引用
        }
    });

})();
