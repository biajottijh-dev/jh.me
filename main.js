
// ── 데이터 로드 ──
let DATA = {};

function loadData() {
  DATA = JSON.parse(document.getElementById('site-data').textContent);
  render();
}

function render() {
  try { renderHeroKeywords(); } catch(e) { console.error('heroKeywords:', e); }
  try { renderAbout(); } catch(e) { console.error('about:', e); }
  try { renderCareer(); } catch(e) { console.error('career:', e); }
  try { renderProjects(); } catch(e) { console.error('projects:', e); }
  try { renderMedia(); } catch(e) { console.error('media:', e); }
  try { renderAwards(); } catch(e) { console.error('awards:', e); }
  try { renderSkills(); } catch(e) { console.error('skills:', e); }
  try { renderContact(); } catch(e) { console.error('contact:', e); }
  try { observeFadeIns(); } catch(e) { console.error('fadeIns:', e); }
}

// ── Hero 키워드 ──
function renderHeroKeywords() {
  // 포지션 키워드를 About 이름 아래에 나열
  const wrap = document.getElementById('aboutKeywords');
  if (!wrap) return;
  wrap.innerHTML = '';
  const keywords = DATA.heroKeywords || [];
  keywords.forEach((kw) => {
    const tag = document.createElement('div');
    tag.className = 'about-keyword';
    tag.textContent = kw;
    wrap.appendChild(tag);
  });
}

// ── About ──
function renderAbout() {
  const m = DATA.meta || {};
  const a = DATA.about || {};
  document.getElementById('aboutName').textContent = m.nameEn || m.name || '';
  document.getElementById('aboutTitle').textContent = m.title || '';
  document.getElementById('aboutTextKo').textContent = a.ko || '';
  document.getElementById('aboutTextEn').textContent = a.en || '';
  document.getElementById('philosophyText').textContent = m.philosophy || '';
  if (m.aboutImage) document.getElementById('aboutPhoto').src = m.aboutImage;
}

// ── Career ──
function renderCareer() {
  const tl = document.getElementById('careerTimeline');
  (DATA.career || []).forEach(item => {
    const el = document.createElement('div');
    el.className = 'timeline-item';
    el.innerHTML = `
      <div class="timeline-period">${item.period} · ${item.duration}</div>
      <div class="timeline-company">${item.company}</div>
      <div class="timeline-role">${item.role}</div>
      <span class="timeline-badge">${item.type}</span>
    `;
    tl.appendChild(el);
  });
}

// ── Projects ──
const categoryColors = {
  'AI Service': '#1a1a2e',
  'Propose & Consulting': '#1a2a1a',
  'UIUX Build': '#2a1a1a',
  'Commerce & Marketing': '#2a2a1a'
};

function renderProjects() {
  const grid = document.getElementById('projectsGrid');
  grid.innerHTML = '';
  (DATA.projects || []).forEach(p => {
    const card = document.createElement('div');
    card.className = 'project-card fade-in';
    card.dataset.category = p.category;
    card.onclick = () => openModal(p);
    const bg = categoryColors[p.category] || '#1a1a1a';

    // 썸네일: 이미지가 있으면 img, 없으면 그라디언트 플레이스홀더
    const thumbContent = p.thumb
      ? `<img src="${p.thumb}" alt="${p.title}" loading="lazy" style="width:100%;height:100%;object-fit:cover;display:block;">`
      : `<div class="card-thumb-label">${p.title.substring(0,6)}</div>`;

    card.innerHTML = `
      <div class="card-thumb" style="${!p.thumb ? 'background: linear-gradient(135deg, '+bg+' 0%, #444 100%)' : ''}">
        ${thumbContent}
        <div class="card-category-badge">${p.category}</div>
      </div>
      <div class="card-body">
        <div class="card-company">${p.company} · ${p.period.split(' ')[0]}</div>
        <div class="card-title">${p.title}</div>
        <div class="card-summary">${p.summary}</div>
        <div class="card-tags">${(p.tags||[]).map(t=>`<span class="card-tag">${t}</span>`).join('')}</div>
      </div>
    `;
    grid.appendChild(card);
  });

  // Filter
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.onclick = () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const f = btn.dataset.filter;
      document.querySelectorAll('.project-card').forEach(card => {
        if (f === 'all' || card.dataset.category === f) {
          card.classList.remove('hidden');
        } else {
          card.classList.add('hidden');
        }
      });
    };
  });
}

