import type { Place, MeritoriousFamily, CelebrationEvent, Neighborhood, AdminUnit } from './types';

// Import seed data for initialization
import provincesData from './data/provinces.json';
import wardsData from './data/wards.json';
import placesData from './data/places.json';
import neighborhoodsData from './data/neighborhoods.json';
import celebrationEventsData from './data/celebration_events.json';
import meritoriousFamiliesData from './data/meritorious_families.json';

// Initialize localStorage with seed data if not already present
function initLocalStorage() {
  if (!localStorage.getItem('philanthropy_provinces')) {
    localStorage.setItem('philanthropy_provinces', JSON.stringify(provincesData));
  }
  if (!localStorage.getItem('philanthropy_wards')) {
    localStorage.setItem('philanthropy_wards', JSON.stringify(wardsData));
  }
  if (!localStorage.getItem('philanthropy_places')) {
    localStorage.setItem('philanthropy_places', JSON.stringify(placesData));
  }
  if (!localStorage.getItem('philanthropy_neighborhoods')) {
    localStorage.setItem('philanthropy_neighborhoods', JSON.stringify(neighborhoodsData));
  }
  if (!localStorage.getItem('philanthropy_celebration_events')) {
    localStorage.setItem('philanthropy_celebration_events', JSON.stringify(celebrationEventsData));
  }
  if (!localStorage.getItem('philanthropy_meritorious_families')) {
    localStorage.setItem('philanthropy_meritorious_families', JSON.stringify(meritoriousFamiliesData));
  }
}
initLocalStorage();

// State management
let places: Place[] = [];
let families: MeritoriousFamily[] = [];
let events: CelebrationEvent[] = [];
let neighborhoods: Neighborhood[] = [];
let wards: AdminUnit[] = [];

// Tab switching
const tabs = ['overview', 'places', 'families', 'events', 'neighborhoods'];
let currentTab = 'overview';

function switchTab(tabId: string) {
  currentTab = tabId;
  
  // Update menu UI
  document.querySelectorAll('.tab-btn').forEach(btn => {
    const btnTab = btn.getAttribute('data-tab');
    if (btnTab === tabId) {
      btn.className = 'tab-btn w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all text-white bg-primary';
    } else {
      btn.className = 'tab-btn w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all text-slate-400 hover:text-white hover:bg-slate-800';
    }
  });

  // Show/Hide Panels
  tabs.forEach(t => {
    const el = document.getElementById(`panel-${t}`);
    if (el) {
      if (t === tabId) {
        el.classList.remove('hidden');
      } else {
        el.classList.add('hidden');
      }
    }
  });

  // Update Page Header Title
  const headerTitle = document.getElementById('current-tab-title');
  if (headerTitle) {
    switch (tabId) {
      case 'overview': headerTitle.textContent = 'Tổng quan hệ thống'; break;
      case 'places': headerTitle.textContent = 'Quản lý Địa điểm (Places)'; break;
      case 'families': headerTitle.textContent = 'Gia đình có công với Cách mạng'; break;
      case 'events': headerTitle.textContent = 'Sự kiện kỷ niệm & Tuyên truyền'; break;
      case 'neighborhoods': headerTitle.textContent = 'Phương án sắp xếp Tổ dân phố'; break;
    }
  }

  // Refresh data list for current tab
  renderCurrentTab();
}

// Load data from LocalStorage
function loadData() {
  places = JSON.parse(localStorage.getItem('philanthropy_places') || '[]');
  families = JSON.parse(localStorage.getItem('philanthropy_meritorious_families') || '[]');
  events = JSON.parse(localStorage.getItem('philanthropy_celebration_events') || '[]');
  neighborhoods = JSON.parse(localStorage.getItem('philanthropy_neighborhoods') || '[]');
  wards = JSON.parse(localStorage.getItem('philanthropy_wards') || '[]');
}

function saveData(key: string, data: any) {
  localStorage.setItem(key, JSON.stringify(data));
  loadData();
  updateStats();
  renderCurrentTab();
}

// Stats counter
function updateStats() {
  const statPlaces = document.getElementById('stat-places');
  const statFamilies = document.getElementById('stat-families');
  const statEvents = document.getElementById('stat-events');
  const statTdp = document.getElementById('stat-tdp');

  if (statPlaces) statPlaces.textContent = places.length.toString();
  if (statFamilies) statFamilies.textContent = families.length.toString();
  if (statEvents) statEvents.textContent = events.length.toString();
  if (statTdp) statTdp.textContent = neighborhoods.length.toString();
}

// Reset localStorage data to seeds
function resetToOriginalData() {
  if (confirm('Bạn có chắc chắn muốn khôi phục cơ sở dữ liệu về trạng thái ban đầu? Tất cả thay đổi của bạn sẽ bị xóa.')) {
    localStorage.removeItem('philanthropy_provinces');
    localStorage.removeItem('philanthropy_wards');
    localStorage.removeItem('philanthropy_places');
    localStorage.removeItem('philanthropy_neighborhoods');
    localStorage.removeItem('philanthropy_celebration_events');
    localStorage.removeItem('philanthropy_meritorious_families');
    
    // Trigger reload
    window.location.reload();
  }
}

