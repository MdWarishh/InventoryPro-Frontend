export const meetingsStyles = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  /* ─── Page shell ──────────────────────────────────── */
  .mp {
    min-height: 100vh;
    background: #f5f6fa;
    font-family: 'Geist', 'DM Sans', 'Segoe UI', sans-serif;
    padding: 36px 32px;
    color: #1a1d27;
  }

  /* ─── Header ──────────────────────────────────────── */
  .mp-header { display: flex; align-items: flex-end; justify-content: space-between; margin-bottom: 28px; flex-wrap: wrap; gap: 16px; }
  .mp-title { font-size: 28px; font-weight: 750; letter-spacing: -0.5px; }
  .mp-sub   { font-size: 14px; color: #8890a4; margin-top: 4px; }

  /* ─── Buttons ─────────────────────────────────────── */
  .btn-primary {
    display: flex; align-items: center; gap: 7px;
    background: #6366f1; color: #fff;
    border: none; border-radius: 10px; padding: 10px 20px;
    font-size: 13.5px; font-weight: 650; cursor: pointer;
    box-shadow: 0 2px 14px rgba(99,102,241,.3); transition: all .18s;
    font-family: inherit;
  }
  .btn-primary:hover { background: #4f52d4; transform: translateY(-1px); }
  .btn-ghost {
    background: #fff; border: 1.5px solid #e2e5ef; color: #4b5270;
    border-radius: 10px; padding: 9px 18px;
    font-size: 13.5px; font-weight: 600; cursor: pointer; transition: all .15s;
    font-family: inherit;
  }
  .btn-ghost:hover { border-color: #c0c6d9; background: #f8f9fc; }
  .btn-danger {
    background: #ef4444; color: #fff; border: none;
    border-radius: 10px; padding: 9px 18px;
    font-size: 13.5px; font-weight: 650; cursor: pointer;
    box-shadow: 0 2px 10px rgba(239,68,68,.25); transition: all .18s;
    font-family: inherit;
  }
  .btn-danger:hover { background: #dc2626; }
  .btn-icon {
    width: 32px; height: 32px; border-radius: 8px;
    border: 1.5px solid #eaecf3; background: #fff;
    color: #7880a0; cursor: pointer; display: flex; align-items: center; justify-content: center;
    transition: all .15s;
  }
  .btn-icon:hover { background: #f5f6fa; color: #1a1d27; border-color: #c0c6d9; }
  .btn-icon.danger:hover { background: #fee2e2; border-color: #fca5a5; color: #ef4444; }

  /* ─── Stats ───────────────────────────────────────── */
  .stats-row { display: flex; gap: 14px; margin-bottom: 24px; flex-wrap: wrap; }
  .stat-card {
    background: #fff; border: 1.5px solid #eaecf3; border-radius: 14px;
    padding: 16px 22px; flex: 1; min-width: 130px;
    border-top: 3px solid var(--stat-color, #6366f1);
  }
  .stat-label { font-size: 11px; font-weight: 700; letter-spacing: 1.2px; text-transform: uppercase; color: #9099b3; margin-bottom: 6px; }
  .stat-value { font-size: 26px; font-weight: 750; letter-spacing: -0.5px; color: #1a1d27; }

  /* ─── View Toggle ─────────────────────────────────── */
  .view-toggle { display: flex; gap: 2px; background: #eef0f7; padding: 4px; border-radius: 10px; }
  .vt-btn {
    padding: 7px 14px; border-radius: 7px; font-size: 13px; font-weight: 600;
    cursor: pointer; border: none; background: transparent; color: #7880a0;
    transition: all .15s; display: flex; align-items: center; gap: 6px;
  }
  .vt-btn.active { background: #fff; color: #1a1d27; box-shadow: 0 1px 6px rgba(0,0,0,.08); }

  /* ─── Filters ─────────────────────────────────────── */
  .filters-bar { display: flex; gap: 10px; margin-bottom: 20px; flex-wrap: wrap; align-items: center; }
  .search-wrap { position: relative; flex: 1; min-width: 220px; max-width: 360px; }
  .search-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #9099b3; pointer-events: none; }
  .search-input {
    width: 100%; background: #fff; border: 1.5px solid #eaecf3;
    border-radius: 10px; padding: 9px 12px 9px 38px;
    font-size: 13.5px; color: #1a1d27; outline: none; transition: border-color .18s;
    font-family: inherit;
  }
  .search-input::placeholder { color: #b0b8cc; }
  .search-input:focus { border-color: #6366f1; }
  .filter-select {
    background: #fff; border: 1.5px solid #eaecf3; border-radius: 10px;
    padding: 9px 14px; font-size: 13px; color: #4b5270; outline: none;
    cursor: pointer; font-family: inherit; transition: border-color .15s;
  }
  .filter-select:focus { border-color: #6366f1; }
  .date-input {
    background: #fff; border: 1.5px solid #eaecf3; border-radius: 10px;
    padding: 9px 12px; font-size: 13px; color: #4b5270; outline: none;
    cursor: pointer; font-family: inherit;
  }

  /* ─── Card Grid ───────────────────────────────────── */
  .card-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 16px; }

  /* ─── Meeting Card ────────────────────────────────── */
  .m-card {
    background: #fff; border: 1.5px solid #eaecf3; border-radius: 16px;
    padding: 20px; cursor: pointer; transition: all .18s;
    border-left: 4px solid var(--priority-color, #6366f1);
    position: relative; overflow: hidden;
  }
  .m-card:hover { border-color: #c0c6d9; border-left-color: var(--priority-color, #6366f1); transform: translateY(-2px); box-shadow: 0 8px 28px rgba(0,0,0,.08); }
  .card-top { display: flex; align-items: flex-start; justify-content: space-between; gap: 10px; margin-bottom: 12px; }
  .card-badges { display: flex; gap: 6px; flex-wrap: wrap; }
  .card-actions-row { display: flex; gap: 6px; opacity: 0; transition: opacity .15s; }
  .m-card:hover .card-actions-row { opacity: 1; }
  .card-title { font-size: 15px; font-weight: 700; color: #1a1d27; margin-bottom: 6px; line-height: 1.4; }
  .card-desc { font-size: 13px; color: #7880a0; line-height: 1.5; margin-bottom: 14px; }
  .card-meta { display: flex; flex-direction: column; gap: 6px; }
  .card-meta-row { display: flex; align-items: center; gap: 7px; font-size: 12.5px; color: #6b7494; }
  .card-meta-row svg { flex-shrink: 0; color: #9099b3; }
  .card-footer { display: flex; align-items: center; justify-content: space-between; margin-top: 14px; padding-top: 12px; border-top: 1px solid #f1f3f9; }
  .avatars { display: flex; }
  .avatar {
    width: 26px; height: 26px; border-radius: 50%;
    background: #eef0fb; border: 2px solid #fff;
    display: flex; align-items: center; justify-content: center;
    font-size: 10px; font-weight: 700; color: #6366f1; margin-left: -6px;
  }
  .avatar:first-child { margin-left: 0; }
  .avatar-more { background: #f0f2f8; color: #7880a0; font-size: 10px; }

  /* ─── Table view ──────────────────────────────────── */
  .tbl-wrap { background: #fff; border: 1.5px solid #eaecf3; border-radius: 16px; overflow: hidden; }
  .tbl { width: 100%; border-collapse: collapse; }
  .tbl thead tr { background: #f8f9fc; }
  .tbl th {
    padding: 13px 18px; text-align: left;
    font-size: 11px; font-weight: 700; letter-spacing: 1.2px;
    text-transform: uppercase; color: #9099b3; border-bottom: 1.5px solid #eaecf3;
    white-space: nowrap;
  }
  .tbl td { padding: 14px 18px; font-size: 13.5px; color: #2c3252; border-bottom: 1px solid #f1f3f9; vertical-align: middle; }
  .tbl tbody tr:last-child td { border-bottom: none; }
  .tbl tbody tr:hover td { background: #fafbff; cursor: pointer; }

  /* ─── Badges ──────────────────────────────────────── */
  .badge {
    display: inline-flex; align-items: center; gap: 4px;
    padding: 3px 9px; border-radius: 6px;
    font-size: 11px; font-weight: 700; letter-spacing: 0.3px; white-space: nowrap;
  }
  .badge-dot { width: 5px; height: 5px; border-radius: 50%; }

  /* Status */
  .s-scheduled  { background: #eff6ff; color: #3b82f6; }
  .s-ongoing    { background: #f0fdf4; color: #16a34a; }
  .s-completed  { background: #f8f9fc; color: #6b7494; }
  .s-cancelled  { background: #fee2e2; color: #ef4444; }
  .s-postponed  { background: #fff7ed; color: #d97706; }

  /* Priority */
  .p-low    { background: #f0fdf4; color: #16a34a; }
  .p-medium { background: #eff6ff; color: #3b82f6; }
  .p-high   { background: #fff7ed; color: #d97706; }
  .p-urgent { background: #fee2e2; color: #ef4444; }

  /* Type */
  .t-badge { background: #f5f3ff; color: #7c3aed; }

  /* ─── Empty ───────────────────────────────────────── */
  .empty { text-align: center; padding: 60px 20px; color: #9099b3; }
  .empty-icon { font-size: 44px; margin-bottom: 12px; opacity: .45; }
  .empty p { font-size: 15px; font-weight: 500; }
  .empty span { font-size: 13px; display: block; margin-top: 6px; color: #b0b8cc; }

  /* ─── Skeleton ────────────────────────────────────── */
  @keyframes sh { 0%,100%{opacity:.45} 50%{opacity:.8} }
  .sk { background: #f0f2f8; border-radius: 6px; animation: sh 1.4s infinite; }

  /* ─── Overlay / Drawer ────────────────────────────── */
  .overlay {
    position: fixed; inset: 0; z-index: 50;
    background: rgba(20,22,36,.45); backdrop-filter: blur(6px);
    display: flex; align-items: center; justify-content: center; padding: 20px;
  }
  .drawer-overlay {
    position: fixed; inset: 0; z-index: 50;
    background: rgba(20,22,36,.3); backdrop-filter: blur(4px);
    display: flex; align-items: stretch; justify-content: flex-end;
  }
  .modal {
    background: #fff; border-radius: 18px; width: 100%; max-width: 580px;
    box-shadow: 0 20px 60px rgba(0,0,0,.15);
    max-height: 90vh; overflow-y: auto;
    animation: slideUp .2s ease;
  }
  .drawer {
    background: #fff; width: 100%; max-width: 480px;
    box-shadow: -10px 0 50px rgba(0,0,0,.12);
    animation: slideRight .22s ease;
    overflow-y: auto;
  }
  @keyframes slideUp    { from{transform:translateY(12px);opacity:0} to{transform:none;opacity:1} }
  @keyframes slideRight { from{transform:translateX(20px);opacity:0} to{transform:none;opacity:1} }

  /* ─── Modal internals ─────────────────────────────── */
  .modal-head {
    display: flex; align-items: center; justify-content: space-between;
    padding: 22px 24px 0;
  }
  .modal-head-left { display: flex; align-items: center; gap: 12px; }
  .modal-head h2 { font-size: 17px; font-weight: 750; letter-spacing: -0.3px; }
  .modal-icon {
    width: 38px; height: 38px; border-radius: 11px;
    background: #eff0fe; display: flex; align-items: center; justify-content: center;
  }
  .close-btn {
    width: 30px; height: 30px; border-radius: 8px; border: 1.5px solid #eaecf3;
    background: transparent; color: #9099b3; cursor: pointer; font-size: 13px;
    display: flex; align-items: center; justify-content: center; transition: all .15s;
  }
  .close-btn:hover { background: #f5f6fa; }
  .modal-body { padding: 20px 24px 24px; }
  .form-section { margin-bottom: 20px; }
  .form-section-title {
    font-size: 11px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase;
    color: #9099b3; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 1px solid #f1f3f9;
  }
  .form-grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
  .form-grid1 { display: grid; grid-template-columns: 1fr; gap: 14px; }
  .fg { display: flex; flex-direction: column; gap: 6px; }
  .fg label { font-size: 12px; font-weight: 650; color: #6b7494; letter-spacing: 0.2px; }
  .fg input, .fg textarea, .fg select {
    background: #f8f9fc; border: 1.5px solid #eaecf3;
    border-radius: 9px; padding: 9px 12px;
    font-size: 13.5px; color: #1a1d27; outline: none; transition: border-color .15s;
    font-family: inherit; resize: none;
  }
  .fg input:focus, .fg textarea:focus, .fg select:focus { border-color: #6366f1; background: #fff; }
  .fg input::placeholder, .fg textarea::placeholder { color: #b8bfd4; }
  .modal-foot { display: flex; justify-content: flex-end; gap: 10px; padding-top: 8px; }

  /* Participant rows */
  .participant-list { display: flex; flex-direction: column; gap: 8px; margin-bottom: 10px; }
  .participant-row { display: flex; gap: 8px; align-items: center; }
  .participant-row input { flex: 1; }
  .add-participant-btn {
    display: flex; align-items: center; gap: 6px;
    font-size: 13px; font-weight: 600; color: #6366f1;
    background: #f5f3ff; border: 1.5px dashed #c4b5fd;
    border-radius: 9px; padding: 8px 14px; cursor: pointer;
    transition: all .15s; width: fit-content;
  }
  .add-participant-btn:hover { background: #ede9fe; }

  /* ─── Drawer internals ────────────────────────────── */
  .drawer-head {
    display: flex; align-items: center; justify-content: space-between;
    padding: 22px 24px; border-bottom: 1.5px solid #f1f3f9; position: sticky; top: 0;
    background: #fff; z-index: 1;
  }
  .drawer-head h2 { font-size: 16px; font-weight: 750; letter-spacing: -0.3px; max-width: 340px; }
  .drawer-body { padding: 22px 24px; display: flex; flex-direction: column; gap: 22px; }
  .detail-section-title {
    font-size: 11px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase;
    color: #9099b3; margin-bottom: 12px;
  }
  .detail-row { display: flex; align-items: flex-start; gap: 10px; margin-bottom: 10px; font-size: 13.5px; }
  .detail-row svg { flex-shrink: 0; margin-top: 2px; color: #9099b3; }
  .detail-label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #b0b8cc; margin-bottom: 4px; }
  .detail-value { font-size: 14px; color: #2c3252; font-weight: 500; }
  .notes-box { background: #f8f9fc; border: 1.5px solid #eaecf3; border-radius: 10px; padding: 14px; font-size: 13.5px; color: #4b5270; line-height: 1.6; }
  .participant-chip {
    display: flex; align-items: center; gap: 8px;
    padding: 8px 12px; background: #f8f9fc; border: 1px solid #eaecf3; border-radius: 10px;
    font-size: 13px;
  }
  .participant-avatar {
    width: 28px; height: 28px; border-radius: 50%; background: #eff0fe;
    display: flex; align-items: center; justify-content: center;
    font-size: 11px; font-weight: 700; color: #6366f1; flex-shrink: 0;
  }
  .participant-name { font-weight: 600; color: #1a1d27; }
  .participant-email { font-size: 12px; color: #9099b3; }
  .participants-grid { display: flex; flex-direction: column; gap: 8px; }
  .drawer-actions { display: flex; gap: 10px; padding: 16px 24px; border-top: 1.5px solid #f1f3f9; }

  /* ─── Error ───────────────────────────────────────── */
  .err-banner {
    background: #fee2e2; color: #b91c1c; border-radius: 9px;
    padding: 10px 14px; font-size: 13px; font-weight: 500; margin-bottom: 16px;
  }
  @keyframes spin { to{transform:rotate(360deg)} }
  .spin { width: 15px; height: 15px; border: 2.5px solid rgba(255,255,255,.35); border-top-color: #fff; border-radius: 50%; animation: spin .7s linear infinite; }

  /* ─── Toast ───────────────────────────────────────── */
  .toast {
    position: fixed; bottom: 26px; left: 50%; transform: translateX(-50%);
    background: #1a1d27; color: #fff; border-radius: 50px;
    padding: 11px 22px; font-size: 13.5px; font-weight: 500;
    box-shadow: 0 6px 30px rgba(0,0,0,.25); z-index: 200;
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