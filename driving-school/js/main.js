/**
 * المحرك التفاعلي لموقع مدرسة تعليم السياقة
 * إدارة الإشارات، محرك الامتحان، استمارة الواتساب، والواجهات التفاعلية
 */

// إعدادات المدرسة الافتراضية
const DEFAULT_SCHOOL_CONFIG = {
  name: "مدرسة الأمان لتعليم السياقة",
  phone: "+213 555 12 34 56",
  phoneRaw: "213555123456",
  whatsapp: "213555123456",
  email: "contact@autoecole-alaman.dz",
  address: "شارع الاستقلال، مقابل محطة الترامواي الرئيسية، الجزائر العاصمة",
  workHours: "السبت - الخميس: 08:00 صباحاً - 18:30 مساءً",
  facebook: "https://facebook.com",
  instagram: "https://instagram.com",
  tiktok: "https://tiktok.com",
  mapsUrl: "https://maps.google.com"
};

// قراءة الإعدادات من الذاكرة المحلية أو استخدام الافتراضية
function getSchoolConfig() {
  const saved = JSON.parse(localStorage.getItem("school_settings") || "null");
  return { ...DEFAULT_SCHOOL_CONFIG, ...(saved || {}) };
}

let SCHOOL_CONFIG = getSchoolConfig();

// حالة الامتحان الحالية
let quizState = {
  currentQuestionIndex: 0,
  score: 0,
  selectedAnswers: {},
  answered: false,
  questions: []
};

// ==========================================
// 1. تشغيل الموقع عند تحميل الصفحة
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
  SCHOOL_CONFIG = getSchoolConfig();
  applyDynamicSettingsToPage();
  initMobileMenu();
  renderTrafficSigns("all");
  initSignsFilter();
  initSignsSearch();
  initQuiz();
  initRegistrationForm();
  initFaqAccordion();
  initBackToTop();
  setupSmoothScroll();
});

// تطبيق الإعدادات المحدثة من لوحة التحكم على عناصر الصفحة
function applyDynamicSettingsToPage() {
  const cfg = SCHOOL_CONFIG;

  // تحديث أسماء المدرسة
  document.querySelectorAll("[data-school-name]").forEach(el => {
    el.innerText = cfg.name;
  });

  // تحديث أرقام الهاتف
  document.querySelectorAll("[data-school-phone]").forEach(el => {
    el.innerText = cfg.phone;
    if (el.tagName === "A") {
      el.href = `tel:${cfg.phone.replace(/[^0-9+]/g, '')}`;
    }
  });

  // تحديث العنوان وأوقات العمل
  document.querySelectorAll("[data-school-address]").forEach(el => {
    el.innerText = cfg.address;
  });
  document.querySelectorAll("[data-school-hours]").forEach(el => {
    el.innerText = cfg.workHours;
  });

  // تحديث روابط حسابات التواصل الاجتماعي
  const fbLink = document.querySelector('[data-social="facebook"]');
  if (fbLink) {
    fbLink.href = cfg.facebook || "https://facebook.com";
    if (!cfg.facebook) fbLink.classList.add("opacity-50");
    else fbLink.classList.remove("opacity-50");
  }

  const igLink = document.querySelector('[data-social="instagram"]');
  if (igLink) {
    igLink.href = cfg.instagram || "https://instagram.com";
    if (!cfg.instagram) igLink.classList.add("opacity-50");
    else igLink.classList.remove("opacity-50");
  }

  const ttLink = document.querySelector('[data-social="tiktok"]');
  if (ttLink) {
    ttLink.href = cfg.tiktok || "https://tiktok.com";
    if (!cfg.tiktok) ttLink.classList.add("opacity-50");
    else ttLink.classList.remove("opacity-50");
  }

  const waLinks = document.querySelectorAll('[data-social="whatsapp"], a[data-school-whatsapp]');
  waLinks.forEach(el => {
    el.href = `https://wa.me/${cfg.whatsapp}?text=${encodeURIComponent("مرحباً بك، أريد الاستفسار عن التسجيل في مدرسة تعليم السياقة")}`;
  });

  // تحديث زر ورابط موقع المدرسة على خرائط جوجل
  const mapLinks = document.querySelectorAll('[data-school-map], #map-direct-link');
  mapLinks.forEach(el => {
    el.href = cfg.mapsUrl || "https://maps.google.com";
  });
}

// ==========================================
// 2. القائمة الجانبية للشاشات الصغيرة
// ==========================================
function initMobileMenu() {
  const menuBtn = document.getElementById("mobile-menu-btn");
  const mobileMenu = document.getElementById("mobile-menu");
  const closeBtn = document.getElementById("close-mobile-menu");

  if (menuBtn && mobileMenu) {
    menuBtn.addEventListener("click", () => {
      mobileMenu.classList.remove("hidden");
      document.body.classList.add("overflow-hidden");
    });

    const closeMenu = () => {
      mobileMenu.classList.add("hidden");
      document.body.classList.remove("overflow-hidden");
    };

    if (closeBtn) closeBtn.addEventListener("click", closeMenu);

    // إغلاق القائمة عند النقر على أي رابط داخلي
    const mobileLinks = mobileMenu.querySelectorAll("a");
    mobileLinks.forEach(link => {
      link.addEventListener("click", closeMenu);
    });
  }
}