// Render logic based on tab
function renderCurrentTab() {
  switch (currentTab) {
    case 'overview':
      renderOverviewTab();
      break;
    case 'places':
      renderPlacesTable();
      break;
    case 'families':
      renderFamiliesTable();
      break;
    case 'events':
      renderEventsTable();
      break;
    case 'neighborhoods':
      renderNeighborhoodsTable();
      break;
  }
}

// --- OVERVIEW TAB ---
function renderOverviewTab() {
  // Populate dates in simulator select
  const select = document.getElementById('select-test-date') as HTMLSelectElement;
  if (!select) return;
  
  select.innerHTML = '';
  
  // Sort events by date
  const sortedEvents = [...events].sort((a, b) => {
    if (a.month !== b.month) return a.month - b.month;
    return a.day - b.day;
  });

  // Current day option
  const today = new Date();
  const todayOpt = document.createElement('option');
  todayOpt.value = `${today.getDate()}/${today.getMonth() + 1}`;
  todayOpt.textContent = `Hôm nay (${today.getDate()}/${today.getMonth() + 1})`;
  select.appendChild(todayOpt);

  sortedEvents.forEach(e => {
    const opt = document.createElement('option');
    opt.value = `${e.day}/${e.month}`;
    opt.textContent = `${e.name} (${e.day}/${e.month})`;
    select.appendChild(opt);
  });

  // Update simulator card based on selected simulator date
  updateSimulatorCard(today.getDate(), today.getMonth() + 1);
}

function updateSimulatorCard(day: number, month: number) {
  const simEventName = document.getElementById('sim-event-name');
  const simEventDesc = document.getElementById('sim-event-desc');
  const simEventTag = document.getElementById('sim-event-tag');

  if (!simEventName || !simEventDesc || !simEventTag) return;

  const activeEvent = events.find(e => e.month === month && e.day === day && e.status === 'active');
  if (activeEvent) {
    const linkedFamilies = families.filter(f => f.celebration_event_id === activeEvent.id && f.status === 'active');
    simEventTag.className = 'text-[9px] font-black uppercase text-red-600 bg-red-50 border border-red-150 px-2 py-0.5 rounded shadow-sm';
    simEventTag.textContent = `Kỷ niệm đang chạy (${day}/${month})`;
    simEventName.textContent = activeEvent.name;
    simEventDesc.textContent = `${activeEvent.description || 'Chưa có mô tả'} — Đang có ${linkedFamilies.length} gia đình chính sách được ghim tri ân.`;
  } else {
    simEventTag.className = 'text-[9px] font-black uppercase text-slate-500 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded';
    simEventTag.textContent = `Không có sự kiện (${day}/${month})`;
    simEventName.textContent = 'Ngày bình thường';
    simEventDesc.textContent = 'Hệ thống hoạt động ở trạng thái thường, không hiển thị banner kỷ niệm đặc biệt.';
  }
}

// --- PLACES TAB ---
function renderPlacesTable() {
  const tbody = document.getElementById('table-places-body');
  if (!tbody) return;

  const searchQuery = (document.getElementById('search-places') as HTMLInputElement)?.value.toLowerCase() || '';
  const filterCat = (document.getElementById('filter-places-category') as HTMLSelectElement)?.value || '';

  tbody.innerHTML = '';

  const filtered = places.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery) || (p.address || '').toLowerCase().includes(searchQuery);
    const matchesCat = filterCat === '' || p.category === filterCat;
    return matchesSearch && matchesCat;
  });

  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" class="py-8 text-center text-slate-400 font-semibold italic">Không tìm thấy địa điểm nào phù hợp</td>
      </tr>
    `;
    return;
  }

  filtered.forEach(p => {
    const tr = document.createElement('tr');
    tr.className = 'hover:bg-slate-50 border-b border-slate-100 transition-colors';
    
    const imgUrl = p.image || 'https://images.unsplash.com/photo-1577086664693-894d8405334a?q=80&w=300&auto=format&fit=crop';
    
    // Category Label & Badge
    let catLabel: string = p.category;
    let catClass = 'bg-slate-100 text-slate-600';
    if (p.category === 'government') { catLabel = 'Cơ quan đoàn thể'; catClass = 'bg-red-50 text-red-600 border border-red-100'; }
    else if (p.category === 'neighborhood') { catLabel = 'TDP / Thôn'; catClass = 'bg-emerald-50 text-emerald-600 border border-emerald-100'; }
    else if (p.category === 'school') { catLabel = 'Trường học'; catClass = 'bg-amber-50 text-amber-600 border border-amber-105'; }
    else if (p.category === 'health') { catLabel = 'Y tế / Bệnh viện'; catClass = 'bg-rose-50 text-rose-600 border border-rose-100'; }
    else if (p.category === 'police') { catLabel = 'An ninh / Công an'; catClass = 'bg-blue-50 text-blue-600 border border-blue-100'; }
    else if (p.category === 'meritorious_family') { catLabel = 'Gia đình có công'; catClass = 'bg-yellow-50 text-yellow-700 border border-yellow-200'; }

    // Ward name
    const ward = wards.find(w => w.id === p.administrative_unit_id);
    const wardName = ward ? ward.name : '—';

    tr.innerHTML = `
      <td class="py-4 px-6 text-slate-400 font-bold">${p.id}</td>
      <td class="py-4 px-6">
        <img class="w-10 h-10 object-cover rounded-lg border border-slate-200" src="${imgUrl}" alt="${p.name}">
      </td>
      <td class="py-4 px-6">
        <div class="font-extrabold text-slate-800">${p.name}</div>
        <div class="text-[10px] text-slate-400 mt-0.5 max-w-[200px] truncate">${p.address || ''}</div>
      </td>
      <td class="py-4 px-6">
        <span class="inline-block px-2 py-0.5 rounded text-[10px] font-bold ${catClass}">${catLabel}</span>
      </td>
      <td class="py-4 px-6 text-slate-500 font-mono text-[11px]">${p.lat.toFixed(6)}, ${p.lng.toFixed(6)}</td>
      <td class="py-4 px-6 font-bold text-slate-700">${wardName}</td>
      <td class="py-4 px-6 text-right shrink-0">
        <div class="flex items-center justify-end gap-2">
          <button onclick="editPlace(${p.id})" class="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 hover:text-slate-900 transition-colors flex items-center justify-center">
            <span class="material-symbols-outlined text-base">edit</span>
          </button>
          <button onclick="deletePlace(${p.id})" class="p-1.5 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-600 transition-colors flex items-center justify-center">
            <span class="material-symbols-outlined text-base">delete</span>
          </button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// --- FAMILIES TAB ---
