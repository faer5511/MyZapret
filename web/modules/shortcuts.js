const Shortcuts = {
    init() {
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.shiftKey && e.key === 'P') {
                e.preventDefault();
                Network.toggleConnection();
            }

            if (e.ctrlKey && e.shiftKey && e.key === 'ArrowLeft') {
                e.preventDefault();
                Network.prevProfile();
            }

            if (e.ctrlKey && e.shiftKey && e.key === 'ArrowRight') {
                e.preventDefault();
                Network.nextProfile();
            }

            if (e.ctrlKey && e.shiftKey && e.key === 'L') {
                e.preventDefault();
                if (confirm('Очистить лог событий?')) {
                    Storage.clearEventLogs();
                    UI.systemLogs = [];
                    UI.renderLogs();
                    UI.showToast('Лог очищен', 'История событий удалена', 'info');
                }
            }

            if (!isNaN(parseInt(e.key)) && e.key >= '1' && e.key <= '9') {
                const filtered = Network.profiles.filter(p => {
                    const m = p.match(/ALT(\d+)/i);
                    return m && parseInt(m[1]) >= 1 && parseInt(m[1]) <= 12;
                }).sort((a, b) => {
                    const getNum = (f) => parseInt(f.match(/ALT(\d+)/i)[1], 10);
                    return getNum(a) - getNum(b);
                });
                const idx = parseInt(e.key) - 1;
                if (filtered[idx]) Network.switchProfile(filtered[idx]);
            }
        });
    }
};