// ==========================================
// 3. محرك إشارات المرور والرسومات المتجهة SVG الشامل
// ==========================================
function generateSignGraphic(sign) {
  // أ. إشارات مثلثة (خطر)
  if (sign.shape === "triangle") {
    let innerContent = "";
    
    if (sign.icon === "curve-right") {
      innerContent = `<path d="M 38 64 Q 38 44 60 40 L 53 33 M 60 40 L 54 48" stroke="#1e293b" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`;
    } else if (sign.icon === "curve-left") {
      innerContent = `<path d="M 62 64 Q 62 44 40 40 L 47 33 M 40 40 L 46 48" stroke="#1e293b" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`;
    } else if (sign.icon === "double-curve-right") {
      innerContent = `<path d="M 40 66 Q 40 54 56 50 Q 64 46 54 36 L 62 34 M 54 36 L 50 44" stroke="#1e293b" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`;
    } else if (sign.icon === "narrow-road") {
      innerContent = `<path d="M 34 66 L 42 42 L 42 32 M 66 66 L 58 42 L 58 32" stroke="#1e293b" stroke-width="4" stroke-linecap="round" fill="none"/>`;
    } else if (sign.icon === "narrow-right") {
      innerContent = `<path d="M 38 66 L 38 32 M 66 66 L 56 46 L 56 32" stroke="#1e293b" stroke-width="4" stroke-linecap="round" fill="none"/>`;
    } else if (sign.icon === "pedestrian") {
      innerContent = `
        <circle cx="50" cy="35" r="3.5" fill="#1e293b"/>
        <path d="M 44 44 L 52 42 L 56 48 L 51 58 M 52 42 L 48 52 L 43 62 M 43 47 L 55 45" stroke="#1e293b" stroke-width="3" stroke-linecap="round" fill="none"/>
        <line x1="30" y1="63" x2="70" y2="63" stroke="#1e293b" stroke-width="2.5" stroke-linecap="round"/>
      `;
    } else if (sign.icon === "children") {
      innerContent = `
        <circle cx="44" cy="36" r="3" fill="#1e293b"/>
        <path d="M 44 39 L 44 52 L 40 62 M 44 45 L 49 52 L 51 60" stroke="#1e293b" stroke-width="2.5" stroke-linecap="round" fill="none"/>
        <circle cx="58" cy="42" r="2.5" fill="#1e293b"/>
        <path d="M 58 45 L 58 54 L 55 62 M 58 50 L 62 58" stroke="#1e293b" stroke-width="2" stroke-linecap="round" fill="none"/>
      `;
    } else if (sign.icon === "speed-bump") {
      innerContent = `<path d="M 28 58 Q 50 36 72 58" stroke="#1e293b" stroke-width="6" stroke-linecap="round" fill="none"/>`;
    } else if (sign.icon === "slippery-road") {
      innerContent = `
        <rect x="42" y="38" width="16" height="12" rx="3" fill="#1e293b"/>
        <path d="M 36 60 Q 45 52 48 64 Q 52 70 64 54" stroke="#1e293b" stroke-width="2.5" fill="none"/>
      `;
    } else if (sign.icon === "roadworks") {
      innerContent = `
        <circle cx="54" cy="38" r="3.5" fill="#1e293b"/>
        <path d="M 50 43 L 42 54 L 48 56 L 54 44" stroke="#1e293b" stroke-width="3" fill="none"/>
        <line x1="38" y1="62" x2="62" y2="44" stroke="#1e293b" stroke-width="3" stroke-linecap="round"/>
      `;
    } else if (sign.icon === "traffic-light") {
      innerContent = `
        <rect x="43" y="32" width="14" height="30" rx="3" fill="#1e293b"/>
        <circle cx="50" cy="37" r="2.5" fill="#ef4444"/>
        <circle cx="50" cy="47" r="2.5" fill="#f59e0b"/>
        <circle cx="50" cy="57" r="2.5" fill="#10b981"/>
      `;
    } else if (sign.icon === "steep-hill") {
      innerContent = `
        <polygon points="34,60 66,60 66,42" fill="#1e293b"/>
        <text x="46" y="56" font-size="9" font-weight="900" fill="#ffffff">10%</text>
      `;
    } else if (sign.icon === "railway-barrier") {
      innerContent = `
        <line x1="34" y1="46" x2="66" y2="46" stroke="#1e293b" stroke-width="4"/>
        <line x1="34" y1="56" x2="66" y2="56" stroke="#1e293b" stroke-width="4"/>
        <line x1="42" y1="40" x2="42" y2="62" stroke="#1e293b" stroke-width="3"/>
        <line x1="58" y1="40" x2="58" y2="62" stroke="#1e293b" stroke-width="3"/>
      `;
    } else if (sign.icon === "railway-open") {
      innerContent = `
        <rect x="40" y="38" width="20" height="16" rx="3" fill="#1e293b"/>
        <circle cx="45" cy="58" r="3" fill="#1e293b"/><circle cx="55" cy="58" r="3" fill="#1e293b"/>
        <line x1="32" y1="62" x2="68" y2="62" stroke="#1e293b" stroke-width="2"/>
      `;
    } else if (sign.icon === "crosswind") {
      innerContent = `
        <line x1="40" y1="34" x2="40" y2="64" stroke="#1e293b" stroke-width="3"/>
        <polygon points="40,36 64,40 64,52 40,56" fill="#dc2626"/>
        <line x1="48" y1="37" x2="48" y2="55" stroke="#ffffff" stroke-width="3"/>
        <line x1="56" y1="39" x2="56" y2="53" stroke="#ffffff" stroke-width="3"/>
      `;
    } else if (sign.icon === "cross-x") {
      innerContent = `
        <line x1="38" y1="40" x2="62" y2="60" stroke="#1e293b" stroke-width="5" stroke-linecap="round"/>
        <line x1="62" y1="40" x2="38" y2="60" stroke="#1e293b" stroke-width="5" stroke-linecap="round"/>
      `;
    } else {
      // علامة التعجب الافتراضية
      innerContent = `<line x1="50" y1="36" x2="50" y2="52" stroke="#1e293b" stroke-width="4" stroke-linecap="round"/><circle cx="50" cy="59" r="2.5" fill="#1e293b"/>`;
    }

    return `
      <svg viewBox="0 0 100 90" class="w-20 h-20 drop-shadow-md transition transform group-hover:scale-105">
        <polygon points="50,8 92,80 8,80" fill="#ffffff" stroke="#dc2626" stroke-width="8" stroke-linejoin="round"/>
        ${innerContent}
      </svg>
    `;
  }

  // ب. إشارة مثلث مقلوب (Cédez le passage)
  if (sign.shape === "inv-triangle") {
    return `
      <svg viewBox="0 0 100 90" class="w-20 h-20 drop-shadow-md transition transform group-hover:scale-105">
        <polygon points="8,10 92,10 50,82" fill="#ffffff" stroke="#dc2626" stroke-width="8" stroke-linejoin="round"/>
      </svg>
    `;
  }

  // ج. إشارة المعين (طريق ذات أولوية)
  if (sign.shape === "diamond") {
    let diagonalBar = "";
    if (sign.icon === "end-priority-road") {
      diagonalBar = `<line x1="20" y1="80" x2="80" y2="20" stroke="#1e293b" stroke-width="7"/>`;
    }
    return `
      <svg viewBox="0 0 100 100" class="w-20 h-20 drop-shadow-md transition transform group-hover:scale-105">
        <polygon points="50,10 90,50 50,90 10,50" fill="#ffffff" stroke="#94a3b8" stroke-width="3"/>
        <polygon points="50,22 78,50 50,78 22,50" fill="#f59e0b"/>
        ${diagonalBar}
      </svg>
    `;
  }

  // د. إشارة ثمانية الأضلاع (STOP)
  if (sign.shape === "octagon") {
    return `
      <svg viewBox="0 0 100 100" class="w-20 h-20 drop-shadow-md transition transform group-hover:scale-105">
        <polygon points="30,8 70,8 92,30 92,70 70,92 30,92 8,70 8,30" fill="#dc2626" stroke="#ffffff" stroke-width="4"/>
        <text x="50" y="58" font-size="22" font-family="sans-serif" font-weight="900" fill="#ffffff" text-anchor="middle">STOP</text>
      </svg>
    `;
  }

  // هـ. إشارات دائرية
  if (sign.shape === "circle") {
    
    // 1. نهاية المنع (قرص أبيض مع شريط رمادي مائل)
    if (sign.type === "end_prohibition") {
      let endContent = "";
      if (sign.icon === "end-speed-50") {
        endContent = `
          <text x="50" y="60" font-size="28" font-family="sans-serif" font-weight="900" fill="#64748b" text-anchor="middle">50</text>
          <line x1="20" y1="80" x2="80" y2="20" stroke="#475569" stroke-width="6"/>
        `;
      } else if (sign.icon === "end-no-overtaking") {
        endContent = `
          <rect x="32" y="44" width="14" height="20" rx="3" fill="#64748b"/>
          <rect x="54" y="44" width="14" height="20" rx="3" fill="#64748b"/>
          <line x1="20" y1="80" x2="80" y2="20" stroke="#475569" stroke-width="6"/>
        `;
      } else {
        // نهاية جميع الممنوعات (5 خطوط مائلة رمادية)
        endContent = `
          <line x1="20" y1="75" x2="75" y2="20" stroke="#334155" stroke-width="3"/>
          <line x1="24" y1="79" x2="79" y2="24" stroke="#334155" stroke-width="3"/>
          <line x1="28" y1="83" x2="83" y2="28" stroke="#334155" stroke-width="3"/>
        `;
      }

      return `
        <svg viewBox="0 0 100 100" class="w-20 h-20 drop-shadow-md transition transform group-hover:scale-105">
          <circle cx="50" cy="50" r="44" fill="#ffffff" stroke="#cbd5e1" stroke-width="4"/>
          ${endContent}
        </svg>
      `;
    }

    // 2. نهاية الإجبار (دائرة زرقاء مع شريط أحمر مائل)
    if (sign.type === "end_obligation") {
      return `
        <svg viewBox="0 0 100 100" class="w-20 h-20 drop-shadow-md transition transform group-hover:scale-105">
          <circle cx="50" cy="50" r="44" fill="#1d4ed8" stroke="#ffffff" stroke-width="3"/>
          <text x="50" y="58" font-size="24" font-weight="900" fill="#ffffff" text-anchor="middle">30</text>
          <line x1="20" y1="80" x2="80" y2="20" stroke="#dc2626" stroke-width="6"/>
        </svg>
      `;
    }

    // 3. إشارات الإجبار (دائرة زرقاء مع رمز أبيض)
    if (sign.type === "obligation") {
      let innerBlue = "";
      if (sign.icon === "arrow-straight") {
        innerBlue = `<path d="M 50 70 L 50 28 M 40 38 L 50 26 L 60 38" stroke="#ffffff" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`;
      } else if (sign.icon === "arrow-right") {
        innerBlue = `<path d="M 34 50 L 66 50 M 56 40 L 68 50 L 56 60" stroke="#ffffff" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`;
      } else if (sign.icon === "arrow-left") {
        innerBlue = `<path d="M 66 50 L 34 50 M 44 40 L 32 50 L 44 60" stroke="#ffffff" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`;
      } else if (sign.icon === "roundabout-arrows") {
        innerBlue = `
          <circle cx="50" cy="50" r="22" stroke="#ffffff" stroke-width="4" stroke-dasharray="14 10" fill="none"/>
          <path d="M 46 24 L 54 28 L 48 34" fill="#ffffff"/>
        `;
      } else if (sign.icon === "min-speed-30") {
        innerBlue = `<text x="50" y="58" font-size="26" font-family="sans-serif" font-weight="900" fill="#ffffff" text-anchor="middle">30</text>`;
      } else if (sign.icon === "cycle-path") {
        innerBlue = `
          <circle cx="38" cy="56" r="8" stroke="#ffffff" stroke-width="2" fill="none"/>
          <circle cx="62" cy="56" r="8" stroke="#ffffff" stroke-width="2" fill="none"/>
          <path d="M 38 56 L 48 44 L 58 44 M 48 44 L 52 56 L 62 56" stroke="#ffffff" stroke-width="2" fill="none"/>
        `;
      } else if (sign.icon === "snow-chains") {
        innerBlue = `
          <circle cx="50" cy="50" r="20" stroke="#ffffff" stroke-width="6" stroke-dasharray="6 6" fill="none"/>
        `;
      } else {
        innerBlue = `<path d="M 40 40 L 60 60 M 60 40 L 40 60" stroke="#ffffff" stroke-width="4"/>`;
      }

      return `
        <svg viewBox="0 0 100 100" class="w-20 h-20 drop-shadow-md transition transform group-hover:scale-105">
          <circle cx="50" cy="50" r="44" fill="#1d4ed8" stroke="#ffffff" stroke-width="3"/>
          ${innerBlue}
        </svg>
      `;
    }

    // 4. إشارات المنع (دائرة بيضاء بحافة حمراء)
    if (sign.type === "prohibition" || sign.type === "priority") {
      let innerProhib = "";

      if (sign.icon === "sens-interdit") {
        return `
          <svg viewBox="0 0 100 100" class="w-20 h-20 drop-shadow-md transition transform group-hover:scale-105">
            <circle cx="50" cy="50" r="44" fill="#dc2626"/>
            <rect x="20" y="42" width="60" height="16" fill="#ffffff" rx="3"/>
          </svg>
        `;
      } else if (sign.icon === "circulation-interdite") {
        return `
          <svg viewBox="0 0 100 100" class="w-20 h-20 drop-shadow-md transition transform group-hover:scale-105">
            <circle cx="50" cy="50" r="44" fill="#ffffff" stroke="#dc2626" stroke-width="10"/>
          </svg>
        `;
      } else if (sign.icon && sign.icon.startsWith("speed-")) {
        const num = sign.icon.replace("speed-", "");
        innerProhib = `<text x="50" y="60" font-size="28" font-family="sans-serif" font-weight="900" fill="#0f172a" text-anchor="middle">${num}</text>`;
      } else if (sign.icon === "no-overtaking") {
        innerProhib = `
          <rect x="30" y="44" width="16" height="24" rx="3" fill="#dc2626"/>
          <rect x="54" y="44" width="16" height="24" rx="3" fill="#0f172a"/>
        `;
      } else if (sign.icon === "no-truck-overtake") {
        innerProhib = `
          <rect x="26" y="42" width="22" height="26" rx="3" fill="#dc2626"/>
          <rect x="54" y="46" width="16" height="22" rx="3" fill="#0f172a"/>
        `;
      } else if (sign.icon === "no-parking") {
        return `
          <svg viewBox="0 0 100 100" class="w-20 h-20 drop-shadow-md transition transform group-hover:scale-105">
            <circle cx="50" cy="50" r="44" fill="#1d4ed8" stroke="#dc2626" stroke-width="10"/>
            <line x1="20" y1="20" x2="80" y2="80" stroke="#dc2626" stroke-width="10"/>
          </svg>
        `;
      } else if (sign.icon === "no-stop-parking") {
        return `
          <svg viewBox="0 0 100 100" class="w-20 h-20 drop-shadow-md transition transform group-hover:scale-105">
            <circle cx="50" cy="50" r="44" fill="#1d4ed8" stroke="#dc2626" stroke-width="10"/>
            <line x1="20" y1="20" x2="80" y2="80" stroke="#dc2626" stroke-width="9"/>
            <line x1="80" y1="20" x2="20" y2="80" stroke="#dc2626" stroke-width="9"/>
          </svg>
        `;
      } else if (sign.icon === "no-right-turn") {
        innerProhib = `
          <path d="M 38 64 L 38 48 Q 38 38 48 38 L 62 38 M 54 30 L 64 38 L 54 46" stroke="#1e293b" stroke-width="4" fill="none"/>
          <line x1="22" y1="22" x2="78" y2="78" stroke="#dc2626" stroke-width="7"/>
        `;
      } else if (sign.icon === "no-left-turn") {
        innerProhib = `
          <path d="M 62 64 L 62 48 Q 62 38 52 38 L 38 38 M 46 30 L 36 38 L 46 46" stroke="#1e293b" stroke-width="4" fill="none"/>
          <line x1="22" y1="22" x2="78" y2="78" stroke="#dc2626" stroke-width="7"/>
        `;
      } else if (sign.icon === "no-u-turn") {
        innerProhib = `
          <path d="M 60 64 L 60 44 Q 60 32 50 32 Q 40 32 40 44 L 40 60 M 32 52 L 40 62 L 48 52" stroke="#1e293b" stroke-width="4" fill="none"/>
          <line x1="22" y1="22" x2="78" y2="78" stroke="#dc2626" stroke-width="7"/>
        `;
      } else if (sign.icon === "no-horn") {
        innerProhib = `
          <path d="M 34 46 L 44 46 L 56 36 L 56 64 L 44 54 L 34 54 Z" fill="#1e293b"/>
          <line x1="22" y1="22" x2="78" y2="78" stroke="#dc2626" stroke-width="7"/>
        `;
      } else if (sign.icon === "no-trucks") {
        innerProhib = `
          <rect x="28" y="44" width="28" height="18" fill="#1e293b"/>
          <rect x="56" y="48" width="14" height="14" fill="#1e293b"/>
          <line x1="22" y1="22" x2="78" y2="78" stroke="#dc2626" stroke-width="7"/>
        `;
      } else if (sign.icon === "no-pedestrians") {
        innerProhib = `
          <circle cx="50" cy="38" r="3.5" fill="#1e293b"/>
          <path d="M 45 44 L 52 42 L 56 48 L 51 58" stroke="#1e293b" stroke-width="3" fill="none"/>
          <line x1="22" y1="22" x2="78" y2="78" stroke="#dc2626" stroke-width="7"/>
        `;
      } else if (sign.icon === "safety-distance-70") {
        innerProhib = `
          <rect x="24" y="48" width="14" height="16" fill="#1e293b"/>
          <rect x="62" y="48" width="14" height="16" fill="#1e293b"/>
          <text x="50" y="58" font-size="12" font-weight="900" fill="#dc2626" text-anchor="middle">70m</text>
        `;
      } else if (sign.icon === "priority-oncoming") {
        innerProhib = `
          <path d="M 42 66 L 42 36 M 36 44 L 42 34 L 48 44" stroke="#dc2626" stroke-width="4" fill="none"/>
          <path d="M 58 34 L 58 64 M 52 56 L 58 66 L 64 56" stroke="#1e293b" stroke-width="4" fill="none"/>
        `;
      } else {
        innerProhib = `<line x1="22" y1="22" x2="78" y2="78" stroke="#dc2626" stroke-width="7"/>`;
      }

      return `
        <svg viewBox="0 0 100 100" class="w-20 h-20 drop-shadow-md transition transform group-hover:scale-105">
          <circle cx="50" cy="50" r="44" fill="#ffffff" stroke="#dc2626" stroke-width="10"/>
          ${innerProhib}
        </svg>
      `;
    }
  }

  // و. إشارات مربعة ومستطيلة (إرشاد وخدمات)
  if (sign.shape === "square") {
    let squareContent = "";
    if (sign.icon === "parking-p") {
      squareContent = `<text x="50" y="65" font-size="44" font-family="sans-serif" font-weight="900" fill="#ffffff" text-anchor="middle">P</text>`;
    } else if (sign.icon === "hospital-h") {
      squareContent = `<text x="50" y="65" font-size="44" font-family="sans-serif" font-weight="900" fill="#dc2626" text-anchor="middle">H</text>`;
    } else if (sign.icon === "fuel-pump") {
      squareContent = `
        <rect x="36" y="32" width="22" height="36" rx="4" fill="#1e3a8a"/>
        <rect x="40" y="36" width="14" height="12" rx="2" fill="#ffffff"/>
        <path d="M 58 40 L 64 44 L 64 62 L 60 62" stroke="#1e3a8a" stroke-width="3" fill="none"/>
      `;
    } else if (sign.icon === "one-way-road") {
      squareContent = `<path d="M 50 72 L 50 28 M 38 40 L 50 26 L 62 40" stroke="#ffffff" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`;
    } else if (sign.icon === "dead-end") {
      squareContent = `
        <rect x="44" y="38" width="12" height="34" fill="#ffffff"/>
        <rect x="34" y="34" width="32" height="10" fill="#dc2626"/>
      `;
    } else if (sign.icon === "highway-start") {
      squareContent = `
        <line x1="32" y1="72" x2="42" y2="28" stroke="#ffffff" stroke-width="4"/>
        <line x1="68" y1="72" x2="58" y2="28" stroke="#ffffff" stroke-width="4"/>
        <rect x="28" y="44" width="44" height="8" rx="2" fill="#ffffff"/>
      `;
    } else if (sign.icon === "highway-end") {
      squareContent = `
        <line x1="32" y1="72" x2="42" y2="28" stroke="#ffffff" stroke-width="4"/>
        <line x1="68" y1="72" x2="58" y2="28" stroke="#ffffff" stroke-width="4"/>
        <rect x="28" y="44" width="44" height="8" rx="2" fill="#ffffff"/>
        <line x1="16" y1="84" x2="84" y2="16" stroke="#dc2626" stroke-width="7"/>
      `;
    } else if (sign.icon === "bus-stop") {
      squareContent = `
        <rect x="32" y="34" width="36" height="32" rx="4" fill="#ffffff"/>
        <rect x="36" y="38" width="28" height="12" fill="#2563eb"/>
        <circle cx="40" cy="58" r="3" fill="#2563eb"/><circle cx="60" cy="58" r="3" fill="#2563eb"/>
      `;
    } else if (sign.icon === "emergency-phone") {
      squareContent = `
        <path d="M 38 34 Q 50 42 62 34 L 62 42 Q 50 50 38 42 Z" fill="#ffffff"/>
        <path d="M 44 42 L 56 42 L 56 60 L 44 60 Z" fill="#ffffff"/>
      `;
    } else {
      squareContent = `<text x="50" y="60" font-size="28" font-weight="900" fill="#ffffff" text-anchor="middle">ℹ</text>`;
    }

    const isLightBg = sign.icon === "hospital-h" || sign.icon === "fuel-pump";
    return `
      <svg viewBox="0 0 100 100" class="w-20 h-20 drop-shadow-md transition transform group-hover:scale-105">
        <rect x="8" y="8" width="84" height="84" rx="14" fill="${isLightBg ? '#ffffff' : '#2563eb'}" stroke="${isLightBg ? '#93c5fd' : '#1d4ed8'}" stroke-width="4"/>
        ${squareContent}
      </svg>
    `;
  }

  // افتراضي
  return `
    <svg viewBox="0 0 100 100" class="w-20 h-20 drop-shadow-md">
      <circle cx="50" cy="50" r="40" fill="#2563eb"/>
    </svg>
  `;
}