function renderFamiliesTable() {
  const tbody = document.getElementById('table-families-body');
  if (!tbody) return;

  const searchQuery = (document.getElementById('search-families') as HTMLInputElement)?.value.toLowerCase() || '';
  const filterType = (document.getElementById('filter-families-type') as HTMLSelectElement)?.value || '';

  tbody.innerHTML = '';

  const filtered = families.filter(f => {
    const matchesSearch = f.name.toLowerCase().includes(searchQuery) || (f.representative_name || '').toLowerCase().includes(searchQuery);
    const matchesType = filterType === '' || f.type === filterType;
    return matchesSearch && matchesType;
  });

  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8" class="py-8 text-center text-slate-400 font-semibold italic">Không tìm thấy gia đình chính sách nào phù hợp</td>
      </tr>
    `;
    return;
  }

  filtered.forEach(f => {
    const tr = document.createElement('tr');
    tr.className = 'hover:bg-slate-50 border-b border-slate-100 transition-colors';
    
    // Type Label
    let typeLabel = f.type;
    let typeClass = 'bg-slate-50 text-slate-600 border border-slate-200';
    if (f.type === 'martyr_family') { typeLabel = 'Gia đình Liệt sĩ'; typeClass = 'bg-red-50 text-red-600 border border-red-100'; }
    else if (f.type === 'wounded_soldier') { typeLabel = 'Thương binh'; typeClass = 'bg-orange-50 text-orange-600 border border-orange-100'; }
    else if (f.type === 'heroic_mother') { typeLabel = 'Mẹ VN Anh hùng'; typeClass = 'bg-red-700 text-white shadow-sm'; }
    else if (f.type === 'armed_forces_hero') { typeLabel = 'Anh hùng LLVTND'; typeClass = 'bg-yellow-50 text-yellow-700 border border-yellow-250'; }
    else if (f.type === 'other') { typeLabel = 'Chính sách khác'; typeClass = 'bg-indigo-50 text-indigo-600 border border-indigo-100'; }

    // Neighborhood Name
    const nh = neighborhoods.find(n => n.id === f.neighborhood_id);
    const nhName = nh ? `TDP ${nh.name}` : '—';

    // Celebration event name
    const event = events.find(e => e.id === f.celebration_event_id);
    const eventName = event ? `${event.name} (${event.day}/${event.month})` : 'Chưa liên kết';

    tr.innerHTML = `
      <td class="py-4 px-6 text-slate-400 font-bold">${f.id}</td>
      <td class="py-4 px-6">
        <div class="font-extrabold text-slate-800">${f.name}</div>
        <div class="text-[10px] text-slate-400 mt-0.5 max-w-[150px] truncate">${f.address || ''}</div>
      </td>
      <td class="py-4 px-6">
        <span class="inline-block px-2 py-0.5 rounded text-[10px] font-bold ${typeClass}">${typeLabel}</span>
      </td>
      <td class="py-4 px-6">
        <div class="font-bold text-slate-700">${f.representative_name || 'Chủ hộ'}</div>
        <div class="text-[10px] text-slate-400 mt-0.5">${f.phone || '—'}</div>
      </td>
      <td class="py-4 px-6 font-bold text-slate-700">${nhName}</td>
      <td class="py-4 px-6 font-bold text-slate-700 max-w-[200px] truncate" title="${f.benefit_details || ''}">
        ${f.benefit_details || '—'}
      </td>
      <td class="py-4 px-6">
        <span class="text-xs text-slate-500 font-medium">${eventName}</span>
      </td>
      <td class="py-4 px-6 text-right shrink-0">
        <div class="flex items-center justify-end gap-2">
          <button onclick="editFamily(${f.id})" class="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 hover:text-slate-900 transition-colors flex items-center justify-center">
            <span class="material-symbols-outlined text-base">edit</span>
          </button>
          <button onclick="deleteFamily(${f.id})" class="p-1.5 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-600 transition-colors flex items-center justify-center">
            <span class="material-symbols-outlined text-base">delete</span>
          </button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// --- EVENTS TAB ---
function renderEventsTable() {
  const tbody = document.getElementById('table-events-body');
  if (!tbody) return;

  const searchQuery = (document.getElementById('search-events') as HTMLInputElement)?.value.toLowerCase() || '';

  tbody.innerHTML = '';

  const filtered = events.filter(e => {
    return e.name.toLowerCase().includes(searchQuery) || (e.description || '').toLowerCase().includes(searchQuery);
  });

  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" class="py-8 text-center text-slate-400 font-semibold italic">Không tìm thấy sự kiện kỷ niệm nào phù hợp</td>
      </tr>
    `;
    return;
  }

  filtered.forEach(e => {
    const tr = document.createElement('tr');
    tr.className = 'hover:bg-slate-50 border-b border-slate-100 transition-colors';
    
    // Count linked families
    const familyCount = families.filter(f => f.celebration_event_id === e.id).length;
    
    // Status Badge
    const statusClass = e.status === 'active' 
      ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
      : 'bg-slate-100 text-slate-400';
    const statusText = e.status === 'active' ? 'Đang hoạt động' : 'Tạm dừng';

    tr.innerHTML = `
      <td class="py-4 px-6 text-slate-400 font-bold">${e.id}</td>
      <td class="py-4 px-6 font-extrabold text-slate-800">${e.name}</td>
      <td class="py-4 px-6 text-slate-500 font-bold">Ngày ${e.day} Tháng ${e.month}</td>
      <td class="py-4 px-6 text-slate-550 max-w-xs truncate" title="${e.description || ''}">${e.description || '—'}</td>
      <td class="py-4 px-6 font-bold text-primary text-center">${familyCount} gia đình</td>
      <td class="py-4 px-6">
        <span class="inline-block px-2 py-0.5 rounded text-[10px] font-bold ${statusClass}">${statusText}</span>
      </td>
      <td class="py-4 px-6 text-right shrink-0">
        <div class="flex items-center justify-end gap-2">
          <button onclick="editEvent(${e.id})" class="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 hover:text-slate-900 transition-colors flex items-center justify-center">
            <span class="material-symbols-outlined text-base">edit</span>
          </button>
          <button onclick="deleteEvent(${e.id})" class="p-1.5 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-600 transition-colors flex items-center justify-center">
            <span class="material-symbols-outlined text-base">delete</span>
          </button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// --- NEIGHBORHOODS TAB ---
function renderNeighborhoodsTable() {
  const tbody = document.getElementById('table-neighborhoods-body');
  if (!tbody) return;

  const searchQuery = (document.getElementById('search-neighborhoods') as HTMLInputElement)?.value.toLowerCase() || '';
  const filterType = (document.getElementById('filter-neighborhoods-type') as HTMLSelectElement)?.value || '';

  tbody.innerHTML = '';

  const filtered = neighborhoods.filter(n => {
    const matchesSearch = n.name.toLowerCase().includes(searchQuery) || (n.leader_name || '').toLowerCase().includes(searchQuery);
    const matchesType = filterType === '' || n.type === filterType;
    return matchesSearch && matchesType;
  });

  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8" class="py-8 text-center text-slate-400 font-semibold italic">Không tìm thấy tổ dân phố nào phù hợp</td>
      </tr>
    `;
    return;
  }

  filtered.forEach(n => {
    const tr = document.createElement('tr');
    tr.className = 'hover:bg-slate-50 border-b border-slate-100 transition-colors';
    
    // Type Badge
    const typeClass = n.type === 'new' 
      ? 'bg-sky-50 text-sky-600 border border-sky-100 font-extrabold' 
      : 'bg-slate-100 text-slate-600 font-medium';
    const typeText = n.type === 'new' ? 'Dự kiến sáp nhập' : 'Hiện trạng cũ';

    tr.innerHTML = `
      <td class="py-4 px-6 text-slate-400 font-bold">${n.id}</td>
      <td class="py-4 px-6 font-extrabold text-slate-800">TDP ${n.name}</td>
      <td class="py-4 px-6">
        <span class="inline-block px-2 py-0.5 rounded text-[10px] ${typeClass}">${typeText}</span>
      </td>
      <td class="py-4 px-6 font-bold text-slate-500 font-mono">${n.group_code || '—'}</td>
      <td class="py-4 px-6">
        <div class="font-bold text-slate-700">${n.leader_name || 'Chưa bổ nhiệm'}</div>
        <div class="text-[10px] text-slate-400 mt-0.5">${n.leader_phone || '—'}</div>
      </td>
      <td class="py-4 px-6 text-right font-bold text-slate-600">${n.households.toLocaleString('vi-VN')} hộ</td>
      <td class="py-4 px-6 text-right font-bold text-slate-600">${n.people.toLocaleString('vi-VN')} khẩu</td>
      <td class="py-4 px-6 text-right shrink-0">
        <div class="flex items-center justify-end gap-2">
          <button onclick="editNeighborhood(${n.id})" class="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 hover:text-slate-900 transition-colors flex items-center justify-center">
            <span class="material-symbols-outlined text-base">edit</span>
          </button>
          <button onclick="deleteNeighborhood(${n.id})" class="p-1.5 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-600 transition-colors flex items-center justify-center">
            <span class="material-symbols-outlined text-base">delete</span>
          </button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// --- MODAL UTILS & POPULATE SELECTS ---
function populateSelects() {
  // Ward dropdown
  const placeWardId = document.getElementById('place-ward-id') as HTMLSelectElement;
  if (placeWardId) {
    placeWardId.innerHTML = '';
    wards.forEach(w => {
      const opt = document.createElement('option');
      opt.value = w.id.toString();
      opt.textContent = `${w.name} (${w.type})`;
      placeWardId.appendChild(opt);
    });
  }

  // Neighborhood dropdown
  const familyNhId = document.getElementById('family-neighborhood-id') as HTMLSelectElement;
  if (familyNhId) {
    familyNhId.innerHTML = '';
    // Select new/target neighborhoods for families
    neighborhoods.forEach(n => {
      const opt = document.createElement('option');
      opt.value = n.id.toString();
      opt.textContent = `TDP ${n.name} (${n.type === 'new' ? 'Sau SN' : 'Trước SN'})`;
      familyNhId.appendChild(opt);
    });
  }

  // Events dropdown for families
  const familyEventId = document.getElementById('family-event-id') as HTMLSelectElement;
  if (familyEventId) {
    familyEventId.innerHTML = '';
    
    // Add default None option
    const noneOpt = document.createElement('option');
    noneOpt.value = '0';
    noneOpt.textContent = '— Không liên kết —';
    familyEventId.appendChild(noneOpt);

    events.forEach(e => {
      const opt = document.createElement('option');
      opt.value = e.id.toString();
      opt.textContent = `${e.name} (${e.day}/${e.month})`;
      familyEventId.appendChild(opt);
    });
  }
}

// --- MODAL TOGGLES & CRUDS ---

// 1. PLACE MODAL
function openPlaceModal(placeId?: number) {
  const modal = document.getElementById('modal-place');
  const title = document.getElementById('modal-place-title');
  const form = document.getElementById('form-place') as HTMLFormElement;
  
  if (!modal || !title || !form) return;

  form.reset();
  populateSelects();

  if (placeId) {
    title.textContent = 'Chỉnh sửa Địa điểm';
    const p = places.find(item => item.id === placeId);
    if (p) {
      (document.getElementById('place-id') as HTMLInputElement).value = p.id.toString();
      (document.getElementById('place-name') as HTMLInputElement).value = p.name;
      (document.getElementById('place-category') as HTMLSelectElement).value = p.category;
      (document.getElementById('place-ward-id') as HTMLSelectElement).value = (p.administrative_unit_id || wards[0]?.id).toString();
      (document.getElementById('place-lat') as HTMLInputElement).value = p.lat.toString();
      (document.getElementById('place-lng') as HTMLInputElement).value = p.lng.toString();
      (document.getElementById('place-address') as HTMLInputElement).value = p.address || '';
      (document.getElementById('place-image') as HTMLInputElement).value = p.image || '';
      (document.getElementById('place-description') as HTMLTextAreaElement).value = p.description || '';
    }
  } else {
    title.textContent = 'Thêm Địa điểm mới';
    (document.getElementById('place-id') as HTMLInputElement).value = '';
    // Set default coordinates near Duy Ha Ward center
    (document.getElementById('place-lat') as HTMLInputElement).value = '20.6478';
    (document.getElementById('place-lng') as HTMLInputElement).value = '105.9147';
  }

  modal.classList.remove('hidden');
  modal.classList.add('flex');
  setTimeout(() => {
    modal.querySelector('.transform')?.classList.remove('scale-95', 'opacity-0');
    modal.querySelector('.transform')?.classList.add('scale-100', 'opacity-100');
  }, 50);
}

function closePlaceModal() {
  const modal = document.getElementById('modal-place');
  if (!modal) return;
  modal.querySelector('.transform')?.classList.add('scale-95', 'opacity-0');
  modal.querySelector('.transform')?.classList.remove('scale-100', 'opacity-100');
  setTimeout(() => {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }, 200);
}

// 2. FAMILY MODAL
function openFamilyModal(familyId?: number) {
  const modal = document.getElementById('modal-family');
  const title = document.getElementById('modal-family-title');
  const form = document.getElementById('form-family') as HTMLFormElement;
  
  if (!modal || !title || !form) return;

  form.reset();
  populateSelects();

  if (familyId) {
    title.textContent = 'Chỉnh sửa Gia đình chính sách';
    const f = families.find(item => item.id === familyId);
    if (f) {
      (document.getElementById('family-id') as HTMLInputElement).value = f.id.toString();
      (document.getElementById('family-name') as HTMLInputElement).value = f.name;
      (document.getElementById('family-type') as HTMLSelectElement).value = f.type;
      (document.getElementById('family-neighborhood-id') as HTMLSelectElement).value = (f.neighborhood_id || neighborhoods[0]?.id).toString();
      (document.getElementById('family-rep-name') as HTMLInputElement).value = f.representative_name || '';
      (document.getElementById('family-phone') as HTMLInputElement).value = f.phone || '';
      (document.getElementById('family-address') as HTMLInputElement).value = f.address || '';
      (document.getElementById('family-event-id') as HTMLSelectElement).value = (f.celebration_event_id || 0).toString();
      (document.getElementById('family-status') as HTMLSelectElement).value = f.status;
      (document.getElementById('family-benefit') as HTMLInputElement).value = f.benefit_details || '';
    }
  } else {
    title.textContent = 'Thêm Gia đình chính sách';
    (document.getElementById('family-id') as HTMLInputElement).value = '';
  }

  modal.classList.remove('hidden');
  modal.classList.add('flex');
  setTimeout(() => {
    modal.querySelector('.transform')?.classList.remove('scale-95', 'opacity-0');
    modal.querySelector('.transform')?.classList.add('scale-100', 'opacity-100');
  }, 50);
}

function closeFamilyModal() {
  const modal = document.getElementById('modal-family');
  if (!modal) return;
  modal.querySelector('.transform')?.classList.add('scale-95', 'opacity-0');
  modal.querySelector('.transform')?.classList.remove('scale-100', 'opacity-100');
  setTimeout(() => {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }, 200);
}

// 3. EVENT MODAL
function openEventModal(eventId?: number) {
  const modal = document.getElementById('modal-event');
  const title = document.getElementById('modal-event-title');
  const form = document.getElementById('form-event') as HTMLFormElement;
  
  if (!modal || !title || !form) return;

  form.reset();

  if (eventId) {
    title.textContent = 'Chỉnh sửa Sự kiện kỷ niệm';
    const e = events.find(item => item.id === eventId);
    if (e) {
      (document.getElementById('event-id') as HTMLInputElement).value = e.id.toString();
      (document.getElementById('event-name') as HTMLInputElement).value = e.name;
      (document.getElementById('event-day') as HTMLInputElement).value = e.day.toString();
      (document.getElementById('event-month') as HTMLInputElement).value = e.month.toString();
      (document.getElementById('event-description') as HTMLTextAreaElement).value = e.description || '';
      (document.getElementById('event-status') as HTMLSelectElement).value = e.status;
    }
  } else {
    title.textContent = 'Thêm Sự kiện kỷ niệm mới';
    (document.getElementById('event-id') as HTMLInputElement).value = '';
    
    // Set default day month
    const d = new Date();
    (document.getElementById('event-day') as HTMLInputElement).value = d.getDate().toString();
    (document.getElementById('event-month') as HTMLInputElement).value = (d.getMonth() + 1).toString();
  }

  modal.classList.remove('hidden');
  modal.classList.add('flex');
  setTimeout(() => {
    modal.querySelector('.transform')?.classList.remove('scale-95', 'opacity-0');
    modal.querySelector('.transform')?.classList.add('scale-100', 'opacity-100');
  }, 50);
}

function closeEventModal() {
  const modal = document.getElementById('modal-event');
  if (!modal) return;
  modal.querySelector('.transform')?.classList.add('scale-95', 'opacity-0');
  modal.querySelector('.transform')?.classList.remove('scale-100', 'opacity-100');
  setTimeout(() => {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }, 200);
}

// 4. NEIGHBORHOOD MODAL
function openNeighborhoodModal(nhId?: number) {
  const modal = document.getElementById('modal-neighborhood');
  const title = document.getElementById('modal-neighborhood-title');
  const form = document.getElementById('form-neighborhood') as HTMLFormElement;
  
  if (!modal || !title || !form) return;

  form.reset();

  if (nhId) {
    title.textContent = 'Chỉnh sửa Tổ dân phố';
    const n = neighborhoods.find(item => item.id === nhId);
    if (n) {
      (document.getElementById('neighborhood-id') as HTMLInputElement).value = n.id.toString();
      (document.getElementById('neighborhood-name') as HTMLInputElement).value = n.name;
      (document.getElementById('neighborhood-type') as HTMLSelectElement).value = n.type;
      (document.getElementById('neighborhood-group-code') as HTMLInputElement).value = n.group_code || '';
      (document.getElementById('neighborhood-leader-name') as HTMLInputElement).value = n.leader_name || '';
      (document.getElementById('neighborhood-leader-phone') as HTMLInputElement).value = n.leader_phone || '';
      (document.getElementById('neighborhood-households') as HTMLInputElement).value = n.households.toString();
      (document.getElementById('neighborhood-people') as HTMLInputElement).value = n.people.toString();
    }
  } else {
    title.textContent = 'Thêm Tổ dân phố mới';
    (document.getElementById('neighborhood-id') as HTMLInputElement).value = '';
  }

  modal.classList.remove('hidden');
  modal.classList.add('flex');
  setTimeout(() => {
    modal.querySelector('.transform')?.classList.remove('scale-95', 'opacity-0');
    modal.querySelector('.transform')?.classList.add('scale-100', 'opacity-100');
  }, 50);
}

function closeNeighborhoodModal() {
  const modal = document.getElementById('modal-neighborhood');
  if (!modal) return;
  modal.querySelector('.transform')?.classList.add('scale-95', 'opacity-0');
  modal.querySelector('.transform')?.classList.remove('scale-100', 'opacity-100');
  setTimeout(() => {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }, 200);
}

// --- SUBMIT HANDLERS ---
function setupSubmitHandlers() {
  // 1. Places form
  document.getElementById('form-place')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const idInput = (document.getElementById('place-id') as HTMLInputElement).value;
    const name = (document.getElementById('place-name') as HTMLInputElement).value;
    const category = (document.getElementById('place-category') as HTMLSelectElement).value as any;
    const wardId = parseInt((document.getElementById('place-ward-id') as HTMLSelectElement).value);
    const lat = parseFloat((document.getElementById('place-lat') as HTMLInputElement).value);
    const lng = parseFloat((document.getElementById('place-lng') as HTMLInputElement).value);
    const address = (document.getElementById('place-address') as HTMLInputElement).value;
    const image = (document.getElementById('place-image') as HTMLInputElement).value;
    const description = (document.getElementById('place-description') as HTMLTextAreaElement).value;

    if (idInput) {
      // Edit
      const id = parseInt(idInput);
      places = places.map(p => p.id === id ? { ...p, name, category, administrative_unit_id: wardId, lat, lng, address, image, description } : p);
    } else {
      // Add
      const id = places.length > 0 ? Math.max(...places.map(p => p.id)) + 1 : 1;
      places.push({ id, name, category, administrative_unit_id: wardId, lat, lng, address, image, description, status: 'active' });
    }

    saveData('philanthropy_places', places);
    closePlaceModal();
  });

  // 2. Families form
  document.getElementById('form-family')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const idInput = (document.getElementById('family-id') as HTMLInputElement).value;
    const name = (document.getElementById('family-name') as HTMLInputElement).value;
    const type = (document.getElementById('family-type') as HTMLSelectElement).value;
    const nhId = parseInt((document.getElementById('family-neighborhood-id') as HTMLSelectElement).value);
    const repName = (document.getElementById('family-rep-name') as HTMLInputElement).value;
    const phone = (document.getElementById('family-phone') as HTMLInputElement).value;
    const address = (document.getElementById('family-address') as HTMLInputElement).value;
    const eventIdVal = parseInt((document.getElementById('family-event-id') as HTMLSelectElement).value);
    const eventId = eventIdVal > 0 ? eventIdVal : undefined;
    const status = (document.getElementById('family-status') as HTMLSelectElement).value;
    const benefit = (document.getElementById('family-benefit') as HTMLInputElement).value;

    if (idInput) {
      // Edit
      const id = parseInt(idInput);
      families = families.map(f => f.id === id ? { ...f, name, type, neighborhood_id: nhId, representative_name: repName, phone, address, celebration_event_id: eventId, status, benefit_details: benefit } : f);
    } else {
      // Add
      const id = families.length > 0 ? Math.max(...families.map(f => f.id)) + 1 : 1;
      families.push({ id, name, type, neighborhood_id: nhId, representative_name: repName, phone, address, celebration_event_id: eventId, status, benefit_details: benefit });
    }

    saveData('philanthropy_meritorious_families', families);
    closeFamilyModal();
  });

  // 3. Events form
  document.getElementById('form-event')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const idInput = (document.getElementById('event-id') as HTMLInputElement).value;
    const name = (document.getElementById('event-name') as HTMLInputElement).value;
    const day = parseInt((document.getElementById('event-day') as HTMLInputElement).value);
    const month = parseInt((document.getElementById('event-month') as HTMLInputElement).value);
    const description = (document.getElementById('event-description') as HTMLTextAreaElement).value;
    const status = (document.getElementById('event-status') as HTMLSelectElement).value;

    if (idInput) {
      // Edit
      const id = parseInt(idInput);
      events = events.map(ev => ev.id === id ? { ...ev, name, day, month, description, status } : ev);
    } else {
      // Add
      const id = events.length > 0 ? Math.max(...events.map(ev => ev.id)) + 1 : 1;
      events.push({ id, name, day, month, description, status });
    }

    saveData('philanthropy_celebration_events', events);
    closeEventModal();
  });

  // 4. Neighborhoods form
  document.getElementById('form-neighborhood')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const idInput = (document.getElementById('neighborhood-id') as HTMLInputElement).value;
    const name = (document.getElementById('neighborhood-name') as HTMLInputElement).value;
    const type = (document.getElementById('neighborhood-type') as HTMLSelectElement).value as any;
    const groupCode = (document.getElementById('neighborhood-group-code') as HTMLInputElement).value;
    const leaderName = (document.getElementById('neighborhood-leader-name') as HTMLInputElement).value || null;
    const leaderPhone = (document.getElementById('neighborhood-leader-phone') as HTMLInputElement).value || null;
    const households = parseInt((document.getElementById('neighborhood-households') as HTMLInputElement).value);
    const people = parseInt((document.getElementById('neighborhood-people') as HTMLInputElement).value);

    if (idInput) {
      // Edit
      const id = parseInt(idInput);
      neighborhoods = neighborhoods.map(n => n.id === id ? { ...n, name, type, group_code: groupCode, leader_name: leaderName, leader_phone: leaderPhone, households, people } : n);
    } else {
      // Add
      const id = neighborhoods.length > 0 ? Math.max(...neighborhoods.map(n => n.id)) + 1 : 1;
      neighborhoods.push({ id, name, type, group_code: groupCode, leader_name: leaderName, leader_phone: leaderPhone, households, people, status: 'active' });
    }

    saveData('philanthropy_neighborhoods', neighborhoods);
    closeNeighborhoodModal();
  });
}

