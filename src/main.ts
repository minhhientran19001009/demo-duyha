import './style.css';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';

import type { Place, Official, Neighborhood } from './types';
import { OFFICIALS } from './data/officials';
import { NEIGHBORHOODS } from './data/neighborhoods';
import { DUY_HA_BOUNDARY } from './data/duyHaBoundary';
import { initWeatherWidget } from './services/weather';
import celebrationEventsData from './data/celebration_events.json';
import meritoriousFamiliesData from './data/meritorious_families.json';
import { ALL_TDP_OFFICIALS } from './data/tdpOfficials';

declare global {
  interface Window {
    showPortalTab: (tabName: 'home' | 'neighborhoods' | 'merger' | 'officials' | 'meritorious') => void;
    toggleMapView: () => void;
    viewPlaceDetail: (id: number) => void;
    closePortalModal: () => void;
    openTdpModal: () => void;
    closeTdpModal: () => void;
    openAllOfficialsModal: () => void;
    closeAllOfficialsModal: () => void;
    filterAllOfficialsTable: (keyword: string) => void;
    showMeritoriousDetail: (id: number) => void;
    closeMeritoriousModal: () => void;
    filterMeritoriousByEvent: (eventId: number | 'all') => void;
    filterPortalCategory: (category: string) => void;
    filterOfficialsByNeighborhood: (neighborhood: string) => void;
    toggleMobileMenu: () => void;
    toggleMobileStatsPanel: () => void;
    switchTdpMobileTab: (tab: 'old' | 'new', prefix?: string) => void;
    pannellum: any;
  }
}

// Seed Places Data (Full list of Institutions + Old & New Neighborhoods)
const SEED_PLACES: Place[] = [
  {
    id: 1,
    name: 'Ủy ban Nhân dân Phường Duy Hà',
    category: 'government',
    status: 'active',
    address: 'Trung tâm Hành chính Phường Duy Hà, Ninh Bình',
    lat: 20.6478448,
    lng: 105.914737,
    image: 'https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=800&q=80',
    description: 'Trụ sở UBND Phường Duy Hà là nơi tập trung chỉ đạo, điều hành kinh tế - xã hội, tiếp nhận và giải quyết các thủ tục hành chính, dịch vụ công trực tuyến cho công dân trên địa bàn phường Duy Hà.',
    households: 3850,
    population: 14200,
    hours: '07:30 - 17:00 (Thứ 2 - Thứ 6)',
    images_360: [
      { title: 'Toàn cảnh Trụ sở UBND Phường 360°', url: 'https://pannellum.org/images/alma.jpg' },
      { title: 'Khu vực Tiếp nhận & Trả kết quả Dịch vụ công', url: 'https://pannellum.org/images/cerro-toco.jpg' }
    ]
  },
  {
    id: 4,
    name: 'Trụ sở Công an Phường Duy Hà',
    category: 'police',
    status: 'active',
    address: 'Trục đường chính Phường Duy Hà, Ninh Bình',
    lat: 20.646500,
    lng: 105.913800,
    image: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80',
    description: 'Công an Phường Duy Hà có nhiệm vụ đảm bảo an ninh trật tự, an toàn xã hội, quản lý hành chính về trật tự xã hội và tiếp nhận phản ánh, tố giác tội phạm 24/7.',
    hours: 'Trực ban 24/24',
    images_360: [{ title: 'Khu vực Trực ban Công an Phường 360°', url: 'https://pannellum.org/images/cerro-toco.jpg' }]
  },
  {
    id: 5,
    name: 'Trạm Y tế Phường Duy Hà',
    category: 'health',
    status: 'active',
    address: 'Cạnh UBND Phường Duy Hà, Ninh Bình',
    lat: 20.647100,
    lng: 105.915500,
    image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=800&q=80',
    description: 'Trạm Y tế Phường Duy Hà thực hiện sơ cấp cứu, chăm sóc sức khỏe ban đầu, tiêm chủng mở rộng và tư vấn y tế cộng đồng.',
    hours: '07:00 - 17:00 (Trực cấp cứu 24/7)',
    images_360: [{ title: 'Khuôn viên Trạm Y tế 360°', url: 'https://pannellum.org/images/boulder.jpg' }]
  },
  {
    id: 6,
    name: 'Trường THCS Duy Hà',
    category: 'school',
    status: 'active',
    address: 'Khu 3, Phường Duy Hà, Ninh Bình',
    lat: 20.649800,
    lng: 105.918200,
    image: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=800&q=80',
    description: 'Trường THCS Duy Hà đạt chuẩn quốc gia cấp độ 2, giàu truyền thống dạy tốt học tốt.',
    hours: '07:00 - 17:30',
    images_360: [{ title: 'Sân trường THCS Duy Hà 360°', url: 'https://pannellum.org/images/alma.jpg' }]
  },
  {
    id: 8,
    name: 'Trường Tiểu học Duy Hà',
    category: 'school',
    status: 'active',
    address: 'Khu 1, Phường Duy Hà, Ninh Bình',
    lat: 20.652000,
    lng: 105.913500,
    image: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=800&q=80',
    description: 'Trường Tiểu học Duy Hà nuôi dưỡng và giáo dục học sinh mầm non tương lai của địa phương.',
    hours: '07:15 - 16:45',
    images_360: [{ title: 'Khối phòng học Tiểu học Duy Hà 360°', url: 'https://pannellum.org/images/boulder.jpg' }]
  },

  // --- TỔ DÂN PHỐ MỚI (DỰ KIẾN SAU SÁP NHẬP) ---
  {
    id: 101,
    name: 'Tổ dân phố Hoàng Đồng (Mới)',
    category: 'neighborhood',
    status: 'active',
    address: 'Cụm sáp nhập An Nhân + Hoàng Thượng + Hoàng Hạ',
    lat: 20.651200,
    lng: 105.912300,
    image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80',
    description: 'Tổ dân phố Hoàng Đồng là đơn vị mới sáp nhập từ 3 thôn cũ: An Nhân, Hoàng Thượng và Hoàng Hạ. Tổng hộ dân: 761 hộ, 2.742 nhân khẩu.',
    former_names: 'An Nhân + Hoàng Thượng + Hoàng Hạ (Cũ)',
    cultural_house_address: 'Nhà Văn hóa TDP Hoàng Đồng',
    households: 761,
    population: 2742,
    images_360: [{ title: 'Nhà Văn hóa TDP Hoàng Đồng (360°)', url: 'https://pannellum.org/images/boulder.jpg' }]
  },
  {
    id: 102,
    name: 'Tổ dân phố Ngọc Tú (Mới)',
    category: 'neighborhood',
    status: 'active',
    address: 'Cụm sáp nhập Thôn Tú + Thôn Ngọc Thị',
    lat: 20.648900,
    lng: 105.916500,
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
    description: 'Tổ dân phố Ngọc Tú là đơn vị mới sáp nhập từ 2 thôn cũ: Thôn Tú và Thôn Ngọc Thị. Tổng hộ dân: 730 hộ, 2.513 nhân khẩu.',
    former_names: 'Thôn Tú + Thôn Ngọc Thị (Cũ)',
    cultural_house_address: 'Nhà Văn hóa TDP Ngọc Tú',
    households: 730,
    population: 2513,
    images_360: [{ title: 'Nhà Văn hóa TDP Ngọc Tú (360°)', url: 'https://pannellum.org/images/alma.jpg' }]
  },
  {
    id: 103,
    name: 'Tổ dân phố Duy Hải (Mới)',
    category: 'neighborhood',
    status: 'active',
    address: 'Cụm sáp nhập Tam Giáp + Tứ Giáp',
    lat: 20.645000,
    lng: 105.916000,
    image: 'https://images.unsplash.com/photo-1448630360428-65456885c650?auto=format&fit=crop&w=800&q=80',
    description: 'Tổ dân phố Duy Hải sáp nhập từ Tam Giáp và Tứ Giáp. Tổng hộ dân: 725 hộ, 2.527 nhân khẩu.',
    former_names: 'Tam Giáp + Tứ Giáp (Cũ)',
    cultural_house_address: 'Nhà Văn hóa TDP Duy Hải',
    households: 725,
    population: 2527,
    images_360: [{ title: 'Nhà Văn hóa TDP Duy Hải (360°)', url: 'https://pannellum.org/images/cerro-toco.jpg' }]
  },
  {
    id: 104,
    name: 'Tổ dân phố Đông Linh Trang (Mới)',
    category: 'neighborhood',
    status: 'active',
    address: 'Cụm sáp nhập Động Linh + Trịnh',
    lat: 20.643500,
    lng: 105.918000,
    image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80',
    description: 'Tổ dân phố Đông Linh Trang sáp nhập từ Động Linh và Trịnh. Tổng hộ dân: 616 hộ, 2.134 nhân khẩu.',
    former_names: 'Động Linh + Trịnh (Cũ)',
    cultural_house_address: 'Nhà Văn hóa TDP Đông Linh Trang',
    households: 616,
    population: 2134,
    images_360: [{ title: 'Nhà Văn hóa TDP Đông Linh Trang 360°', url: 'https://pannellum.org/images/boulder.jpg' }]
  },

  // --- TỔ DÂN PHỐ CỦ (TRƯỚC SÁP NHẬP) ---
  {
    id: 201,
    name: 'Tổ dân phố An Nhân (Cũ)',
    category: 'neighborhood',
    status: 'closed',
    address: 'Thuộc cụm sáp nhập Hoàng Đồng',
    lat: 20.651000,
    lng: 105.912000,
    image: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=800&q=80',
    description: 'Tổ dân phố An Nhân trước đây có 201 hộ gia đình với 669 nhân khẩu. Hiện nay thuộc phương án sắp xếp sáp nhập vào Tổ dân phố Hoàng Đồng.',
    former_names: 'Tổ dân phố An Nhân (Hiện trạng cũ)',
    households: 201,
    population: 669
  },
  {
    id: 202,
    name: 'Tổ dân phố Hoàng Thượng (Cũ)',
    category: 'neighborhood',
    status: 'closed',
    address: 'Thuộc cụm sáp nhập Hoàng Đồng',
    lat: 20.651500,
    lng: 105.912500,
    image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=800&q=80',
    description: 'Tổ dân phố Hoàng Thượng trước sáp nhập có 326 hộ gia đình với 1.174 nhân khẩu.',
    former_names: 'Tổ dân phố Hoàng Thượng (Hiện trạng cũ)',
    households: 326,
    population: 1174
  },
  {
    id: 203,
    name: 'Tổ dân phố Tam Giáp (Cũ)',
    category: 'neighborhood',
    status: 'closed',
    address: 'Thuộc cụm sáp nhập Duy Hải',
    lat: 20.645200,
    lng: 105.915800,
    image: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=800&q=80',
    description: 'Tổ dân phố Tam Giáp trước sáp nhập có 379 hộ gia đình với 1.284 nhân khẩu.',
    former_names: 'Tam Giáp (Hiện trạng cũ)',
    households: 379,
    population: 1284
  }
];