function renderTrafficSigns(filterType = "all", searchQuery = "") {
  const container = document.getElementById("traffic-signs-container");
  if (!container) return;

  let filtered = TRAFFIC_SIGNS_DB;

  if (filterType !== "all") {
    filtered = filtered.filter(item => item.type === filterType);
  }

  if (searchQuery.trim() !== "") {
    const q = searchQuery.toLowerCase().trim();
    filtered = filtered.filter(item =>
      item.title.toLowerCase().includes(q) ||
      item.desc.toLowerCase().includes(q) ||
      item.categoryName.toLowerCase().includes(q)
    );
  }

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="col-span-full text-center py-12 bg-white rounded-2xl border border-dashed border-slate-300">
        <div class="w-16 h-16 mx-auto mb-3 bg-amber-50 rounded-full flex items-center justify-center text-amber-500">
          <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
        </div>
        <h4 class="text-lg font-bold text-slate-700">لم يتم العثور على أية إشارة تطابق بحثك</h4>
        <p class="text-sm text-slate-500 mt-1">جرّب البحث بكلمة أخرى مثل 'سرعة'، 'تجاوز'، 'أولوية' أو اختر 'الكل'</p>
      </div>
    `;
    return;
  }

  // تحديث عداد الإشارات إن وُجد
  const countBadge = document.getElementById("signs-count-badge");
  if (countBadge) {
    countBadge.innerText = `${filtered.length} إشارة معتمدة`;
  }

  container.innerHTML = filtered.map(sign => `
    <div class="group bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-xl hover:border-blue-400 transition-all duration-300 flex flex-col items-center text-center">
      <div class="mb-4 h-24 flex items-center justify-center">
        ${generateSignGraphic(sign)}
      </div>
      <span class="inline-block text-xs font-semibold px-2.5 py-1 rounded-full mb-2 ${
        sign.type === 'danger' ? 'bg-red-50 text-red-700 border border-red-100' :
        sign.type === 'prohibition' ? 'bg-rose-50 text-rose-700 border border-rose-100' :
        sign.type === 'end_prohibition' ? 'bg-slate-100 text-slate-700 border border-slate-200' :
        sign.type === 'obligation' ? 'bg-blue-50 text-blue-700 border border-blue-100' :
        sign.type === 'end_obligation' ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' :
        sign.type === 'priority' ? 'bg-amber-50 text-amber-800 border border-amber-200' :
        'bg-sky-50 text-sky-700 border border-sky-100'
      }">
        ${sign.categoryName}
      </span>
      <h4 class="font-bold text-slate-800 text-base mb-2 group-hover:text-blue-700 transition">
        ${sign.title}
      </h4>
      <p class="text-xs text-slate-600 leading-relaxed mt-auto">
        ${sign.desc}
      </p>
    </div>
  `).join("");
}

function initSignsFilter() {
  const buttons = document.querySelectorAll(".sign-filter-btn");
  buttons.forEach(btn => {
    btn.addEventListener("click", () => {
      buttons.forEach(b => {
        b.classList.remove("active", "bg-blue-700", "text-white");
        b.classList.add("bg-white", "text-slate-700");
      });
      btn.classList.add("active", "bg-blue-700", "text-white");
      btn.classList.remove("bg-white", "text-slate-700");

      const filter = btn.dataset.filter;
      const searchInput = document.getElementById("signs-search");
      renderTrafficSigns(filter, searchInput ? searchInput.value : "");
    });
  });
}

function initSignsSearch() {
  const searchInput = document.getElementById("signs-search");
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      const activeBtn = document.querySelector(".sign-filter-btn.active");
      const currentFilter = activeBtn ? activeBtn.dataset.filter : "all";
      renderTrafficSigns(currentFilter, e.target.value);
    });
  }
}

// ==========================================
// 4. المحرك التفاعلي للامتحان وكويز السلامة المرورية
// ==========================================
window.setQuizMode = function(mode) {
  quizState.mode = mode;

  // تحديث أزرار تبويب الكويز
  document.querySelectorAll(".quiz-mode-btn").forEach(btn => {
    btn.classList.remove("active", "bg-amber-500", "text-slate-950", "shadow-lg");
    btn.classList.add("bg-slate-800/80", "text-slate-300");
    if (btn.dataset.mode === mode) {
      btn.classList.add("active", "bg-amber-500", "text-slate-950", "shadow-lg");
      btn.classList.remove("bg-slate-800/80", "text-slate-300");
    }
  });

  // تحديد بنك الأسئلة المعتمد حسب النمط
  if (mode === "safety") {
    quizState.questions = (typeof ROAD_SAFETY_QUESTIONS !== "undefined") ? [...ROAD_SAFETY_QUESTIONS] : [...QUIZ_QUESTIONS];
    const titleEl = document.getElementById("quiz-intro-title");
    const descEl = document.getElementById("quiz-intro-desc");
    if (titleEl) titleEl.innerText = "كويز السلامة المرورية والوقاية من الحوادث 🛡️";
    if (descEl) descEl.innerText = "اختبر معلوماتك حول مسافات الأمان، قواعد السياقة في المطر والليل، حزام الأمان، والتصرف السليم في الطوارئ.";
  } else if (mode === "all") {
    quizState.questions = (typeof ALL_QUIZ_QUESTIONS !== "undefined") ? [...ALL_QUIZ_QUESTIONS] : [...QUIZ_QUESTIONS];
    const titleEl = document.getElementById("quiz-intro-title");
    const descEl = document.getElementById("quiz-intro-desc");
    if (titleEl) titleEl.innerText = "الامتحان الشامل (قانون المرور + السلامة المرورية) 🎯";
    if (descEl) descEl.innerText = "اختبار مكثف يجمع كافة أسئلة قانون المرور النظري مع قواعد السلامة والوقاية الطرقية.";
  } else {
    quizState.questions = (typeof CODE_EXAM_QUESTIONS !== "undefined") ? [...CODE_EXAM_QUESTIONS] : [...QUIZ_QUESTIONS];
    const titleEl = document.getElementById("quiz-intro-title");
    const descEl = document.getElementById("quiz-intro-desc");
    if (titleEl) titleEl.innerText = "امتحان قانون المرور والأولويات (Test Code) 🚦";
    if (descEl) descEl.innerText = "يحتوي هذا الاختبار على أسئلة حقيقية تغطي أولويات التقاطعات، إشارات المرور، ومسارات الطرق.";
  }

  // إعادة ضبط الكويز لبطاقة البداية
  const introCard = document.getElementById("quiz-intro-card");
  const activeCard = document.getElementById("quiz-active-card");
  const resultsCard = document.getElementById("quiz-results-card");
  if (introCard) introCard.classList.remove("hidden");
  if (activeCard) activeCard.classList.add("hidden");
  if (resultsCard) resultsCard.classList.add("hidden");

  quizState.currentQuestionIndex = 0;
  quizState.score = 0;
  quizState.selectedAnswers = {};
};

function initQuiz() {
  setQuizMode('code');

  // أزرار تبديل نمط الكويز
  document.querySelectorAll(".quiz-mode-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      setQuizMode(btn.dataset.mode);
    });
  });

  const startBtn = document.getElementById("start-quiz-btn");
  if (startBtn) {
    startBtn.addEventListener("click", () => {
      document.getElementById("quiz-intro-card").classList.add("hidden");
      document.getElementById("quiz-active-card").classList.remove("hidden");
      loadQuestion(0);
    });
  }

  const nextBtn = document.getElementById("quiz-next-btn");
  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      if (quizState.currentQuestionIndex < quizState.questions.length - 1) {
        quizState.currentQuestionIndex++;
        loadQuestion(quizState.currentQuestionIndex);
      } else {
        showQuizResults();
      }
    });
  }

  const restartBtn = document.getElementById("restart-quiz-btn");
  if (restartBtn) {
    restartBtn.addEventListener("click", () => {
      document.getElementById("quiz-results-card").classList.add("hidden");
      document.getElementById("quiz-active-card").classList.remove("hidden");
      quizState.currentQuestionIndex = 0;
      quizState.score = 0;
      quizState.selectedAnswers = {};
      loadQuestion(0);
    });
  }
}

function loadQuestion(index) {
  const q = quizState.questions[index];
  quizState.answered = false;

  const total = quizState.questions.length;
  document.getElementById("quiz-counter").innerText = `السؤال ${index + 1} من ${total}`;
  document.getElementById("quiz-badge").innerText = q.badge || "قانون المرور";
  document.getElementById("quiz-progress-bar").style.width = `${((index + 1) / total) * 100}%`;

  document.getElementById("quiz-question-text").innerText = q.question;

  // الرسم التوضيحي للسؤال إن وجد
  const illustrationBox = document.getElementById("quiz-illustration-box");
  if (q.signSvg || q.diagramType) {
    illustrationBox.classList.remove("hidden");
    illustrationBox.innerHTML = generateQuestionIllustration(q);
  } else {
    illustrationBox.classList.add("hidden");
    illustrationBox.innerHTML = "";
  }

  // خيارات الإجابة
  const optionsBox = document.getElementById("quiz-options-container");
  optionsBox.innerHTML = q.options.map((opt, i) => `
    <button type="button" onclick="selectQuizAnswer(${i})" class="quiz-option w-full p-4 rounded-xl border border-slate-200 bg-white text-right font-medium text-slate-800 flex items-center justify-between group">
      <div class="flex items-center gap-3">
        <span class="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-sm group-hover:bg-blue-600 group-hover:text-white transition">
          ${i + 1}
        </span>
        <span class="text-sm md:text-base">${opt}</span>
      </div>
      <span class="option-icon text-lg hidden"></span>
    </button>
  `).join("");

  // إخفاء صندوق الشرح وزر التالي حتى يتم الاختيار
  document.getElementById("quiz-explanation-box").classList.add("hidden");
  document.getElementById("quiz-next-btn").disabled = true;
  document.getElementById("quiz-next-btn").classList.add("opacity-50", "cursor-not-allowed");
}

function generateQuestionIllustration(q) {
  if (q.diagramType === "crossroad") {
    // رسم تخطيطي لتقاطع طرق بدون إشارات
    return `
      <div class="relative w-48 h-48 mx-auto bg-slate-800 rounded-xl overflow-hidden shadow-inner flex items-center justify-center border-2 border-slate-700">
        <!-- الطرق المتقاطعة -->
        <div class="absolute w-16 h-full bg-slate-700 left-16 border-l-2 border-r-2 border-dashed border-yellow-400"></div>
        <div class="absolute h-16 w-full bg-slate-700 top-16 border-t-2 border-b-2 border-dashed border-yellow-400"></div>
        
        <!-- سيارة قادمة من اليمين (حمراء) -->
        <div class="absolute top-20 right-4 flex items-center gap-1 bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow">
          سيارة (أ) ➔
        </div>

        <!-- سيارتك من الأسفل (زرقاء) -->
        <div class="absolute bottom-3 left-20 flex items-center gap-1 bg-blue-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow">
          ▲ سيارتك
        </div>

        <div class="absolute top-1 left-2 text-[10px] text-yellow-300 font-semibold">
          تقاطع بدون إشارة
        </div>
      </div>
    `;
  } else if (q.signSvg === "priority_road") {
    return `
      <div class="flex justify-center p-2">
        <svg viewBox="0 0 100 90" class="w-24 h-24 drop-shadow-md">
          <polygon points="50,8 92,80 8,80" fill="#ffffff" stroke="#dc2626" stroke-width="8" stroke-linejoin="round"/>
          <polygon points="46,32 54,32 54,64 46,64" fill="#1e293b"/>
          <polygon points="34,44 66,44 66,52 34,52" fill="#1e293b"/>
        </svg>
      </div>
    `;
  } else if (q.signSvg === "speed_50") {
    return `
      <div class="flex justify-center p-2">
        <svg viewBox="0 0 100 100" class="w-24 h-24 drop-shadow-md">
          <circle cx="50" cy="50" r="44" fill="#ffffff" stroke="#dc2626" stroke-width="10"/>
          <text x="50" y="60" font-size="28" font-family="sans-serif" font-weight="900" fill="#0f172a" text-anchor="middle">50</text>
        </svg>
      </div>
    `;
  } else if (q.signSvg === "no_parking") {
    return `
      <div class="flex justify-center p-2">
        <svg viewBox="0 0 100 100" class="w-24 h-24 drop-shadow-md">
          <circle cx="50" cy="50" r="44" fill="#1d4ed8" stroke="#dc2626" stroke-width="10"/>
          <line x1="20" y1="20" x2="80" y2="80" stroke="#dc2626" stroke-width="10"/>
        </svg>
      </div>
    `;
  } else if (q.signSvg === "turn_right") {
    return `
      <div class="flex justify-center p-2">
        <svg viewBox="0 0 100 100" class="w-24 h-24 drop-shadow-md">
          <circle cx="50" cy="50" r="44" fill="#1d4ed8" stroke="#ffffff" stroke-width="3"/>
          <path d="M 40 68 L 40 45 Q 40 32 55 32 L 66 32 M 58 24 L 68 32 L 58 40" stroke="#ffffff" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
        </svg>
      </div>
    `;
  }
  return "";
}

window.selectQuizAnswer = function(optionIndex) {
  if (quizState.answered) return;
  quizState.answered = true;

  const currentQ = quizState.questions[quizState.currentQuestionIndex];
  const isCorrect = optionIndex === currentQ.correct;

  if (isCorrect) {
    quizState.score++;
  }
  quizState.selectedAnswers[quizState.currentQuestionIndex] = optionIndex;

  // تلوين الخيارات
  const optionButtons = document.querySelectorAll(".quiz-option");
  optionButtons.forEach((btn, idx) => {
    btn.classList.remove("hover:bg-blue-50");
    if (idx === currentQ.correct) {
      btn.classList.add("correct");
      const icon = btn.querySelector(".option-icon");
      icon.classList.remove("hidden");
      icon.innerHTML = "✓ إجابة صحيحة";
    } else if (idx === optionIndex && !isCorrect) {
      btn.classList.add("wrong");
      const icon = btn.querySelector(".option-icon");
      icon.classList.remove("hidden");
      icon.innerHTML = "✕ إجابة خاطئة";
    }
  });

  // إظهار الشرح والتصحيح
  const expBox = document.getElementById("quiz-explanation-box");
  expBox.classList.remove("hidden");
  document.getElementById("quiz-explanation-text").innerText = currentQ.explanation;

  const nextBtn = document.getElementById("quiz-next-btn");
  nextBtn.disabled = false;
  nextBtn.classList.remove("opacity-50", "cursor-not-allowed");
  if (quizState.currentQuestionIndex === quizState.questions.length - 1) {
    nextBtn.innerText = "عرض النتيجة النهائية ➔";
  } else {
    nextBtn.innerText = "السؤال التالي ➔";
  }
};

function showQuizResults() {
  document.getElementById("quiz-active-card").classList.add("hidden");
  const resultsCard = document.getElementById("quiz-results-card");
  resultsCard.classList.remove("hidden");

  const total = quizState.questions.length;
  const score = quizState.score;
  const percentage = Math.round((score / total) * 100);

  document.getElementById("result-score-text").innerText = `${score} / ${total}`;
  document.getElementById("result-percentage").innerText = `${percentage}%`;

  const statusTitle = document.getElementById("result-status-title");
  const statusDesc = document.getElementById("result-status-desc");
  const resultIcon = document.getElementById("result-icon-container");

  if (percentage >= 70) {
    statusTitle.innerText = "ممتاز! لقد اجتزت الاختبار بنجاح 🎉";
    statusTitle.className = "text-2xl font-black text-emerald-600 mb-2";
    statusDesc.innerText = "مستواك رائع في استيعاب قواعد وإشارات المرور! يمكنك الآن التسجيل بثقة لخوض الامتحان الرسمي.";
    resultIcon.innerHTML = `<div class="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-4xl shadow-inner mx-auto">✓</div>`;
  } else {
    statusTitle.innerText = "تحتاج إلى المزيد من المراجعة والتدريب 🚗";
    statusTitle.className = "text-2xl font-black text-amber-600 mb-2";
    statusDesc.innerText = "لا تقلق! قانون المرور يحتاج للممارسة والتركيز. التحق بدوراتنا في مدرسة الأمان لتضمن نجاحك بسهولة من أول محاولة.";
    resultIcon.innerHTML = `<div class="w-20 h-20 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center text-4xl shadow-inner mx-auto">!</div>`;
  }
}

// ==========================================
// 5. استمارة التسجيل والحجز والإرسال للواتساب
// ==========================================
function initRegistrationForm() {
  const form = document.getElementById("registration-form");
  if (!form) return;

  const whatsappBtn = document.getElementById("submit-whatsapp-btn");
  const directSubmitBtn = document.getElementById("submit-direct-btn");

  // إرسال عبر واتساب مباشرة بنقرة زر
  if (whatsappBtn) {
    whatsappBtn.addEventListener("click", (e) => {
      e.preventDefault();
      if (!validateForm(form)) return;

      const data = getFormData(form);
      data.id = "REG-" + Math.floor(100000 + Math.random() * 900000);
      data.date = new Date().toLocaleDateString("ar-DZ") + " " + new Date().toLocaleTimeString("ar-DZ", { hour: '2-digit', minute: '2-digit' });
      data.status = "new";

      // حفظ الطلب في الذاكرة لتتبعه في لوحة التحكم
      const existing = JSON.parse(localStorage.getItem("drivingSchoolBookings") || "[]");
      existing.unshift(data);
      localStorage.setItem("drivingSchoolBookings", JSON.stringify(existing));

      const text = `*طلب تسجيل جديد - مدرسة تعليم السياقة* 🚗
