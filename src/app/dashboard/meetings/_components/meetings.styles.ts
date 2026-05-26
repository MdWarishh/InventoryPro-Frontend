export const meetingsStyles = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  /* ─── CSS Variables: Light Mode defaults ──────────── */
  :root {
    --bg-page:        #f5f6fa;
    --bg-card:        #ffffff;
    --bg-input:       #f8f9fc;
    --bg-subtle:      #f0f2f8;
    --bg-hover:       #fafbff;
    --bg-thead:       #f8f9fc;

    --border:         #eaecf3;
    --border-mid:     #e2e5ef;
    --border-light:   #f1f3f9;

    --text-primary:   #1a1d27;
    --text-secondary: #4b5270;
    --text-muted:     #7880a0;
    --text-faint:     #9099b3;
    --text-ghost:     #b0b8cc;

    --indigo:         #6366f1;
    --indigo-dark:    #4f52d4;
    --indigo-bg:      #eff0fe;
    --indigo-soft:    #f5f3ff;
    --indigo-border:  #c4b5fd;

    --drawer-bg:      #ffffff;
    --modal-bg:       #ffffff;
    --overlay-bg:     rgba(20,22,36,.45);
    --drawer-overlay: rgba(20,22,36,.3);

    --duration-pill:  #f0f2f8;
    --duration-text:  #7880a0;

    --toast-bg:       #1a1d27;
    --toast-text:     #ffffff;
  }

  /* ─── Dark Mode Variables ─────────────────────────── */
  .dark, [data-theme="dark"] {
    --bg-page:        #0f1117;
    --bg-card:        #1a1d2e;
    --bg-input:       #141620;
    --bg-subtle:      #1e2133;
    --bg-hover:       #1e2133;
    --bg-thead:       #161825;

    --border:         #2a2d3e;
    --border-mid:     #252838;
    --border-light:   #222535;

    --text-primary:   #e8eaf6;
    --text-secondary: #a0a8c8;
    --text-muted:     #7880a0;
    --text-faint:     #5c6480;
    --text-ghost:     #4a5068;

    --indigo:         #818cf8;
    --indigo-dark:    #6366f1;
    --indigo-bg:      #1e1f3a;
    --indigo-soft:    #1c1a2e;
    --indigo-border:  #4338ca;

    --drawer-bg:      #1a1d2e;
    --modal-bg:       #1a1d2e;
    --overlay-bg:     rgba(5,6,12,.65);
    --drawer-overlay: rgba(5,6,12,.5);

    --duration-pill:  #1e2133;
    --duration-text:  #7880a0;

    --toast-bg:       #e8eaf6;
    --toast-text:     #1a1d27;
  }

  /* ─── Auto dark if no class-based theming ────────── */
  @media (prefers-color-scheme: dark) {
    :root:not(.light):not([data-theme="light"]) {
      --bg-page:        #0f1117;
      --bg-card:        #1a1d2e;
      --bg-input:       #141620;
      --bg-subtle:      #1e2133;
      --bg-hover:       #1e2133;
      --bg-thead:       #161825;

      --border:         #2a2d3e;
      --border-mid:     #252838;
      --border-light:   #222535;

      --text-primary:   #e8eaf6;
      --text-secondary: #a0a8c8;
      --text-muted:     #7880a0;
      --text-faint:     #5c6480;
      --text-ghost:     #4a5068;

      --indigo:         #818cf8;
      --indigo-dark:    #6366f1;
      --indigo-bg:      #1e1f3a;
      --indigo-soft:    #1c1a2e;
      --indigo-border:  #4338ca;

      --drawer-bg:      #1a1d2e;
      --modal-bg:       #1a1d2e;
      --overlay-bg:     rgba(5,6,12,.65);
      --drawer-overlay: rgba(5,6,12,.5);

      --duration-pill:  #1e2133;
      --duration-text:  #7880a0;

      --toast-bg:       #e8eaf6;
      --toast-text:     #1a1d27;
    }
  }

  /* ─── Page shell ──────────────────────────────────── */
  .mp {
    min-height: 100vh;
    background: var(--bg-page);
    font-family: 'Geist', 'DM Sans', 'Segoe UI', sans-serif;
    padding: 36px 32px;
    color: var(--text-primary);
    transition: background .2s, color .2s;
  }

  /* ─── Header ──────────────────────────────────────── */
  .mp-header { display: flex; align-items: flex-end; justify-content: space-between; margin-bottom: 28px; flex-wrap: wrap; gap: 16px; }
  .mp-title { font-size: 28px; font-weight: 750; letter-spacing: -0.5px; color: var(--text-primary); }
  .mp-sub   { font-size: 14px; color: var(--text-faint); margin-top: 4px; }

  /* ─── Buttons ─────────────────────────────────────── */
  .btn-primary {
    display: flex; align-items: center; gap: 7px;
    background: var(--indigo); color: #fff;
    border: none; border-radius: 10px; padding: 10px 20px;
    font-size: 13.5px; font-weight: 650; cursor: pointer;
    box-shadow: 0 2px 14px rgba(99,102,241,.3); transition: all .18s;
    font-family: inherit;
  }
  .btn-primary:hover { background: var(--indigo-dark); transform: translateY(-1px); }
  .btn-primary:disabled { opacity: .6; cursor: not-allowed; transform: none; }

  .btn-ghost {
    background: var(--bg-card); border: 1.5px solid var(--border-mid); color: var(--text-secondary);
    border-radius: 10px; padding: 9px 18px;
    font-size: 13.5px; font-weight: 600; cursor: pointer; transition: all .15s;
    font-family: inherit; display: flex; align-items: center;
  }
  .btn-ghost:hover { border-color: var(--text-muted); background: var(--bg-subtle); }

  .btn-danger {
    background: #ef4444; color: #fff; border: none;
    border-radius: 10px; padding: 9px 18px;
    font-size: 13.5px; font-weight: 650; cursor: pointer;
    box-shadow: 0 2px 10px rgba(239,68,68,.25); transition: all .18s;
    font-family: inherit; display: flex; align-items: center;
  }
  .btn-danger:hover { background: #dc2626; }
  .btn-danger:disabled { opacity: .6; cursor: not-allowed; }

  .btn-icon {
    width: 32px; height: 32px; border-radius: 8px;
    border: 1.5px solid var(--border); background: var(--bg-card);
    color: var(--text-muted); cursor: pointer; display: flex; align-items: center; justify-content: center;
    transition: all .15s;
  }
  .btn-icon:hover { background: var(--bg-subtle); color: var(--text-primary); border-color: var(--text-faint); }
  .btn-icon.danger:hover { background: #fee2e2; border-color: #fca5a5; color: #ef4444; }
  .dark .btn-icon.danger:hover,
  [data-theme="dark"] .btn-icon.danger:hover { background: #3a1515; border-color: #7f1d1d; color: #f87171; }

  /* ─── Stats ───────────────────────────────────────── */
  .stats-row { display: flex; gap: 14px; margin-bottom: 24px; flex-wrap: wrap; }
  .stat-card {
    background: var(--bg-card); border: 1.5px solid var(--border); border-radius: 14px;
    padding: 16px 22px; flex: 1; min-width: 130px;
    border-top: 3px solid var(--stat-color, var(--indigo));
    transition: background .2s, border-color .2s;
  }
  .stat-label { font-size: 11px; font-weight: 700; letter-spacing: 1.2px; text-transform: uppercase; color: var(--text-faint); margin-bottom: 6px; }
  .stat-value { font-size: 26px; font-weight: 750; letter-spacing: -0.5px; color: var(--text-primary); }

  /* ─── View Toggle ─────────────────────────────────── */
  .view-toggle { display: flex; gap: 2px; background: var(--bg-subtle); padding: 4px; border-radius: 10px; }
  .vt-btn {
    padding: 7px 14px; border-radius: 7px; font-size: 13px; font-weight: 600;
    cursor: pointer; border: none; background: transparent; color: var(--text-muted);
    transition: all .15s; display: flex; align-items: center; gap: 6px;
  }
  .vt-btn.active { background: var(--bg-card); color: var(--text-primary); box-shadow: 0 1px 6px rgba(0,0,0,.1); }

  /* ─── Filters ─────────────────────────────────────── */
  .filters-bar { display: flex; gap: 10px; margin-bottom: 20px; flex-wrap: wrap; align-items: center; }
  .search-wrap { position: relative; flex: 1; min-width: 220px; max-width: 360px; }
  .search-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: var(--text-faint); pointer-events: none; }
  .search-input {
    width: 100%; background: var(--bg-card); border: 1.5px solid var(--border);
    border-radius: 10px; padding: 9px 12px 9px 38px;
    font-size: 13.5px; color: var(--text-primary); outline: none; transition: border-color .18s;
    font-family: inherit;
  }
  .search-input::placeholder { color: var(--text-ghost); }
  .search-input:focus { border-color: var(--indigo); }

  .filter-select {
    background: var(--bg-card); border: 1.5px solid var(--border); border-radius: 10px;
    padding: 9px 14px; font-size: 13px; color: var(--text-secondary); outline: none;
    cursor: pointer; font-family: inherit; transition: border-color .15s;
  }
  .filter-select:focus { border-color: var(--indigo); }

  .date-input {
    background: var(--bg-card); border: 1.5px solid var(--border); border-radius: 10px;
    padding: 9px 12px; font-size: 13px; color: var(--text-secondary); outline: none;
    cursor: pointer; font-family: inherit;
  }
  .date-input::-webkit-calendar-picker-indicator { filter: invert(0.4); }
  .dark .date-input::-webkit-calendar-picker-indicator,
  [data-theme="dark"] .date-input::-webkit-calendar-picker-indicator { filter: invert(0.7); }

  /* ─── Card Grid ───────────────────────────────────── */
  .card-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 16px; }

  /* ─── Meeting Card ────────────────────────────────── */
  .m-card {
    background: var(--bg-card); border: 1.5px solid var(--border); border-radius: 16px;
    padding: 20px; cursor: pointer; transition: all .18s;
    border-left: 4px solid var(--priority-color, var(--indigo));
    position: relative; overflow: hidden;
  }
  .m-card:hover {
    border-color: var(--text-muted);
    border-left-color: var(--priority-color, var(--indigo));
    transform: translateY(-2px);
    box-shadow: 0 8px 28px rgba(0,0,0,.12);
  }
  .card-top { display: flex; align-items: flex-start; justify-content: space-between; gap: 10px; margin-bottom: 12px; }
  .card-badges { display: flex; gap: 6px; flex-wrap: wrap; }
  .card-actions-row { display: flex; gap: 6px; opacity: 0; transition: opacity .15s; }
  .m-card:hover .card-actions-row { opacity: 1; }
  .card-title { font-size: 15px; font-weight: 700; color: var(--text-primary); margin-bottom: 6px; line-height: 1.4; }
  .card-desc { font-size: 13px; color: var(--text-muted); line-height: 1.5; margin-bottom: 14px; }
  .card-meta { display: flex; flex-direction: column; gap: 6px; }
  .card-meta-row { display: flex; align-items: center; gap: 7px; font-size: 12.5px; color: var(--text-muted); }
  .card-meta-row svg { flex-shrink: 0; color: var(--text-faint); }
  .card-footer {
    display: flex; align-items: center; justify-content: space-between;
    margin-top: 14px; padding-top: 12px; border-top: 1px solid var(--border-light);
  }
  .card-footer-by { font-size: 12px; color: var(--text-faint); }
  .avatars { display: flex; }
  .avatar {
    width: 26px; height: 26px; border-radius: 50%;
    background: var(--indigo-bg); border: 2px solid var(--bg-card);
    display: flex; align-items: center; justify-content: center;
    font-size: 10px; font-weight: 700; color: var(--indigo); margin-left: -6px;
  }
  .avatar:first-child { margin-left: 0; }
  .avatar-more { background: var(--bg-subtle); color: var(--text-muted); font-size: 10px; }

  /* Duration pill */
  .duration-pill {
    background: var(--duration-pill); border-radius: 5px;
    padding: 1px 6px; font-size: 11px; font-weight: 600; color: var(--duration-text);
  }

  /* ─── Table view ──────────────────────────────────── */
  .tbl-wrap { background: var(--bg-card); border: 1.5px solid var(--border); border-radius: 16px; overflow: hidden; }
  .tbl { width: 100%; border-collapse: collapse; }
  .tbl thead tr { background: var(--bg-thead); }
  .tbl th {
    padding: 13px 18px; text-align: left;
    font-size: 11px; font-weight: 700; letter-spacing: 1.2px;
    text-transform: uppercase; color: var(--text-faint); border-bottom: 1.5px solid var(--border);
    white-space: nowrap;
  }
  .tbl td { padding: 14px 18px; font-size: 13.5px; color: var(--text-secondary); border-bottom: 1px solid var(--border-light); vertical-align: middle; }
  .tbl td strong { color: var(--text-primary); }
  .tbl tbody tr:last-child td { border-bottom: none; }
  .tbl tbody tr:hover td { background: var(--bg-hover); cursor: pointer; }
  .tbl-title { font-weight: 650; font-size: 14px; color: var(--text-primary); }
  .tbl-location { font-size: 12px; color: var(--text-faint); margin-top: 2px; }
  .tbl-date { font-weight: 600; color: var(--text-primary); }
  .tbl-time { font-size: 12px; color: var(--text-faint); }

  /* ─── Badges ──────────────────────────────────────── */
  .badge {
    display: inline-flex; align-items: center; gap: 4px;
    padding: 3px 9px; border-radius: 6px;
    font-size: 11px; font-weight: 700; letter-spacing: 0.3px; white-space: nowrap;
  }
  .badge-dot { width: 5px; height: 5px; border-radius: 50%; }

  /* Status — light */
  .s-scheduled  { background: #eff6ff; color: #3b82f6; }
  .s-ongoing    { background: #f0fdf4; color: #16a34a; }
  .s-completed  { background: #f8f9fc; color: #6b7494; }
  .s-cancelled  { background: #fee2e2; color: #ef4444; }
  .s-postponed  { background: #fff7ed; color: #d97706; }

  /* Status — dark */
  .dark .s-scheduled,  [data-theme="dark"] .s-scheduled  { background: #1e2f4d; color: #60a5fa; }
  .dark .s-ongoing,    [data-theme="dark"] .s-ongoing    { background: #14291e; color: #4ade80; }
  .dark .s-completed,  [data-theme="dark"] .s-completed  { background: #1e2133; color: #7880a0; }
  .dark .s-cancelled,  [data-theme="dark"] .s-cancelled  { background: #2d1515; color: #f87171; }
  .dark .s-postponed,  [data-theme="dark"] .s-postponed  { background: #2d1f0a; color: #fbbf24; }

  @media (prefers-color-scheme: dark) {
    :root:not(.light):not([data-theme="light"]) .s-scheduled  { background: #1e2f4d; color: #60a5fa; }
    :root:not(.light):not([data-theme="light"]) .s-ongoing    { background: #14291e; color: #4ade80; }
    :root:not(.light):not([data-theme="light"]) .s-completed  { background: #1e2133; color: #7880a0; }
    :root:not(.light):not([data-theme="light"]) .s-cancelled  { background: #2d1515; color: #f87171; }
    :root:not(.light):not([data-theme="light"]) .s-postponed  { background: #2d1f0a; color: #fbbf24; }
  }

  /* Priority — light */
  .p-low    { background: #f0fdf4; color: #16a34a; }
  .p-medium { background: #eff6ff; color: #3b82f6; }
  .p-high   { background: #fff7ed; color: #d97706; }
  .p-urgent { background: #fee2e2; color: #ef4444; }

  /* Priority — dark */
  .dark .p-low,    [data-theme="dark"] .p-low    { background: #14291e; color: #4ade80; }
  .dark .p-medium, [data-theme="dark"] .p-medium { background: #1e2f4d; color: #60a5fa; }
  .dark .p-high,   [data-theme="dark"] .p-high   { background: #2d1f0a; color: #fbbf24; }
  .dark .p-urgent, [data-theme="dark"] .p-urgent { background: #2d1515; color: #f87171; }

  @media (prefers-color-scheme: dark) {
    :root:not(.light):not([data-theme="light"]) .p-low    { background: #14291e; color: #4ade80; }
    :root:not(.light):not([data-theme="light"]) .p-medium { background: #1e2f4d; color: #60a5fa; }
    :root:not(.light):not([data-theme="light"]) .p-high   { background: #2d1f0a; color: #fbbf24; }
    :root:not(.light):not([data-theme="light"]) .p-urgent { background: #2d1515; color: #f87171; }
  }

  /* Type */
  .t-badge { background: #f5f3ff; color: #7c3aed; }
  .dark .t-badge, [data-theme="dark"] .t-badge { background: #1e1a2e; color: #a78bfa; }
  @media (prefers-color-scheme: dark) {
    :root:not(.light):not([data-theme="light"]) .t-badge { background: #1e1a2e; color: #a78bfa; }
  }

  /* ─── Reminder sent pill ─────────────────────────── */
  .reminder-sent {
    background: #f0fdf4; color: #16a34a; border-radius: 5px;
    padding: 2px 7px; font-size: 11px; font-weight: 700;
  }
  .dark .reminder-sent, [data-theme="dark"] .reminder-sent { background: #14291e; color: #4ade80; }

  /* ─── Empty ───────────────────────────────────────── */
  .empty { text-align: center; padding: 60px 20px; color: var(--text-faint); }
  .empty-icon { font-size: 44px; margin-bottom: 12px; opacity: .45; }
  .empty p { font-size: 15px; font-weight: 500; color: var(--text-muted); }
  .empty span { font-size: 13px; display: block; margin-top: 6px; color: var(--text-ghost); }

  /* ─── Skeleton ────────────────────────────────────── */
  @keyframes sh { 0%,100%{opacity:.45} 50%{opacity:.8} }
  .sk { background: var(--bg-subtle); border-radius: 6px; animation: sh 1.4s infinite; }

  /* ─── Overlay / Modal / Drawer ───────────────────── */
  .overlay {
    position: fixed; inset: 0; z-index: 50;
    background: var(--overlay-bg); backdrop-filter: blur(6px);
    display: flex; align-items: center; justify-content: center; padding: 20px;
  }
  .drawer-overlay {
    position: fixed; inset: 0; z-index: 50;
    background: var(--drawer-overlay); backdrop-filter: blur(4px);
    display: flex; align-items: stretch; justify-content: flex-end;
  }
  .modal {
    background: var(--modal-bg); border-radius: 18px; width: 100%; max-width: 580px;
    box-shadow: 0 20px 60px rgba(0,0,0,.25);
    max-height: 90vh; overflow-y: auto;
    animation: slideUp .2s ease;
    border: 1.5px solid var(--border);
  }
  .drawer {
    background: var(--drawer-bg); width: 100%; max-width: 480px;
    box-shadow: -10px 0 50px rgba(0,0,0,.2);
    animation: slideRight .22s ease;
    overflow-y: auto;
    border-left: 1.5px solid var(--border);
  }
  @keyframes slideUp    { from{transform:translateY(12px);opacity:0} to{transform:none;opacity:1} }
  @keyframes slideRight { from{transform:translateX(20px);opacity:0} to{transform:none;opacity:1} }

  /* ─── Delete dialog box ───────────────────────────── */
  .delete-dialog {
    background: var(--modal-bg); border-radius: 18px; width: 100%; max-width: 380px;
    padding: 28px 24px 24px; text-align: center;
    box-shadow: 0 20px 60px rgba(0,0,0,.25);
    border: 1.5px solid var(--border);
  }
  .delete-dialog-icon {
    width: 52px; height: 52px; border-radius: 14px;
    background: #fee2e2; border: 1px solid #fca5a5;
    display: flex; align-items: center; justify-content: center;
    margin: 0 auto 16px;
  }
  .dark .delete-dialog-icon, [data-theme="dark"] .delete-dialog-icon { background: #2d1515; border-color: #7f1d1d; }
  .delete-dialog h3 { font-size: 18px; font-weight: 750; margin-bottom: 10px; color: var(--text-primary); }
  .delete-dialog p  { font-size: 14px; color: var(--text-muted); line-height: 1.6; margin-bottom: 22px; }
  .delete-dialog strong { color: var(--text-primary); }
  .delete-dialog-actions { display: flex; gap: 10px; justify-content: center; }

  /* ─── Modal internals ─────────────────────────────── */
  .modal-head {
    display: flex; align-items: center; justify-content: space-between;
    padding: 22px 24px 0;
  }
  .modal-head-left { display: flex; align-items: center; gap: 12px; }
  .modal-head h2 { font-size: 17px; font-weight: 750; letter-spacing: -0.3px; color: var(--text-primary); }
  .modal-icon {
    width: 38px; height: 38px; border-radius: 11px;
    background: var(--indigo-bg); display: flex; align-items: center; justify-content: center;
  }
  .close-btn {
    width: 30px; height: 30px; border-radius: 8px; border: 1.5px solid var(--border);
    background: transparent; color: var(--text-faint); cursor: pointer; font-size: 13px;
    display: flex; align-items: center; justify-content: center; transition: all .15s;
  }
  .close-btn:hover { background: var(--bg-subtle); color: var(--text-primary); }
  .modal-body { padding: 20px 24px 24px; }
  .form-section { margin-bottom: 20px; }
  .form-section-title {
    font-size: 11px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase;
    color: var(--text-faint); margin-bottom: 12px; padding-bottom: 8px;
    border-bottom: 1px solid var(--border-light);
  }
  .form-grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
  .form-grid1 { display: grid; grid-template-columns: 1fr; gap: 14px; }
  .fg { display: flex; flex-direction: column; gap: 6px; }
  .fg label { font-size: 12px; font-weight: 650; color: var(--text-muted); letter-spacing: 0.2px; }
  .fg input, .fg textarea, .fg select {
    background: var(--bg-input); border: 1.5px solid var(--border);
    border-radius: 9px; padding: 9px 12px;
    font-size: 13.5px; color: var(--text-primary); outline: none; transition: border-color .15s;
    font-family: inherit; resize: none;
  }
  .fg input:focus, .fg textarea:focus, .fg select:focus { border-color: var(--indigo); background: var(--bg-card); }
  .fg input::placeholder, .fg textarea::placeholder { color: var(--text-ghost); }
  .fg select option { background: var(--bg-card); color: var(--text-primary); }
  .modal-foot { display: flex; justify-content: flex-end; gap: 10px; padding-top: 8px; }

  /* Participant rows */
  .participant-list { display: flex; flex-direction: column; gap: 8px; margin-bottom: 10px; }
  .participant-row { display: flex; gap: 8px; align-items: center; }
  .participant-row input { flex: 1; }
  .add-participant-btn {
    display: flex; align-items: center; gap: 6px;
    font-size: 13px; font-weight: 600; color: var(--indigo);
    background: var(--indigo-soft); border: 1.5px dashed var(--indigo-border);
    border-radius: 9px; padding: 8px 14px; cursor: pointer;
    transition: all .15s; width: fit-content; font-family: inherit;
  }
  .add-participant-btn:hover { opacity: .85; }

  /* ─── Drawer internals ────────────────────────────── */
  .drawer-head {
    display: flex; align-items: center; justify-content: space-between;
    padding: 22px 24px; border-bottom: 1.5px solid var(--border-light); position: sticky; top: 0;
    background: var(--drawer-bg); z-index: 1;
  }
  .drawer-head h2 { font-size: 16px; font-weight: 750; letter-spacing: -0.3px; max-width: 340px; color: var(--text-primary); }
  .drawer-body { padding: 22px 24px; display: flex; flex-direction: column; gap: 22px; }
  .detail-section-title {
    font-size: 11px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase;
    color: var(--text-faint); margin-bottom: 12px;
  }
  .detail-row { display: flex; align-items: flex-start; gap: 10px; margin-bottom: 10px; font-size: 13.5px; }
  .detail-row svg { flex-shrink: 0; margin-top: 2px; color: var(--text-faint); }
  .detail-row a { color: var(--indigo); font-weight: 600; text-decoration: none; word-break: break-all; font-size: 14px; }
  .detail-label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: var(--text-ghost); margin-bottom: 4px; }
  .detail-value { font-size: 14px; color: var(--text-secondary); font-weight: 500; }
  .detail-desc { font-size: 14px; color: var(--text-secondary); line-height: 1.7; }
  .detail-meta { font-size: 12px; color: var(--text-ghost); border-top: 1.5px solid var(--border-light); padding-top: 16px; }
  .detail-meta strong { color: var(--text-muted); }
  .notes-box {
    background: var(--bg-input); border: 1.5px solid var(--border); border-radius: 10px;
    padding: 14px; font-size: 13.5px; color: var(--text-secondary); line-height: 1.6;
  }
  .participant-chip {
    display: flex; align-items: center; gap: 8px;
    padding: 8px 12px; background: var(--bg-input); border: 1px solid var(--border); border-radius: 10px;
    font-size: 13px;
  }
  .participant-avatar {
    width: 28px; height: 28px; border-radius: 50%; background: var(--indigo-bg);
    display: flex; align-items: center; justify-content: center;
    font-size: 11px; font-weight: 700; color: var(--indigo); flex-shrink: 0;
  }
  .participant-name { font-weight: 600; color: var(--text-primary); }
  .participant-email { font-size: 12px; color: var(--text-faint); }
  .participant-status { font-size: 10px; margin-left: auto; }
  .participants-grid { display: flex; flex-direction: column; gap: 8px; }
  .no-participants { font-size: 13px; color: var(--text-ghost); }
  .drawer-actions { display: flex; gap: 10px; padding: 16px 24px; border-top: 1.5px solid var(--border-light); }

  /* ─── Error ───────────────────────────────────────── */
  .err-banner {
    background: #fee2e2; color: #b91c1c; border-radius: 9px;
    padding: 10px 14px; font-size: 13px; font-weight: 500; margin-bottom: 16px;
  }
  .dark .err-banner, [data-theme="dark"] .err-banner { background: #2d1515; color: #f87171; }

  @keyframes spin { to{transform:rotate(360deg)} }
  .spin { width: 15px; height: 15px; border: 2.5px solid rgba(255,255,255,.35); border-top-color: #fff; border-radius: 50%; animation: spin .7s linear infinite; display: inline-block; }

  /* ─── Toast ───────────────────────────────────────── */
  .toast {
    position: fixed; bottom: 26px; left: 50%; transform: translateX(-50%);
    background: var(--toast-bg); color: var(--toast-text); border-radius: 50px;
    padding: 11px 22px; font-size: 13.5px; font-weight: 500;
    box-shadow: 0 6px 30px rgba(0,0,0,.3); z-index: 200;
    display: flex; align-items: center; gap: 8px; white-space: nowrap;
    animation: toastIn .22s ease;
  }
  .toast-dot { width: 7px; height: 7px; border-radius: 50%; }
  .toast.success .toast-dot { background: #22c55e; }
  .toast.error   .toast-dot { background: #ef4444; }
  @keyframes toastIn { from{opacity:0;transform:translateX(-50%) translateY(8px)} to{opacity:1;transform:translateX(-50%) translateY(0)} }

  @media(max-width:640px){
    .mp { padding: 20px 16px; }
    .mp-title { font-size: 22px; }
    .form-grid2 { grid-template-columns: 1fr; }
    .card-grid { grid-template-columns: 1fr; }
    .drawer { max-width: 100%; }
  }
`