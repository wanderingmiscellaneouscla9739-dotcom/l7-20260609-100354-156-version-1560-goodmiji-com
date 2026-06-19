(function () {
    'use strict';

    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function initMobileMenu() {
        var button = document.querySelector('[data-mobile-menu-button]');
        var menu = document.querySelector('[data-mobile-menu]');
        if (!button || !menu) {
            return;
        }
        button.addEventListener('click', function () {
            menu.classList.toggle('is-open');
        });
    }

    function initHeroSlider() {
        var slider = document.querySelector('[data-hero-slider]');
        if (!slider) {
            return;
        }
        var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
        var prev = slider.querySelector('[data-hero-prev]');
        var next = slider.querySelector('[data-hero-next]');
        var current = 0;
        var timer = null;

        function show(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5000);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        if (prev) {
            prev.addEventListener('click', function () {
                show(current - 1);
                start();
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                show(current + 1);
                start();
            });
        }
        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-hero-dot')) || 0);
                start();
            });
        });
        slider.addEventListener('mouseenter', stop);
        slider.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    function initFilters() {
        var grid = document.querySelector('[data-filter-grid]');
        if (!grid) {
            return;
        }
        var input = document.querySelector('[data-filter-input]');
        var yearSelect = document.querySelector('[data-filter-year]');
        var typeSelect = document.querySelector('[data-filter-type]');
        var countNode = document.querySelector('[data-result-count]');
        var noResults = document.querySelector('[data-no-results]');
        var cards = Array.prototype.slice.call(grid.querySelectorAll('[data-card]'));
        var params = new URLSearchParams(window.location.search);
        var query = params.get('q');

        if (query && input) {
            input.value = query;
        }

        function matches(card) {
            var q = normalize(input ? input.value : '');
            var year = yearSelect ? yearSelect.value : '';
            var type = typeSelect ? typeSelect.value : '';
            var haystack = normalize([
                card.getAttribute('data-title'),
                card.getAttribute('data-region'),
                card.getAttribute('data-type'),
                card.getAttribute('data-year'),
                card.getAttribute('data-tags'),
                card.getAttribute('data-category')
            ].join(' '));
            var yearOk = !year || card.getAttribute('data-year') === year;
            var typeOk = !type || card.getAttribute('data-type') === type;
            var queryOk = !q || haystack.indexOf(q) !== -1;
            return yearOk && typeOk && queryOk;
        }

        function applyFilters() {
            var visible = 0;
            cards.forEach(function (card) {
                var shouldShow = matches(card);
                card.hidden = !shouldShow;
                if (shouldShow) {
                    visible += 1;
                }
            });
            if (countNode) {
                countNode.textContent = visible + ' 部影片';
            }
            if (noResults) {
                noResults.hidden = visible !== 0;
            }
        }

        [input, yearSelect, typeSelect].forEach(function (control) {
            if (control) {
                control.addEventListener('input', applyFilters);
                control.addEventListener('change', applyFilters);
            }
        });
        applyFilters();
    }

    function loadScript(src) {
        return new Promise(function (resolve, reject) {
            var existing = document.querySelector('script[src="' + src + '"]');
            if (existing) {
                if (window.Hls) {
                    resolve();
                } else {
                    existing.addEventListener('load', resolve, { once: true });
                    existing.addEventListener('error', reject, { once: true });
                }
                return;
            }
            var script = document.createElement('script');
            script.src = src;
            script.async = true;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    function initPlayers() {
        var cards = Array.prototype.slice.call(document.querySelectorAll('[data-player-card]'));
        cards.forEach(function (card) {
            var video = card.querySelector('video[data-hls-src]');
            var button = card.querySelector('[data-player-start]');
            var note = card.querySelector('[data-player-note]');
            if (!video || !button) {
                return;
            }
            var source = video.getAttribute('data-hls-src');
            var started = false;

            function setNote(message) {
                if (note) {
                    note.textContent = message;
                }
            }

            function playNative() {
                video.src = source;
                video.play().catch(function () {
                    setNote('浏览器已加载播放源，请再次点击播放器开始播放。');
                });
            }

            function playWithHls() {
                var hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(source);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    video.play().catch(function () {
                        setNote('播放源已就绪，请再次点击播放器开始播放。');
                    });
                });
                hls.on(window.Hls.Events.ERROR, function (event, data) {
                    if (data && data.fatal) {
                        setNote('播放源加载失败，请刷新页面或更换浏览器后重试。');
                    }
                });
            }

            button.addEventListener('click', function () {
                if (started) {
                    return;
                }
                started = true;
                button.classList.add('is-hidden');
                setNote('正在初始化 HLS 播放源...');
                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    playNative();
                    setNote('已使用浏览器原生 HLS 播放能力。');
                    return;
                }
                loadScript('https://cdn.jsdelivr.net/npm/hls.js@1.5.17/dist/hls.min.js')
                    .then(function () {
                        if (window.Hls && window.Hls.isSupported()) {
                            playWithHls();
                            setNote('HLS 播放源已加载，正在播放。');
                        } else {
                            started = false;
                            button.classList.remove('is-hidden');
                            setNote('当前浏览器暂不支持 HLS 播放，请尝试使用 Chrome、Edge 或 Safari。');
                        }
                    })
                    .catch(function () {
                        started = false;
                        button.classList.remove('is-hidden');
                        setNote('HLS 播放器脚本加载失败，请检查网络后重试。');
                    });
            });
        });
    }

    ready(function () {
        initMobileMenu();
        initHeroSlider();
        initFilters();
        initPlayers();
    });
}());
