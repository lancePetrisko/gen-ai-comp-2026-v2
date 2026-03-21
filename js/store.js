/* =============================================
   Global Data Store
   Shared state across pages via localStorage
   ============================================= */

const Store = {
  requests: [],
  nextId: 1001,
  selectedId: null,
  sortField: 'id',
  sortDir: 'desc',
  filters: {},
  searchQuery: '',

  /** Save requests to localStorage so dashboard.html can read them */
  save() {
    localStorage.setItem('chp_requests', JSON.stringify(this.requests));
    localStorage.setItem('chp_nextId', String(this.nextId));
  },

  /** Load requests from localStorage */
  load() {
    const raw = localStorage.getItem('chp_requests');
    if (raw) {
      try { this.requests = JSON.parse(raw); } catch (e) { this.requests = []; }
    }
    const id = localStorage.getItem('chp_nextId');
    if (id) this.nextId = parseInt(id, 10);
  }
};
