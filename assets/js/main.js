/**
 * 婚礼请柬 - 主逻辑
 * Wedding Invitation - Main Logic
 */

(function () {
    'use strict';

    // ==================== 元素引用 ====================
    const invitation = document.getElementById('invitation');
    const pages = Array.from(invitation.querySelectorAll('.page'));
    const dots = Array.from(document.querySelectorAll('.dot'));
    const swipeHint = document.getElementById('swipe-hint');
    const musicBtn = document.getElementById('music-toggle');
    const bgMusic = document.getElementById('bg-music');
    const rsvpForm = document.getElementById('rsvp-form');
    const rsvpThanks = document.getElementById('rsvp-thanks');
    const mapLink = document.getElementById('map-link');

    let currentPage = 0;
    let isAnimating = false;
    let touchStartY = 0;
    let touchEndY = 0;
    let touchStartX = 0;
    let swipeThreshold = 50;
    let musicAutoPlayed = false;

    // ==================== 页面切换 ====================
    function goToPage(index) {
        if (isAnimating || index < 0 || index >= pages.length || index === currentPage) return;
        isAnimating = true;

        const prevPage = pages[currentPage];
        const nextPage = pages[index];
        const direction = index > currentPage ? 'next' : 'prev';

        // 更新页面类
        prevPage.classList.remove('active');
        prevPage.classList.add(direction);
        nextPage.classList.add('active');

        // 更新指示器
        dots[currentPage].classList.remove('active');
        dots[index].classList.add('active');

        // 翻页完成后清理
        setTimeout(() => {
            prevPage.classList.remove('prev', 'next');
            isAnimating = false;
        }, 800);

        currentPage = index;

        // 封面页隐藏提示，其他页显示
        if (currentPage === 0) {
            swipeHint.classList.remove('hidden');
        } else {
            swipeHint.classList.add('hidden');
        }

        // 花瓣爆发效果（切换到相册页时）
        if (index === 1 && window._gallery) {
            // 轮播回到第一张
            window._gallery.goTo(0);
            window._gallery.restartAutoPlay();
        }
        if (window._petalSystem && index === 1) {
            window._petalSystem.burst(15);
        }
    }

    function nextPage() {
        goToPage(currentPage + 1);
    }

    function prevPage() {
        goToPage(currentPage - 1);
    }

    // ==================== 触摸/鼠标事件 ====================
    function handleTouchStart(e) {
        touchStartY = e.type === 'touchstart' ? e.touches[0].clientY : e.clientY;
        touchStartX = e.type === 'touchstart' ? e.touches[0].clientX : e.clientX;
    }

    function handleTouchEnd(e) {
        touchEndY = e.type === 'touchend' ? e.changedTouches[0].clientY : e.clientY;
        const endX = e.type === 'touchend' ? e.changedTouches[0].clientX : e.clientX;
        handleSwipe(endX);
    }

    function handleSwipe(endX) {
        const deltaY = touchStartY - touchEndY;
        const deltaX = touchStartX - endX;

        // 如果水平滑动大于垂直滑动，不触发翻页（让轮播处理）
        if (Math.abs(deltaX) > Math.abs(deltaY)) return;

        if (deltaY > swipeThreshold) {
            // 向上滑动 → 下一页
            nextPage();
        } else if (deltaY < -swipeThreshold) {
            // 向下滑动 → 上一页
            prevPage();
        }
    }

    // 绑定触摸事件
    invitation.addEventListener('touchstart', handleTouchStart, { passive: true });
    invitation.addEventListener('touchend', handleTouchEnd, { passive: true });

    // 桌面端鼠标支持
    invitation.addEventListener('mousedown', handleTouchStart);
    invitation.addEventListener('mouseup', handleTouchEnd);

    // 滚轮支持
    invitation.addEventListener('wheel', (e) => {
        e.preventDefault();
        if (e.deltaY > 0) {
            nextPage();
        } else {
            prevPage();
        }
    }, { passive: false });

    // ==================== 键盘支持 ====================
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowDown' || e.key === 'ArrowRight' || e.key === ' ') {
            e.preventDefault();
            nextPage();
        } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
            e.preventDefault();
            prevPage();
        }
    });

    // ==================== 页面指示器点击 ====================
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            goToPage(index);
        });
    });

    // ==================== 音乐控制 ====================
    function initMusic() {
        // 尝试自动播放（需要用户交互）
        const tryPlay = () => {
            if (musicAutoPlayed) return;
            bgMusic.play().then(() => {
                musicAutoPlayed = true;
                musicBtn.classList.add('playing');
            }).catch(() => {
                // 用户未交互时无法自动播放是正常的
            });
        };

        // 首次交互时播放
        document.addEventListener('touchstart', tryPlay, { once: true });
        document.addEventListener('click', tryPlay, { once: true });

        // 音乐按钮切换
        musicBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (bgMusic.paused) {
                bgMusic.play();
                musicBtn.classList.add('playing');
            } else {
                bgMusic.pause();
                musicBtn.classList.remove('playing');
            }
        });

        // 音乐结束监听
        bgMusic.addEventListener('ended', () => {
            bgMusic.currentTime = 0;
            bgMusic.play();
        });
    }

    // ==================== RSVP 表单 ====================
    if (rsvpForm) {
        rsvpForm.addEventListener('submit', (e) => {
            e.preventDefault();

            // 收集表单数据
            const data = {
                name: document.getElementById('guest-name').value,
                phone: document.getElementById('guest-phone').value,
                count: document.getElementById('guest-count').value,
                attend: document.querySelector('input[name="attend"]:checked').value,
                message: document.getElementById('guest-message').value,
            };

            // 简单验证
            if (!data.name || !data.phone) {
                alert('请填写姓名和联系电话');
                return;
            }

            // 模拟提交（实际项目可对接后端API）
            console.log('RSVP 提交数据:', data);

            // 显示感谢信息
            rsvpForm.style.display = 'none';
            rsvpForm.nextElementSibling.style.display = 'none';
            rsvpThanks.style.display = 'block';

            // 花瓣爆发庆祝
            if (window._petalSystem) {
                window._petalSystem.burst(30);
            }
        });
    }

    // ==================== 地图链接 ====================
    if (mapLink) {
        mapLink.addEventListener('click', () => {
            // 实际项目中替换为真实地图链接
            const address = encodeURIComponent('杭州市西湖区杨公堤18号');
            // 尝试打开高德地图
            window.open(`https://uri.amap.com/search?keyword=${address}&src=m&from=open`, '_blank');
        });
    }

    // ==================== 页面入场动画 ====================
    function animatePageEntrance() {
        const activePage = pages[currentPage];
        const elements = activePage.querySelectorAll('.animate-in');
        elements.forEach((el) => {
            el.style.animation = 'none';
            el.offsetHeight; // 强制重绘
            el.style.animation = null;
        });
    }

    // ==================== 初始化 ====================
    function init() {
        initMusic();

        // 封面入场动画完成后隐藏提示
        setTimeout(() => {
            // 首次访问后一段时间自动隐藏
            setTimeout(() => {
                swipeHint.classList.remove('hidden');
            }, 1500);
        }, 2500);

        // 监听页面切换触发入场动画
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.target.classList.contains('active')) {
                    animatePageEntrance();
                    // 进入相册页时刷新懒加载
                    if (mutation.target.dataset.index === '1' && window._lazyLoader) {
                        window._lazyLoader.refresh();
                    }
                }
            });
        });

        pages.forEach((page) => {
            observer.observe(page, { attributes: true, attributeFilter: ['class'] });
        });
    }

    // DOM 加载完成后初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