----------------------------------
👤 *الاسم الكامل:* ${data.name}
📱 *رقم الهاتف:* ${data.phone}
🪪 *صنف الرخصة المطلوب:* ${data.licenseType}
📚 *نوع الدورة:* ${data.courseType}
⏰ *الفترة المفضلة:* ${data.shift}
📍 *الفرع أو المنطقة:* ${data.branch || "الفرع الرئيسي"}
📝 *ملاحظات:* ${data.notes || "لا توجد"}
----------------------------------
أرجو تزويدي بالموعد المقترح لإيداع الملف وبدء الحصص. شكراً لكم!`;

      const encoded = encodeURIComponent(text);
      const whatsappUrl = `https://wa.me/${SCHOOL_CONFIG.whatsapp}?text=${encoded}`;
      
      window.open(whatsappUrl, "_blank");
      showSuccessModal(data);
      form.reset();
    });
  }

  // إرسال وحفظ محلي
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!validateForm(form)) return;

    const data = getFormData(form);
    data.id = "REG-" + Math.floor(100000 + Math.random() * 900000);
    data.date = new Date().toLocaleDateString("ar-DZ") + " " + new Date().toLocaleTimeString("ar-DZ", { hour: '2-digit', minute: '2-digit' });
    data.status = "new";
    
    // حفظ الطلب في الذاكرة المحلية (localStorage) لتتبعه في لوحة التحكم
    const existing = JSON.parse(localStorage.getItem("drivingSchoolBookings") || "[]");
    existing.unshift(data);
    localStorage.setItem("drivingSchoolBookings", JSON.stringify(existing));

    showSuccessModal(data);
    form.reset();
  });
}

