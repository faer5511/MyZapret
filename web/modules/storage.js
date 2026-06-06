const Storage = {
    get(key, defaultValue = null) {
        try {
            const value = localStorage.getItem(key);
            return value ? JSON.parse(value) : defaultValue;
        } catch {
            return defaultValue;
        }
    },

    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch {
            return false;
        }
    },

    remove(key) {
        localStorage.removeItem(key);
    },

    clear() {
        localStorage.clear();
    },

    getFavorites() {
        return this.get('favorites', []);
    },

    addFavorite(profile) {
        const favorites = this.getFavorites();
        if (!favorites.includes(profile)) {
            favorites.push(profile);
            this.set('favorites', favorites);
        }
        return favorites;
    },

    removeFavorite(profile) {
        let favorites = this.getFavorites();
        favorites = favorites.filter(f => f !== profile);
        this.set('favorites', favorites);
        return favorites;
    },

    toggleFavorite(profile) {
        const favorites = this.getFavorites();
        if (favorites.includes(profile)) {
            return this.removeFavorite(profile);
        } else {
            return this.addFavorite(profile);
        }
    },

    getTheme() {
        return this.get('theme', 'dark');
    },

    setTheme(theme) {
        this.set('theme', theme);
    },

    getSessionStats() {
        const today = new Date().toDateString();
        const saved = this.get('sessionStats', {});
        if (saved.date !== today) {
            return { date: today, launchCount: 0, traffic: 0, seconds: 0 };
        }
        return saved;
    },

    updateSessionStats(updates) {
        const stats = this.getSessionStats();
        Object.assign(stats, updates, { date: new Date().toDateString() });
        this.set('sessionStats', stats);
        return stats;
    },

    getEventLogs() {
        return this.get('eventLogs', []);
    },

    addEventLog(entry) {
        const logs = this.getEventLogs();
        logs.unshift({ ...entry, timestamp: new Date().toLocaleTimeString() });
        if (logs.length > 500) logs.pop();
        this.set('eventLogs', logs);
        return logs;
    },

    clearEventLogs() {
        this.set('eventLogs', []);
    }
};