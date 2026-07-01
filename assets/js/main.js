/**
 * 婚礼请柬 - 主逻辑
 * Wedding Invitation - Main Logic
 */

(function () {
    'use strict';

    // ==================== 婚礼日期（用于倒计时） ====================
    const WEDDING_DATE = new Date('2026-10-06T11:28:00+08:00').getTime();

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
    let hasOpenedEnvelope = false;

    // ==================== 婚期倒计时 ====================
    function initCountdown() {
        const daysEl = document.getElementById('countdown-days');
        const hoursEl = document.getElementById('countdown-hours');
        const minsEl = document.getElementById('countdown-mins');
        const secsEl = document.getElementById('countdown-secs');
        if (!daysEl) return;

        function update() {
            const now = Date.now();
            let diff = WEDDING_DATE - now;
            if (diff < 0) diff = 0;

            const days = Math.floor(diff / 86400000);
            const hours = Math.floor((diff % 86400000) / 3600000);
            const mins = Math.floor((diff % 3600000) / 60000);
            const secs = Math.floor((diff % 60000) / 1000);

            daysEl.textContent = String(days).padStart(3, '0');
            hoursEl.textContent = String(hours).padStart(2, '0');
            minsEl.textContent = String(mins).padStart(2, '0');
            secsEl.textContent = String(secs).padStart(2, '0');
        }

        update();
        setInterval(update, 1000);
    }

    // ==================== 拆信封动画 ====================
    function initEnvelope() {
        const envelopeOverlay = document.getElementById('envelope-overlay');
        const envelopeBody = document.getElementById('envelope-body');
        const envelopeBtn = document.getElementById('envelope-open-btn');
        if (!envelopeOverlay) return;

        envelopeBtn.addEventListener('click', () => {
            if (hasOpenedEnvelope) return;
            hasOpenedEnvelope = true;

            // 信封翻盖动画
            envelopeBody.classList.add('opened');

            // 淡出遮罩
            setTimeout(() => {
                envelopeOverlay.classList.add('fade-out');
            }, 800);

            // 完全移除
            setTimeout(() => {
                envelopeOverlay.style.display = 'none';
                // 触发封面入场动画
                triggerCoverAnimation();
                // 启动音乐
                tryPlayMusic();
                // 启动弹幕
                if (window._danmakuSystem) {
                    setTimeout(() => window._danmakuSystem.start(), 1500);
                }
            }, 1600);
        });
    }

    function triggerCoverAnimation() {
        const animateEls = document.querySelectorAll('.page-cover .animate-in');
        animateEls.forEach((el) => {
            el.style.animation = 'none';
            el.offsetHeight;
            el.style.animation = null;
        });
    }

    // ==================== 撒花按钮 ====================
    function initFlowerBtn() {
        const flowerBtn = document.getElementById('flower-btn');
        if (!flowerBtn) return;

        let burstCount = 0;
        flowerBtn.addEventListener('click', () => {
            burstCount++;

            // 花瓣爆发
            if (window._petalSystem) {
                window._petalSystem.burst(12);
            }

            // 每3次触发一次烟花
            if (burstCount % 3 === 0 && window._fireworksSystem) {
                window._fireworksSystem.launch();
            }

            // 按钮动画
            flowerBtn.classList.add('clicked');
            setTimeout(() => flowerBtn.classList.remove('clicked'), 400);
        });
    }

    // ==================== 页面切换 ====================
    function goToPage(index) {
        if (isAnimating || index < 0 || index >= pages.length || index === currentPage) return;
        isAnimating = true;

        const prevPage = pages[currentPage];
        const nextPage = pages[index];
        const direction = index > currentPage ? 'next' : 'prev';

        prevPage.classList.remove('active');
        prevPage.classList.add(direction);
        nextPage.classList.add('active');

        dots[currentPage].classList.remove('active');
        dots[index].classList.add('active');

        setTimeout(() => {
            prevPage.classList.remove('prev', 'next');
            isAnimating = false;
        }, 800);

        currentPage = index;

        if (currentPage === 0) {
            swipeHint.classList.remove('hidden');
        } else {
            swipeHint.classList.add('hidden');
        }

        if (index === 1 && window._gallery) {
            window._gallery.goTo(0);
            window._gallery.restartAutoPlay();
        }
        if (window._petalSystem && index === 1) {
            window._petalSystem.burst(15);
        }
    }

    function nextPage() { goToPage(currentPage + 1); }
    function prevPage() { goToPage(currentPage - 1); }

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
        if (Math.abs(deltaX) > Math.abs(deltaY)) return;

        if (deltaY > swipeThreshold) nextPage();
        else if (deltaY < -swipeThreshold) prevPage();
    }

    invitation.addEventListener('touchstart', handleTouchStart, { passive: true });
    invitation.addEventListener('touchend', handleTouchEnd, { passive: true });
    invitation.addEventListener('mousedown', handleTouchStart);
    invitation.addEventListener('mouseup', handleTouchEnd);

    invitation.addEventListener('wheel', (e) => {
        e.preventDefault();
        if (e.deltaY > 0) nextPage();
        else prevPage();
    }, { passive: false });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowDown' || e.key === 'ArrowRight' || e.key === ' ') {
            e.preventDefault();
            nextPage();
        } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
            e.preventDefault();
            prevPage();
        }
    });

    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => goToPage(index));
    });

    // ==================== 音乐控制 ====================
    function tryPlayMusic() {
        if (musicAutoPlayed) return;
        bgMusic.play().then(() => {
            musicAutoPlayed = true;
            musicBtn.classList.add('playing');
        }).catch(() => {});
    }

    function initMusic() {
        // 首次交互时播放（信封未打开时的备选）
        document.addEventListener('touchstart', tryPlayMusic, { once: true });
        document.addEventListener('click', tryPlayMusic, { once: true });

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

        bgMusic.addEventListener('ended', () => {
            bgMusic.currentTime = 0;
            bgMusic.play();
        });
    }

    // ==================== RSVP 表单 ====================
    if (rsvpForm) {
        rsvpForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const data = {
                name: document.getElementById('guest-name').value,
                phone: document.getElementById('guest-phone').value,
                count: document.getElementById('guest-count').value,
                attend: document.querySelector('input[name="attend"]:checked').value,
                message: document.getElementById('guest-message').value,
            };

            if (!data.name || !data.phone) {
                alert('请填写姓名和联系电话');
                return;
            }

            console.log('RSVP 提交数据:', data);

            // 添加真实祝福到弹幕系统
            if (window._danmakuSystem) {
                const blessingText = data.message || '祝你们新婚快乐，永远幸福！';
                window._danmakuSystem.addBlessing(data.name, blessingText);
                // 多发几条让宾客马上看到
                setTimeout(() => window._danmakuSystem && window._danmakuSystem._spawnReal(), 500);
                setTimeout(() => window._danmakuSystem && window._danmakuSystem._spawnReal(), 1200);
            }

            // 烟花庆祝
            if (window._fireworksSystem) {
                window._fireworksSystem.celebrate();
            }

            // 花瓣爆发
            if (window._petalSystem) {
                window._petalSystem.burst(30);
            }

            // 显示感谢信息
            rsvpForm.style.display = 'none';
            rsvpForm.nextElementSibling.style.display = 'none';
            rsvpThanks.style.display = 'block';
        });
    }

    // ==================== 地图链接 ====================
    if (mapLink) {
        mapLink.addEventListener('click', () => {
            const address = encodeURIComponent('杭州市西湖区杨公堤18号');
            window.open(`https://uri.amap.com/search?keyword=${address}&src=m&from=open`, '_blank');
        });
    }

    // ==================== 页面入场动画 ====================
    function animatePageEntrance() {
        const activePage = pages[currentPage];
        const elements = activePage.querySelectorAll('.animate-in');
        elements.forEach((el) => {
            el.style.animation = 'none';
            el.offsetHeight;
            el.style.animation = null;
        });
    }

    // ==================== 初始化 ====================
    function init() {
        initEnvelope();
        initCountdown();
        initMusic();
        initFlowerBtn();

        setTimeout(() => {
            setTimeout(() => {
                swipeHint.classList.remove('hidden');
            }, 1500);
        }, 2500);

        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.target.classList.contains('active')) {
                    animatePageEntrance();
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

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