function getFormData(form) {
  return {
    name: form.querySelector("#reg-name").value.trim(),
    phone: form.querySelector("#reg-phone").value.trim(),
    licenseType: form.querySelector("#reg-license").value,
    courseType: form.querySelector("#reg-course").value,
    shift: form.querySelector("#reg-shift").value,
    branch: form.querySelector("#reg-branch").value,
    notes: form.querySelector("#reg-notes").value.trim()
  };
}

function validateForm(form) {
  const name = form.querySelector("#reg-name").value.trim();
  const phone = form.querySelector("#reg-phone").value.trim();

  if (!name || name.length < 3) {
    alert("يرجى إدخال الاسم الكامل بشكل صحيح.");
    form.querySelector("#reg-name").focus();
    return false;
  }

  if (!phone || phone.length < 8) {
    alert("يرجى إدخال رقم هاتف صحيح للتواصل.");
    form.querySelector("#reg-phone").focus();
    return false;
  }

  return true;
}

function showSuccessModal(data) {
  const modal = document.getElementById("booking-success-modal");
  if (modal) {
    document.getElementById("modal-user-name").innerText = data.name;
    document.getElementById("modal-license-type").innerText = data.licenseType;
    modal.classList.remove("hidden");
  } else {
    alert(`شكراً لك يا ${data.name}! تم استلام طلبك للتسجيل في صنف (${data.licenseType}) بنجاح. سنتواصل معك هاتفياً قريباً.`);
  }
}

