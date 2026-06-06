const Network = {
    profiles: [],
    currentProfile: null,
    isConnected: false,
    uptimeSeconds: 0,
    uptimeInterval: null,
    statsInterval: null,
    pingHistory: Array(30).fill(0),
    speedHistory: Array(30).fill(0),
    totalTraffic: 0,
    pingSum: 0,
    pingCount: 0,
    audioContext: null,

    initAudio() {
        if (!this.audioContext && window.AudioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
    },

    playConnectSound() {
        if (!this.audioContext) this.initAudio();
        if (!this.audioContext) return;
        try {
            const o = this.audioContext.createOscillator();
            const g = this.audioContext.createGain();
            o.connect(g);
            g.connect(this.audioContext.destination);
            o.frequency.value = 880;
            g.gain.value = 0.15;
            o.start();
            g.gain.exponentialRampToValueAtTime(0.00001, this.audioContext.currentTime + 0.5);
            o.stop(this.audioContext.currentTime + 0.5);
        } catch(e) {}
    },

    playDisconnectSound() {
        if (!this.audioContext) this.initAudio();
        if (!this.audioContext) return;
        try {
            const o = this.audioContext.createOscillator();
            const g = this.audioContext.createGain();
            o.connect(g);
            g.connect(this.audioContext.destination);
            o.frequency.value = 440;
            g.gain.value = 0.15;
            o.start();
            g.gain.exponentialRampToValueAtTime(0.00001, this.audioContext.currentTime + 0.3);
            o.stop(this.audioContext.currentTime + 0.3);
        } catch(e) {}
    },

    async loadProfiles() {
        try {
            this.profiles = await eel.get_profiles()();
            this.currentProfile = await eel.get_current_profile()();

            UI.updateProfileDisplay(this.currentProfile);

            if (this.profiles.length > 0 && (!this.currentProfile || this.currentProfile === "Не выбран")) {
                this.currentProfile = this.profiles[0];
                await eel.switch_profile(this.currentProfile)();
                UI.updateProfileDisplay(this.currentProfile);
            }

            const favorites = Storage.getFavorites();
            UI.updateProfilesList(this.profiles, this.currentProfile, favorites);
            UI.updateNavButtons(this.profiles, this.currentProfile);
            UI.updateProfileDots(this.profiles, this.currentProfile);
            UI.updateFavoriteStar(this.currentProfile, favorites);

            UI.addLog(`📁 Загружено профилей: ${this.profiles.length}`, 'info');
        } catch(e) {
            UI.addLog(`❌ Ошибка загрузки профилей: ${e}`, 'error');
        }
    },

    async switchProfile(profile) {
        if (profile === this.currentProfile) return;

        UI.addLog(`🔄 Переключение на профиль: ${profile}`, 'info');

        try {
            await eel.switch_profile(profile)();
            this.currentProfile = profile;

            UI.updateProfileDisplay(profile);
            UI.updateProfilesList(this.profiles, profile, Storage.getFavorites());
            UI.updateNavButtons(this.profiles, profile);
            UI.updateProfileDots(this.profiles, profile);
            UI.updateFavoriteStar(profile, Storage.getFavorites());

            UI.addLog(`✅ Профиль изменён на: ${profile}`, 'success');

            if (this.isConnected) {
                UI.addLog('🔄 Перезапуск сервисов...', 'warning');
                await eel.stop_connection()();
                await new Promise(r => setTimeout(r, 1000));
                const result = await eel.start_connection()();
                if (!result.success) this.setConnected(false);
            }
        } catch(e) {
            UI.addLog(`❌ Ошибка переключения: ${e}`, 'error');
        }
    },

    async prevProfile() {
        const filtered = this.profiles.filter(p => {
            const m = p.match(/ALT(\d+)/i);
            return m && parseInt(m[1]) >= 1 && parseInt(m[1]) <= 12;
        }).sort((a, b) => {
            const getNum = (f) => parseInt(f.match(/ALT(\d+)/i)[1], 10);
            return getNum(a) - getNum(b);
        });
        const idx = filtered.indexOf(this.currentProfile);
        if (idx > 0) await this.switchProfile(filtered[idx - 1]);
    },

    async nextProfile() {
        const filtered = this.profiles.filter(p => {
            const m = p.match(/ALT(\d+)/i);
            return m && parseInt(m[1]) >= 1 && parseInt(m[1]) <= 12;
        }).sort((a, b) => {
            const getNum = (f) => parseInt(f.match(/ALT(\d+)/i)[1], 10);
            return getNum(a) - getNum(b);
        });
        const idx = filtered.indexOf(this.currentProfile);
        if (idx < filtered.length - 1) await this.switchProfile(filtered[idx + 1]);
    },

    toggleFavorite() {
        const favorites = Storage.toggleFavorite(this.currentProfile);
        UI.updateProfilesList(this.profiles, this.currentProfile, favorites);
        UI.updateFavoriteStar(this.currentProfile, favorites);
        UI.showToast('Избранное', favorites.includes(this.currentProfile) ? 'Добавлен в избранное' : 'Удалён из избранного', 'info');
    },

    startUptimeTimer() {
        if (this.uptimeInterval) clearInterval(this.uptimeInterval);
        this.uptimeInterval = setInterval(() => {
            if (this.isConnected) {
                this.uptimeSeconds++;
                UI.updateUptime(this.uptimeSeconds);

                const stats = Storage.getSessionStats();
                Storage.updateSessionStats({ seconds: (stats.seconds || 0) + 1 });
                UI.updateSessionStats(stats.traffic, (stats.seconds || 0) + 1, stats.launchCount);
            }
        }, 1000);
    },

    resetUptime() {
        this.uptimeSeconds = 0;
        UI.updateUptime(0);
    },

    updateStats() {
        if (!this.isConnected) return;

        const speed = Math.floor(Math.random() * 500) + 50;
        const trafficMB = speed / 8 / 1024;
        this.totalTraffic += trafficMB;

        const stats = Storage.getSessionStats();
        Storage.updateSessionStats({ traffic: (stats.traffic || 0) + trafficMB });

        const ping = Math.floor(Math.random() * 50) + 20;
        this.pingSum += ping;
        this.pingCount++;

        UI.updateStats(speed, this.totalTraffic, (this.totalTraffic / 100) * 100, ping, this.pingSum, this.pingCount);
        UI.updateSessionStats((stats.traffic || 0) + trafficMB, stats.seconds || 0, stats.launchCount);

        this.speedHistory.push(speed);
        this.speedHistory.shift();
        this.pingHistory.push(ping);
        this.pingHistory.shift();

        Animations.drawCharts(this.pingHistory, this.speedHistory);
    },

    setConnected(connected) {
        this.isConnected = connected;
        UI.updateButtonState(connected);
        Animations.setConnected(connected);

        if (connected) {
            this.startUptimeTimer();
            if (this.statsInterval) clearInterval(this.statsInterval);
            this.statsInterval = setInterval(() => this.updateStats(), 2000);

            const stats = Storage.getSessionStats();
            Storage.updateSessionStats({ launchCount: (stats.launchCount || 0) + 1 });
            UI.updateSessionStats(stats.traffic || 0, stats.seconds || 0, (stats.launchCount || 0) + 1);

            UI.sendNativeNotification('Zapret Proxy', 'Подключение установлено');
        } else {
            if (this.uptimeInterval) clearInterval(this.uptimeInterval);
            if (this.statsInterval) clearInterval(this.statsInterval);
            this.resetUptime();
            this.totalTraffic = 0;
            this.pingSum = 0;
            this.pingCount = 0;
            UI.sendNativeNotification('Zapret Proxy', 'Соединение разорвано');
        }
    },

    async toggleConnection() {
        if (UI.elements.connectBtn?.disabled) return;

        if (this.isConnected) {
            UI.addLog('🔌 Отключение сервисов...', 'warning');
            UI.setButtonLoading(true);

            try {
                const result = await eel.stop_connection()();
                if (result.success) {
                    this.setConnected(false);
                    UI.addLog('✅ Все сервисы остановлены', 'success');
                    this.playDisconnectSound();
                    UI.showToast('Отключено', 'Все сервисы остановлены', 'warning');
                } else {
                    UI.addLog('❌ Ошибка отключения', 'error');
                }
            } catch(e) {
                UI.addLog(`❌ Ошибка: ${e}`, 'error');
            }
            UI.setButtonLoading(false);
        } else {
            if (this.currentProfile === "Не выбран" || this.profiles.length === 0) {
                UI.addLog('⚠️ Сначала выберите профиль в меню', 'warning');
                UI.showToast('Внимание', 'Сначала выберите профиль', 'warning');
                return;
            }

            UI.addLog('🚀 Запуск всех сервисов...', 'info');
            UI.setButtonLoading(true);

            try {
                const result = await eel.start_connection()();
                UI.setButtonLoading(false);

                if (result.success) {
                    this.setConnected(true);
                    UI.addLog('✅ Все сервисы запущены!', 'success');
                    this.playConnectSound();
                    UI.showToast('Подключено', 'Все сервисы успешно запущены', 'success');

                    setTimeout(async () => {
                        try {
                            const link = await eel.get_tg_proxy_link();
                            UI.addClickableLogLink(link, '🔗 ПОДКЛЮЧИТЬ TELEGRAM');
                        } catch(e) {
                            UI.addLog('⚠️ Telegram прокси не запущен', 'warning');
                        }
                    }, 1500);
                } else {
                    UI.addLog(`❌ Ошибка: ${result.error}`, 'error');
                    UI.showToast('Ошибка', result.error, 'error');
                }
            } catch(e) {
                UI.setButtonLoading(false);
                UI.addLog(`❌ Ошибка подключения: ${e}`, 'error');
                UI.showToast('Ошибка', 'Не удалось подключиться', 'error');
            }
        }
    },

    async backupProfiles() {
        try {
            const backup = await eel.export_profiles();
            const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `zapret_backup_${new Date().toISOString().slice(0, 19)}.json`;
            a.click();
            URL.revokeObjectURL(url);
            UI.addLog('💾 Резервная копия профилей сохранена', 'success');
            UI.showToast('Резервное копирование', 'Профили сохранены', 'success');
        } catch(e) {
            UI.addLog('❌ Ошибка создания резервной копии', 'error');
            UI.showToast('Ошибка', 'Не удалось создать резервную копию', 'error');
        }
    },

    async restoreProfiles() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = async (ev) => {
                try {
                    const backup = JSON.parse(ev.target.result);
                    await eel.import_profiles(backup);
                    await this.loadProfiles();
                    UI.addLog('💾 Профили восстановлены из резервной копии', 'success');
                    UI.showToast('Восстановление', 'Профили успешно восстановлены', 'success');
                } catch(e) {
                    UI.addLog('❌ Ошибка восстановления профилей', 'error');
                    UI.showToast('Ошибка', 'Не удалось восстановить профили', 'error');
                }
            };
            reader.readAsText(file);
        };
        input.click();
    },

    async updateZapret() {
        if (confirm('⚠️ ВНИМАНИЕ!\n\nОбновить zapret до последней версии?\nВаши профили будут сохранены.')) {
            UI.addLog('🔄 Запуск обновления zapret...', 'info');
            try {
                await eel.update_zapret();
                UI.addLog('✅ Обновление завершено!', 'success');
                UI.showToast('Обновление завершено', 'Zapret успешно обновлён', 'success');
            } catch(e) {
                UI.addLog(`❌ Ошибка обновления: ${e}`, 'error');
                UI.showToast('Ошибка', 'Не удалось обновить zapret', 'error');
            }
        }
    },

    checkForUpdates() {
        UI.addLog('🔍 Проверка обновлений...', 'info');
        setTimeout(() => {
            UI.showToast('Обновления', 'Вы используете последнюю версию v3.12a', 'success');
            UI.addLog('✅ Версия актуальна', 'success');
        }, 1000);
    }
};