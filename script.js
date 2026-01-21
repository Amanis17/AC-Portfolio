// ---------- Helpers ----------
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

const toast = (msg) => {
    const el = $("#toast");
    if (!el) return;
    el.textContent = msg;
    window.clearTimeout(toast._t);
    toast._t = window.setTimeout(() => (el.textContent = ""), 2200);
};

// ---------- Mobile Nav ----------
const navToggle = $("#navToggle");
const navLinks = $("#navLinks");

if (navToggle && navLinks) {
    navToggle.addEventListener("click", () => {
        const isOpen = navLinks.classList.toggle("open");
        navToggle.setAttribute("aria-expanded", String(isOpen));
    });

    $$(".nav-link").forEach((link) => {
        link.addEventListener("click", () => {
            navLinks.classList.remove("open");
            navToggle.setAttribute("aria-expanded", "false");
        });
    });
}

// ---------- Theme Toggle ----------
const themeToggle = $("#themeToggle");
const THEME_KEY = "adan_theme";

const applyTheme = (theme) => {
    document.documentElement.dataset.theme = theme;
    if (themeToggle) themeToggle.textContent = theme === "light" ? "🌞" : "🌙";
};

const savedTheme = localStorage.getItem(THEME_KEY);
applyTheme(savedTheme || "dark");

if (themeToggle) {
    themeToggle.addEventListener("click", () => {
        const current = document.documentElement.dataset.theme || "dark";
        const next = current === "dark" ? "light" : "dark";
        localStorage.setItem(THEME_KEY, next);
        applyTheme(next);
    });
}

// ---------- Active Nav Link (IntersectionObserver) ----------
const sections = ["about", "skills", "projects", "experience", "contact"]
    .map((id) => document.getElementById(id))
    .filter(Boolean);

const linksById = new Map(
    $$(".nav-link")
        .map((a) => [a.getAttribute("href")?.replace("#", ""), a])
        .filter(([k]) => k)
);

if ("IntersectionObserver" in window && sections.length) {
    const io = new IntersectionObserver(
        (entries) => {
            entries.forEach((e) => {
                if (!e.isIntersecting) return;
                linksById.forEach((a) => a.classList.remove("active"));
                const id = e.target.id;
                const link = linksById.get(id);
                if (link) link.classList.add("active");
            });
        },
        { root: null, threshold: 0.4 }
    );

    sections.forEach((s) => io.observe(s));
}

// ---------- Project Filters ----------
const filterBtns = $$(".filter");
const projectCards = $$("#projectGrid .project");

filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
        filterBtns.forEach((b) => b.classList.remove("is-active"));
        btn.classList.add("is-active");

        const value = btn.dataset.filter;
        projectCards.forEach((card) => {
            const tags = (card.dataset.tags || "").split(" ").filter(Boolean);
            const show = value === "all" || tags.includes(value);
            card.style.display = show ? "" : "none";
        });
    });
});

// ---------- Copy Email ----------
const copyBtn = $("#copyEmail");
if (copyBtn) {
    copyBtn.addEventListener("click", async () => {
        const email = $("#emailText")?.textContent?.trim();
        if (!email) return;

        try {
            await navigator.clipboard.writeText(email);
            toast("Copied email to clipboard ✅");
        } catch {
            toast("Couldn’t copy (browser blocked it) — select and copy manually.");
        }
    });
}

// ---------- Contact Form Validation (client-side only) ----------
const form = $("#contactForm");
if (form) {
    form.addEventListener("submit", (e) => {
        e.preventDefault();

        const data = new FormData(form);
        const name = String(data.get("name") || "").trim();
        const email = String(data.get("email") || "").trim();
        const message = String(data.get("message") || "").trim();

        const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

        if (name.length < 2) return toast("Name looks too short.");
        if (!emailOk) return toast("Enter a valid email address.");
        if (message.length < 10) return toast("Message should be at least 10 characters.");

        // No backend here — just show success.
        form.reset();
        toast("Message validated ✅ (Add EmailJS/Formspree to send it.)");
    });
}

// ---------- Footer Year ----------
const year = $("#year");
if (year) year.textContent = new Date().getFullYear();
            