window.closeSuccessModal = function() {
  const modal = document.getElementById("booking-success-modal");
  if (modal) modal.classList.add("hidden");
};

// ==========================================
// 6. الأسئلة الشائعة (FAQ Accordion)
// ==========================================
function initFaqAccordion() {
  const items = document.querySelectorAll(".faq-item");
  items.forEach(item => {
    const btn = item.querySelector(".faq-question");
    const content = item.querySelector(".faq-answer");
    const icon = item.querySelector(".faq-icon");

    if (btn && content) {
      btn.addEventListener("click", () => {
        const isOpen = !content.classList.contains("hidden");

        // إغلاق باقي الأسئلة
        items.forEach(other => {
          other.querySelector(".faq-answer").classList.add("hidden");
          const otherIcon = other.querySelector(".faq-icon");
          if (otherIcon) otherIcon.style.transform = "rotate(0deg)";
        });

        if (!isOpen) {
          content.classList.remove("hidden");
          if (icon) icon.style.transform = "rotate(180deg)";
        }
      });
    }
  });
}

// ==========================================
// 7. زر الصعود للأعلى والتمرير السلس
// ==========================================
function initBackToTop() {
  const topBtn = document.getElementById("back-to-top-btn");
  if (!topBtn) return;

  window.addEventListener("scroll", () => {
    if (window.scrollY > 400) {
      topBtn.classList.remove("opacity-0", "pointer-events-none");
    } else {
      topBtn.classList.add("opacity-0", "pointer-events-none");
    }
  });

  topBtn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

function setupSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener("click", function(e) {
      const targetId = this.getAttribute("href");
      if (targetId === "#") return;
      const targetElem = document.querySelector(targetId);
      if (targetElem) {
        e.preventDefault();
        targetElem.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });
}

// دالة سريعة لاختيار الصنف وتوجيه المستخدم لاستمارة الحجز
window.selectLicenseForBooking = function(licenseName) {
  const licenseSelect = document.getElementById("reg-license");
  if (licenseSelect) {
    licenseSelect.value = licenseName;
  }
  const formSection = document.getElementById("registration-section");
  if (formSection) {
    formSection.scrollIntoView({ behavior: "smooth" });
  }
};