// ── Modal — 좌우 분할 슬라이드 ──
let currentSlide = 0;
let totalSlides = 0;

function openModal(p) {
  // 팝업은 PNG 이미지 자체가 전체 내용(제목·기간·설명·화면)을 담고 있어
  // 별도 텍스트 패널 없이 이미지만 크게 표시한다.
  const images = p.images && p.images.length > 0 ? p.images : [];
  const slidesEl = document.getElementById('modalSlides');
  const dotsEl = document.getElementById('modalDots');
  slidesEl.innerHTML = '';
  dotsEl.innerHTML = '';

  if (images.length === 0) {
    slidesEl.innerHTML = `
      <div class="modal-slide active">
        <div class="modal-slide-placeholder">
          <span>${p.title.substring(0,4)}</span>
          <p>산출물 이미지 준비 중</p>
        </div>
      </div>`;
  } else {
    images.forEach((src, i) => {
      const slide = document.createElement('div');
      slide.className = 'modal-slide';
      slide.innerHTML = `<img src="${src}" alt="산출물 ${i+1}" loading="lazy">`;
      slidesEl.appendChild(slide);
      const dot = document.createElement('div');
      dot.className = 'slide-dot' + (i === 0 ? ' active' : '');
      dot.onclick = () => goToSlide(i);
      dotsEl.appendChild(dot);
    });

    // 스크롤 시 dot 업데이트
    slidesEl.onscroll = () => {
      const w = slidesEl.offsetWidth;
      if (!w) return;
      const idx = Math.round(slidesEl.scrollLeft / w);
      document.querySelectorAll('.slide-dot').forEach((d,i) => {
        d.classList.toggle('active', i === idx);
      });
      currentSlide = idx;
    };
  }

  totalSlides = images.length;
  currentSlide = 0;
  slidesEl.scrollLeft = 0;

  const prevBtn = document.getElementById('slidePrev');
  const nextBtn = document.getElementById('slideNext');
  if (prevBtn) prevBtn.style.display = totalSlides > 1 ? '' : 'none';
  if (nextBtn) nextBtn.style.display = totalSlides > 1 ? '' : 'none';
  // 슬라이드가 1장뿐이면 하단 바(점·화살표)를 숨긴다
  const bar = document.getElementById('modalSlideBar');
  if (bar) bar.style.display = totalSlides > 1 ? '' : 'none';

  document.getElementById('modalOverlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function goToSlide(n) {
  if (totalSlides === 0) return;
  const slidesEl = document.getElementById('modalSlides');
  currentSlide = (n + totalSlides) % totalSlides;
  slidesEl.scrollTo({ left: currentSlide * slidesEl.offsetWidth, behavior: 'smooth' });
  document.querySelectorAll('.slide-dot').forEach((d,i) => d.classList.toggle('active', i === currentSlide));
}

function changeSlide(dir) {
  goToSlide(currentSlide + dir);
}

function closeModal(e) {
  if (e.target === document.getElementById('modalOverlay')) {
    document.getElementById('modalOverlay').classList.remove('open');
    document.body.style.overflow = '';
  }
}
function closeModalBtn() {
  document.getElementById('modalOverlay').classList.remove('open');
  document.body.style.overflow = '';
}
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeModalBtn();
  if (e.key === 'ArrowRight') changeSlide(1);
  if (e.key === 'ArrowLeft') changeSlide(-1);
});

