(() => {
    document.documentElement.classList.add("js");
    const header = document.querySelector("[data-site-header]");
    const toggle = document.querySelector(".nav-toggle");
    const nav = document.querySelector(".main-nav");
    const langButton = document.querySelector("[data-lang-toggle]");
    const soundButton = document.querySelector("[data-sound-toggle]");
    const audio = document.querySelector("[data-ui-audio]");
    let lang = localStorage.getItem("preu-lang") || "en";
    let sound = localStorage.getItem("preu-sound") === "on";
    function applyLang() {
        document.documentElement.lang = lang === "zh" ? "zh-CN" : "en";
        document.querySelectorAll("[data-en][data-zh]").forEach((el) => {
            const value = el.dataset[lang];
            if (value !== undefined) el.textContent = value;
        });
        document.querySelectorAll("[data-en-html][data-zh-html]").forEach((el) => {
            const value = el.dataset[lang + "Html"];
            if (value !== undefined) el.innerHTML = value;
        });
        if (langButton) langButton.textContent = lang === "en" ? "中" : "EN";
    }
    function play() {
        if (!sound || !audio) return;
        try {
            audio.currentTime = 0;
            audio.volume = 0.12;
            audio.play().catch(() => {});
        } catch (e) {}
    }
    window.addEventListener("scroll", () => header && header.classList.toggle("scrolled", window.scrollY > 16), {
        passive: true,
    });
    if (toggle)
        toggle.addEventListener("click", () => {
            const open = toggle.getAttribute("aria-expanded") === "true";
            toggle.setAttribute("aria-expanded", String(!open));
            nav && nav.classList.toggle("open");
            play();
        });
    if (nav)
        nav.querySelectorAll("a").forEach((a) =>
            a.addEventListener("click", () => {
                nav.classList.remove("open");
                toggle && toggle.setAttribute("aria-expanded", "false");
                play();
            }),
        );
    if (langButton)
        langButton.addEventListener("click", () => {
            lang = lang === "en" ? "zh" : "en";
            localStorage.setItem("preu-lang", lang);
            applyLang();
            play();
        });
    function applySound() {
        if (soundButton) {
            soundButton.setAttribute("aria-pressed", String(sound));
            soundButton.setAttribute("aria-label", sound ? "Disable interface sound" : "Enable interface sound");
        }
    }
    if (soundButton)
        soundButton.addEventListener("click", () => {
            sound = !sound;
            localStorage.setItem("preu-sound", sound ? "on" : "off");
            applySound();
            if (sound) play();
        });
    document.querySelectorAll(".button,.text-link,[data-filter]").forEach((el) => el.addEventListener("click", play));
    const observer = new IntersectionObserver(
        (entries) =>
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("visible");
                    observer.unobserve(entry.target);
                }
            }),
        { threshold: 0.1 },
    );
    document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
    document.querySelectorAll("[data-filter]").forEach((button) =>
        button.addEventListener("click", () => {
            const filter = button.dataset.filter;
            document.querySelectorAll("[data-filter]").forEach((b) => b.classList.remove("selected"));
            button.classList.add("selected");
            document
                .querySelectorAll("[data-category]")
                .forEach((card) => (card.hidden = filter !== "all" && card.dataset.category !== filter));
        }),
    );
    const dialog = document.querySelector("[data-lightbox]");
    if (dialog) {
        const img = dialog.querySelector("img"),
            cap = dialog.querySelector("p");
        document.querySelectorAll("[data-lightbox-src]").forEach((item) =>
            item.addEventListener("click", () => {
                img.src = item.dataset.lightboxSrc;
                img.alt = item.dataset.lightboxAlt || "";
                cap.textContent = item.dataset.lightboxAlt || "";
                dialog.showModal();
                play();
            }),
        );
        dialog.querySelector(".lightbox-close").addEventListener("click", () => dialog.close());
        dialog.addEventListener("click", (e) => {
            if (e.target === dialog) dialog.close();
        });
    }
    document.querySelectorAll("[data-check-id]").forEach((input) => {
        const key = "preu-check-" + input.dataset.checkId;
        input.checked = localStorage.getItem(key) === "1";
        input.addEventListener("change", () => {
            localStorage.setItem(key, input.checked ? "1" : "0");
            play();
        });
    });

    // Version 1 Who We Are / Vision / Mission retained as an accessible slider.
    document.querySelectorAll("[data-story-slider]").forEach((slider) => {
        const slides = [...slider.querySelectorAll("[data-story-slide]")];
        const dots = [...slider.querySelectorAll("[data-story-dot]")];
        const current = slider.querySelector("[data-story-current]");
        const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        let index = 0,
            timer = null;
        function show(next) {
            index = (next + slides.length) % slides.length;
            slides.forEach((slide, i) => {
                slide.hidden = i !== index;
                slide.classList.toggle("active", i === index);
            });
            dots.forEach((dot, i) => {
                dot.classList.toggle("active", i === index);
                dot.setAttribute("aria-selected", String(i === index));
            });
            if (current) current.textContent = String(index + 1);
            play();
        }
        function start() {
            if (reduced || slides.length < 2) return;
            stop();
            timer = setInterval(() => show(index + 1), 7000);
        }
        function stop() {
            if (timer) {
                clearInterval(timer);
                timer = null;
            }
        }
        slider.querySelector("[data-story-prev]")?.addEventListener("click", () => {
            show(index - 1);
            start();
        });
        slider.querySelector("[data-story-next]")?.addEventListener("click", () => {
            show(index + 1);
            start();
        });
        dots.forEach((dot, i) =>
            dot.addEventListener("click", () => {
                show(i);
                start();
            }),
        );
        slider.addEventListener("mouseenter", stop);
        slider.addEventListener("mouseleave", start);
        slider.addEventListener("focusin", stop);
        slider.addEventListener("focusout", start);
        show(0);
        start();
    });

    // Version 1 member popups rebuilt as a smaller accessible dialog; no Instagram links.
    const profileDialog = document.querySelector("[data-profile-dialog]");
    if (profileDialog && window.PREU_PEOPLE) {
        const profileImage = profileDialog.querySelector("[data-profile-image]");
        const profileRole = profileDialog.querySelector("[data-profile-role]");
        const profileName = profileDialog.querySelector("[data-profile-name]");
        const profileOrigin = profileDialog.querySelector("[data-profile-origin]");
        const profileMajor = profileDialog.querySelector("[data-profile-major]");
        const profileQuote = profileDialog.querySelector("[data-profile-quote]");
        function openProfile(id) {
            const p = window.PREU_PEOPLE[id];
            if (!p) return;
            const zh = lang === "zh";
            profileImage.src = p.image;
            profileImage.alt = p.name;
            profileRole.textContent = zh ? p.role_zh : p.role_en;
            profileName.textContent = p.name;
            profileOrigin.textContent = zh ? p.origin_zh : p.origin_en;
            profileMajor.textContent = zh ? p.major_zh : p.major_en;
            profileQuote.textContent = "“" + p.quote + "”";
            profileDialog.showModal();
            play();
        }
        document
            .querySelectorAll("[data-person-id]")
            .forEach((button) => button.addEventListener("click", () => openProfile(button.dataset.personId)));
        profileDialog.querySelector("[data-profile-close]")?.addEventListener("click", () => profileDialog.close());
        profileDialog.addEventListener("click", (event) => {
            if (event.target === profileDialog) profileDialog.close();
        });
        if (location.hash) {
            const id = location.hash.slice(1);
            if (window.PREU_PEOPLE[id]) setTimeout(() => openProfile(id), 250);
        }
    }
    applyLang();
    applySound();
})();
