// Theme Switcher Logic
function initTheme() {
  const toggleBtn = document.getElementById('theme-toggle');
  
  // Determine initial theme
  let currentTheme = localStorage.getItem('theme');
  if (!currentTheme) {
    currentTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  document.documentElement.setAttribute('data-theme', currentTheme);
  
  if (toggleBtn) {
    toggleBtn.textContent = currentTheme === 'dark' ? '☀️' : '🌙';
    toggleBtn.addEventListener('click', () => {
      let extTheme = document.documentElement.getAttribute('data-theme');
      let newTheme = extTheme === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', newTheme);
      localStorage.setItem('theme', newTheme);
      toggleBtn.textContent = newTheme === 'dark' ? '☀️' : '🌙';
    });
  }

  // Auto-listen to OS changes if no manual override
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
    if (!localStorage.getItem('theme')) {
      const newTheme = e.matches ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', newTheme);
      if (toggleBtn) toggleBtn.textContent = newTheme === 'dark' ? '☀️' : '🌙';
    }
  });
}

// 3D Vanilla Tilt Effect for Cards
function initTilt() {
  const tiltCards = document.querySelectorAll('.tilt-card');
  tiltCards.forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      const rotateX = ((y - centerY) / centerY) * -10; // Max 10 deg
      const rotateY = ((x - centerX) / centerX) * 10;
      
      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
    });
    
    card.addEventListener('mouseleave', () => {
      card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
    });
  });
}

// GSAP Scroll Animations (The ScrollFloat effect)
function initGSAP() {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
  
  gsap.registerPlugin(ScrollTrigger);

  // 1. Hero Title Elastic Text Stagger
  const title = document.getElementById('gsap-hero-title');
  if (title) {
    // Split text into wrapped spans for staggering
    const text = title.innerHTML;
    // Basic split by words to preserve HTML inside (like <br> or <span class="gradient-text">)
    // A robust split needs libraries, but a simple split by children/text nodes:
    gsap.from(title, {
      y: 50,
      opacity: 0,
      duration: 1.5,
      ease: "back.inOut(2)",
      scrollTrigger: {
        trigger: title,
        start: "top bottom-=10%",
        end: "bottom center",
        toggleActions: "play none none reverse"
      }
    });
  }

  // 2. Animate Main Grid Cards on Scroll
  const gridCards = document.querySelectorAll('.builder-card');
  if (gridCards.length > 0) {
    gsap.fromTo(gridCards, 
      { y: 50, opacity: 0, scale: 0.95 }, 
      {
        y: 0, opacity: 1, scale: 1,
        duration: 0.8,
        ease: "back.out(1.5)",
        stagger: 0.1,
        scrollTrigger: {
          trigger: '.cards-grid',
          start: "top bottom-=15%"
        }
      }
    );
  }
}

// Initialize everything on DOM Load
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initTilt();
  initGSAP();
});

// Since builder cards are dynamically injected by Javascript later, 
// we expose a re-initializer for the tilt effect and scrolltrigger.
window.refreshMotionEffects = function() {
  initTilt();
  if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh();
};