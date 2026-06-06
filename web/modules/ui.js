const UI = {
    elements: {},
    isConnected: false,
    logExpanded: true,
    currentLogTab: 'events',
    systemLogs: [],
    logDebounceTimer: null,

    init() {
        this.cacheElements();
        this.applyTheme();
        this.initThemeToggle();
        this.initLogToggle();
        this.initCopyLog();
        this.initExportLogs();
        this.initClearLogs();
        this.initResetSettings();
        this.initProfileSearch();
        this.initFavoriteBtn();
        this.initMenuEvents();
    },

    cacheElements() {
        const ids = ['connectBtn', 'indicator', 'statusText', 'menuStatus', 'headerStatus',
                     'currentProfile', 'menuProfile', 'logContent', 'profilesList', 'profileDots',
                     'prevBtn', 'nextBtn', 'speedValue', 'trafficValue', 'trafficProgress',
                     'uptimeValue', 'pingValue', 'todayTraffic', 'todayTime', 'launchCount',
                     'avgPing', 'favoriteBtn', 'profileSearch', 'copyLogBtn', 'exportLogsBtn',
                     'clearLogsBtn', 'resetSettingsBtn', 'themeToggle', 'logToggle'];
        ids.forEach(id => {
            this.elements[id] = document.getElementById(id);
        });
    },

    applyTheme() {
        const theme = Storage.getTheme();
        const root = document.documentElement;

        if (theme === 'light') {
            root.style.setProperty('--bg-primary', '#f5f5f5');
            root.style.setProperty('--bg-secondary', '#ffffff');
            root.style.setProperty('--bg-tertiary', '#e8e8e8');
            root.style.setProperty('--text-primary', '#1a1a1a');
            root.style.setProperty('--text-secondary', '#666666');
            root.style.setProperty('--text-muted', '#999999');
            root.style.setProperty('--glass-bg', 'rgba(0,0,0,0.03)');
            root.style.setProperty('--glass-border', 'rgba(0,0,0,0.08)');
            if (this.elements.themeToggle) this.elements.themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
        } else {
            root.style.setProperty('--bg-primary', '#0a0a0f');
            root.style.setProperty('--bg-secondary', '#12121a');
            root.style.setProperty('--bg-tertiary', '#1a1a2a');
            root.style.setProperty('--text-primary', '#ffffff');
            root.style.setProperty('--text-secondary', '#a0a0b0');
            root.style.setProperty('--text-muted', '#6b6b7a');
            root.style.setProperty('--glass-bg', 'rgba(255,255,255,0.03)');
            root.style.setProperty('--glass-border', 'rgba(255,255,255,0.05)');
            if (this.elements.themeToggle) this.elements.themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
        }
    },

    initThemeToggle() {
        if (this.elements.themeToggle) {
            this.elements.themeToggle.onclick = () => {
                const newTheme = Storage.getTheme() === 'dark' ? 'light' : 'dark';
                Storage.setTheme(newTheme);
                this.applyTheme();
                this.showToast('Тема изменена', `${newTheme === 'dark' ? 'Тёмная' : 'Светлая'} тема`, 'success');
            };
        }
    },

    initLogToggle() {
        if (this.elements.logToggle) {
            this.elements.logToggle.onclick = () => {
                const logContainer = document.querySelector('.log-content');
                if (logContainer) {
                    if (this.logExpanded) {
                        logContainer.classList.add('collapsed');
                        this.elements.logToggle.innerHTML = '<i class="fas fa-chevron-down"></i>';
                    } else {
                        logContainer.classList.remove('collapsed');
                        this.elements.logToggle.innerHTML = '<i class="fas fa-chevron-up"></i>';
                    }
                    this.logExpanded = !this.logExpanded;
                }
            };
        }
    },

    initCopyLog() {
        if (this.elements.copyLogBtn) {
            this.elements.copyLogBtn.onclick = async () => {
                const logs = this.currentLogTab === 'events' ? Storage.getEventLogs() : this.systemLogs;
                if (logs.length === 0) {
                    this.showToast('Лог пуст', 'Нечего копировать', 'warning');
                    return;
                }
                const text = logs.map(l => `[${l.timestamp}] ${l.message}`).join('\n');
                try {
                    await navigator.clipboard.writeText(text);
                    this.showToast('Скопировано', 'Лог скопирован в буфер обмена', 'success');
                } catch {
                    this.showToast('Ошибка', 'Не удалось скопировать лог', 'error');
                }
            };
        }
    },

    initExportLogs() {
        if (this.elements.exportLogsBtn) {
            this.elements.exportLogsBtn.onclick = () => {
                const logs = this.currentLogTab === 'events' ? Storage.getEventLogs() : this.systemLogs;
                if (logs.length === 0) {
                    this.showToast('Лог пуст', 'Нечего экспортировать', 'warning');
                    return;
                }
                const text = logs.map(l => `[${l.timestamp}] ${l.message}`).join('\n');
                const blob = new Blob([text], { type: 'text/plain' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `zapret_log_${new Date().toISOString().slice(0, 19)}.txt`;
                a.click();
                URL.revokeObjectURL(url);
                this.showToast('Экспорт', 'Лог сохранён в файл', 'success');
            };
        }
    },

    initClearLogs() {
        if (this.elements.clearLogsBtn) {
            this.elements.clearLogsBtn.onclick = () => {
                if (confirm('Очистить лог событий?')) {
                    Storage.clearEventLogs();
                    this.systemLogs = [];
                    this.renderLogs();
                    this.showToast('Лог очищен', 'История событий удалена', 'info');
                }
            };
        }
    },

    initResetSettings() {
        if (this.elements.resetSettingsBtn) {
            this.elements.resetSettingsBtn.onclick = () => {
                if (confirm('⚠️ ВНИМАНИЕ!\n\nСбросить все настройки?\nБудут удалены: логи, избранное, тема, статистика сессии.')) {
                    Storage.clear();
                    window.location.reload();
                }
            };
        }
    },

    initProfileSearch() {
        if (this.elements.profileSearch) {
            this.elements.profileSearch.addEventListener('input', () => {
                if (window.updateProfilesList) window.updateProfilesList();
            });
        }
    },

    initFavoriteBtn() {
        if (this.elements.favoriteBtn) {
            this.elements.favoriteBtn.onclick = () => {
                if (window.currentProfile && window.toggleFavorite) {
                    window.toggleFavorite();
                }
            };
        }
    },

    initMenuEvents() {
        const menuOverlay = document.getElementById('menuOverlay');
        const menuBtn = document.getElementById('menuBtn');
        const menuClose = document.getElementById('menuClose');
        const mainContent = document.getElementById('mainContent');

        const toggleMenu = () => {
            if (menuOverlay) {
                menuOverlay.classList.toggle('active');
                if (menuOverlay.classList.contains('active')) {
                    document.body.classList.add('menu-open');
                    if (mainContent) mainContent.style.overflowY = 'hidden';
                } else {
                    document.body.classList.remove('menu-open');
                    if (mainContent) mainContent.style.overflowY = 'auto';
                }
            }
        };

        const closeMenu = () => {
            if (menuOverlay) {
                menuOverlay.classList.remove('active');
                document.body.classList.remove('menu-open');
                if (mainContent) mainContent.style.overflowY = 'auto';
            }
        };

        if (menuBtn) menuBtn.onclick = toggleMenu;
        if (menuClose) menuClose.onclick = closeMenu;
        if (menuOverlay) {
            menuOverlay.addEventListener('click', (e) => {
                if (e.target === menuOverlay) closeMenu();
            });
        }

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') closeMenu();
        });
    },

    initLogTabs() {
        document.querySelectorAll('.log-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                this.currentLogTab = tab.dataset.tab;
                document.querySelectorAll('.log-tab').forEach(t => {
                    t.classList.toggle('active', t.dataset.tab === this.currentLogTab);
                });
                this.renderLogs();
            });
        });
    },

    renderLogs() {
        if (!this.elements.logContent) return;
        if (this.logDebounceTimer) clearTimeout(this.logDebounceTimer);

        this.logDebounceTimer = setTimeout(() => {
            let logs = this.currentLogTab === 'events' ? Storage.getEventLogs() : this.systemLogs;

            if (logs.length === 0) {
                this.elements.logContent.innerHTML = `<div class="log-empty"><i class="fas fa-${this.currentLogTab === 'events' ? 'terminal' : 'microchip'}"></i><p>${this.currentLogTab === 'events' ? 'Лог событий пуст' : 'Системный лог пуст'}</p></div>`;
                return;
            }

            const html = logs.slice(0, 200).map(log => {
                if (log.type === 'link') {
                    return `<div class="log-entry"><span class="log-time">[${log.timestamp}]</span><div class="log-message">🔗 <a href="${log.link}" target="_blank">${this.escapeHtml(log.message || log.link)}</a></div></div>`;
                }
                const emoji = log.level === 'error' ? '❌' : log.level === 'warning' ? '⚠️' : log.level === 'success' ? '✅' : '🟢';
                return `<div class="log-entry"><span class="log-time">[${log.timestamp}]</span><div class="log-message">${emoji} ${this.escapeHtml(log.message)}</div></div>`;
            }).join('');

            this.elements.logContent.innerHTML = html;
            this.elements.logContent.scrollTop = 0;
        }, 50);
    },

    addLog(message, level = 'info') {
        Storage.addEventLog({ message, level, type: 'event' });
        if (this.currentLogTab === 'events') this.renderLogs();
    },

    addSystemLog(message, level = 'info') {
        this.systemLogs.unshift({ timestamp: new Date().toLocaleTimeString(), message, level });
        if (this.systemLogs.length > 500) this.systemLogs.pop();
        if (this.currentLogTab === 'system') this.renderLogs();
    },

    addClickableLogLink(link, message) {
        Storage.addEventLog({ message, link, type: 'link' });
        if (this.currentLogTab === 'events') this.renderLogs();
    },

    showToast(title, message, type = 'info') {
        const container = document.getElementById('toastContainer');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        const icons = { success: '✅', error: '❌', warning: '⚠️', info: '🔔' };

        toast.innerHTML = `<div class="toast-icon">${icons[type] || '🔔'}</div><div class="toast-content"><div class="toast-title">${this.escapeHtml(title)}</div><div class="toast-message">${this.escapeHtml(message)}</div></div>`;
        container.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    },

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    updateButtonState(isConnected) {
        this.isConnected = isConnected;
        const btn = this.elements.connectBtn;
        if (!btn) return;

        btn.classList.remove('active', 'inactive');

        if (isConnected) {
            btn.classList.add('active');
            btn.innerHTML = `<div class="btn-glow"></div><i class="fas fa-check-circle"></i><span>ПОДКЛЮЧЕНО</span>`;
            if (this.elements.indicator) this.elements.indicator.style.background = '#10b981';
            if (this.elements.statusText) {
                this.elements.statusText.textContent = 'Активно (YouTube + Telegram)';
                this.elements.statusText.style.color = '#10b981';
            }
            if (this.elements.menuStatus) this.elements.menuStatus.innerHTML = '<span class="status-badge online">Активен</span>';
            if (this.elements.headerStatus) this.elements.headerStatus.classList.add('active');
        } else {
            btn.classList.add('inactive');
            btn.innerHTML = `<div class="btn-glow"></div><i class="fas fa-plug"></i><span>ПОДКЛЮЧИТЬ</span>`;
            if (this.elements.indicator) this.elements.indicator.style.background = '#dc2626';
            if (this.elements.statusText) {
                this.elements.statusText.textContent = 'Отключено';
                this.elements.statusText.style.color = '#a0a0b0';
            }
            if (this.elements.menuStatus) this.elements.menuStatus.innerHTML = '<span class="status-badge offline">Остановлен</span>';
            if (this.elements.headerStatus) this.elements.headerStatus.classList.remove('active');
        }
        btn.disabled = false;
    },

    setButtonLoading(loading) {
        const btn = this.elements.connectBtn;
        if (!btn) return;

        if (loading) {
            btn.disabled = true;
            btn.classList.remove('active', 'inactive');
            btn.innerHTML = `<div class="btn-glow"></div><i class="fas fa-spinner fa-spin"></i><span>ЗАПУСК...</span>`;
        } else {
            this.updateButtonState(this.isConnected);
        }
    },

    updateProfilesList(profiles, currentProfile, favorites) {
        if (!this.elements.profilesList) return;

        let filtered = profiles.filter(p => {
            const match = p.match(/ALT(\d+)/i);
            return match && parseInt(match[1]) >= 1 && parseInt(match[1]) <= 12;
        }).sort((a, b) => {
            const getNum = (f) => parseInt(f.match(/ALT(\d+)/i)[1], 10);
            return getNum(a) - getNum(b);
        });

        const searchValue = this.elements.profileSearch?.value?.toLowerCase();
        if (searchValue) {
            filtered = filtered.filter(p => p.toLowerCase().includes(searchValue));
        }

        this.elements.profilesList.innerHTML = filtered.map(profile => `
            <div class="profile-item ${profile === currentProfile ? 'active' : ''} ${favorites.includes(profile) ? 'favorite' : ''}" data-profile="${profile}">
                <span>${profile}${favorites.includes(profile) ? ' ⭐' : ''}</span>
                <span class="ping-value">ALT${parseInt(profile.match(/ALT(\d+)/i)[1], 10)}</span>
            </div>
        `).join('');

        this.elements.profilesList.querySelectorAll('.profile-item').forEach(item => {
            item.addEventListener('click', () => {
                if (window.switchProfile) window.switchProfile(item.dataset.profile);
            });
        });
    },

    updateProfileDots(profiles, currentProfile) {
        if (!this.elements.profileDots) return;

        const filtered = profiles.filter(p => {
            const match = p.match(/ALT(\d+)/i);
            return match && parseInt(match[1]) >= 1 && parseInt(match[1]) <= 12;
        }).sort((a, b) => {
            const getNum = (f) => parseInt(f.match(/ALT(\d+)/i)[1], 10);
            return getNum(a) - getNum(b);
        });

        const index = filtered.indexOf(currentProfile);
        this.elements.profileDots.innerHTML = filtered.map((_, i) => `<div class="profile-dot ${i === index ? 'active' : ''}"></div>`).join('');
    },

    updateNavButtons(profiles, currentProfile) {
        const filtered = profiles.filter(p => {
            const match = p.match(/ALT(\d+)/i);
            return match && parseInt(match[1]) >= 1 && parseInt(match[1]) <= 12;
        }).sort((a, b) => {
            const getNum = (f) => parseInt(f.match(/ALT(\d+)/i)[1], 10);
            return getNum(a) - getNum(b);
        });

        const index = filtered.indexOf(currentProfile);
        if (this.elements.prevBtn) this.elements.prevBtn.disabled = index <= 0;
        if (this.elements.nextBtn) this.elements.nextBtn.disabled = index >= filtered.length - 1;
    },

    updateFavoriteStar(currentProfile, favorites) {
        if (!this.elements.favoriteBtn) return;
        if (favorites.includes(currentProfile)) {
            this.elements.favoriteBtn.innerHTML = '<i class="fas fa-star"></i>';
            this.elements.favoriteBtn.classList.add('active');
        } else {
            this.elements.favoriteBtn.innerHTML = '<i class="far fa-star"></i>';
            this.elements.favoriteBtn.classList.remove('active');
        }
    },

    updateStats(speed, traffic, progress, ping, avgPing, totalTraffic, pingSum, pingCount) {
        if (this.elements.speedValue) this.elements.speedValue.textContent = `${speed} Kbps`;
        if (this.elements.trafficValue) this.elements.trafficValue.textContent = `${Math.floor(traffic)} MB`;
        if (this.elements.trafficProgress) this.elements.trafficProgress.style.width = `${Math.min(100, progress)}%`;
        if (this.elements.pingValue) this.elements.pingValue.textContent = `${ping} ms`;
        if (this.elements.avgPing && pingCount > 0) {
            this.elements.avgPing.textContent = `${Math.floor(pingSum / pingCount)} ms`;
        }
    },

    updateSessionStats(trafficMB, seconds, launchCount) {
        if (this.elements.todayTraffic) this.elements.todayTraffic.textContent = `${Math.floor(trafficMB)} MB`;
        if (this.elements.todayTime) {
            const h = Math.floor(seconds / 3600);
            const m = Math.floor((seconds % 3600) / 60);
            const s = seconds % 60;
            this.elements.todayTime.textContent = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
        }
        if (this.elements.launchCount) this.elements.launchCount.textContent = launchCount;
    },

    updateUptime(seconds) {
        if (this.elements.uptimeValue) {
            const h = Math.floor(seconds / 3600);
            const m = Math.floor((seconds % 3600) / 60);
            const s = seconds % 60;
            this.elements.uptimeValue.textContent = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
        }
    },

    updateProfileDisplay(profile) {
        if (this.elements.currentProfile) this.elements.currentProfile.textContent = profile || "Не выбран";
        if (this.elements.menuProfile) this.elements.menuProfile.textContent = profile || "Не выбран";
    },

    sendNativeNotification(title, body) {
        if ("Notification" in window && Notification.permission === "granted") {
            new Notification(title, { body, icon: "logo.png" });
        } else if ("Notification" in window && Notification.permission !== "denied") {
            Notification.requestPermission();
        }
    },

    hideLoader() {
        const loader = document.getElementById('loader');
        setTimeout(() => {
            if (loader) {
                loader.style.opacity = '0';
                setTimeout(() => loader.classList.add('hide'), 500);
            }
        }, 1500);
    }
};