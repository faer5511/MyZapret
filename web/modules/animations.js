const Animations = {
    particlesCanvas: null,
    particlesCtx: null,
    particles: [],
    waveCanvas: null,
    waveCtx: null,
    waveAmplitude: 10,
    animationId: null,
    isConnected: false,

    initParticles() {
        this.particlesCanvas = document.getElementById('particlesCanvas');
        if (!this.particlesCanvas) return;
        this.particlesCtx = this.particlesCanvas.getContext('2d');

        const resize = () => {
            this.particlesCanvas.width = window.innerWidth;
            this.particlesCanvas.height = window.innerHeight;
            this.particles = [];
            const count = Math.min(50, Math.floor(window.innerWidth / 30));
            for (let i = 0; i < count; i++) {
                this.particles.push({
                    x: Math.random() * this.particlesCanvas.width,
                    y: Math.random() * this.particlesCanvas.height,
                    radius: Math.random() * 2 + 1,
                    speedX: (Math.random() - 0.5) * 0.5,
                    speedY: (Math.random() - 0.5) * 0.3,
                    alpha: Math.random() * 0.3 + 0.1
                });
            }
        };

        resize();
        window.addEventListener('resize', resize);

        const animate = () => {
            if (!this.particlesCtx || !this.particlesCanvas) return;
            this.particlesCtx.clearRect(0, 0, this.particlesCanvas.width, this.particlesCanvas.height);
            this.particles.forEach(p => {
                p.x += p.speedX;
                p.y += p.speedY;
                if (p.x < 0) p.x = this.particlesCanvas.width;
                if (p.x > this.particlesCanvas.width) p.x = 0;
                if (p.y < 0) p.y = this.particlesCanvas.height;
                if (p.y > this.particlesCanvas.height) p.y = 0;
                this.particlesCtx.beginPath();
                this.particlesCtx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                this.particlesCtx.fillStyle = `rgba(220, 38, 38, ${p.alpha})`;
                this.particlesCtx.fill();
            });
            this.animationId = requestAnimationFrame(() => animate());
        };
        animate();
    },

    initWave() {
        this.waveCanvas = document.getElementById('waveCanvas');
        if (!this.waveCanvas) return;
        this.waveCtx = this.waveCanvas.getContext('2d');

        const resize = () => {
            this.waveCanvas.width = window.innerWidth;
            this.waveCanvas.height = 80;
        };
        resize();
        window.addEventListener('resize', resize);

        let time = 0;
        const draw = () => {
            if (!this.waveCtx || !this.waveCanvas) return;
            this.waveCtx.clearRect(0, 0, this.waveCanvas.width, this.waveCanvas.height);

            this.waveCtx.beginPath();
            this.waveCtx.strokeStyle = `rgba(220, 38, 38, 0.4)`;
            this.waveCtx.lineWidth = 2;
            const step = this.waveCanvas.width / 100;
            let x = 0;
            for (let i = 0; i <= 100; i++) {
                const y = this.waveCanvas.height / 2 + Math.sin(i * 0.1 + time) * this.waveAmplitude * 0.6 + Math.cos(i * 0.2 + time * 1.5) * this.waveAmplitude * 0.4;
                if (i === 0) this.waveCtx.moveTo(x, y);
                else this.waveCtx.lineTo(x, y);
                x += step;
            }
            this.waveCtx.stroke();

            this.waveCtx.beginPath();
            this.waveCtx.strokeStyle = `rgba(220, 38, 38, 0.2)`;
            this.waveCtx.lineWidth = 1.5;
            x = 0;
            for (let i = 0; i <= 100; i++) {
                const y = this.waveCanvas.height / 2 + Math.sin(i * 0.15 + time + 2) * this.waveAmplitude * 0.5 + Math.cos(i * 0.25 + time * 1.2) * this.waveAmplitude * 0.3;
                if (i === 0) this.waveCtx.moveTo(x, y);
                else this.waveCtx.lineTo(x, y);
                x += step;
            }
            this.waveCtx.stroke();

            time += 0.05;
            this.waveAmplitude = this.isConnected ? 25 + Math.sin(Date.now() * 0.005) * 5 : 10;
            requestAnimationFrame(draw);
        };
        draw();
    },

    setConnected(connected) {
        this.isConnected = connected;
    },

    drawCharts(pingHistory, speedHistory) {
        requestAnimationFrame(() => {
            const pingCanvas = document.getElementById('pingChart');
            const speedCanvas = document.getElementById('speedChart');

            if (pingCanvas && pingCanvas.parentElement) {
                const ctx = pingCanvas.getContext('2d');
                pingCanvas.width = pingCanvas.clientWidth || 60;
                pingCanvas.height = pingCanvas.clientHeight || 40;
                ctx.clearRect(0, 0, pingCanvas.width, pingCanvas.height);
                if (pingHistory && pingHistory.length > 1) {
                    ctx.beginPath();
                    ctx.strokeStyle = '#10b981';
                    ctx.lineWidth = 1.5;
                    const max = Math.max(...pingHistory, 100);
                    const step = pingCanvas.width / (pingHistory.length - 1);
                    pingHistory.forEach((p, i) => {
                        const x = i * step;
                        const y = pingCanvas.height - (p / max) * pingCanvas.height;
                        if (i === 0) ctx.moveTo(x, y);
                        else ctx.lineTo(x, y);
                    });
                    ctx.stroke();
                }
            }

            if (speedCanvas && speedCanvas.parentElement) {
                const ctx = speedCanvas.getContext('2d');
                speedCanvas.width = speedCanvas.clientWidth || 60;
                speedCanvas.height = speedCanvas.clientHeight || 40;
                ctx.clearRect(0, 0, speedCanvas.width, speedCanvas.height);
                if (speedHistory && speedHistory.length > 1) {
                    ctx.beginPath();
                    ctx.strokeStyle = '#f59e0b';
                    ctx.lineWidth = 1.5;
                    const max = Math.max(...speedHistory, 1000);
                    const step = speedCanvas.width / (speedHistory.length - 1);
                    speedHistory.forEach((s, i) => {
                        const x = i * step;
                        const y = speedCanvas.height - (s / max) * speedCanvas.height;
                        if (i === 0) ctx.moveTo(x, y);
                        else ctx.lineTo(x, y);
                    });
                    ctx.stroke();
                }
            }
        });
    }
};