// ── Media ──
function formatTimestamp(sec) {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  if (h > 0) return `${h}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}~`;
  return `${m}:${String(s).padStart(2,'0')}~`;
}
function getYtThumb(videoId) {
  return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
}

function getYtUrl(videoId, timestamp) {
  const base = `https://www.youtube.com/watch?v=${videoId}`;
  return timestamp > 0 ? `${base}&t=${timestamp}` : base;
}

function renderMedia() {
  const list = document.getElementById('mediaList');
  list.innerHTML = '';
  (DATA.media || []).forEach(m => {
    const videoId = m.videoId || '';
    const thumb = videoId ? getYtThumb(videoId) : '';
    const url = videoId ? getYtUrl(videoId, m.timestamp || 0) : m.url;

    const a = document.createElement('a');
    a.className = 'media-item';
    a.href = url;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.innerHTML = `
      <div class="media-thumb">
        ${thumb
          ? `<img src="${thumb}" alt="${m.title}" loading="lazy" onerror="this.parentElement.style.background='#333'">`
          : '<div style="width:100%;height:100%;background:#333"></div>'
        }
        <div class="media-thumb-overlay">
          <div class="media-play-btn">▶</div>
        </div>
        ${m.timestamp > 0
          ? `<div style="position:absolute;bottom:4px;right:4px;background:rgba(0,0,0,0.75);color:white;font-family:'Barlow',sans-serif;font-size:9px;padding:2px 6px;border-radius:3px;">${formatTimestamp(m.timestamp)}</div>`
          : ''
        }
      </div>
      <div class="media-info">
        <div class="media-item-title">${m.title}</div>
        <div class="media-item-desc">${m.description}</div>
      </div>
      <div class="media-arrow">→</div>
    `;
    list.appendChild(a);
  });
}

// ── Awards ──
function renderAwards() {
  const list = document.getElementById('awardsList');
  (DATA.awards || []).forEach(a => {
    const el = document.createElement('div');
    el.className = 'award-item';
    el.innerHTML = `
      <div class="award-year">${a.year}</div>
      <div class="award-title">${a.title}</div>
      <div class="award-detail">${a.detail}</div>
      <div class="award-project">${a.project}</div>
    `;
    list.appendChild(el);
  });
}

// ── Skills ──
function renderSkills() {
  const grid = document.getElementById('skillsGrid');
  (DATA.skills || []).forEach(group => {
    const el = document.createElement('div');
    el.className = 'skill-group';
    el.innerHTML = `
      <div class="skill-group-title">${group.category}</div>
      <div class="skill-items">${group.items.map(i=>`<div class="skill-item">${i}</div>`).join('')}</div>
    `;
    grid.appendChild(el);
  });
}

// ── Contact ──
function renderContact() {
  const c = DATA.contact || {};
  const m = DATA.meta || {};
  const email = c.email || m.email || '';
  document.getElementById('contactEmailText').textContent = email;
  document.getElementById('contactEmailBtn').href = 'mailto:' + email;

  const linksEl = document.getElementById('contactLinks');
  if (c.linkedin) {
    const a = document.createElement('a');
    a.className = 'contact-link'; a.href = c.linkedin; a.target = '_blank';
    a.textContent = 'LinkedIn'; linksEl.appendChild(a);
  }
  if (c.youtube) {
    const a = document.createElement('a');
    a.className = 'contact-link'; a.href = c.youtube; a.target = '_blank';
    a.textContent = 'YouTube'; linksEl.appendChild(a);
  }
}

// ── Scroll fade-in ──
function observeFadeIns() {
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.1 });
  document.querySelectorAll('.fade-in').forEach(el => obs.observe(el));
}

// 랜딩 시 항상 최상단에서 시작 (브라우저 스크롤 복원 / 해시 점프 방지)
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
if (location.hash) history.replaceState(null, '', location.pathname + location.search);
window.addEventListener('load', () => window.scrollTo(0, 0));

loadData();
