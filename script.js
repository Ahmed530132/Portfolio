(function () {
    // ---- scroll reveal ----
    const revealEls = document.querySelectorAll('.reveal');
    const io = new IntersectionObserver((entries) => {
        entries.forEach(e => {
            if (e.isIntersecting) {
                e.target.classList.add('in');
                io.unobserve(e.target);
            }
        });
    }, { threshold: 0.12 });
    revealEls.forEach(el => io.observe(el));

    // ---- scrollspy nav ----
    const navLinks = document.querySelectorAll('[data-nav]');
    const sections = Array.from(navLinks).map(a => document.querySelector(a.getAttribute('href')));
    function onScroll() {
        let current = sections[0];
        const y = window.scrollY + 90;
        sections.forEach(s => { if (s && s.offsetTop <= y) current = s; });
        navLinks.forEach(a => {
            a.classList.toggle('active', a.getAttribute('href') === '#' + current.id);
        });
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    // ---- cursor glow in hero ----
    const header = document.querySelector('header');
    const glow = document.getElementById('glow');
    header.addEventListener('mousemove', (e) => {
        const r = header.getBoundingClientRect();
        glow.style.setProperty('--gx', (e.clientX - r.left) + 'px');
        glow.style.setProperty('--gy', (e.clientY - r.top) + 'px');
    });

    // ---- copy profile link ----
    const copyBtn = document.getElementById('copyBtn');
    const PROFILE_LINK = 'https://github.com/Ahmed530132';

    function fallbackCopy(text) {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        let ok = false;
        try { ok = document.execCommand('copy'); } catch (err) { ok = false; }
        document.body.removeChild(ta);
        return ok;
    }

    copyBtn.addEventListener('click', async () => {
        let success = false;

        // clipboard API only works in a secure context (https/localhost) —
        // opening this file directly (file://) will not have it, so fall back
        if (navigator.clipboard && window.isSecureContext) {
            try {
                await navigator.clipboard.writeText(PROFILE_LINK);
                success = true;
            } catch (err) {
                success = fallbackCopy(PROFILE_LINK);
            }
        } else {
            success = fallbackCopy(PROFILE_LINK);
        }

        copyBtn.textContent = success ? 'Copied!' : 'Copy failed';
        copyBtn.classList.toggle('copied', success);
        setTimeout(() => {
            copyBtn.textContent = 'Copy profile link';
            copyBtn.classList.remove('copied');
        }, 1800);
    });

    // ---- home link ----
    const homeLink = document.getElementById('homeLink');
    homeLink.addEventListener('click', (e) => {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // ---- animated count-up ----
    function countUp(el, target, duration) {
        const start = performance.now();
        function tick(now) {
            const p = Math.min((now - start) / duration, 1);
            el.textContent = Math.round(p * target);
            if (p < 1) requestAnimationFrame(tick);
            else el.classList.remove('loading');
        }
        requestAnimationFrame(tick);
    }

    // ---- live GitHub data ----
    const GH_USER = 'Ahmed530132';
    const repoListEl = document.getElementById('repoList');
    const repoCountEl = document.getElementById('repoCount');

    fetch(`https://api.github.com/users/${GH_USER}`)
        .then(r => r.ok ? r.json() : Promise.reject())
        .then(data => {
            countUp(repoCountEl, data.public_repos || 0, 900);
        })
        .catch(() => {
            repoCountEl.textContent = '—';
            repoCountEl.classList.remove('loading');
        });

    fetch(`https://api.github.com/users/${GH_USER}/repos?sort=updated&per_page=4`)
        .then(r => r.ok ? r.json() : Promise.reject())
        .then(repos => {
            if (!Array.isArray(repos) || repos.length === 0) {
                repoListEl.innerHTML = '<div class="project"><div><p style="color:var(--ink-dim);">No public repositories yet — check back soon.</p></div></div>';
                return;
            }
            repoListEl.innerHTML = repos.map(r => `
        <div class="project">
        <div>
            <h3>${r.name}</h3>
            <p>${r.description ? r.description : 'No description provided.'}</p>
            <div class="tags">
            ${r.language ? `<span class="tag">${r.language}</span>` : ''}
            <span class="tag">★ ${r.stargazers_count}</span>
            <span class="tag">updated ${new Date(r.updated_at).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}</span>
            </div>
        </div>
        <a class="btn" href="${r.html_url}" target="_blank" rel="noopener" style="padding:6px 14px; font-size:12px;">Open</a>
        </div>
    `).join('');
        })
        .catch(() => {
            repoListEl.innerHTML = '<div class="project"><div><p style="color:var(--ink-dim);">Could not load repositories right now — visit GitHub directly.</p></div></div>';
        });
})();