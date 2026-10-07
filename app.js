(() => {
  "use strict";

  const data = window.siteData;
  if (!data) {
    console.error("未找到 window.siteData，请检查 content.js 是否在 app.js 之前加载。");
    return;
  }

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

  function setText(selector, value) {
    const element = $(selector);
    if (!element) return;
    element.textContent = value ?? "";
    element.style.whiteSpace = "pre-wrap";
  }

  function setHref(element, url, fallback = "#") {
    if (!element) return;
    element.href = typeof url === "string" && url.trim() ? url.trim() : fallback;
  }

  function hasManualLayout(project) {
    const layout = project?.layout;
    return layout && [layout.col, layout.row, layout.colSpan, layout.rowSpan].every(Number.isFinite);
  }

  function getPalette(item) {
    return Array.isArray(item.colors) && item.colors.length >= 2 ? item.colors : ["#48545b", "#d7cbb8"];
  }

  function buildMedia(item, className, eager = false) {
    const media = document.createElement("div");
    media.className = className;
    media.style.setProperty("--c1", getPalette(item)[0]);
    media.style.setProperty("--c2", getPalette(item)[1]);
    media.dataset.coverStyle = String(item.coverStyle || 1);

    if (item.image) {
      const image = document.createElement("img");
      image.src = item.image;
      image.alt = item.alt || item.title || "";
      image.loading = eager ? "eager" : "lazy";
      image.decoding = "async";
      media.appendChild(image);
      media.classList.add("has-image");
      return media;
    }

    const shape = document.createElement("div");
    shape.className = "media-shape";
    for (let index = 0; index < 4; index += 1) {
      const span = document.createElement("span");
      shape.appendChild(span);
    }
    media.appendChild(shape);
    return media;
  }

function applyAppearanceOverrides() {
  const appearance = window.portfolioAppearance;
  if (!appearance) return;
  const rootStyle = document.documentElement.style;
  const colorPattern = /^#[0-9a-f]{6}$/i;

  if (typeof appearance.fontFamily === "string" && appearance.fontFamily.trim()) {
    rootStyle.setProperty("--sans", appearance.fontFamily.trim());
  }
  if ([300, 400, 500, 600, 700].includes(Number(appearance.bodyFontWeight))) {
    rootStyle.setProperty("--body-font-weight", String(Number(appearance.bodyFontWeight)));
  }
  rootStyle.setProperty("--body-font-style", appearance.bodyFontStyle === "italic" ? "italic" : "normal");
  if ([300, 400, 500, 600, 700].includes(Number(appearance.headingFontWeight))) {
    rootStyle.setProperty("--heading-font-weight", String(Number(appearance.headingFontWeight)));
  }
  rootStyle.setProperty("--heading-font-style", appearance.headingFontStyle === "italic" ? "italic" : "normal");
  if (Number.isFinite(Number(appearance.fontSize))) {
    const size = Math.min(24, Math.max(12, Number(appearance.fontSize)));
    rootStyle.setProperty("--base-font-size", size + "px");
  }
  if (Number.isFinite(Number(appearance.headingScale))) {
    const scale = Math.min(180, Math.max(50, Number(appearance.headingScale))) / 100;
    rootStyle.setProperty("--heading-scale", String(scale));
  }
  if (colorPattern.test(appearance.backgroundColor || "")) rootStyle.setProperty("--paper", appearance.backgroundColor);
  if (colorPattern.test(appearance.textColor || "")) rootStyle.setProperty("--ink", appearance.textColor);
  if (colorPattern.test(appearance.paginationColor || "")) rootStyle.setProperty("--pagination-color", appearance.paginationColor);
  if (colorPattern.test(appearance.paginationActive || "")) rootStyle.setProperty("--pagination-active", appearance.paginationActive);
  if (colorPattern.test(appearance.paginationTrack || "")) rootStyle.setProperty("--pagination-track", appearance.paginationTrack);
  if (colorPattern.test(appearance.heroTextColor || "")) rootStyle.setProperty("--hero-text", appearance.heroTextColor);
  if (colorPattern.test(appearance.heroBackgroundColor || "")) rootStyle.setProperty("--hero-background", appearance.heroBackgroundColor);
  if (Number.isFinite(Number(appearance.heroBackgroundOpacity))) {
    const opacity = Math.min(100, Math.max(0, Number(appearance.heroBackgroundOpacity))) / 100;
    rootStyle.setProperty("--hero-background-opacity", String(opacity));
  }
  if (Number.isFinite(Number(appearance.heroHeadingScale))) {
    const heroScale = Math.min(180, Math.max(50, Number(appearance.heroHeadingScale))) / 100;
    rootStyle.setProperty("--hero-heading-scale", String(heroScale));
  }
  const heroColors = [["carouselTextColor", "--carousel-text"], ["projectTextColor", "--project-text"], ["aboutTextColor", "--about-text"], ["contactTextColor", "--contact-text"]];
  heroColors.forEach(([key, variable]) => { if (colorPattern.test(appearance[key] || "")) rootStyle.setProperty(variable, appearance[key]); });
  if (colorPattern.test(appearance.contactBackgroundColor || "")) rootStyle.setProperty("--contact-background", appearance.contactBackgroundColor);
  if (Number.isFinite(Number(appearance.contactEmailSize))) rootStyle.setProperty("--contact-email-size", Math.min(48, Math.max(12, Number(appearance.contactEmailSize))) + "px");
  const moduleHeadingStyles = [
    ["heroHeadingWeight", "--hero-heading-weight"], ["heroHeadingStyle", "--hero-heading-style"],
    ["carouselHeadingWeight", "--carousel-heading-weight"], ["carouselHeadingStyle", "--carousel-heading-style"],
    ["projectHeadingWeight", "--project-heading-weight"], ["projectHeadingStyle", "--project-heading-style"],
    ["aboutHeadingWeight", "--about-heading-weight"], ["aboutHeadingStyle", "--about-heading-style"],
    ["contactHeadingWeight", "--contact-heading-weight"], ["contactHeadingStyle", "--contact-heading-style"]
  ];
  moduleHeadingStyles.forEach(([key, variable]) => {
    const value = appearance[key];
    if (key.endsWith("Weight") && [300, 400, 500, 600, 700].includes(Number(value))) rootStyle.setProperty(variable, String(Number(value)));
    if (key.endsWith("Style")) rootStyle.setProperty(variable, value === "italic" ? "italic" : "normal");
  });
  const moduleScales = [
    ["carouselHeadingScale", "--carousel-heading-scale"],
    ["projectHeadingScale", "--project-heading-scale"],
    ["aboutHeadingScale", "--about-heading-scale"],
    ["contactHeadingScale", "--contact-heading-scale"]
  ];
  moduleScales.forEach(([key, variable]) => {
    if (Number.isFinite(Number(appearance[key]))) {
      const scale = Math.min(180, Math.max(50, Number(appearance[key]))) / 100;
      rootStyle.setProperty(variable, String(scale));
    }
  });

  const buttonColors = [
    ["buttonSurfaceBg", "--button-surface-bg"],
    ["buttonSurfaceText", "--button-surface-text"],
    ["buttonSurfaceHoverBg", "--button-surface-hover-bg"],
    ["buttonSurfaceHoverText", "--button-surface-hover-text"],
    ["buttonPrimaryBg", "--button-primary-bg"],
    ["buttonPrimaryText", "--button-primary-text"],
    ["buttonPrimaryHoverBg", "--button-primary-hover-bg"],
    ["buttonPrimaryHoverText", "--button-primary-hover-text"]
  ];
  buttonColors.forEach(([key, variable]) => {
    if (colorPattern.test(appearance[key] || "")) rootStyle.setProperty(variable, appearance[key]);
  });
  if (Number.isFinite(Number(appearance.buttonRadius))) {
    const radius = Math.min(999, Math.max(0, Number(appearance.buttonRadius)));
    rootStyle.setProperty("--button-radius", radius + "px");
  }
  if (colorPattern.test(appearance.languageBackgroundColor || "")) rootStyle.setProperty("--language-bg", appearance.languageBackgroundColor);
  if (colorPattern.test(appearance.languageTextColor || "")) rootStyle.setProperty("--language-text", appearance.languageTextColor);
  if (colorPattern.test(appearance.languageHoverBackgroundColor || "")) rootStyle.setProperty("--language-hover-bg", appearance.languageHoverBackgroundColor);
  if (colorPattern.test(appearance.languageHoverTextColor || "")) rootStyle.setProperty("--language-hover-text", appearance.languageHoverTextColor);
  if (Number.isFinite(Number(appearance.languageFontSize))) rootStyle.setProperty("--language-font-size", Math.min(24, Math.max(8, Number(appearance.languageFontSize))) + "px");
  if (Number.isFinite(Number(appearance.languageWidth))) rootStyle.setProperty("--language-width", Math.min(160, Math.max(40, Number(appearance.languageWidth))) + "px");
  if (Number.isFinite(Number(appearance.languageHeight))) rootStyle.setProperty("--language-height", Math.min(80, Math.max(28, Number(appearance.languageHeight))) + "px");
  if (Number.isFinite(Number(appearance.languageRadius))) rootStyle.setProperty("--language-radius", Math.min(999, Math.max(0, Number(appearance.languageRadius))) + "px");
  rootStyle.setProperty("--language-weight", appearance.languageBold === true ? "700" : "400");

  if (colorPattern.test(appearance.brandBackgroundColor || "")) rootStyle.setProperty("--brand-bg", appearance.brandBackgroundColor);
  if (colorPattern.test(appearance.brandTextColor || "")) rootStyle.setProperty("--brand-text", appearance.brandTextColor);
  if (Number.isFinite(Number(appearance.brandFontSize))) rootStyle.setProperty("--brand-font-size", Math.min(30, Math.max(8, Number(appearance.brandFontSize))) + "px");
  if (Number.isFinite(Number(appearance.brandWidth))) rootStyle.setProperty("--brand-width", Math.min(200, Math.max(24, Number(appearance.brandWidth))) + "px");
  if (Number.isFinite(Number(appearance.brandHeight))) rootStyle.setProperty("--brand-height", Math.min(120, Math.max(24, Number(appearance.brandHeight))) + "px");
  if (Number.isFinite(Number(appearance.brandRadius))) rootStyle.setProperty("--brand-radius", Math.min(999, Math.max(0, Number(appearance.brandRadius))) + "px");

  const moduleStyles = appearance.moduleStyles || {};
  const modulePrefixes = { basic: "basic", topline: "topline", availability: "availability", hero: "hero", carousel: "carousel", projects: "project", dialog: "dialog", about: "about", contact: "contact", filters: "filters" };
  Object.entries(modulePrefixes).forEach(([sourceKey, prefix]) => {
    const style = moduleStyles[sourceKey];
    if (!style) return;
    if (style.fontFamily) rootStyle.setProperty("--" + prefix + "-font", style.fontFamily);
    if (Number.isFinite(Number(style.titleScale))) rootStyle.setProperty("--" + prefix + "-title-scale", String(Math.min(200, Math.max(40, Number(style.titleScale))) / 100));
    if (Number.isFinite(Number(style.titleWeight))) rootStyle.setProperty("--" + prefix + "-title-weight", String(Number(style.titleWeight)));
    rootStyle.setProperty("--" + prefix + "-title-style", style.titleStyle === "italic" ? "italic" : "normal");
    if (/^#[0-9a-f]{6}$/i.test(style.titleColor || "")) rootStyle.setProperty("--" + prefix + "-title-color", style.titleColor);
    if (Number.isFinite(Number(style.textSize))) rootStyle.setProperty("--" + prefix + "-text-size", Math.min(32, Math.max(8, Number(style.textSize))) + "px");
    if (Number.isFinite(Number(style.textWeight))) rootStyle.setProperty("--" + prefix + "-text-weight", String(Number(style.textWeight)));
    rootStyle.setProperty("--" + prefix + "-text-style", style.textStyle === "italic" ? "italic" : "normal");
    if (/^#[0-9a-f]{6}$/i.test(style.textColor || "")) rootStyle.setProperty("--" + prefix + "-text-color", style.textColor);
    ["label", "subheading", "lead", "approach", "dialogTitle", "dialogBody"].forEach((part) => {
      const cssPart = part === "dialogTitle" ? "title" : part === "dialogBody" ? "body" : part;
      const size = Number(style[part + "Size"]);
      if (Number.isFinite(size)) rootStyle.setProperty("--" + prefix + "-" + cssPart + "-size", Math.min(32, Math.max(8, size)) + "px");
      const weight = Number(style[part + "Weight"]);
      if (Number.isFinite(weight)) rootStyle.setProperty("--" + prefix + "-" + cssPart + "-weight", String(weight));
      rootStyle.setProperty("--" + prefix + "-" + cssPart + "-style", style[part + "Style"] === "italic" ? "italic" : "normal");
      if (/^#[0-9a-f]{6}$/i.test(style[part + "Color"] || "")) rootStyle.setProperty("--" + prefix + "-" + cssPart + "-color", style[part + "Color"]);
    });
  });

  const basic = moduleStyles.basic;
  if (basic) {
    if (basic.fontFamily) rootStyle.setProperty("--sans", basic.fontFamily);
    if (Number.isFinite(Number(basic.textSize))) rootStyle.setProperty("--base-font-size", Math.min(32, Math.max(8, Number(basic.textSize))) + "px");
    if (Number.isFinite(Number(basic.textWeight))) rootStyle.setProperty("--body-font-weight", String(Number(basic.textWeight)));
    rootStyle.setProperty("--body-font-style", basic.textStyle === "italic" ? "italic" : "normal");
    if (/^#[0-9a-f]{6}$/i.test(basic.textColor || "")) rootStyle.setProperty("--ink", basic.textColor);
  }
}

function mergeContentOverrides(target, source) {
  Object.entries(source || {}).forEach(([key, value]) => {
    if (key === "version" || value === undefined) return;

    if (Array.isArray(value)) {
      target[key] = value.map((entry) => {
        if (entry && typeof entry === "object" && !Array.isArray(entry)) {
          return { ...entry, ...(Array.isArray(entry.tags) ? { tags: [...entry.tags] } : {}) };
        }
        return entry;
      });
      return;
    }

    if (value && typeof value === "object") {
      if (!target[key] || typeof target[key] !== "object" || Array.isArray(target[key])) target[key] = {};
      mergeContentOverrides(target[key], value);
      return;
    }

    target[key] = value;
  });
}

function applyContentOverrides() {
  if (window.contentOverrides) mergeContentOverrides(data, window.contentOverrides);
}

function getPortfolioLanguage() {
  try { return localStorage.getItem("portfolio-language") === "en" ? "en" : "zh"; } catch (error) { return "zh"; }
}
function setPortfolioLanguage(language) {
  try { localStorage.setItem("portfolio-language", language === "en" ? "en" : "zh"); } catch (error) {}
  window.location.reload();
}
function parseEnglishList(value, fallback) {
  const items = String(value ?? "").split(/\r?\n|,|，|、/).map((item) => item.trim()).filter(Boolean);
  return items.length ? items : fallback;
}
function applyEnglishContent() {
  if (getPortfolioLanguage() !== "en") return;
  const en = data.enText && typeof data.enText === "object" ? data.enText : {};
  const staticText = en.static && typeof en.static === "object" ? en.static : {};
  const pick = (key, fallback) => staticText[key] || fallback;
  data.pageTitle = pick("textPageTitle", data.pageTitle);
  data.brandName = pick("textBrandName", data.brandName);
  data.brandMark = pick("textBrandMark", data.brandMark);
  data.footerName = pick("textFooterName", data.footerName);
  data.availability = pick("textAvailability", data.availability);
  data.nav = {
    ...(data.nav || {}),
    work: pick("textNavWork", data.nav?.work),
    about: pick("textNavAbout", data.nav?.about),
    contact: pick("textNavContact", data.nav?.contact)
  };
  data.topline = {
    ...(data.topline || {}),
    label: pick("textToplineLabel", data.topline?.label),
    year: pick("textToplineYear", data.topline?.year)
  };
  data.hero = {
    ...(data.hero || {}),
    lead: pick("textHeroLead", data.hero?.lead),
    accent: pick("textHeroAccent", data.hero?.accent),
    intro: pick("textHeroIntro", data.hero?.intro),
    role: pick("textHeroRole", data.hero?.role),
    location: pick("textHeroLocation", data.hero?.location)
  };
  data.works = {
    ...(data.works || {}),
    label: pick("textWorkLabel", data.works?.label),
    title: pick("textWorkTitle", data.works?.title)
  };
  data.about = {
    ...(data.about || {}),
    label: pick("textAboutLabel", data.about?.label),
    titleLead: pick("textAboutTitleLead", data.about?.titleLead),
    titleAccent: pick("textAboutTitleAccent", data.about?.titleAccent),
    approachLabel: pick("textAboutApproachLabel", data.about?.approachLabel),
    skillsLabel: pick("textAboutSkillsLabel", data.about?.skillsLabel),
    lead: pick("textAboutLead", data.about?.lead),
    approach: pick("textAboutApproach", data.about?.approach),
    skills: parseEnglishList(staticText.textAboutSkills, data.about?.skills || [])
  };
  data.contact = {
    ...(data.contact || {}),
    label: pick("textContactLabel", data.contact?.label),
    text: pick("textContactText", data.contact?.text)
  };
  const slideText = en.heroSlides && typeof en.heroSlides === "object" ? en.heroSlides : {};
  data.heroSlides = (data.heroSlides || []).map((slide) => {
    const translated = slide?.id ? slideText[slide.id] : null;
    return translated ? { ...slide, label: translated.label || slide.label, title: translated.title || slide.title, meta: translated.meta || slide.meta } : slide;
  });
  const projectText = en.projects && typeof en.projects === "object" ? en.projects : {};
  data.projects = (data.projects || []).map((project) => {
    const translated = project?.id ? projectText[project.id] : null;
    if (!translated) return project;
    return {
      ...project,
      title: translated.title || project.title,
      summary: translated.summary || project.summary,
      tags: Array.isArray(translated.tags) && translated.tags.length ? translated.tags : project.tags
    };
  });
  const filterText = en.filters && typeof en.filters === "object" ? en.filters : {};
  data.filters = data.filters || {};
  data.filters.items = (data.filters.items || []).map((item) => ({ ...item, label: filterText[item.key] || item.label || item.key }));
  data.filters.labels = { ...(data.filters.labels || {}) };
  data.filters.items.forEach((item) => { data.filters.labels[item.key] = item.label; });
  const socialText = en.socials && typeof en.socials === "object" ? en.socials : {};
  data.socials = (data.socials || []).map((social, index) => ({ ...social, label: socialText[String(index)] || social.label }));
  document.documentElement.lang = "en";
}

function applyMediaOverrides() {
    const overrides = window.portfolioMedia;
    if (!overrides) return;

    const collections = [
      [overrides.hero, Array.isArray(data.heroSlides) ? data.heroSlides : []],
      [overrides.projects, Array.isArray(data.projects) ? data.projects : []]
    ];

    collections.forEach(([mediaGroup, items]) => {
      Object.entries(mediaGroup || {}).forEach(([index, media]) => {
        const item = items[Number(index)];
        if (!item || !media?.image) return;
        item.image = media.image;
        if (media.alt) item.alt = media.alt;
      });
    });
    data.brandImage = overrides.brand?.["0"] || null;
    data.contactBackgroundImage = overrides.contact?.["0"] || null;
    data.resumeZhImage = overrides.resume?.["0"] || null;
    data.resumeEnImage = overrides.resume?.["1"] || null;
  }

  function renderContactBackground() {
    const panel = $(".contact-panel");
    if (!panel) return;
    const record = data.contactBackgroundImage;
    if (record?.image) {
      panel.style.backgroundImage = `linear-gradient(180deg, rgba(0, 0, 0, 0.16), rgba(0, 0, 0, 0.42)), url("${record.image}")`;
      panel.style.backgroundSize = "cover";
      panel.style.backgroundPosition = "center";
      panel.style.backgroundRepeat = "no-repeat";
    } else {
      panel.style.backgroundImage = "";
      panel.style.backgroundSize = "";
      panel.style.backgroundPosition = "";
      panel.style.backgroundRepeat = "";
    }
  }

  function renderResume() {
    const button = $("#resumeTrigger");
    const image = $("#resumeImage");
    const record = getPortfolioLanguage() === "en" ? data.resumeEnImage : data.resumeZhImage;
    if (button) {
      button.hidden = !record?.image;
      button.textContent = getPortfolioLanguage() === "en" ? "Resume ↗" : "查看简历 ↗";
    }
    if (image && record?.image) {
      image.src = record.image;
      image.alt = record.alt || (getPortfolioLanguage() === "en" ? "Resume" : "简历");
    }
  }

  function renderIdentity() {
    document.title = data.pageTitle || "你的名字 — 作品与实验";
    const brandElement = $("#brandMark");
    const brandImage = data.brandImage;
    if (brandElement && brandImage?.image) {
      const image = document.createElement("img");
      image.src = brandImage.image;
      image.alt = brandImage.alt || data.brandName || data.brandMark || "品牌";
      brandElement.replaceChildren(image);
      brandElement.classList.add("has-image");
    } else if (brandElement) {
      brandElement.textContent = data.brandMark || data.brandName?.slice(0, 2) || "ME";
      brandElement.style.whiteSpace = "pre-wrap";
      brandElement.classList.remove("has-image");
    }
    setText("#navWorkLabel", data.nav?.work || "作品");
    setText("#navAboutLabel", data.nav?.about || "关于");
    setText("#navContactLabel", data.nav?.contact || "联系");
    setText("#availability", data.availability);
    setText("#showcaseLead", data.hero?.lead);
    setText("#showcaseAccent", data.hero?.accent);
    setText("#siteIntro", data.hero?.intro);
    setText("#heroRole", data.hero?.role);
    setText("#heroLocation", data.hero?.location);
    setText("#footerName", data.footerName || data.brandName);
    setText("#currentYear", String(new Date().getFullYear()));
    setText("#toplineLabel", data.topline?.label || "PORTFOLIO /");
    setText("#yearLabel", data.topline?.year || "2021 to --");

    setText("#contactLabel", data.contact?.label || "CONTACT / 04");
    setText("#contactText", data.contact?.text);
    const email = data.contact?.email || "hello@example.com";
    setText("#contactEmail", email);
    setHref($("#contactLink"), `mailto:${email}`);
  }

  function renderHeroCarousel() {
    const slidesRoot = $("#heroSlides");
    const indicatorsRoot = $("#heroIndicators");
    const slides = Array.isArray(data.heroSlides) ? data.heroSlides : [];
    if (!slidesRoot || !indicatorsRoot || !slides.length) return;

    let current = 0;
    let timer = null;
    let hasInitialized = false;
    const slideNodes = [];
    const indicatorNodes = [];
    const cleanupTimers = new WeakMap();
    let reduceMotion = document.documentElement.dataset.motion === "off";
    const handleMotionChange = (event) => {
      reduceMotion = !event.detail.enabled;
      if (reduceMotion) stopAutoplay();
      else startAutoplay();
    };
    document.addEventListener("motionchange", handleMotionChange);

    slides.forEach((slide, index) => {
      const node = buildMedia(slide, "hero-slide", index === 0);
      node.dataset.coverStyle = String(slide.coverStyle || ((index % 4) + 1));
      slidesRoot.appendChild(node);
      slideNodes.push(node);

      const button = document.createElement("button");
      button.type = "button";
      button.className = "slide-indicator";
      button.setAttribute("aria-label", `查看首屏作品 ${index + 1}：${slide.title || "未命名"}`);
      button.innerHTML = `<span>0${index + 1}</span><i></i>`;
      button.addEventListener("click", () => {
        setActive(index);
        restartAutoplay();
      });
      indicatorsRoot.appendChild(button);
      indicatorNodes.push(button);
    });

    function setActive(index) {
      const previous = current;
      const next = (index + slides.length) % slides.length;
      const shouldAnimate = hasInitialized && previous !== next;
      current = next;
      const slide = slides[current];

      slideNodes.forEach((node) => {
        const cleanupTimer = cleanupTimers.get(node);
        if (cleanupTimer) window.clearTimeout(cleanupTimer);
        cleanupTimers.delete(node);
        node.classList.remove("is-active", "is-leaving");
      });

      if (shouldAnimate) {
        const leavingNode = slideNodes[previous];
        leavingNode.classList.add("is-leaving");
        const cleanupTimer = window.setTimeout(() => {
          leavingNode.classList.remove("is-leaving");
          cleanupTimers.delete(leavingNode);
        }, 1000);
        cleanupTimers.set(leavingNode, cleanupTimer);
      }

      slideNodes[current].classList.add("is-active");
      hasInitialized = true;

      indicatorNodes.forEach((node, nodeIndex) => {
        node.classList.toggle("is-active", nodeIndex === current);
        node.setAttribute("aria-pressed", String(nodeIndex === current));
      });
      setText("#heroSlideIndex", `${String(current + 1).padStart(2, "0")} / ${String(slides.length).padStart(2, "0")}`);
      setText("#heroSlideTitle", slide.title);
      setText("#heroSlideMeta", [slide.label, slide.meta].filter(Boolean).join(" · "));
    }

    function stopAutoplay() {
      if (timer) window.clearInterval(timer);
      timer = null;
    }

    function startAutoplay() {
      stopAutoplay();
      if (reduceMotion || document.hidden || slides.length < 2) return;
      timer = window.setInterval(() => setActive(current + 1), 3000);
    }

    function restartAutoplay() {
      startAutoplay();
    }

        document.addEventListener("visibilitychange", startAutoplay);

    setActive(0);
    startAutoplay();
  }

  let activeCategory = null;
  let lastFocusedElement = null;

  function createProjectCard(project, index) {
    const card = document.createElement("button");
    card.type = "button";
    card.className = "project-card";
    card.dataset.category = project.category || "未分类";
    card.dataset.layout = String((index % 4) + 1);
    card.setAttribute("aria-label", `查看项目：${project.title}`);

    const media = buildMedia(project, "project-card__media");
    media.setAttribute("aria-hidden", "true");

    const overlay = document.createElement("div");
    overlay.className = "project-card__overlay";

    const overlayTop = document.createElement("div");
    overlayTop.className = "project-card__overlay-top";
    const number = document.createElement("span");
    number.textContent = project.number || String(index + 1).padStart(2, "0");
    const arrow = document.createElement("span");
    arrow.textContent = "↗";
    overlayTop.append(number, arrow);

    const overlayTitle = document.createElement("p");
    overlayTitle.style.whiteSpace = "pre-wrap";
    overlayTitle.textContent = project.title;
    const overlayTags = document.createElement("p");
    overlayTags.style.whiteSpace = "pre-wrap";
    overlayTags.textContent = (project.tags || []).join(" / ");
    overlay.append(overlayTop, overlayTitle, overlayTags);

    const meta = document.createElement("div");
    meta.className = "project-card__meta";
    const title = document.createElement("h3");
    title.className = "project-card__title";
    title.style.whiteSpace = "pre-wrap";
    title.textContent = project.title;
    meta.appendChild(title);

    media.appendChild(overlay);
    card.append(media, meta);
    card.addEventListener("click", () => openProject(project));
    return card;
  }

  function renderWorksHeader() {
    setText("#workLabel", data.works?.label || "SELECTED WORKS");
    setText("#workTitle", data.works?.title || "精选作品");
  }

  function renderProjects() {
    const grid = $("#projectGrid");
    const filters = $("#projectFilters");
    if (!grid || !filters) return;
    const projects = Array.isArray(data.projects) ? data.projects : [];

    if (!projects.length) {
      const empty = document.createElement("p");
      empty.textContent = "还没有项目。请在 content.js 的 projects 数组中添加作品。";
      grid.appendChild(empty);
      return;
    }

    const filterLabels = data.filters?.labels || {};
    const configuredFilters = Array.isArray(data.filters?.items) && data.filters.items.length
      ? data.filters.items.map((item) => ({ key: item.key, label: item.label || filterLabels[item.key] || item.key, style: item.style || {} }))
      : [...new Set(projects.map((project) => project.category || "未分类"))].map((category) => ({ key: category, label: filterLabels[category] || category, style: {} }));
    if (!configuredFilters.some((item) => item.key === activeCategory)) {
      activeCategory = configuredFilters[0]?.key || null;
    }
    const categories = [...configuredFilters];

    function applyCategoryVisibility() {
      $$(".project-card", grid).forEach((card) => {
        card.hidden = !activeCategory || card.dataset.category !== activeCategory;
      });
    }

    const filterDefaults = data.filters?.defaults || {};
    const filterStyles = data.filters?.styles || {};
    categories.forEach(({ key, label }) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "filter-button";
      button.dataset.category = key;
      button.textContent = label;
      button.style.whiteSpace = "pre-wrap";
      const buttonStyle = { ...filterDefaults, ...(filterStyles[key] || {}), ...(categories.find(item => item.key === key)?.style || {}) };
      if (buttonStyle.background) button.style.setProperty("--filter-bg", buttonStyle.background);
      if (buttonStyle.text) button.style.setProperty("--filter-text", buttonStyle.text);
      if (buttonStyle.hoverBackground) button.style.setProperty("--filter-hover-bg", buttonStyle.hoverBackground);
      if (buttonStyle.hoverText) button.style.setProperty("--filter-hover-text", buttonStyle.hoverText);
      if (buttonStyle.activeBackground) button.style.setProperty("--filter-active-bg", buttonStyle.activeBackground);
      if (buttonStyle.activeText) button.style.setProperty("--filter-active-text", buttonStyle.activeText);
      if (Number.isFinite(Number(buttonStyle.radius))) button.style.setProperty("--filter-radius", Number(buttonStyle.radius) + "px");
      button.setAttribute("aria-pressed", String(key === activeCategory));
      button.addEventListener("click", () => {
        activeCategory = key;
        $$(".filter-button", filters).forEach((item) => item.setAttribute("aria-pressed", String(item.dataset.category === key)));
        applyCategoryVisibility();
      });
      filters.appendChild(button);
    });

    const tagOrder = new Map(configuredFilters.map((item, index) => [item.key, index]));
    const sourceOrder = new Map(projects.map((project, index) => [project, index]));
    const orderedProjects = [...projects].sort((a, b) => {
      const aTag = tagOrder.get(a.category || "未分类") ?? Number.MAX_SAFE_INTEGER;
      const bTag = tagOrder.get(b.category || "未分类") ?? Number.MAX_SAFE_INTEGER;
      if (aTag !== bTag) return aTag - bTag;
      return (sourceOrder.get(a) ?? 0) - (sourceOrder.get(b) ?? 0);
    });
    const manualProjects = orderedProjects.filter((project) => hasManualLayout(project));
    if (!manualProjects.length) {
      projects.forEach((project, index) => grid.appendChild(createProjectCard(project, index)));
      applyCategoryVisibility();
      return;
    }
    let fallbackRow = Math.max(1, ...manualProjects.map((project) => project.layout.row + project.layout.rowSpan));
    let fallbackCol = 1;
    const nextFallbackLayout = () => {
      if (fallbackCol + 11 > 24) { fallbackCol = 1; fallbackRow += 8; }
      const layout = { col: fallbackCol, row: fallbackRow, colSpan: 12, rowSpan: 8 };
      fallbackCol += 12;
      return layout;
    };
    grid.classList.add("work-grid--manual");
    const syncManualGrid = () => {
      const cellWidth = Math.max(20, (grid.clientWidth - 23 * 8) / 24);
      const rowHeight = Math.max(20, Math.round(cellWidth));
      grid.style.setProperty("--manual-row-height", rowHeight + "px");
    };
    syncManualGrid();
    window.addEventListener("resize", syncManualGrid, { passive: true });
    orderedProjects.forEach((project, index) => {
      const card = createProjectCard(project, index);
      const layout = hasManualLayout(project) ? project.layout : nextFallbackLayout();
      card.style.gridColumn = layout.col + " / span " + layout.colSpan;
      card.style.gridRow = layout.row + " / span " + layout.rowSpan;
      const cardMedia = card.querySelector(".project-card__media");
      if (cardMedia) cardMedia.style.aspectRatio = "auto";
      grid.appendChild(card);
    });
    applyCategoryVisibility();
  }

  function renderAbout() {
    setText("#aboutLabel", data.about?.label || "ABOUT / APPROACH");
    setText("#aboutTitleLead", data.about?.titleLead || "我做的不只是");
    setText("#aboutTitleAccent", data.about?.titleAccent || "“看起来不错”。");
    setText("#aboutApproachLabel", data.about?.approachLabel || "工作方式");
    setText("#aboutSkillsLabel", data.about?.skillsLabel || "能力范围");
    setText("#aboutLead", data.about?.lead);
    setText("#aboutApproach", data.about?.approach);

    const skillList = $("#skillList");
    (data.about?.skills || []).forEach((skill) => {
      const li = document.createElement("li");
      li.style.whiteSpace = "pre-wrap";
      li.textContent = skill;
      skillList?.appendChild(li);
    });

  }

  function renderSocials() {
    const container = $("#socialLinks");
    (data.socials || []).forEach((social) => {
      const link = document.createElement("a");
      link.textContent = social.label;
      setHref(link, social.url);
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      container?.appendChild(link);
    });
  }
  function openProject(project) {
    const dialog = $("#projectDialog");
    const dialogMedia = $("#dialogMedia");
    if (!dialog || !dialogMedia || typeof dialog.showModal !== "function") return;

    lastFocusedElement = document.activeElement;
    setText("#dialogTitle", project.title);
    setText("#dialogSummary", project.summary);

    const builtMedia = buildMedia(project, "dialog-media");
    dialogMedia.replaceChildren(...builtMedia.childNodes);
    dialogMedia.className = builtMedia.className;
    dialogMedia.style.cssText = builtMedia.style.cssText;
    dialogMedia.dataset.coverStyle = builtMedia.dataset.coverStyle;

    const dialogGallery = $("#dialogGallery");
    if (dialogGallery) {
      dialogGallery.replaceChildren();
      const projectGallery = window.portfolioMedia?.gallery?.[project.id] || {};
      const galleryRecords = Object.keys(projectGallery)
        .sort((a, b) => Number(a) - Number(b))
        .map((key) => projectGallery[key])
        .filter((record) => record?.image);
      galleryRecords.forEach((record) => {
        const figure = document.createElement("figure");
        figure.className = "dialog-gallery__item";
        const image = document.createElement("img");
        image.src = record.image;
        image.alt = record.alt || project.title || "项目详情图片";
        image.loading = "lazy";
        image.decoding = "async";
        figure.appendChild(image);
        dialogGallery.appendChild(figure);
      });
      dialogGallery.hidden = galleryRecords.length === 0;
    }
    const dialogCard = dialog.querySelector(".dialog-card");
    if (dialogCard) dialogCard.scrollTop = 0;
    dialog.showModal();
  }

  function bindResumeDialog() {
    const dialog = $("#resumeDialog");
    const trigger = $("#resumeTrigger");
    if (!dialog || !trigger || typeof dialog.showModal !== "function") return;
    trigger.addEventListener("click", () => dialog.showModal());
    $$("[data-close-resume]", dialog).forEach((element) => element.addEventListener("click", () => dialog.close()));
    dialog.addEventListener("click", (event) => { if (event.target === dialog) dialog.close(); });
    dialog.addEventListener("cancel", (event) => { event.preventDefault(); dialog.close(); });
  }

  function bindDialog() {
    const dialog = $("#projectDialog");
    if (!dialog) return;

    $$("[data-close-dialog]", dialog).forEach((element) => element.addEventListener("click", () => dialog.close()));
    dialog.addEventListener("click", (event) => {
      if (event.target === dialog) dialog.close();
    });
    dialog.addEventListener("cancel", (event) => {
      event.preventDefault();
      dialog.close();
    });
    dialog.addEventListener("close", () => {
      if (lastFocusedElement instanceof HTMLElement) lastFocusedElement.focus();
    });
  }

  function initReveal() {
    const elements = $$(".reveal, .work-grid .project-card");
    if (!elements.length) return;

    if (!("IntersectionObserver" in window) || document.documentElement.dataset.motion === "off") {
      elements.forEach((element) => element.classList.add("is-visible"));
      return;
    }

    const observedOnce = new WeakSet();
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observedOnce.add(entry.target);
        } else if (observedOnce.has(entry.target)) {
          entry.target.classList.remove("is-visible");
        }
      });
    }, { threshold: 0.08, rootMargin: "0px 0px -6% 0px" });

    elements.forEach((element) => observer.observe(element));
  }

  function bindScrollState() {
    const update = () => document.body.classList.toggle("is-scrolled", window.scrollY > 16);
    update();
    window.addEventListener("scroll", update, { passive: true });
  }

  function bindLiveReload() {
    const reload = () => window.location.reload();
    if ("BroadcastChannel" in window) {
      const channel = new BroadcastChannel("portfolio-content-updates");
      channel.addEventListener("message", (event) => {
        if (event.data?.type === "content-saved") reload();
      });
    }
    window.addEventListener("storage", (event) => {
      if (event.key === "portfolio-content-version") reload();
    });
    if (location.protocol === "http:" || location.protocol === "https:") {
      let lastVersion = null;
      let checking = false;
      const checkVersion = async () => {
        if (checking || document.hidden) return;
        checking = true;
        try {
          const response = await fetch("/api/version", { cache: "no-store" });
          const result = await response.json();
          if (lastVersion && result.version !== lastVersion) reload();
          lastVersion = result.version;
        } catch (error) {
          // 本地服务暂时不可用时忽略，稍后继续检查。
        } finally {
          checking = false;
        }
      };
      checkVersion();
      window.setInterval(checkVersion, 2000);
    }
  }

  function initLanguageToggle() {
    const button = $("#languageToggle");
    if (!button) return;
    const language = getPortfolioLanguage();
    button.textContent = language === "en" ? "中文" : "EN";
    button.addEventListener("click", () => setPortfolioLanguage(language === "en" ? "zh" : "en"));
  }

  function init() {
    bindLiveReload();
    initLanguageToggle();
    applyAppearanceOverrides();
    applyContentOverrides();
    applyEnglishContent();
    applyMediaOverrides();
    renderIdentity();
    renderResume();
    renderContactBackground();
    renderHeroCarousel();
    renderWorksHeader();
    renderProjects();
    renderAbout();
    renderSocials();
    bindDialog();
    bindResumeDialog();
    bindScrollState();
    initReveal();
    requestAnimationFrame(() => document.body.classList.remove("is-loading"));
  }

  init();
})();