class PortalApp {
  private places: Place[] = SEED_PLACES;
  private officials: Official[] = OFFICIALS;
  private neighborhoods: Neighborhood[] = NEIGHBORHOODS;
  private celebrationEvents: any[] = celebrationEventsData;
  private meritoriousFamilies: any[] = meritoriousFamiliesData;
  private activeCategory: string = 'all';
  private currentPlace: Place | null = null;
  private isDarkMode: boolean = false;

  // Leaflet Map state
  private map: L.Map | null = null;

  constructor() {
    this.initTheme();
    this.initPortalData();
    this.initSearch();
    this.initEventListeners();
    this.renderPortalGrid();
    this.renderOfficialsGrid();
    this.populateOfficialNeighborhoodSelect();
    this.renderTdpModalTables();
    this.renderMeritoriousSection();

    // Wire global window methods
    window.showPortalTab = this.showPortalTab.bind(this);
    window.toggleMapView = this.toggleMapView.bind(this);
    window.viewPlaceDetail = this.viewPlaceDetail.bind(this);
    window.closePortalModal = this.closePortalModal.bind(this);
    window.openTdpModal = this.openTdpModal.bind(this);
    window.closeTdpModal = this.closeTdpModal.bind(this);
    window.openAllOfficialsModal = this.openAllOfficialsModal.bind(this);
    window.closeAllOfficialsModal = this.closeAllOfficialsModal.bind(this);
    window.filterAllOfficialsTable = this.renderAllOfficialsTable.bind(this);
    window.showMeritoriousDetail = this.showMeritoriousDetail.bind(this);
    window.closeMeritoriousModal = this.closeMeritoriousModal.bind(this);
    window.filterMeritoriousByEvent = (eventId: number | 'all') => {
      this.renderMeritoriousSection(eventId);
    };
    window.filterPortalCategory = this.filterPortalCategory.bind(this);
    window.filterOfficialsByNeighborhood = this.filterOfficialsByNeighborhood.bind(this);
    window.toggleMobileMenu = () => {
      const menu = document.getElementById('mobile-nav-menu');
      if (menu) menu.classList.toggle('hidden');
    };
    window.toggleMobileStatsPanel = () => {
      const panel = document.getElementById('stats-panel');
      if (panel) {
        if (panel.classList.contains('hidden')) {
          panel.classList.remove('hidden');
          panel.classList.add('flex');
        } else {
          panel.classList.add('hidden');
          panel.classList.remove('flex');
        }
      }
    };
    window.switchTdpMobileTab = (tab: 'old' | 'new', prefix: string = 'page') => {
      const container = document.getElementById(`${prefix}-tdp-tables-container`);
      const slideNew = document.getElementById(`${prefix}-tdp-slide-new`);
      const btnOld = document.getElementById(`${prefix}-tdp-tab-old`);
      const btnNew = document.getElementById(`${prefix}-tdp-tab-new`);

      if (!container) return;

      if (tab === 'old') {
        container.scrollTo({ left: 0, behavior: 'smooth' });
        if (btnOld) btnOld.className = 'flex-1 py-2 px-3 rounded-xl text-xs font-black transition-all bg-white dark:bg-slate-900 text-blue-700 dark:text-blue-400 shadow-sm flex items-center justify-center gap-1.5';
        if (btnNew) btnNew.className = 'flex-1 py-2 px-3 rounded-xl text-xs font-black transition-all text-slate-600 dark:text-slate-400 hover:text-emerald-600 flex items-center justify-center gap-1.5';
      } else {
        const targetLeft = slideNew ? slideNew.offsetLeft - container.offsetLeft : container.scrollWidth / 2;
        container.scrollTo({ left: targetLeft, behavior: 'smooth' });
        if (btnNew) btnNew.className = 'flex-1 py-2 px-3 rounded-xl text-xs font-black transition-all bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-sm flex items-center justify-center gap-1.5';
        if (btnOld) btnOld.className = 'flex-1 py-2 px-3 rounded-xl text-xs font-black transition-all text-slate-600 dark:text-slate-400 hover:text-blue-600 flex items-center justify-center gap-1.5';
      }
    };

    // Attach scroll sync for mobile TDP swipe containers
    setTimeout(() => {
      ['page', 'modal'].forEach(prefix => {
        const container = document.getElementById(`${prefix}-tdp-tables-container`);
        if (container) {
          container.addEventListener('scroll', () => {
            const scrollLeft = container.scrollLeft;
            const width = container.clientWidth;
            const btnOld = document.getElementById(`${prefix}-tdp-tab-old`);
            const btnNew = document.getElementById(`${prefix}-tdp-tab-new`);
            if (scrollLeft > width / 3) {
              if (btnNew) btnNew.className = 'flex-1 py-2 px-3 rounded-xl text-xs font-black transition-all bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-sm flex items-center justify-center gap-1.5';
              if (btnOld) btnOld.className = 'flex-1 py-2 px-3 rounded-xl text-xs font-black transition-all text-slate-600 dark:text-slate-400 hover:text-blue-600 flex items-center justify-center gap-1.5';
            } else {
              if (btnOld) btnOld.className = 'flex-1 py-2 px-3 rounded-xl text-xs font-black transition-all bg-white dark:bg-slate-900 text-blue-700 dark:text-blue-400 shadow-sm flex items-center justify-center gap-1.5';
              if (btnNew) btnNew.className = 'flex-1 py-2 px-3 rounded-xl text-xs font-black transition-all text-slate-600 dark:text-slate-400 hover:text-emerald-600 flex items-center justify-center gap-1.5';
            }
          });
        }
      });
    }, 500);

    // Weather widget
    initWeatherWidget();
  }

  public getCurrentPlace(): Place | null {
    return this.currentPlace;
  }

