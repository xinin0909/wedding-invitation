/**
 * 微信分享卡片配置
 * WeChat Share Card Configuration
 * 
 * 功能：
 * - 配置分享给朋友/朋友圈的标题、描述、图片
 * - 自动检测微信环境，非微信浏览器静默跳过
 * - 需要后端接口提供签名（wxConfig）
 * 
 * 使用前需要：
 * 1. 在微信公众平台绑定域名
 * 2. 部署后端签名接口
 * 3. 替换 SHARE_CONFIG 中的链接和图片地址
 */

(function () {
    'use strict';

    // ==================== 分享内容配置 ====================
    const SHARE_CONFIG = {
        // 分享标题（朋友+朋友圈）
        title: '嘉豪 & 婉清 · 婚礼邀请',
        // 分享描述（仅朋友）
        desc: '诚邀您参加我们的婚礼 · 2026年10月6日 · 杭州西湖国宾馆',
        // 分享链接（当前页面URL）
        link: window.location.href.split('#')[0],
        // 分享缩略图（建议 300×300，< 32KB）
        imgUrl: 'https://your-domain.com/assets/images/share-cover.jpg',
        // 分享类型
        type: 'link',
        dataUrl: '',
    };

    // ==================== 后端签名接口 ====================
    const SIGN_API = '/api/wx-signature?url=';

    // ==================== 检测微信浏览器 ====================
    function isWeChatBrowser() {
        const ua = navigator.userAgent.toLowerCase();
        return ua.indexOf('micromessenger') !== -1 && ua.indexOf('wxwork') === -1;
    }

    // ==================== 微信 JSSDK 配置 ====================
    function initWeChatShare() {
        if (!isWeChatBrowser()) {
            console.log('[WeChat Share] 非微信浏览器，跳过分享配置');
            return;
        }

        if (typeof wx === 'undefined') {
            console.warn('[WeChat Share] 微信 JSSDK 未加载');
            return;
        }

        const currentUrl = window.location.href.split('#')[0];

        // 请求后端签名
        fetch(SIGN_API + encodeURIComponent(currentUrl))
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    console.warn('[WeChat Share] 签名失败:', data.error);
                    return;
                }

                // 配置 JSSDK
                wx.config({
                    debug: false,
                    appId: data.appId,
                    timestamp: data.timestamp,
                    nonceStr: data.nonceStr,
                    signature: data.signature,
                    jsApiList: [
                        'updateAppMessageShareData',
                        'updateTimelineShareData',
                        'onMenuShareAppMessage',
                        'onMenuShareTimeline',
                    ],
                });

                wx.ready(function () {
                    console.log('[WeChat Share] JSSDK 配置成功');

                    // 分享给朋友（新版接口）
                    if (wx.checkJsApi) {
                        wx.checkJsApi({
                            jsApiList: ['updateAppMessageShareData', 'updateTimelineShareData'],
                            success: function (res) {
                                const hasNewAPI = res.checkResult['updateAppMessageShareData'];
                                if (hasNewAPI) {
                                    configNewShare();
                                } else {
                                    configLegacyShare();
                                }
                            },
                            fail: function () {
                                configLegacyShare();
                            },
                        });
                    } else {
                        configLegacyShare();
                    }
                });

                wx.error(function (res) {
                    console.warn('[WeChat Share] JSSDK 配置失败:', res.errMsg);
                });
            })
            .catch(err => {
                console.warn('[WeChat Share] 签名请求失败:', err);
                // 降级：尝试不签名的配置（仅在调试模式下有效）
                configShareWithoutSignature();
            });
    }

    // ==================== 新版分享接口 ====================
    function configNewShare() {
        // 分享给朋友
        wx.updateAppMessageShareData({
            title: SHARE_CONFIG.title,
            desc: SHARE_CONFIG.desc,
            link: SHARE_CONFIG.link,
            imgUrl: SHARE_CONFIG.imgUrl,
            success: function () {
                console.log('[WeChat Share] 分享给朋友配置成功');
            },
        });

        // 分享到朋友圈
        wx.updateTimelineShareData({
            title: SHARE_CONFIG.title + ' · ' + SHARE_CONFIG.desc,
            link: SHARE_CONFIG.link,
            imgUrl: SHARE_CONFIG.imgUrl,
            success: function () {
                console.log('[WeChat Share] 分享到朋友圈配置成功');
            },
        });
    }

    // ==================== 旧版分享接口（兼容 6.7.2 以下） ====================
    function configLegacyShare() {
        // 分享给朋友
        wx.onMenuShareAppMessage({
            title: SHARE_CONFIG.title,
            desc: SHARE_CONFIG.desc,
            link: SHARE_CONFIG.link,
            imgUrl: SHARE_CONFIG.imgUrl,
            type: SHARE_CONFIG.type,
            dataUrl: SHARE_CONFIG.dataUrl,
            success: function () {
                console.log('[WeChat Share] 分享给朋友成功');
            },
        });

        // 分享到朋友圈
        wx.onMenuShareTimeline({
            title: SHARE_CONFIG.title + ' · ' + SHARE_CONFIG.desc,
            link: SHARE_CONFIG.link,
            imgUrl: SHARE_CONFIG.imgUrl,
            success: function () {
                console.log('[WeChat Share] 分享到朋友圈成功');
            },
        });
    }

    // ==================== 无签名降级（仅设置 meta） ====================
    function configShareWithoutSignature() {
        console.log('[WeChat Share] 降级模式：仅使用 meta 标签');
        // meta 标签已在 HTML 中设置，微信会自动读取
        // 但自定义分享卡片需要 JSSDK 签名，这里无法实现
    }

    // ==================== 非微信浏览器的原生分享 ====================
    function initNativeShare() {
        if (navigator.share) {
            // 创建分享按钮（可选）
            const shareBtn = document.createElement('div');
            shareBtn.style.cssText = `
                position: fixed; bottom: 80px; left: 50%; transform: translateX(-50%);
                padding: 0.6rem 1.5rem; background: rgba(212,117,107,0.9); color: #fff;
                border-radius: 25px; font-size: 0.85rem; z-index: 99; cursor: pointer;
                box-shadow: 0 4px 15px rgba(212,117,107,0.3); display: none;
            `;
            shareBtn.textContent = '分享请柬';
            shareBtn.id = 'native-share-btn';
            document.body.appendChild(shareBtn);

            shareBtn.addEventListener('click', async () => {
                try {
                    await navigator.share({
                        title: SHARE_CONFIG.title,
                        text: SHARE_CONFIG.desc,
                        url: SHARE_CONFIG.link,
                    });
                } catch (err) {
                    // 用户取消分享，不需要处理
                }
            });

            // 延迟显示
            setTimeout(() => {
                shareBtn.style.display = 'block';
            }, 3000);
        }
    }

    // ==================== 禁用微信字体大小调整 ====================
    function disableWeChatFontResize() {
        if (typeof WeixinJSBridge === 'object' && typeof WeixinJSBridge.invoke === 'function') {
            WeixinJSBridge.invoke('setFontSizeCallback', { fontSize: 0 });
            WeixinJSBridge.on('menu:setfont', function () {
                WeixinJSBridge.invoke('setFontSizeCallback', { fontSize: 0 });
            });
        } else {
            document.addEventListener('WeixinJSBridgeReady', function () {
                WeixinJSBridge.invoke('setFontSizeCallback', { fontSize: 0 });
                WeixinJSBridge.on('menu:setfont', function () {
                    WeixinJSBridge.invoke('setFontSizeCallback', { fontSize: 0 });
                });
            }, false);
        }
    }

    // ==================== 禁用双指缩放（全局手势拦截） ====================
    function disablePinchZoom() {
        // 阻止多指触摸缩放
        document.addEventListener('gesturestart', function (e) {
            e.preventDefault();
        });

        document.addEventListener('gesturechange', function (e) {
            e.preventDefault();
        });

        document.addEventListener('gestureend', function (e) {
            e.preventDefault();
        });

        // 拦截双指 touchstart（仅在 >1 触摸点时阻止默认缩放行为）
        document.addEventListener('touchstart', function (e) {
            if (e.touches.length > 1) {
                e.preventDefault();
            }
        }, { passive: false });

        // 拦截双击缩放
        let lastTouchEnd = 0;
        document.addEventListener('touchend', function (e) {
            const now = Date.now();
            if (now - lastTouchEnd <= 300) {
                e.preventDefault();
            }
            lastTouchEnd = now;
        }, { passive: false });

        // iOS Safari 双指缩放拦截
        document.addEventListener('touchmove', function (e) {
            if (e.touches.length > 1) {
                e.preventDefault();
            }
        }, { passive: false });
    }

    // ==================== 初始化 ====================
    function init() {
        disablePinchZoom();
        disableWeChatFontResize();
        initWeChatShare();
        initNativeShare();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // ==================== 导出配置（方便动态修改） ====================
    window.WeddingShare = {
        config: SHARE_CONFIG,
        update: function (newConfig) {
            Object.assign(SHARE_CONFIG, newConfig);
            // 重新配置微信分享
            if (typeof wx !== 'undefined' && isWeChatBrowser()) {
                configNewShare();
                configLegacyShare();
            }
        },
    };

})();
