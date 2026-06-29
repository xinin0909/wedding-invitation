/**
 * 相册轮播组件
 * Gallery Carousel
 * 
 * 特性：
 * - 触摸滑动 + 鼠标拖拽切换
 * - 左右箭头按钮
 * - 指示点点击跳转
 * - 自动播放（可关闭）
 * - 切换时更新背景虚化
 * - 懒加载联动（切换前预加载下一张）
 * - 点击图片全屏查看
 * - 无限循环（最后一张→第一张）
 */

(function () {
    'use strict';

    class Gallery {
        constructor(rootSelector) {
            this.root = document.querySelector(rootSelector);
            if (!this.root) return;

            this.track = this.root.querySelector('#gallery-track');
            this.slides = Array.from(this.track.querySelectorAll('.gallery-slide'));
            this.dots = Array.from(this.root.querySelectorAll('.gallery-dot'));
            this.prevBtn = this.root.querySelector('#gallery-prev');
            this.nextBtn = this.root.querySelector('#gallery-next');
            this.bgBlur = document.getElementById('gallery-bg-blur');

            this.currentIndex = 0;
            this.totalSlides = this.slides.length;
            this.autoPlayTimer = null;
            this.autoPlayInterval = 4000;
            this.autoPlayEnabled = true;

            this.touchStartX = 0;
            this.touchEndX = 0;
            this.touchStartY = 0;
            this.touchEndY = 0;
            this.isDragging = false;
            this.dragOffset = 0;
            this.swipeThreshold = 40;

            this.init();
        }

        init() {
            this.bindEvents();
            this.updateBackground(0);
            this.preloadAdjacent(0);
            
            // 延迟启动自动播放（等页面可见时）
            setTimeout(() => {
                this.startAutoPlay();
            }, 2000);
        }

        // ==================== 事件绑定 ====================
        bindEvents() {
            // 箭头按钮
            this.prevBtn?.addEventListener('click', (e) => {
                e.stopPropagation();
                this.prev();
            });
            this.nextBtn?.addEventListener('click', (e) => {
                e.stopPropagation();
                this.next();
            });

            // 指示点
            this.dots.forEach((dot, index) => {
                dot.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.goTo(index);
                });
            });

            // 触摸滑动
            const carousel = this.root.querySelector('.gallery-carousel');
            
            carousel.addEventListener('touchstart', (e) => {
                this.handleTouchStart(e);
            }, { passive: true });

            carousel.addEventListener('touchmove', (e) => {
                this.handleTouchMove(e);
            }, { passive: true });

            carousel.addEventListener('touchend', (e) => {
                this.handleTouchEnd(e);
            }, { passive: true });

            // 鼠标拖拽（桌面端）
            carousel.addEventListener('mousedown', (e) => {
                this.handleMouseDown(e);
            });

            carousel.addEventListener('mousemove', (e) => {
                if (this.isDragging) this.handleMouseMove(e);
            });

            carousel.addEventListener('mouseup', (e) => {
                if (this.isDragging) this.handleMouseUp(e);
            });

            carousel.addEventListener('mouseleave', (e) => {
                if (this.isDragging) this.handleMouseUp(e);
            });

            // 图片点击 → 不执行放大（用户要求禁用照片缩放）
            // 原全屏查看功能已移除

            // 自动播放控制：鼠标进入暂停
            this.root.addEventListener('mouseenter', () => {
                this.stopAutoPlay();
            });

            this.root.addEventListener('mouseleave', () => {
                this.startAutoPlay();
            });

            // 页面切换时暂停/恢复
            document.addEventListener('visibilitychange', () => {
                if (document.visibilityState === 'hidden') {
                    this.stopAutoPlay();
                } else {
                    this.startAutoPlay();
                }
            });
        }

        // ==================== 触摸事件 ====================
        handleTouchStart(e) {
            this.touchStartX = e.touches[0].clientX;
            this.touchStartY = e.touches[0].clientY;
            this.stopAutoPlay();
        }

        handleTouchMove(e) {
            this.touchEndX = e.touches[0].clientX;
            this.touchEndY = e.touches[0].clientY;
        }

        handleTouchEnd(e) {
            const deltaX = this.touchStartX - this.touchEndX;
            const deltaY = this.touchStartY - this.touchEndY;

            // 水平滑动优先（避免与翻页冲突）
            if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > this.swipeThreshold) {
                if (deltaX > 0) {
                    this.next();
                } else {
                    this.prev();
                }
            }

            this.touchStartX = 0;
            this.touchEndX = 0;
            this.startAutoPlay();
        }

        // ==================== 鼠标拖拽 ====================
        handleMouseDown(e) {
            this.touchStartX = e.clientX;
            this.isDragging = true;
            this.stopAutoPlay();
        }

        handleMouseMove(e) {
            this.touchEndX = e.clientX;
        }

        handleMouseUp(e) {
            const deltaX = this.touchStartX - this.touchEndX;

            if (Math.abs(deltaX) > this.swipeThreshold) {
                if (deltaX > 0) {
                    this.next();
                } else {
                    this.prev();
                }
            }

            this.isDragging = false;
            this.touchStartX = 0;
            this.touchEndX = 0;
            this.startAutoPlay();
        }

        // ==================== 轮播控制 ====================
        goTo(index) {
            if (index < 0) index = this.totalSlides - 1;
            if (index >= this.totalSlides) index = 0;

            this.currentIndex = index;
            this.track.style.transform = `translateX(-${index * 100}%)`;

            // 更新指示点
            this.dots.forEach((dot, i) => {
                dot.classList.toggle('active', i === index);
            });

            // 更新背景虚化
            this.updateBackground(index);

            // 预加载相邻图片
            this.preloadAdjacent(index);

            // 重启自动播放
            this.restartAutoPlay();
        }

        next() {
            this.goTo(this.currentIndex + 1);
        }

        prev() {
            this.goTo(this.currentIndex - 1);
        }

        // ==================== 背景虚化 ====================
        updateBackground(index) {
            if (!this.bgBlur) return;

            const img = this.slides[index].querySelector('.lazy-img');
            if (img) {
                const src = img.dataset.src || img.src;
                if (src) {
                    this.bgBlur.style.backgroundImage = `url('${src}')`;
                }
            }
        }

        // ==================== 懒加载联动 ====================
        preloadAdjacent(index) {
            if (!window._lazyLoader) return;

            // 预加载当前 + 下一张 + 上一张
            const indices = [
                index,
                (index + 1) % this.totalSlides,
                (index - 1 + this.totalSlides) % this.totalSlides,
            ];

            indices.forEach(i => {
                const img = this.slides[i].querySelector('.lazy-img[data-src]');
                if (img && !img.classList.contains('loaded') && !img.classList.contains('loading')) {
                    window._lazyLoader.loadImage(img);
                }
            });
        }

        // ==================== 自动播放 ====================
        startAutoPlay() {
            if (!this.autoPlayEnabled) return;
            this.stopAutoPlay();
            this.autoPlayTimer = setInterval(() => {
                this.next();
            }, this.autoPlayInterval);
        }

        stopAutoPlay() {
            if (this.autoPlayTimer) {
                clearInterval(this.autoPlayTimer);
                this.autoPlayTimer = null;
            }
        }

        restartAutoPlay() {
            this.stopAutoPlay();
            this.startAutoPlay();
        }

        // ==================== 销毁 ====================
        destroy() {
            this.stopAutoPlay();
            this.observer?.disconnect();
        }
    }

    // ==================== 导出 ====================
    window.Gallery = Gallery;

    // ==================== 自动初始化 ====================
    let galleryInstance = null;

    function initGallery() {
        const galleryEl = document.querySelector('.page-gallery');
        if (galleryEl && !galleryInstance) {
            galleryInstance = new Gallery('.page-gallery');
            window._gallery = galleryInstance;
        }
    }

    document.addEventListener('DOMContentLoaded', initGallery);

    // 页面可见时恢复
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible' && !galleryInstance) {
            initGallery();
        }
    });

})();
