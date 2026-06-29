/**
 * 图片懒加载系统
 * Image Lazy Loading System
 * 
 * 特性：
 * - IntersectionObserver 监听进入视口
 * - 支持背景图 + img 标签
 * - 加载进度反馈
 * - 加载失败占位处理
 */

(function () {
    'use strict';

    // ==================== 配置 ====================
    const CONFIG = {
        rootMargin: '100px 0px',  // 提前 100px 开始加载
        threshold: 0.01,
        loadingClass: 'loading',
        loadedClass: 'loaded',
        errorClass: 'error',
    };

    // ==================== 懒加载管理器 ====================
    class LazyLoader {
        constructor() {
            this.observer = null;
            this.init();
        }

        init() {
            if (!('IntersectionObserver' in window)) {
                // 降级处理：直接加载所有图片
                this.loadAll();
                return;
            }

            this.observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        this.loadElement(entry.target);
                        this.observer.unobserve(entry.target);
                    }
                });
            }, {
                rootMargin: CONFIG.rootMargin,
                threshold: CONFIG.threshold,
            });

            // 监听所有懒加载元素
            this.observeAll();
        }

        observeAll() {
            const lazyImages = document.querySelectorAll('.lazy-img[data-src]');
            lazyImages.forEach(img => this.observer.observe(img));

            const lazyBackgrounds = document.querySelectorAll('[data-lazy-bg]');
            lazyBackgrounds.forEach(el => this.observer.observe(el));
        }

        loadElement(el) {
            if (el.tagName === 'IMG') {
                this.loadImage(el);
            } else if (el.hasAttribute('data-lazy-bg')) {
                this.loadBackground(el);
            }
        }

        loadImage(img) {
            const src = img.dataset.src;
            if (!src) return;

            img.classList.add(CONFIG.loadingClass);

            const tempImg = new Image();
            
            tempImg.onload = () => {
                img.src = src;
                img.classList.remove(CONFIG.loadingClass);
                img.classList.add(CONFIG.loadedClass);
                
                // 隐藏占位
                const placeholder = img.closest('.gallery-photo-inner')?.querySelector('.gallery-photo-placeholder');
                if (placeholder) {
                    placeholder.classList.add('hidden');
                }
            };

            tempImg.onerror = () => {
                img.classList.remove(CONFIG.loadingClass);
                img.classList.add(CONFIG.errorClass);
                console.warn('图片加载失败:', src);
            };

            tempImg.src = src;
        }

        loadBackground(el) {
            const src = el.dataset.lazyBg;
            if (!src) return;

            el.classList.add(CONFIG.loadingClass);

            const img = new Image();
            
            img.onload = () => {
                el.style.backgroundImage = `url('${src}')`;
                el.classList.remove(CONFIG.loadingClass);
                el.classList.add(CONFIG.loadedClass);
            };

            img.onerror = () => {
                el.classList.remove(CONFIG.loadingClass);
                el.classList.add(CONFIG.errorClass);
            };

            img.src = src;
        }

        loadAll() {
            const lazyImages = document.querySelectorAll('.lazy-img[data-src]');
            lazyImages.forEach(img => this.loadImage(img));

            const lazyBackgrounds = document.querySelectorAll('[data-lazy-bg]');
            lazyBackgrounds.forEach(el => this.loadBackground(el));
        }

        // 强制加载指定图片
        forceLoad(selector) {
            const elements = document.querySelectorAll(selector);
            elements.forEach(el => this.loadElement(el));
        }

        // 刷新监听（动态添加元素后调用）
        refresh() {
            if (this.observer) {
                this.observeAll();
            }
        }
    }

    // ==================== 导出 ====================
    window.LazyLoader = LazyLoader;

    // ==================== 自动初始化 ====================
    let lazyLoaderInstance = null;

    document.addEventListener('DOMContentLoaded', () => {
        lazyLoaderInstance = new LazyLoader();
        window._lazyLoader = lazyLoaderInstance;
    });

    // 页面可见时刷新懒加载
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible' && lazyLoaderInstance) {
            lazyLoaderInstance.refresh();
        }
    });

})();