// --- DELETE HANDLERS ---
function deletePlace(id: number) {
  if (confirm('Bạn có chắc chắn muốn xóa địa điểm này không?')) {
    places = places.filter(p => p.id !== id);
    saveData('philanthropy_places', places);
  }
}

function deleteFamily(id: number) {
  if (confirm('Bạn có chắc chắn muốn xóa thông tin gia đình chính sách này không?')) {
    families = families.filter(f => f.id !== id);
    saveData('philanthropy_meritorious_families', families);
  }
}

function deleteEvent(id: number) {
  if (confirm('Bạn có chắc chắn muốn xóa sự kiện kỷ niệm này? Tất cả các liên kết gia đình chính sách thuộc sự kiện này sẽ bị ngắt kết nối.')) {
    // Break relationships first
    families = families.map(f => f.celebration_event_id === id ? { ...f, celebration_event_id: undefined } : f);
    localStorage.setItem('philanthropy_meritorious_families', JSON.stringify(families));
    
    events = events.filter(e => e.id !== id);
    saveData('philanthropy_celebration_events', events);
  }
}

function deleteNeighborhood(id: number) {
  if (confirm('Bạn có chắc chắn muốn xóa Tổ dân phố này không?')) {
    // Break relationships for families under this neighborhood
    families = families.map(f => f.neighborhood_id === id ? { ...f, neighborhood_id: undefined } : f);
    localStorage.setItem('philanthropy_meritorious_families', JSON.stringify(families));

    neighborhoods = neighborhoods.filter(n => n.id !== id);
    saveData('philanthropy_neighborhoods', neighborhoods);
  }
}