  private initTheme() {
    const savedTheme = localStorage.getItem('portal_theme');
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      this.isDarkMode = true;
      document.body.classList.add('dark-mode', 'dark');
      document.documentElement.setAttribute('data-theme', 'dark');
      const icon = document.getElementById('theme-icon');
      if (icon) icon.textContent = 'light_mode';
    }
  }

  private toggleTheme() {
    this.isDarkMode = !this.isDarkMode;
    if (this.isDarkMode) {
      document.body.classList.add('dark-mode', 'dark');
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('portal_theme', 'dark');
      const icon = document.getElementById('theme-icon');
      if (icon) icon.textContent = 'light_mode';
    } else {
      document.body.classList.remove('dark-mode', 'dark');
      document.documentElement.setAttribute('data-theme', 'light');
      localStorage.setItem('portal_theme', 'light');
      const icon = document.getElementById('theme-icon');
      if (icon) icon.textContent = 'dark_mode';
    }
  }

  private async initPortalData() {
    try {
      const [placesRes, officialsRes, neighborhoodsRes, eventsRes, familiesRes] = await Promise.all([
        fetch('http://127.0.0.1:8005/api/places'),
        fetch('http://127.0.0.1:8005/api/officials'),
        fetch('http://127.0.0.1:8005/api/neighborhoods'),
        fetch('http://127.0.0.1:8005/api/celebration-events'),
        fetch('http://127.0.0.1:8005/api/meritorious-families')
      ]);

      if (placesRes.ok) {
        const data = await placesRes.json();
        if (Array.isArray(data) && data.length > 0) {
          this.places = data;
          this.renderPortalGrid();
          this.renderMapPlacesCarousel();
        }
      }

      if (officialsRes.ok) {
        const officialsData = await officialsRes.json();
        if (Array.isArray(officialsData) && officialsData.length > 0) {
          this.officials = officialsData;
          this.renderOfficialsGrid();
          this.populateOfficialNeighborhoodSelect();
        }
      }

      if (neighborhoodsRes.ok) {
        const nData = await neighborhoodsRes.json();
        if (Array.isArray(nData) && nData.length > 0) {
          this.neighborhoods = nData;
          this.renderTdpModalTables();
        }
      }

      if (eventsRes.ok && familiesRes.ok) {
        const eventsData = await eventsRes.json();
        const familiesData = await familiesRes.json();
        if (Array.isArray(eventsData) && Array.isArray(familiesData)) {
          this.celebrationEvents = eventsData;
          this.meritoriousFamilies = familiesData;
          this.renderMeritoriousSection();
        }
      }
    } catch (e) {
      console.log('API call fallback to seed data');
    }
  }

  private showPortalTab(tabName: 'home' | 'neighborhoods' | 'merger' | 'officials' | 'meritorious') {
    const mapContainer = document.getElementById('map-view-container');
    if (mapContainer && !mapContainer.classList.contains('hidden')) {
      this.toggleMapView();
    }

    if (tabName === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (tabName === 'neighborhoods') {
      const el = document.getElementById('section-neighborhoods');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else if (tabName === 'merger') {
      const el = document.getElementById('section-tdp-merger');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else if (tabName === 'officials') {
      const el = document.getElementById('section-officials');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else if (tabName === 'meritorious') {
      const el = document.getElementById('section-meritorious');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }

    ['home', 'neighborhoods', 'merger', 'officials', 'meritorious'].forEach(tab => {
      const btn = document.getElementById(`nav-tab-${tab}`);
      if (btn) {
        if (tab === tabName) {
          btn.className = 'px-5 py-2.5 text-xs sm:text-sm font-extrabold rounded-xl transition-all bg-red-700 text-white shadow-md shadow-red-700/20';
        } else {
          btn.className = 'px-5 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all text-slate-700 dark:text-slate-200 hover:text-red-700 dark:hover:text-amber-400';
        }
      }
    });
  }

  private renderMapPlacesCarousel(query: string = '') {
    const container = document.getElementById('map-places-carousel');
    if (!container) return;

    let items = this.places.filter(p => p.category !== 'neighborhood');
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      items = items.filter(p =>
        p.name.toLowerCase().includes(q) ||
        (p.address && p.address.toLowerCase().includes(q)) ||
        (p.former_names && p.former_names.toLowerCase().includes(q))
      );
    }

    if (items.length === 0) {
      container.innerHTML = `
        <div class="px-6 py-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-500">
          Không tìm thấy địa điểm nào khớp với "${query}"
        </div>
      `;
      return;
    }

    container.innerHTML = items.map(p => {
      let badgeText = 'ĐỊA ĐIỂM';
      let badgeColor = 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300';
      if (p.category === 'government') {
        badgeText = 'HÀNH CHÍNH';
        badgeColor = 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300';
      } else if (p.category === 'police') {
        badgeText = 'CÔNG AN';
        badgeColor = 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300';
      } else if (p.category === 'health') {
        badgeText = 'Y TẾ';
        badgeColor = 'bg-pink-100 text-pink-700 dark:bg-pink-950 dark:text-pink-300';
      } else if (p.category === 'school') {
        badgeText = 'TRƯỜNG HỌC';
        badgeColor = 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300';
      } else if (p.category === 'neighborhood') {
        badgeText = p.status === 'closed' ? 'TDP CŨ' : 'TỔ DÂN PHỐ';
        badgeColor = 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300';
      }

      return `
        <div class="min-w-[280px] max-w-[310px] bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl flex items-center gap-3 shrink-0">
          <img src="${p.image || 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=300&q=80'}" class="w-16 h-16 rounded-xl object-cover shrink-0" alt="${p.name}" />
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-1.5 mb-1">
              <span class="text-[9px] font-black uppercase ${badgeColor} px-1.5 py-0.5 rounded">${badgeText}</span>
            </div>
            <h4 class="text-xs font-black text-slate-900 dark:text-white truncate" title="${p.name}">${p.name}</h4>
            <p class="text-[10px] text-slate-500 truncate mt-0.5">📍 ${p.address || 'Phường Duy Hà'}</p>
            <div class="flex items-center gap-2 mt-2">
              <button onclick="window.viewPlaceDetail(${p.id})" class="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 text-[10px] font-bold rounded-lg flex items-center gap-1">
                <span class="material-symbols-outlined text-[12px]">info</span>
                <span>Chi tiết</span>
              </button>
              <a href="https://www.google.com/maps/dir/?api=1&destination=${p.lat},${p.lng}" target="_blank" rel="noopener noreferrer" class="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-white text-[10px] font-bold rounded-lg flex items-center gap-1">
                <span class="material-symbols-outlined text-[12px]">near_me</span>
                <span>Định vị</span>
              </a>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  private initSearch() {
    const input = document.getElementById('portal-search-input') as HTMLInputElement;
    const resultsBox = document.getElementById('portal-search-results');
    const searchBtn = document.getElementById('portal-search-btn');

    if (input && resultsBox) {
      input.addEventListener('input', () => {
        const query = input.value.trim().toLowerCase();
        if (query.length === 0) {
          resultsBox.classList.add('hidden');
          resultsBox.innerHTML = '';
          return;
        }

        const filteredPlaces = this.places.filter(p =>
          p.name.toLowerCase().includes(query) ||
          (p.address && p.address.toLowerCase().includes(query)) ||
          (p.former_names && p.former_names.toLowerCase().includes(query)) ||
          (p.description && p.description.toLowerCase().includes(query))
        );

        const filteredOfficials = this.officials.filter(o =>
          o.name.toLowerCase().includes(query) ||
          o.role.toLowerCase().includes(query) ||
          o.phone.includes(query)
        );

        if (filteredPlaces.length === 0 && filteredOfficials.length === 0) {
          resultsBox.innerHTML = `
            <div class="p-4 text-center text-xs text-slate-400">
              Không tìm thấy kết quả khớp với "${query}"
            </div>
          `;
        } else {
          let html = '';
          if (filteredPlaces.length > 0) {
            html += `<div class="p-2 text-[10px] font-extrabold uppercase text-blue-600 tracking-wider bg-slate-50 dark:bg-slate-800">Địa điểm & Tổ dân phố</div>`;
            filteredPlaces.forEach(p => {
              html += `
                <div onclick="window.viewPlaceDetail(${p.id})" class="p-3 hover:bg-blue-50 dark:hover:bg-slate-800 cursor-pointer transition-colors border-b border-slate-100 dark:border-slate-800/50 flex items-center justify-between">
                  <div>
                    <b class="text-xs font-bold text-slate-900 dark:text-white block">${p.name}</b>
                    <small class="text-[11px] text-slate-500">${p.former_names ? `Sáp nhập: ${p.former_names}` : (p.address || 'Phường Duy Hà')}</small>
                  </div>
                  <span class="material-symbols-outlined text-blue-600 text-sm">info</span>
                </div>
              `;
            });
          }

          if (filteredOfficials.length > 0) {
            html += `<div class="p-2 text-[10px] font-extrabold uppercase text-emerald-600 tracking-wider bg-slate-50 dark:bg-slate-800">Cán bộ phụ trách</div>`;
            filteredOfficials.forEach(o => {
              html += `
                <div onclick="window.location.href='tel:${o.phone}'" class="p-3 hover:bg-emerald-50 dark:hover:bg-slate-800 cursor-pointer transition-colors border-b border-slate-100 dark:border-slate-800/50 flex items-center justify-between">
                  <div>
                    <b class="text-xs font-bold text-slate-900 dark:text-white block">${o.name} - ${o.role}</b>
                    <small class="text-[11px] text-emerald-600 font-bold">${o.phone}</small>
                  </div>
                  <span class="material-symbols-outlined text-emerald-600 text-sm">call</span>
                </div>
              `;
            });
          }
          resultsBox.innerHTML = html;
        }

        resultsBox.classList.remove('hidden');
      });

      if (searchBtn) {
        searchBtn.addEventListener('click', () => {
          const query = input.value.trim().toLowerCase();
          if (query) {
            const match = this.places.find(p => p.name.toLowerCase().includes(query));
            if (match) {
              this.viewPlaceDetail(match.id);
            }
          }
        });
      }
    }
  }

  private filterPortalCategory(cat: string) {
    this.activeCategory = cat;

    document.querySelectorAll('.cat-filter-btn').forEach(btn => {
      const category = btn.getAttribute('data-cat');
      if (category === cat) {
        btn.className = 'cat-filter-btn px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all bg-white dark:bg-slate-900 text-blue-700 dark:text-blue-400 shadow-sm';
      } else {
        btn.className = 'cat-filter-btn px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all text-slate-600 dark:text-slate-300 hover:text-blue-700';
      }
    });

    this.renderPortalGrid();
  }

  private renderPortalGrid() {
    const grid = document.getElementById('portal-places-grid');
    if (!grid) return;

    let items = this.places.filter(p => p.category !== 'neighborhood');
    if (this.activeCategory === 'tdp_new') {
      items = this.places.filter(p => p.category === 'neighborhood' && p.status === 'active');
    } else if (this.activeCategory === 'tdp_old') {
      items = this.places.filter(p => p.category === 'neighborhood' && p.status === 'closed');
    } else if (this.activeCategory !== 'all') {
      items = this.places.filter(p => p.category === this.activeCategory);
    }

    if (items.length === 0) {
      grid.innerHTML = `
        <div class="col-span-full p-12 text-center text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl">
          Chưa có dữ liệu địa điểm theo phân loại này.
        </div>
      `;
      return;
    }

    grid.innerHTML = items.map(p => {
      const isPolice = p.category === 'police' || p.name.toLowerCase().includes('công an');
      const isGov = p.category === 'government' || p.name.toLowerCase().includes('ubnd') || p.name.toLowerCase().includes('ủy ban');

      if (isGov || isPolice || p.category === 'government' || p.category === 'police') {
        const phone = isPolice ? '02263835113' : '02263835112';
        const subTitle = isPolice ? 'AN NINH & TRẬT TỰ XÃ HỘI' : 'CƠ QUAN HÀNH CHÍNH';
        const iconName = isPolice ? 'local_police' : 'corporate_fare';
        const directionsUrl = (p.lat && p.lng)
          ? `https://www.google.com/maps/dir/?api=1&destination=${p.lat},${p.lng}`
          : `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(p.name + ' Phường Duy Hà')}`;

        return `
          <div onclick="window.viewPlaceDetail(${p.id})"
            class="relative rounded-3xl overflow-hidden shadow-xl min-h-[210px] flex flex-col justify-between p-6 sm:p-7 border border-amber-400/20 dark:border-slate-800 group text-white cursor-pointer transition-all duration-300 hover:shadow-2xl">
            <!-- Background Image with Soft Gradient Overlay -->
            <img src="${p.image || (isPolice ? 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=800&auto=format&fit=crop' : 'https://images.unsplash.com/photo-1577086664693-894d8405334a?q=80&w=800&auto=format&fit=crop')}"
              alt="${p.name}" class="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            <div class="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/35 to-slate-950/10"></div>

            <!-- Card Top Header -->
            <div class="relative z-10 flex items-center gap-3.5">
              <div class="w-12 sm:w-14 h-12 sm:h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white text-2xl sm:text-3xl font-bold border border-white/30 shrink-0">
                <span class="material-symbols-outlined">${iconName}</span>
              </div>
              <div>
                <span class="text-xs font-black uppercase tracking-wider text-amber-300 block">
                  ${subTitle}
                </span>
                <h3 class="text-xl sm:text-2xl font-black text-white drop-shadow-md leading-tight mt-0.5">${p.name}</h3>
              </div>
            </div>

            <!-- Card Bottom Actions (3 buttons) -->
            <div class="relative z-10 flex flex-wrap sm:flex-nowrap items-stretch gap-2.5 mt-6">
              <a href="tel:${phone}" onclick="event.stopPropagation()"
                class="flex-1 bg-white hover:bg-slate-100 text-slate-900 rounded-2xl py-3 px-3.5 font-extrabold text-xs sm:text-sm transition-all flex items-center justify-center gap-1.5 shadow-md active:scale-95 whitespace-nowrap">
                <span class="material-symbols-outlined text-base sm:text-lg text-blue-700">call</span>
                <span>Hotline & Trực ban</span>
              </a>
              <button onclick="event.stopPropagation(); window.viewPlaceDetail(${p.id})"
                class="flex-1 bg-white hover:bg-slate-100 text-slate-900 rounded-2xl py-3 px-3.5 font-extrabold text-xs sm:text-sm transition-all flex items-center justify-center gap-1.5 shadow-md active:scale-95 whitespace-nowrap">
                <span class="material-symbols-outlined text-base sm:text-lg text-blue-700">info</span>
                <span>Xem chi tiết</span>
              </button>
              <a href="${directionsUrl}" target="_blank" onclick="event.stopPropagation()"
                class="bg-white/20 hover:bg-white/30 text-white rounded-2xl py-3 px-3.5 font-extrabold text-xs sm:text-sm transition-all flex items-center justify-center gap-1.5 backdrop-blur-md border border-white/30 shadow-md active:scale-95 whitespace-nowrap shrink-0">
                <span class="material-symbols-outlined text-base sm:text-lg">directions</span>
                <span>Chỉ đường</span>
              </a>
            </div>
          </div>
        `;
      }

      const getCategoryBadge = (place: Place) => {
        if (place.category === 'neighborhood') {
          if (place.status === 'closed') {
            return { text: 'TRƯỚC SÁP NHẬP', color: 'bg-amber-500/10 text-amber-600 border-amber-200' };
          }
          return { text: 'SAU SÁP NHẬP', color: 'bg-blue-500/10 text-blue-600 border-blue-200' };
        }
        switch (place.category) {
          case 'government': return { text: 'HÀNH CHÍNH', color: 'bg-red-500/10 text-red-600 border-red-200' };
          case 'school': return { text: 'GIÁO DỤC', color: 'bg-emerald-500/10 text-emerald-600 border-emerald-200' };
          case 'health': return { text: 'Y TẾ', color: 'bg-pink-500/10 text-pink-600 border-pink-200' };
          case 'police': return { text: 'AN NINH', color: 'bg-indigo-500/10 text-indigo-600 border-indigo-200' };
          default: return { text: 'ĐỊA ĐIỂM', color: 'bg-slate-500/10 text-slate-600 border-slate-200' };
        }
      };

      const badge = getCategoryBadge(p);

      return `
        <div class="place-card cursor-pointer group" onclick="window.viewPlaceDetail(${p.id})">
          <div class="place-card-cover relative">
            <img src="${p.image || 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80'}" alt="${p.name}" class="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-500" />
            <div class="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>
            
            <div class="relative z-10 w-full">
              <span class="inline-block px-2.5 py-1 text-[10px] font-extrabold uppercase rounded-lg backdrop-blur-md border ${badge.color} mb-1">
                ${badge.text}
              </span>
              <h3 class="text-lg font-black text-white leading-snug drop-shadow-md group-hover:text-blue-300 transition-colors">
                ${p.name}
              </h3>
            </div>
          </div>

          <div class="p-5 flex-1 flex flex-col justify-between space-y-4">
            <div class="space-y-2">
              ${p.former_names ? `<p class="text-xs text-slate-500 dark:text-slate-400 font-semibold">🏛️ Sáp nhập từ: <b class="text-slate-800 dark:text-slate-100">${p.former_names}</b></p>` : ''}
              ${p.households ? `
                <div class="flex items-center gap-4 text-xs font-semibold text-slate-600 dark:text-slate-300">
                  <span>🏠 Hộ dân: <b>${p.households}</b></span>
                  <span>👥 Dân số: <b>${p.population}</b></span>
                </div>
              ` : ''}
              <p class="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                ${p.description || 'Thông tin địa điểm trên địa bàn Phường Duy Hà, Ninh Bình.'}
              </p>
            </div>

            <div class="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-bold text-blue-700 dark:text-blue-400">
              <span class="flex items-center gap-1">
                <span class="material-symbols-outlined text-base">info</span>
                <span>Xem thông tin chi tiết</span>
              </span>
              <span class="material-symbols-outlined text-base group-hover:translate-x-1 transition-transform">arrow_forward</span>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  private renderTdpModalTables() {
    const oldBody = document.getElementById('old-neighborhoods-list');
    const newBody = document.getElementById('new-neighborhoods-list');
    const oldTitle = document.getElementById('old-neighborhoods-count-title');
    const newTitle = document.getElementById('new-neighborhoods-count-title');
    const oldTotalHouseholdsEl = document.getElementById('old-total-households');
    const oldTotalPeopleEl = document.getElementById('old-total-people');
    const newTotalHouseholdsEl = document.getElementById('new-total-households');
    const newTotalPeopleEl = document.getElementById('new-total-people');

    // Page Section Elements
    const pageOldBody = document.getElementById('page-old-neighborhoods-list');
    const pageNewBody = document.getElementById('page-new-neighborhoods-list');
    const pageOldTitle = document.getElementById('page-old-neighborhoods-count-title');
    const pageNewTitle = document.getElementById('page-new-neighborhoods-count-title');
    const pageOldTotalHouseholdsEl = document.getElementById('page-old-total-households');
    const pageOldTotalPeopleEl = document.getElementById('page-old-total-people');
    const pageNewTotalHouseholdsEl = document.getElementById('page-new-total-households');
    const pageNewTotalPeopleEl = document.getElementById('page-new-total-people');

    const groupStyles: Record<string, { label: string; badgeClass: string; highlightClass: string }> = {
      'ngoc-dong': { label: 'TDP Ngọc Động', badgeClass: 'bg-red-50 text-red-800 border-red-200 dark:bg-red-950/60 dark:text-red-300 dark:border-red-800', highlightClass: '' },
      'chuong': { label: 'TDP Chuồng', badgeClass: 'bg-amber-50 text-amber-900 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800', highlightClass: '' },
      'bach-xa': { label: 'TDP Bạch Xá', badgeClass: 'bg-orange-50 text-orange-900 border-orange-200 dark:bg-orange-950/60 dark:text-orange-300 dark:border-orange-800', highlightClass: '' },
      'dong-hai': { label: 'TDP Đông Hải', badgeClass: 'bg-blue-50 text-blue-900 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800', highlightClass: '' },
      'huong-cat': { label: 'TDP Hương Cát', badgeClass: 'bg-teal-50 text-teal-900 border-teal-200 dark:bg-teal-950/60 dark:text-teal-300 dark:border-teal-800', highlightClass: '' },
      'hoang-dong': { label: 'TDP Hoàng Đồng', badgeClass: 'bg-yellow-50 text-yellow-900 border-yellow-300 dark:bg-yellow-950/60 dark:text-yellow-300 dark:border-yellow-800', highlightClass: '' },
      'ngoc-tu': { label: 'TDP Ngọc Tú', badgeClass: 'bg-rose-50 text-rose-900 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800', highlightClass: '' },
      'duy-hai': { label: 'TDP Duy Hải', badgeClass: 'bg-emerald-50 text-emerald-900 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800', highlightClass: '' },
      'dong-linh-trang': { label: 'TDP Đông Linh Trang', badgeClass: 'bg-purple-50 text-purple-900 border-purple-200 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800', highlightClass: '' },
      'duy-minh': { label: 'TDP Duy Minh', badgeClass: 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800', highlightClass: '' },
    };

    const oldList = this.neighborhoods.filter(n => n.type === 'old');
    const newList = this.neighborhoods.filter(n => n.type === 'new');

    const oldTitleText = `HIỆN TRẠNG TỔ DÂN PHỐ (${oldList.length} TỔ DÂN PHỐ - TRƯỚC SÁP NHẬP)`;
    const newTitleText = `DỰ KIẾN PHƯƠNG ÁN SẮP XẾP (${newList.length} TỔ DÂN PHỐ - SAU SÁP NHẬP)`;

    if (oldTitle) oldTitle.textContent = oldTitleText;
    if (newTitle) newTitle.textContent = newTitleText;
    if (pageOldTitle) pageOldTitle.textContent = oldTitleText;
    if (pageNewTitle) pageNewTitle.textContent = newTitleText;

    let oldTotalHouseholds = 0;
    let oldTotalPeople = 0;
    let oldTotalArea = 0;
    const oldRowsHtml = oldList.map((n, idx) => {
      oldTotalHouseholds += n.households || 0;
      oldTotalPeople += n.people || 0;
      oldTotalArea += n.area_ha || 0;
      const gStyle = groupStyles[n.group_code] || { label: 'TDP Mới', badgeClass: 'bg-slate-100 text-slate-700', borderClass: 'border-l-4 border-slate-400', highlightClass: '' };
      return `
        <tr data-group-code="${n.group_code}" class="tdp-merger-row transition-all duration-300 cursor-pointer hover:bg-amber-50 dark:hover:bg-slate-800">
          <td class="py-2.5 px-2 text-center text-slate-400 font-bold">${idx + 1}</td>
          <td class="py-2.5 px-2 font-bold text-slate-800 dark:text-slate-100">
            <div class="flex items-center gap-1.5 flex-wrap">
              <span class="font-bold text-slate-800 dark:text-slate-100">TDP ${n.name}</span>
              <span class="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${gStyle.badgeClass}">
                <span class="material-symbols-outlined text-[12px]">arrow_right_alt</span>
                <span>${gStyle.label}</span>
              </span>
            </div>
          </td>
          <td class="py-2.5 px-2 text-right font-bold text-slate-800 dark:text-slate-200">${n.households.toLocaleString('vi-VN')}</td>
          <td class="py-2.5 px-2 text-right font-bold text-slate-800 dark:text-slate-200">${n.people.toLocaleString('vi-VN')}</td>
          <td class="py-2.5 px-2 text-right font-extrabold text-slate-900 dark:text-slate-100">${n.area_ha ? n.area_ha.toFixed(2).replace('.', ',') : '--'}</td>
        </tr>
      `;
    }).join('');

    if (oldBody) oldBody.innerHTML = oldRowsHtml;
    if (pageOldBody) pageOldBody.innerHTML = oldRowsHtml;

    const oldHHFormatted = oldTotalHouseholds.toLocaleString('vi-VN');
    const oldPeopleFormatted = oldTotalPeople.toLocaleString('vi-VN');
    const oldAreaFormatted = oldTotalArea.toFixed(2).replace('.', ',');
    if (oldTotalHouseholdsEl) oldTotalHouseholdsEl.textContent = oldHHFormatted;
    if (oldTotalPeopleEl) oldTotalPeopleEl.textContent = oldPeopleFormatted;
    if (pageOldTotalHouseholdsEl) pageOldTotalHouseholdsEl.textContent = oldHHFormatted;
    if (pageOldTotalPeopleEl) pageOldTotalPeopleEl.textContent = oldPeopleFormatted;
    const pageOldTotalAreaEl = document.getElementById('page-old-total-area');
    if (pageOldTotalAreaEl) pageOldTotalAreaEl.textContent = oldAreaFormatted;

    let newTotalHouseholds = 0;
    let newTotalPeople = 0;
    let newTotalArea = 0;
    const newRowsHtml = newList.map((n, idx) => {
      newTotalHouseholds += n.households || 0;
      newTotalPeople += n.people || 0;
      newTotalArea += n.area_ha || 0;
      const gStyle = groupStyles[n.group_code] || { label: 'TDP Mới', badgeClass: 'bg-slate-100 text-slate-700', borderClass: 'border-l-4 border-slate-400', highlightClass: '' };
      return `
        <tr data-group-code="${n.group_code}" class="tdp-merger-row transition-all duration-300 cursor-pointer hover:bg-amber-50 dark:hover:bg-slate-800">
          <td class="py-2.5 px-2 text-center text-slate-400 font-bold">${idx + 1}</td>
          <td class="py-2.5 px-2 font-bold text-slate-800 dark:text-slate-100">
            <span class="inline-flex items-center px-2.5 py-1 rounded-xl text-xs font-extrabold border ${gStyle.badgeClass}">
              ${gStyle.label}
            </span>
          </td>
          <td class="py-2.5 px-2 text-slate-600 dark:text-slate-300">
            ${n.leader_name ? `<b class="block text-slate-900 dark:text-white">${n.leader_name}</b><a href="tel:${n.leader_phone}" class="text-[11px] text-red-700 dark:text-amber-400 font-bold hover:underline">${n.leader_phone}</a>` : '<span class="text-slate-400 italic">Đang cập nhật</span>'}
          </td>
          <td class="py-2.5 px-2 text-right font-bold text-slate-800 dark:text-slate-200">${n.households.toLocaleString('vi-VN')}</td>
          <td class="py-2.5 px-2 text-right font-bold text-slate-800 dark:text-slate-200">${n.people.toLocaleString('vi-VN')}</td>
          <td class="py-2.5 px-2 text-right font-extrabold text-slate-900 dark:text-slate-100">${n.area_ha ? n.area_ha.toFixed(2).replace('.', ',') : '--'}</td>
        </tr>
      `;
    }).join('');

    if (newBody) newBody.innerHTML = newRowsHtml;
    if (pageNewBody) pageNewBody.innerHTML = newRowsHtml;

    const newHHFormatted = newTotalHouseholds.toLocaleString('vi-VN');
    const newPeopleFormatted = newTotalPeople.toLocaleString('vi-VN');
    const newAreaFormatted = newTotalArea.toFixed(2).replace('.', ',');
    if (newTotalHouseholdsEl) newTotalHouseholdsEl.textContent = newHHFormatted;
    if (newTotalPeopleEl) newTotalPeopleEl.textContent = newPeopleFormatted;
    if (pageNewTotalHouseholdsEl) pageNewTotalHouseholdsEl.textContent = newHHFormatted;
    if (pageNewTotalPeopleEl) pageNewTotalPeopleEl.textContent = newPeopleFormatted;
    const pageNewTotalAreaEl = document.getElementById('page-new-total-area');
    if (pageNewTotalAreaEl) pageNewTotalAreaEl.textContent = newAreaFormatted;

    // Attach Hover Highlight & Dimming Events
    this.initTdpHoverHighlight();
  }

  private initTdpHoverHighlight() {
    const rows = document.querySelectorAll<HTMLElement>('.tdp-merger-row');
    let currentGroup: string | null = null;

    const highlightGroup = (groupCode: string | null) => {
      currentGroup = groupCode;
      rows.forEach(r => {
        const rCode = r.getAttribute('data-group-code');
        if (!groupCode) {
          r.classList.remove('bg-amber-100/90', 'dark:bg-amber-950/80', 'font-black', 'shadow-md', 'ring-2', 'ring-amber-500', 'z-10', 'opacity-30', 'grayscale-[50%]');
        } else if (rCode === groupCode) {
          r.classList.add('bg-amber-100/90', 'dark:bg-amber-950/80', 'font-black', 'shadow-md', 'ring-2', 'ring-amber-500', 'z-10');
          r.classList.remove('opacity-30', 'grayscale-[50%]');
        } else {
          r.classList.add('opacity-30', 'grayscale-[50%]');
          r.classList.remove('bg-amber-100/90', 'dark:bg-amber-950/80', 'font-black', 'shadow-md', 'ring-2', 'ring-amber-500', 'z-10');
        }
      });
    };

    rows.forEach(row => {
      // Desktop Hover
      row.addEventListener('mouseenter', () => {
        if ('ontouchstart' in window && window.innerWidth < 1024) return;
        const groupCode = row.getAttribute('data-group-code');
        if (groupCode) highlightGroup(groupCode);
      });

      row.addEventListener('mouseleave', () => {
        if ('ontouchstart' in window && window.innerWidth < 1024) return;
        highlightGroup(null);
      });

      // Touch / Click on Mobile & Desktop
      row.addEventListener('click', (e) => {
        e.stopPropagation();
        const groupCode = row.getAttribute('data-group-code');
        if (!groupCode) return;

        if (currentGroup === groupCode) {
          highlightGroup(null);
        } else {
          highlightGroup(groupCode);

          // On mobile/tablet screens (< 1024px) where tables stack, scroll partner into view
          if (window.innerWidth < 1024) {
            const partnerRow = Array.from(rows).find(r => r !== row && r.getAttribute('data-group-code') === groupCode);
            if (partnerRow) {
              setTimeout(() => {
                partnerRow.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }, 120);
            }
          }
        }
      });
    });

    // Reset highlight when clicking outside table rows
    document.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      if (currentGroup && !target.closest('.tdp-merger-row')) {
        highlightGroup(null);
      }
    });
  }

  private openTdpModal() {
    const modal = document.getElementById('tdp-modal');
    if (modal) {
      modal.classList.remove('hidden');
      modal.classList.add('flex');
    }
  }

  private closeTdpModal() {
    const modal = document.getElementById('tdp-modal');
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
  }

  private openAllOfficialsModal() {
    this.renderAllOfficialsTable();
    const modal = document.getElementById('all-officials-modal');
    if (modal) {
      modal.classList.remove('hidden');
      modal.classList.add('flex');
    }
  }

  private closeAllOfficialsModal() {
    const modal = document.getElementById('all-officials-modal');
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
  }

  private renderAllOfficialsTable(keyword: string = '') {
    const tbody = document.getElementById('all-officials-table-body');
    if (!tbody) return;

    const kw = keyword.toLowerCase().trim();
    const filtered = ALL_TDP_OFFICIALS.filter(item => {
      if (!kw) return true;
      return (
        item.tdp.toLowerCase().includes(kw) ||
        item.biThuName.toLowerCase().includes(kw) ||
        (item.biThuPhone && item.biThuPhone.includes(kw)) ||
        item.toTruongName.toLowerCase().includes(kw) ||
        (item.toTruongPhone && item.toTruongPhone.includes(kw)) ||
        item.matTanName.toLowerCase().includes(kw) ||
        (item.matTanPhone && item.matTanPhone.includes(kw)) ||
        item.nguoiCaoTuoi.toLowerCase().includes(kw) ||
        item.phuNu.toLowerCase().includes(kw) ||
        item.nongDan.toLowerCase().includes(kw) ||
        item.ccb.toLowerCase().includes(kw) ||
        item.doanThanhNien.toLowerCase().includes(kw)
      );
    });

    if (filtered.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="10" class="py-8 text-center text-slate-400 italic">Không tìm thấy cán bộ phù hợp với từ khóa "${keyword}".</td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = filtered.map(item => `
      <tr class="hover:bg-blue-50/70 dark:hover:bg-slate-800/80 transition-all border-b border-slate-200 dark:border-slate-700/60">
        <td class="py-2.5 px-2 text-center text-slate-400 font-bold border-r border-slate-200 dark:border-slate-700">${item.tt}</td>
        <td class="py-2.5 px-2 font-black text-blue-900 dark:text-blue-300 border-r border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/40">${item.tdp}</td>
        <td class="py-2.5 px-2 border-r border-slate-200 dark:border-slate-700">
          <div class="font-bold text-slate-900 dark:text-white">${item.biThuName}</div>
          ${item.biThuPhone ? `<a href="tel:${item.biThuPhone.replace(/\s+/g, '')}" class="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-0.5 mt-0.5"><span class="material-symbols-outlined text-[12px]">call</span>${item.biThuPhone}</a>` : ''}
        </td>
        <td class="py-2.5 px-2 border-r border-slate-200 dark:border-slate-700">
          <div class="font-bold text-slate-900 dark:text-white">${item.toTruongName}</div>
          ${item.toTruongPhone ? `<a href="tel:${item.toTruongPhone.replace(/\s+/g, '')}" class="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-0.5 mt-0.5"><span class="material-symbols-outlined text-[12px]">call</span>${item.toTruongPhone}</a>` : ''}
        </td>
        <td class="py-2.5 px-2 border-r border-slate-200 dark:border-slate-700">
          <div class="font-bold text-slate-900 dark:text-white">${item.matTanName}</div>
          ${item.matTanPhone ? `<a href="tel:${item.matTanPhone.replace(/\s+/g, '')}" class="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-0.5 mt-0.5"><span class="material-symbols-outlined text-[12px]">call</span>${item.matTanPhone}</a>` : ''}
        </td>
        <td class="py-2.5 px-2 text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-700">${item.nguoiCaoTuoi}</td>
        <td class="py-2.5 px-2 text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-700">${item.phuNu}</td>
        <td class="py-2.5 px-2 text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-700">${item.nongDan}</td>
        <td class="py-2.5 px-2 text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-700">${item.ccb}</td>
        <td class="py-2.5 px-2 text-slate-700 dark:text-slate-300">${item.doanThanhNien}</td>
      </tr>
    `).join('');
  }

  private showMeritoriousDetail(id: number) {
    const family = (this.meritoriousFamilies as any[]).find(f => f.id === id);
    if (!family) return;

    const event = (this.celebrationEvents as any[]).find(e => e.id === family.celebration_event_id);

    const modal = document.getElementById('meritorious-modal');
    const badgeEl = document.getElementById('meritorious-modal-badge');
    const titleEl = document.getElementById('meritorious-modal-title');
    const tdpEl = document.getElementById('meritorious-modal-tdp');
    const summaryEl = document.getElementById('meritorious-modal-summary');

    if (badgeEl) badgeEl.textContent = family.type;
    if (titleEl) titleEl.textContent = family.name;
    if (tdpEl) tdpEl.textContent = `Sự kiện vinh danh: ${event ? event.name : 'Sự kiện kỷ niệm Phường Duy Hà'}`;
    if (summaryEl) summaryEl.textContent = `Gia đình ${family.name} thuộc diện chính sách ${family.type}, được tôn vinh nhân dịp ${event ? event.name : 'các ngày lễ kỷ niệm trọng đại Phường Duy Hà'}.`;

    if (modal) {
      modal.classList.remove('hidden');
      modal.classList.add('flex');
    }
  }

  private renderMeritoriousSection(selectedEventId: number | 'all' = 'all') {
    const container = document.getElementById('meritorious-events-container');
    if (!container) return;

    // CHỈ LẤY CÁC SỰ KIỆN ĐƯỢC ADMIN BẬT NỔI BẬT (is_featured = true) VÀ ĐANG HOẠT ĐỘNG
    const events = (this.celebrationEvents as any[]).filter(e => e.status === 'active' && e.is_featured === true);
    const families = (this.meritoriousFamilies as any[]).filter(f => f.status === 'active');

    if (events.length === 0) {
      container.innerHTML = `
        <div class="text-center py-12 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-700">
          <span class="material-symbols-outlined text-4xl text-amber-500 mb-2">event_busy</span>
          <p class="text-sm font-bold text-slate-700 dark:text-slate-300">Hiện chưa có sự kiện vinh danh nào được kích hoạt hiển thị.</p>
          <p class="text-xs text-slate-400 mt-1">Quản trị viên có thể bật tùy chọn "Hiển thị nổi bật trang chủ" cho Sự kiện trong trang Quản trị Admin.</p>
        </div>
      `;
      return;
    }

    const displayEvents = selectedEventId === 'all'
      ? events
      : events.filter(e => e.id === Number(selectedEventId));

    let html = '';

    // Nếu có từ 2 sự kiện trở lên được bật nổi bật, hiển thị các nút Tab chuyển đổi
    if (events.length > 1) {
      html += `
        <!-- Event Filter Tabs -->
        <div class="flex items-center gap-2 overflow-x-auto pb-3 mb-6 no-scrollbar">
          <button onclick="window.filterMeritoriousByEvent('all')"
            class="px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 border ${
              selectedEventId === 'all'
                ? 'bg-amber-600 text-white border-amber-600 shadow-md'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-amber-50 dark:hover:bg-amber-950/40'
            }">
            Tất cả sự kiện nổi bật (${events.length})
          </button>
          ${events.map((ev: any) => `
            <button onclick="window.filterMeritoriousByEvent(${ev.id})"
              class="px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 border flex items-center gap-1.5 ${
                selectedEventId === ev.id
                  ? 'bg-amber-600 text-white border-amber-600 shadow-md'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-amber-50 dark:hover:bg-amber-950/40'
              }">
              <span class="text-amber-400">⭐</span>
              <span>${ev.name.split(' (')[0]}</span>
              <span class="text-[10px] opacity-80">(${ev.day}/${ev.month})</span>
            </button>
          `).join('')}
        </div>
      `;
    }

    if (displayEvents.length === 0) {
      html += `
        <div class="text-center py-12 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-700">
          <p class="text-sm text-slate-500 dark:text-slate-400">Không tìm thấy sự kiện tương ứng.</p>
        </div>
      `;
    } else {
      html += `<div class="space-y-8">`;
      displayEvents.forEach((ev: any) => {
        const linkedFamilies = families.filter(f => f.celebration_event_id === ev.id);

        html += `
          <div class="bg-gradient-to-r from-amber-50/70 via-orange-50/50 to-amber-50/70 dark:from-slate-800/80 dark:via-slate-800/50 dark:to-slate-800/80 rounded-2xl p-5 border border-amber-200/80 dark:border-slate-700/80 shadow-sm space-y-4">
            <!-- Event Header -->
            <div class="border-b border-amber-200/60 dark:border-slate-700 pb-3">
              <div>
                <div class="flex items-center gap-2 flex-wrap mb-1">
                  <span class="text-xs font-black uppercase text-amber-800 dark:text-amber-300 bg-amber-200/70 dark:bg-amber-950 px-2.5 py-0.5 rounded-md">
                    🚩 Ngày ${ev.day}/${ev.month} hàng năm
                  </span>
                </div>
                <h3 class="text-lg font-black text-slate-900 dark:text-white">${ev.name}</h3>
                ${ev.description ? `<p class="text-xs text-slate-600 dark:text-slate-300 mt-1 italic">${ev.description}</p>` : ''}
              </div>
            </div>

            <!-- Meritorious Families Grid for this Event -->
            ${linkedFamilies.length === 0 ? `
              <p class="text-xs text-slate-400 italic py-2">Chưa có hộ gia đình được phân công vinh danh theo sự kiện này.</p>
            ` : `
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
                ${linkedFamilies.map((f: any) => `
                  <div class="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200/80 dark:border-slate-700 shadow-sm space-y-3 flex flex-col justify-between hover:border-amber-400 transition-all">
                    <div>
                      <span class="text-[10px] font-extrabold uppercase text-amber-700 dark:text-amber-400 tracking-wider bg-amber-100 dark:bg-amber-950/80 px-2 py-0.5 rounded-md inline-block mb-1.5">
                        ${f.type}
                      </span>
                      <h4 class="text-sm font-black text-slate-900 dark:text-white">${f.name}</h4>
                    </div>
                    <button onclick="window.showMeritoriousDetail(${f.id})"
                      class="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-2 px-3 rounded-lg text-xs flex items-center justify-center gap-1 transition-all shadow-sm active:scale-95 mt-2">
                      <span class="material-symbols-outlined text-sm">info</span>
                      <span>Xem thông tin</span>
                    </button>
                  </div>
                `).join('')}
              </div>
            `}
          </div>
        `;
      });
      html += `</div>`;
    }

    container.innerHTML = html;
  }

  private closeMeritoriousModal() {
    const modal = document.getElementById('meritorious-modal');
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
  }

  private populateOfficialNeighborhoodSelect() {
    const select = document.getElementById('official-neighborhood-select') as HTMLSelectElement;
    if (!select) return;

    const uniqueNeighborhoods = Array.from(new Set(this.officials.map(o => o.neighborhood_name).filter(Boolean)));
    select.innerHTML = `<option value="all">Tất cả khu vực / Tổ dân phố</option>` +
      uniqueNeighborhoods.map(n => `<option value="${n}">${n}</option>`).join('');
  }

  private filterOfficialsByNeighborhood(nb: string) {
    this.renderOfficialsGrid(nb);
  }

  private renderOfficialsGrid(filterNb: string = 'all') {
    const grid = document.getElementById('officials-list-grid');
    if (!grid) return;

    let items = this.officials;
    if (filterNb !== 'all') {
      items = items.filter(o => o.neighborhood_name === filterNb);
    }

    const dangUy = items.filter(o => o.department === 'dang_uy');
    const chinhQuyen = items.filter(o => o.department === 'chinh_quyen');
    const cskv = items.filter(o => o.department === 'cskv' || (o.role && o.role.toLowerCase().includes('cảnh sát khu vực')));
    const ttpvhcc = items.filter(o => o.department === 'ttpvhcc');

    const renderCard = (o: Official) => {
      let assignedBadge = '';
      if (o.neighborhood_name) {
        const nbs = Array.isArray(o.neighborhood_name) ? o.neighborhood_name : [o.neighborhood_name];
        const filteredNbs = nbs.filter(Boolean);
        if (filteredNbs.length > 0) {
          assignedBadge = `<div class="mt-1 text-[11px] font-bold text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 px-2.5 py-0.5 rounded-full border border-amber-200 dark:border-amber-900/40 flex items-center justify-center gap-1"><span class="material-symbols-outlined text-xs">location_on</span><span>${filteredNbs.join(', ')}</span></div>`;
        }
      }

      return `
        <div class="bg-white dark:bg-slate-900/90 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-md flex flex-col items-center text-center transition-all hover:scale-[1.02] duration-300 justify-between">
          <div class="flex flex-col items-center text-center w-full">
            <div class="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-slate-800 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3 shrink-0 border border-blue-100 dark:border-slate-700">
              <span class="material-symbols-outlined text-2xl">badge</span>
            </div>
            <h5 class="text-base font-black text-slate-900 dark:text-slate-100 leading-tight">${o.name}</h5>
            <span class="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1 leading-normal min-h-[24px] flex items-center justify-center">${o.role}</span>
            ${assignedBadge}
          </div>
          <a href="tel:${o.phone}" class="mt-4 inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 text-blue-600 dark:text-blue-400 rounded-full font-extrabold text-xs transition-colors w-full border border-blue-100 dark:border-blue-900/50">
            <span class="material-symbols-outlined text-sm">call</span>
            <span>${o.phone}</span>
          </a>
        </div>
      `;
    };

    let html = '';

    if (dangUy.length > 0) {
      html += `
        <div class="col-span-full mb-2">
          <h4 class="text-xs font-black uppercase tracking-widest text-red-600 dark:text-red-400 border-b border-slate-200 dark:border-slate-800 pb-2 mb-4 flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-red-600"></span>
            <span>ĐẢNG ỦY</span>
          </h4>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            ${dangUy.map(renderCard).join('')}
          </div>
        </div>
      `;
    }

    if (chinhQuyen.length > 0) {
      html += `
        <div class="col-span-full mb-2 mt-4">
          <h4 class="text-xs font-black uppercase tracking-widest text-blue-600 dark:text-blue-400 border-b border-slate-200 dark:border-slate-800 pb-2 mb-4 flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-blue-600"></span>
            <span>CHÍNH QUYỀN</span>
          </h4>
          <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-6">
            ${chinhQuyen.map(renderCard).join('')}
          </div>
        </div>
      `;
    }

    if (cskv.length > 0) {
      html += `
        <div class="col-span-full mt-4">
          <h4 class="text-xs font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400 border-b border-slate-200 dark:border-slate-800 pb-2 mb-4 flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-indigo-600"></span>
            <span>CẢNH SÁT KHU VỰC</span>
          </h4>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            ${cskv.map(renderCard).join('')}
          </div>
        </div>
      `;
    }

    if (ttpvhcc.length > 0) {
      html += `
        <div class="col-span-full mt-4">
          <h4 class="text-xs font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400 border-b border-slate-200 dark:border-slate-800 pb-2 mb-4 flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-emerald-600"></span>
            <span>TTPVHCC</span>
          </h4>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            ${ttpvhcc.map(renderCard).join('')}
          </div>
        </div>
      `;
    }

    grid.innerHTML = html;
  }

  private viewPlaceDetail(id: number) {
    const place = this.places.find(p => p.id === id);
    if (!place) return;

    this.currentPlace = place;

    const modal = document.getElementById('portal-detail-modal');
    const badge = document.getElementById('modal-category-badge');
    const name = document.getElementById('modal-place-name');
    const desc = document.getElementById('modal-description');
    const addr = document.getElementById('modal-address');
    const statsRow = document.getElementById('modal-stats-row');
    const officialsBox = document.getElementById('modal-officials-list');

    if (badge) badge.textContent = place.category.toUpperCase();
    if (name) name.textContent = place.name;
    if (desc) desc.textContent = place.description || 'Không có mô tả chi tiết.';
    if (addr) addr.textContent = `📍 ${place.address || 'Phường Duy Hà, Ninh Bình'}`;

    if (statsRow) {
      if (place.households || place.population || place.hours) {
        statsRow.innerHTML = `
          ${place.households ? `<div class="bg-blue-50 dark:bg-slate-800 p-3 rounded-2xl text-center"><b class="text-lg font-bold text-blue-700 dark:text-blue-400 block">${place.households}</b><span class="text-[11px] text-slate-500">Số hộ dân</span></div>` : ''}
          ${place.population ? `<div class="bg-emerald-50 dark:bg-slate-800 p-3 rounded-2xl text-center"><b class="text-lg font-bold text-emerald-700 dark:text-emerald-400 block">${place.population}</b><span class="text-[11px] text-slate-500">Dân số</span></div>` : ''}
          ${place.hours ? `<div class="bg-amber-50 dark:bg-slate-800 p-3 rounded-2xl text-center"><b class="text-xs font-bold text-amber-700 dark:text-amber-400 block mt-1">${place.hours}</b><span class="text-[11px] text-slate-500">Giờ làm việc</span></div>` : ''}
          ${place.cultural_house_address ? `<div class="bg-purple-50 dark:bg-slate-800 p-3 rounded-2xl text-center"><b class="text-xs font-bold text-purple-700 dark:text-purple-400 block truncate mt-1">${place.cultural_house_address}</b><span class="text-[11px] text-slate-500">Nhà văn hóa</span></div>` : ''}
        `;
        statsRow.classList.remove('hidden');
      } else {
        statsRow.classList.add('hidden');
      }
    }

    if (officialsBox) {
      const matchOfficials = this.officials.filter(o =>
        o.neighborhood_name === place.name ||
        (place.category === 'government' && o.neighborhood_name?.includes('UBND'))
      );

      if (matchOfficials.length > 0) {
        officialsBox.innerHTML = matchOfficials.map(o => `
          <div class="officer-card p-3">
            <div class="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0" style="background-color: ${o.avatar_color || '#1D4ED8'}">
              ${o.name.charAt(0)}
            </div>
            <div class="flex-1 min-w-0">
              <b class="text-xs font-bold text-slate-900 dark:text-white block truncate">${o.name}</b>
              <span class="text-[11px] text-blue-600 dark:text-blue-400 block truncate">${o.role}</span>
            </div>
            <a href="tel:${o.phone}" class="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <span class="material-symbols-outlined text-base">call</span>
            </a>
          </div>
        `).join('');
      } else {
        officialsBox.innerHTML = `<p class="text-xs text-slate-400 col-span-full">Danh bạ cán bộ phụ trách khu vực đang được cập nhật.</p>`;
      }
    }

    if (modal) {
      modal.classList.remove('hidden');
      modal.classList.add('flex');
    }
  }

  private closePortalModal() {
    const modal = document.getElementById('portal-detail-modal');
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
  }

  private toggleMapView() {
    const mapContainer = document.getElementById('map-view-container');
    if (!mapContainer) return;

    const isHidden = mapContainer.classList.contains('hidden');
    if (isHidden) {
      mapContainer.classList.remove('hidden');
      mapContainer.classList.add('flex');
      if (!this.map) {
        this.initLeafletMap();
      } else {
        setTimeout(() => this.map?.invalidateSize(), 200);
      }
    } else {
      mapContainer.classList.add('hidden');
      mapContainer.classList.remove('flex');
    }
  }

  private initLeafletMap() {
    const mapEl = document.getElementById('map');
    if (!mapEl) return;

    this.map = L.map('map', {
      zoomControl: true,
      attributionControl: true
    }).setView([20.6478448, 105.914737], 14.5);

    L.tileLayer('https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
      maxZoom: 20,
      attribution: '© Google Maps'
    }).addTo(this.map);

    // Render boundary of Phường Duy Hà (GeoJSON)
    // @ts-ignore
    const boundaryLayer = L.geoJSON(DUY_HA_BOUNDARY, {
      style: {
        color: '#1D4ED8',
        weight: 3.5,
        dashArray: '6, 6',
        fillColor: '#3B82F6',
        fillOpacity: 0.12
      }
    }).addTo(this.map);

    // Focus & restrict camera bounds to Phường Duy Hà boundary
    const bounds = boundaryLayer.getBounds();
    if (bounds.isValid()) {
      this.map.fitBounds(bounds, { padding: [40, 40] });
      this.map.setMaxBounds(bounds.pad(0.35));
      this.map.setMinZoom(13);
    }

    // Render Places with Custom Category Icon Markers (Exclude 'neighborhood' / Tổ dân phố)
    const mapPlaces = this.places.filter(p => p.category !== 'neighborhood');
    mapPlaces.forEach(p => {
      let iconName = 'location_on';
      let gradient = 'from-blue-600 to-blue-800';
      let borderColor = 'border-blue-300';

      if (p.category === 'government') {
        iconName = 'account_balance';
        gradient = 'from-blue-600 to-indigo-800';
        borderColor = 'border-blue-300';
      } else if (p.category === 'police') {
        iconName = 'local_police';
        gradient = 'from-indigo-600 to-purple-900';
        borderColor = 'border-indigo-300';
      } else if (p.category === 'health') {
        iconName = 'local_hospital';
        gradient = 'from-red-600 to-rose-800';
        borderColor = 'border-red-300';
      } else if (p.category === 'school') {
        iconName = 'school';
        gradient = 'from-amber-500 to-orange-700';
        borderColor = 'border-amber-300';
      } else if (p.category === 'neighborhood') {
        iconName = 'holiday_village';
        gradient = 'from-emerald-600 to-teal-800';
        borderColor = 'border-emerald-300';
      }

      const customIcon = L.divIcon({
        className: 'custom-leaflet-marker',
        html: `
          <div class="relative group cursor-pointer flex flex-col items-center">
            <div class="w-9 h-9 rounded-full bg-gradient-to-tr ${gradient} text-white shadow-xl border-2 ${borderColor} flex items-center justify-center transition-transform hover:scale-125">
              <span class="material-symbols-outlined text-lg">${iconName}</span>
            </div>
            <div class="mt-1 px-2 py-0.5 rounded-md bg-slate-900/90 backdrop-blur-md text-white font-bold text-[10px] shadow-md whitespace-nowrap border border-slate-700 pointer-events-none">
              ${p.name}
            </div>
          </div>
        `,
        iconSize: [120, 50],
        iconAnchor: [60, 18],
        popupAnchor: [0, -22]
      });

      const marker = L.marker([p.lat, p.lng], { icon: customIcon });
      marker.bindPopup(`
        <div style="font-family:sans-serif; padding:6px; min-width:180px;">
          <div style="font-size:10px; font-weight:800; text-transform:uppercase; color:#1D4ED8; margin-bottom:2px;">
            ${p.category === 'government' ? 'Cơ quan Hành chính' : p.category === 'police' ? 'Công an Phường' : p.category === 'health' ? 'Cơ sở Y tế' : p.category === 'school' ? 'Trường học' : 'Tổ dân phố'}
          </div>
          <b style="color:#0F172A; font-size:13px; display:block; margin-bottom:4px;">${p.name}</b>
          <span style="font-size:11px; color:#64748B; display:block; margin-bottom:8px;">${p.address || ''}</span>
          <a href="https://www.google.com/maps/dir/?api=1&destination=${p.lat},${p.lng}" target="_blank" rel="noopener noreferrer" style="width:100%; background:#1D4ED8; color:white; border:none; padding:7px 10px; border-radius:8px; font-size:11px; font-weight:bold; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:4px; text-decoration:none; box-sizing:border-box;">
            <span class="material-symbols-outlined" style="font-size:14px;">near_me</span>
            <span>Chỉ đường</span>
          </a>
        </div>
      `);
      marker.addTo(this.map!);
    });
  }

  private initEventListeners() {
    const themeBtn = document.getElementById('theme-toggle-btn');
    if (themeBtn) {
      themeBtn.addEventListener('click', () => this.toggleTheme());
    }

    const modal = document.getElementById('portal-detail-modal');
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          this.closePortalModal();
        }
      });
    }

    const tdpModal = document.getElementById('tdp-modal');
    if (tdpModal) {
      tdpModal.addEventListener('click', (e) => {
        if (e.target === tdpModal) {
          this.closeTdpModal();
        }
      });
    }

    const mapSearchInput = document.getElementById('map-search-input') as HTMLInputElement;
    if (mapSearchInput) {
      mapSearchInput.addEventListener('input', () => {
        this.renderMapPlacesCarousel(mapSearchInput.value);
      });
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new PortalApp();
});