// Expose functions globally to HTML handlers
(window as any).openPlaceModal = openPlaceModal;
(window as any).closePlaceModal = closePlaceModal;
(window as any).openFamilyModal = openFamilyModal;
(window as any).closeFamilyModal = closeFamilyModal;
(window as any).openEventModal = openEventModal;
(window as any).closeEventModal = closeEventModal;
(window as any).openNeighborhoodModal = openNeighborhoodModal;
(window as any).closeNeighborhoodModal = closeNeighborhoodModal;
(window as any).deletePlace = deletePlace;
(window as any).deleteFamily = deleteFamily;
(window as any).deleteEvent = deleteEvent;
(window as any).deleteNeighborhood = deleteNeighborhood;
(window as any).editPlace = openPlaceModal;
(window as any).editFamily = openFamilyModal;
(window as any).editEvent = openEventModal;
(window as any).editNeighborhood = openNeighborhoodModal;
(window as any).resetToOriginalData = resetToOriginalData;

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  // Load data
  loadData();
  
  // Set up tab switching listeners
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const tabId = btn.getAttribute('data-tab');
      if (tabId) switchTab(tabId);
    });
  });

  // Sidebar drawer responsive toggle logic
  const sidebar = document.getElementById('admin-sidebar');
  const overlay = document.getElementById('sidebar-overlay');
  const btnToggle = document.getElementById('btn-toggle-sidebar');
  const btnClose = document.getElementById('btn-close-sidebar');

  const showSidebar = () => {
    sidebar?.classList.remove('-translate-x-full');
    overlay?.classList.remove('hidden');
  };

  const hideSidebar = () => {
    sidebar?.classList.add('-translate-x-full');
    overlay?.classList.add('hidden');
  };

  btnToggle?.addEventListener('click', showSidebar);
  btnClose?.addEventListener('click', hideSidebar);
  overlay?.addEventListener('click', hideSidebar);

  // Auto-close sidebar on mobile when tab changes
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      if (window.innerWidth < 768) {
        hideSidebar();
      }
    });
  });

  // Simulator test date trigger
  document.getElementById('btn-trigger-test-date')?.addEventListener('click', () => {
    const val = (document.getElementById('select-test-date') as HTMLSelectElement).value;
    const [day, month] = val.split('/').map(Number);
    updateSimulatorCard(day, month);
  });

  // Search input listeners for instant filtering
  document.getElementById('search-places')?.addEventListener('input', renderPlacesTable);
  document.getElementById('search-families')?.addEventListener('input', renderFamiliesTable);
  document.getElementById('search-events')?.addEventListener('input', renderEventsTable);
  document.getElementById('search-neighborhoods')?.addEventListener('input', renderNeighborhoodsTable);

  // Filter selection change listeners
  document.getElementById('filter-places-category')?.addEventListener('change', renderPlacesTable);
  document.getElementById('filter-families-type')?.addEventListener('change', renderFamiliesTable);
  document.getElementById('filter-neighborhoods-type')?.addEventListener('change', renderNeighborhoodsTable);

  // Setup form submit events
  setupSubmitHandlers();

  // Populate first stats and tab
  updateStats();
  switchTab('overview');
});
