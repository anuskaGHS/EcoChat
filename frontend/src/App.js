import { useState, useEffect, useRef, useMemo } from 'react';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts';
import {
  Leaf, Send, Mic, Sun, Moon, MessageSquare, Search, Zap, Car, Plane,
  Utensils, Trash2, Droplet, ShoppingBag, ChevronRight, ChevronLeft, Copy, ThumbsUp,
  ThumbsDown, Menu, X, ArrowRight, Sparkles, TreePine, Check, RotateCcw, ArrowLeft,
  Bookmark, Share2, MapPin, Award, Trophy, List, Map as MapIcon, Star, Navigation,
  HelpCircle, BookOpen, Flame, Recycle, Bus, Bike, CheckCircle2, Circle, Heart,
  Lightbulb, Battery, Medal, Gift, Clock, Filter, Edit2, Keyboard
} from 'lucide-react';

/* ---------------------------------------------------------------- */
/* Design tokens — Deep Forest Green / Earth Brown / Leaf Green /    */
/* Warm Orange / Off White, per brief. Display face: Fraunces        */
/* (organic, low-contrast serif — reads like something carved from   */
/* wood grain). Body: Inter. Data face: IBM Plex Mono.                */
/* ---------------------------------------------------------------- */

const C = {
  forest: '#1B5E20',
  forestDark: '#123F16',
  brown: '#8D6E63',
  leaf: '#4CAF50',
  orange: '#C7714D',
  off: '#F4F1EA',
  ink: '#172417',
  inkSoft: '#56624F',
  line: '#E2DDD0',
};

const API_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:5000';

const css = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600;700;800&family=IBM+Plex+Mono:wght@500;600&display=swap');

.eco-root{
  --forest:${C.forest}; --forestDark:${C.forestDark}; --brown:${C.brown}; --leaf:${C.leaf};
  --orange:${C.orange}; --off:${C.off}; --ink:${C.ink}; --inkSoft:${C.inkSoft}; --line:${C.line};
  font-family:'Inter',sans-serif; color:var(--ink); background:var(--off);
  min-height:100vh; position:relative; overflow-y:auto;
}
.eco-root *{ box-sizing:border-box; }
.eco-display{ font-family:'Fraunces',serif; }
.eco-mono{ font-family:'IBM Plex Mono',monospace; letter-spacing:0.01em; }

/* ---------- nav ---------- */
.eco-nav{
  position:sticky; top:0; z-index:40; display:flex; align-items:center; justify-content:space-between;
  padding:16px 28px; background:rgba(244,241,234,0.86); backdrop-filter:blur(10px);
  border-bottom:1px solid var(--line);
}
.eco-logo{ display:flex; align-items:center; gap:9px; font-family:'Fraunces',serif; font-weight:600; font-size:20px; color:var(--forest); cursor:pointer; }
.eco-logo .badge{ width:30px; height:30px; border-radius:9px; background:var(--forest); display:flex; align-items:center; justify-content:center; }
.eco-navlinks{ display:flex; align-items:center; gap:3px; overflow-x:auto; scrollbar-width:none; max-width:64vw; }
.eco-navlinks::-webkit-scrollbar{ display:none; }
.eco-navlink{
  font-size:13.5px; font-weight:600; padding:9px 13px; border-radius:999px; cursor:pointer;
  color:var(--inkSoft); transition:all .25s ease; border:none; background:transparent; white-space:nowrap; flex-shrink:0;
}
.eco-navlink:hover{ color:var(--forest); background:#fff; }
.eco-navlink.active{ color:#fff; background:var(--forest); }
.eco-navmenu-btn{ display:none; }

/* ---------- buttons ---------- */
.eco-btn{
  display:inline-flex; align-items:center; gap:8px; font-weight:700; font-size:14.5px;
  padding:13px 24px; border-radius:999px; border:none; cursor:pointer; transition:transform .2s ease, box-shadow .2s ease;
  font-family:'Inter',sans-serif;
}
.eco-btn:active{ transform:scale(0.97); }
.eco-btn-primary{ background:var(--forest); color:#fff; box-shadow:0 8px 20px -8px rgba(27,94,32,0.55); }
.eco-btn-primary:hover{ box-shadow:0 12px 26px -8px rgba(27,94,32,0.65); transform:translateY(-1px); }
.eco-btn-ghost{ background:#fff; color:var(--forest); border:1.5px solid var(--line); }
.eco-btn-ghost:hover{ border-color:var(--forest); }
.eco-btn-orange{ background:var(--orange); color:#fff; box-shadow:0 8px 20px -8px rgba(199,113,77,0.55); }

/* ---------- hero ---------- */
.eco-hero{ position:relative; padding:88px 28px 60px; max-width:1180px; margin:0 auto; overflow:hidden; }
.eco-hero-grid{ display:grid; grid-template-columns:1.05fr 0.95fr; gap:48px; align-items:center; }
.eco-eyebrow{
  display:inline-flex; align-items:center; gap:7px; font-size:12.5px; font-weight:700; text-transform:uppercase;
  letter-spacing:0.09em; color:var(--forest); background:#E6EFE2; padding:7px 14px; border-radius:999px; margin-bottom:20px;
}
.eco-hero h1{ font-size:54px; line-height:1.04; font-weight:600; letter-spacing:-0.01em; margin:0 0 20px; color:var(--ink); }
.eco-hero h1 em{ font-style:italic; color:var(--forest); }
.eco-hero p.sub{ font-size:17.5px; line-height:1.6; color:var(--inkSoft); max-width:480px; margin:0 0 30px; }
.eco-hero-ctas{ display:flex; gap:12px; flex-wrap:wrap; }

.eco-wreath-wrap{ position:relative; display:flex; align-items:center; justify-content:center; }
.eco-orbit-card{
  position:absolute; background:#fff; border-radius:18px; padding:13px 16px; box-shadow:0 14px 34px -14px rgba(23,36,23,0.28);
  display:flex; align-items:center; gap:10px; border:1px solid var(--line);
  animation:float 5s ease-in-out infinite;
}
@keyframes float{ 0%,100%{ transform:translateY(0);} 50%{ transform:translateY(-9px);} }
.eco-orbit-card .num{ font-family:'IBM Plex Mono',monospace; font-weight:600; font-size:15px; color:var(--forest); }
.eco-orbit-card .lbl{ font-size:11.5px; color:var(--inkSoft); }
.eco-orbit-icon{ width:34px; height:34px; border-radius:10px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }

/* ---------- sections ---------- */
.eco-section{ max-width:1180px; margin:0 auto; padding:64px 28px; }
.eco-section-head{ max-width:560px; margin:0 0 40px; }
.eco-kicker{ font-size:12.5px; font-weight:700; text-transform:uppercase; letter-spacing:0.1em; color:var(--orange); margin-bottom:10px; }
.eco-section-head h2{ font-size:34px; font-weight:600; margin:0 0 12px; color:var(--ink); }
.eco-section-head p{ color:var(--inkSoft); font-size:15.5px; line-height:1.6; margin:0; }

.eco-feature-grid{ display:grid; grid-template-columns:repeat(3,1fr); gap:20px; }
.eco-toolkit-grid{ grid-template-columns:repeat(4,1fr) !important; }
.eco-feature-card{
  background:#fff; border:1px solid var(--line); border-radius:20px; padding:26px; transition:transform .25s ease, box-shadow .25s ease;
}
.eco-feature-card:hover{ transform:translateY(-4px); box-shadow:0 18px 34px -18px rgba(23,36,23,0.25); }
.eco-feature-icon{ width:44px; height:44px; border-radius:12px; display:flex; align-items:center; justify-content:center; margin-bottom:16px; }
.eco-feature-card h3{ font-size:17px; font-weight:700; margin:0 0 8px; color:var(--ink); }
.eco-feature-card p{ font-size:14px; color:var(--inkSoft); line-height:1.55; margin:0; }

.eco-stats-band{ background:var(--forest); border-radius:28px; padding:48px 36px; display:grid; grid-template-columns:repeat(4,1fr); gap:24px; }
.eco-stat .n{ font-family:'Fraunces',serif; font-size:38px; color:#fff; font-weight:600; }
.eco-stat .l{ font-size:13px; color:#C9DCC8; margin-top:4px; }

.eco-testimonials{ display:grid; grid-template-columns:repeat(3,1fr); gap:20px; }
.eco-tcard{ background:#fff; border:1px solid var(--line); border-radius:20px; padding:24px; }
.eco-tcard p{ font-size:14.5px; color:var(--ink); line-height:1.6; margin:0 0 16px; }
.eco-tperson{ display:flex; align-items:center; gap:10px; }
.eco-avatar{ width:36px; height:36px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-weight:700; color:#fff; font-size:13px; }
.eco-tname{ font-weight:700; font-size:13.5px; }
.eco-trole{ font-size:12px; color:var(--inkSoft); }

.eco-footer{ background:var(--forestDark); color:#cfe0cd; padding:48px 28px 26px; margin-top:40px; }
.eco-footer-inner{ max-width:1180px; margin:0 auto; display:flex; justify-content:space-between; flex-wrap:wrap; gap:30px; }
.eco-footer-bottom{ max-width:1180px; margin:34px auto 0; padding-top:20px; border-top:1px solid rgba(255,255,255,0.12); font-size:12.5px; color:#9CB698; }

/* ---------- chat page ---------- */
.eco-chat-shell{ display:grid; grid-template-columns:272px 1fr; height:calc(100vh - 65px); }
.eco-chat-sidebar{ background:#fff; border-right:1px solid var(--line); display:flex; flex-direction:column; padding:18px; overflow:hidden; }
.eco-history-list{ flex:1; overflow-y:auto; padding-right:4px; margin-right:-4px; }
.eco-search{ display:flex; align-items:center; gap:8px; background:var(--off); border-radius:11px; padding:10px 13px; margin-bottom:16px; }
.eco-search input{ border:none; background:transparent; outline:none; font-size:13.5px; width:100%; color:var(--ink); }
.eco-newchat{ display:flex; align-items:center; justify-content:center; gap:7px; background:var(--forest); color:#fff; border:none; border-radius:11px; padding:11px; font-weight:700; font-size:13.5px; cursor:pointer; margin-bottom:18px; }
.eco-history-label{ font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.08em; color:var(--inkSoft); margin:6px 0 8px; }
.eco-history-item{ padding:10px 11px; border-radius:10px; font-size:13.5px; color:var(--ink); cursor:pointer; margin-bottom:3px; display:flex; align-items:center; gap:8px; position:relative; padding-right:54px; }
.eco-history-item:hover{ background:var(--off); }
.eco-history-item.active{ background:#E6EFE2; color:var(--forest); font-weight:600; }
.eco-history-item .actions{ position:absolute; right:8px; display:none; gap:4px; align-items:center; }
.eco-history-item:hover .actions{ display:flex; }
.eco-history-item .actions button{ background:transparent; border:none; color:var(--inkSoft); cursor:pointer; padding:2px; display:flex; align-items:center; justify-content:center; border-radius:4px; transition:all .15s ease; }
.eco-history-item .actions button:hover{ color:var(--forest); background:rgba(0,0,0,0.06); }
.eco-history-rename-input{ border:1.5px solid var(--forest); border-radius:6px; font-size:12.5px; padding:2px 6px; width:100%; outline:none; background:#fff; color:var(--ink); }

.eco-chat-main{ display:flex; flex-direction:column; background:var(--off); position:relative; }
.eco-chat-topbar{ display:flex; align-items:center; justify-content:space-between; padding:14px 24px; border-bottom:1px solid var(--line); background:#fff; }
.eco-toggle{ width:46px; height:26px; border-radius:999px; background:var(--off); border:1.5px solid var(--line); position:relative; cursor:pointer; }
.eco-toggle .dot{ position:absolute; top:2px; left:2px; width:19px; height:19px; border-radius:50%; background:var(--forest); transition:transform .25s ease; display:flex; align-items:center; justify-content:center; }
.eco-toggle.on .dot{ transform:translateX(20px); background:var(--ink); }

.eco-messages{ flex:1; overflow-y:auto; padding:26px 8%; display:flex; flex-direction:column; gap:18px; }
.eco-msg-row{ display:flex; gap:11px; max-width:720px; }
.eco-msg-row.user{ align-self:flex-end; flex-direction:row-reverse; }
.eco-msg-avatar{ width:32px; height:32px; border-radius:9px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
.eco-bubble{ padding:13px 16px; border-radius:16px; font-size:14.5px; line-height:1.6; white-space: pre-wrap; }
.eco-bubble.ai{ background:#fff; border:1px solid var(--line); border-top-left-radius:4px; }
.eco-bubble.user{ background:var(--forest); color:#fff; border-top-right-radius:4px; }
.eco-msg-actions{ display:flex; gap:6px; margin-top:8px; }
.eco-msg-actions button{ background:#fff; border:1px solid var(--line); border-radius:8px; padding:5px 7px; cursor:pointer; color:var(--inkSoft); display:flex; }
.eco-msg-actions button:hover{ color:var(--forest); border-color:var(--forest); }
.eco-sources{ margin-top:9px; display:flex; gap:7px; flex-wrap:wrap; }
.eco-source-chip{ font-size:11.5px; background:var(--off); border:1px solid var(--line); border-radius:999px; padding:4px 10px; color:var(--inkSoft); }

.eco-typing{ display:flex; gap:4px; padding:13px 16px; background:#fff; border:1px solid var(--line); border-radius:16px; border-top-left-radius:4px; width:fit-content; }
.eco-typing span{ width:6px; height:6px; border-radius:50%; background:var(--brown); animation:bounce 1.2s infinite ease-in-out; }
.eco-typing span:nth-child(2){ animation-delay:.15s; } .eco-typing span:nth-child(3){ animation-delay:.3s; }
@keyframes bounce{ 0%,60%,100%{ transform:translateY(0); opacity:.5;} 30%{ transform:translateY(-4px); opacity:1;} }

.eco-chips{ display:flex; gap:9px; flex-wrap:wrap; padding:0 8% 16px; }
.eco-chip{ background:#fff; border:1px solid var(--line); border-radius:999px; padding:9px 15px; font-size:13px; font-weight:600; color:var(--forest); cursor:pointer; transition:all .2s ease; }
.eco-chip:hover{ background:var(--forest); color:#fff; border-color:var(--forest); }

.eco-composer{ padding:16px 8% 22px; background:var(--off); }
.eco-composer-inner{ display:flex; align-items:flex-end; gap:8px; background:#fff; border:1.5px solid var(--line); border-radius:18px; padding:9px 9px 9px 16px; }
.eco-composer-inner textarea{ flex:1; border:none; outline:none; resize:none; font-size:14.5px; font-family:'Inter',sans-serif; max-height:120px; padding:8px 0; background:transparent; color:var(--ink); }
.eco-icon-btn{ width:36px; height:36px; border-radius:11px; border:none; background:transparent; color:var(--inkSoft); display:flex; align-items:center; justify-content:center; cursor:pointer; flex-shrink:0; }
.eco-icon-btn:hover{ background:var(--off); color:var(--forest); }
.eco-send-btn{ width:36px; height:36px; border-radius:11px; border:none; background:var(--forest); color:#fff; display:flex; align-items:center; justify-content:center; cursor:pointer; flex-shrink:0; }
.eco-send-btn:disabled{ opacity:0.4; cursor:not-allowed; }
.eco-mic.recording{ background:#FDEDE7; color:var(--orange); animation:pulseMic 1.2s infinite; }
@keyframes pulseMic{ 0%,100%{ box-shadow:0 0 0 0 rgba(199,113,77,0.35);} 50%{ box-shadow:0 0 0 7px rgba(199,113,77,0);} }

/* dark mode (chat only) */
.eco-chat-shell.dark{ background:#15201A; }
.eco-chat-shell.dark .eco-chat-sidebar{ background:#1A2620; border-color:#27362C; }
.eco-chat-shell.dark .eco-chat-main{ background:#15201A; }
.eco-chat-shell.dark .eco-chat-topbar{ background:#1A2620; border-color:#27362C; }
.eco-chat-shell.dark .eco-bubble.ai{ background:#1F2D25; border-color:#2C3D32; color:#E7EEE5; }
.eco-chat-shell.dark .eco-composer{ background:#15201A; }
.eco-chat-shell.dark .eco-composer-inner{ background:#1F2D25; border-color:#2C3D32; }
.eco-chat-shell.dark .eco-composer-inner textarea{ color:#E7EEE5; }
.eco-chat-shell.dark .eco-chip{ background:#1F2D25; border-color:#2C3D32; color:#9FD49A; }
.eco-chat-shell.dark .eco-history-item{ color:#D7E2D3; }
.eco-chat-shell.dark .eco-history-item:hover{ background:#22302793; }
.eco-chat-shell.dark .eco-history-item.active{ background:#27392C; color:#9FD49A; }
.eco-chat-shell.dark .eco-history-item .actions button{ color:#A9C0A5; }
.eco-chat-shell.dark .eco-history-item .actions button:hover{ color:#9FD49A; background:#ffffff0e; }
.eco-chat-shell.dark .eco-history-rename-input{ background:#1F2D25; border-color:#2C3D32; color:#E7EEE5; }
.eco-chat-shell.dark .eco-search{ background:#1F2D25; }
.eco-chat-shell.dark .eco-search input{ color:#E7EEE5; }
.eco-chat-shell.dark .eco-source-chip{ background:#1F2D25; border-color:#2C3D32; color:#A9C0A5; }
.eco-chat-shell.dark .eco-msg-actions button{ background:#1F2D25; border-color:#2C3D32; color:#A9C0A5; }
.eco-chat-shell.dark .eco-typing{ background:#1F2D25; border-color:#2C3D32; }

/* ---------- calculator ---------- */
.eco-calc-wrap{ max-width:980px; margin:0 auto; padding:44px 28px 80px; overflow-y:auto; }
.eco-calc-steps{ display:flex; align-items:center; gap:6px; margin-bottom:36px; }
.eco-step-dot{ flex:1; height:5px; border-radius:999px; background:var(--line); position:relative; overflow:hidden; }
.eco-step-dot .fill{ position:absolute; inset:0; background:var(--forest); transform-origin:left; transition:transform .4s ease; }
.eco-calc-card{ background:#fff; border:1px solid var(--line); border-radius:24px; padding:40px; }
.eco-calc-card h2{ font-family:'Fraunces',serif; font-size:27px; font-weight:600; margin:0 0 6px; }
.eco-calc-card .hint{ color:var(--inkSoft); font-size:14px; margin:0 0 28px; }
.eco-field{ margin-bottom:24px; }
.eco-field label{ display:flex; justify-content:space-between; font-size:14px; font-weight:600; margin-bottom:10px; color:var(--ink); }
.eco-field label .val{ font-family:'IBM Plex Mono',monospace; color:var(--forest); font-weight:600; }
.eco-slider{ width:100%; -webkit-appearance:none; height:6px; border-radius:999px; background:var(--line); outline:none; }
.eco-slider::-webkit-slider-thumb{ -webkit-appearance:none; width:20px; height:20px; border-radius:50%; background:var(--forest); cursor:pointer; border:3px solid #fff; box-shadow:0 2px 8px rgba(0,0,0,0.25); }
.eco-pillrow{ display:flex; gap:9px; flex-wrap:wrap; }
.eco-pill{ padding:10px 17px; border-radius:999px; border:1.5px solid var(--line); background:#fff; font-size:13.5px; font-weight:600; cursor:pointer; color:var(--ink); }
.eco-pill.sel{ background:var(--forest); border-color:var(--forest); color:#fff; }
.eco-calc-nav{ display:flex; justify-content:space-between; margin-top:32px; }

.eco-results-grid{ display:grid; grid-template-columns:1fr 1fr; gap:20px; margin-bottom:24px; }
.eco-result-card{ background:#fff; border:1px solid var(--line); border-radius:20px; padding:24px; }
.eco-result-card h4{ font-size:12.5px; text-transform:uppercase; letter-spacing:0.07em; color:var(--inkSoft); font-weight:700; margin:0 0 6px; }
.eco-result-big{ font-family:'Fraunces',serif; font-size:30px; font-weight:600; color:var(--ink); }
.eco-compare-row{ display:flex; align-items:center; gap:10px; font-size:13px; margin-top:8px; }
.eco-compare-bar{ flex:1; height:8px; border-radius:999px; background:var(--line); overflow:hidden; }
.eco-compare-bar .fill{ height:100%; border-radius:999px; }
.eco-breakdown-row{ display:flex; align-items:center; gap:12px; padding:11px 0; border-bottom:1px solid var(--line); }
.eco-breakdown-row:last-child{ border-bottom:none; }
.eco-bicon{ width:34px; height:34px; border-radius:10px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
.eco-rec-card{ background:#fff; border:1px solid var(--line); border-radius:18px; padding:20px; display:flex; gap:14px; }
.eco-rec-icon{ width:42px; height:42px; border-radius:12px; background:#E6EFE2; color:var(--forest); display:flex; align-items:center; justify-content:center; flex-shrink:0; }
.eco-tag{ font-size:11px; font-weight:700; padding:3px 9px; border-radius:999px; }

/* ---------- shared inner page header ---------- */
.eco-page{ max-width:1180px; margin:0 auto; padding:40px 28px 80px; overflow-y:auto; }
.eco-page-head{ display:flex; align-items:flex-end; justify-content:space-between; gap:20px; flex-wrap:wrap; margin-bottom:30px; }
.eco-page-head h1{ font-family:'Fraunces',serif; font-size:32px; font-weight:600; margin:0 0 6px; }
.eco-page-head p{ color:var(--inkSoft); font-size:14.5px; margin:0; max-width:480px; }
.eco-filterrow{ display:flex; gap:9px; flex-wrap:wrap; margin-bottom:28px; }
.eco-filter{ padding:9px 16px; border-radius:999px; border:1.5px solid var(--line); background:#fff; font-size:13.5px; font-weight:600; color:var(--inkSoft); cursor:pointer; display:flex; align-items:center; gap:6px; transition:all .2s ease; }
.eco-filter.sel{ background:var(--ink); border-color:var(--ink); color:#fff; }
.eco-filter.sel.green{ background:var(--forest); border-color:var(--forest); }

/* ---------- stat header strip (tracker / challenges) ---------- */
.eco-statstrip{ display:grid; grid-template-columns:repeat(4,1fr); gap:16px; margin-bottom:30px; }
.eco-statpill{ background:#fff; border:1px solid var(--line); border-radius:18px; padding:18px 20px; display:flex; align-items:center; gap:12px; }
.eco-statpill .ic{ width:40px; height:40px; border-radius:11px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
.eco-statpill .v{ font-family:'IBM Plex Mono',monospace; font-size:19px; font-weight:600; color:var(--ink); }
.eco-statpill .l{ font-size:11.5px; color:var(--inkSoft); }

/* ---------- eco tips ---------- */
.eco-tip-grid{ display:grid; grid-template-columns:repeat(3,1fr); gap:18px; }
.eco-tip-card{ background:#fff; border:1px solid var(--line); border-radius:20px; padding:22px; display:flex; flex-direction:column; gap:12px; transition:transform .2s ease, box-shadow .2s ease; }
.eco-tip-card:hover{ transform:translateY(-3px); box-shadow:0 16px 30px -18px rgba(23,36,23,0.22); }
.eco-tip-top{ display:flex; justify-content:space-between; align-items:flex-start; }
.eco-tip-icon{ width:42px; height:42px; border-radius:12px; background:#E6EFE2; color:var(--forest); display:flex; align-items:center; justify-content:center; }
.eco-tip-card h3{ font-size:15.5px; font-weight:700; margin:0; color:var(--ink); }
.eco-tip-meta{ display:flex; gap:7px; flex-wrap:wrap; }
.eco-tip-foot{ display:flex; align-items:center; justify-content:space-between; margin-top:auto; padding-top:8px; border-top:1px solid var(--line); }
.eco-co2save{ font-family:'IBM Plex Mono',monospace; font-size:12.5px; color:var(--forest); font-weight:600; }
.eco-iconbtn-row{ display:flex; gap:6px; }
.eco-iconbtn-sm{ width:32px; height:32px; border-radius:9px; border:1px solid var(--line); background:#fff; display:flex; align-items:center; justify-content:center; cursor:pointer; color:var(--inkSoft); }
.eco-iconbtn-sm:hover{ border-color:var(--forest); color:var(--forest); }
.eco-iconbtn-sm.saved{ background:#FDEDE7; border-color:var(--orange); color:var(--orange); }

/* ---------- habit tracker ---------- */
.eco-habit-grid{ display:grid; grid-template-columns:repeat(2,1fr); gap:16px; }
.eco-habit-card{ background:#fff; border:1px solid var(--line); border-radius:20px; padding:20px; display:flex; gap:16px; align-items:center; }
.eco-habit-check{ width:30px; height:30px; border-radius:9px; border:2px solid var(--line); display:flex; align-items:center; justify-content:center; cursor:pointer; flex-shrink:0; transition:all .2s ease; }
.eco-habit-check.done{ background:var(--forest); border-color:var(--forest); }
.eco-habit-body{ flex:1; }
.eco-habit-body h4{ margin:0 0 4px; font-size:14.5px; font-weight:700; }
.eco-habit-sub{ font-size:12px; color:var(--inkSoft); display:flex; gap:10px; align-items:center; }
.eco-habit-bar{ height:6px; border-radius:999px; background:var(--line); margin-top:8px; overflow:hidden; }
.eco-habit-bar .fill{ height:100%; border-radius:999px; background:var(--leaf); transition:width .4s ease; }
.eco-ring{ flex-shrink:0; }
.eco-streak-flame{ display:flex; align-items:center; gap:3px; color:var(--orange); font-weight:700; font-size:12.5px; }

/* ---------- learning hub ---------- */
.eco-article-row{ display:grid; grid-template-columns:repeat(4,1fr); gap:16px; margin-bottom:36px; }
.eco-article-card{ background:#fff; border:1px solid var(--line); border-radius:18px; overflow:hidden; cursor:pointer; transition:transform .2s ease; display:flex; flex-direction:column; height:100%; }
.eco-article-card:hover{ transform:translateY(-3px); }
.eco-article-img{ height:110px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
.eco-article-body{ padding:14px; flex:1; display:flex; flex-direction:column; justify-content:space-between; }
.eco-article-body h4{ font-size:13.5px; font-weight:700; margin:0 0 7px; line-height:1.35; }
.eco-article-meta{ display:flex; justify-content:space-between; align-items:center; font-size:11.5px; color:var(--inkSoft); }
.eco-article-progress{ height:4px; background:var(--line); }
.eco-article-progress .fill{ height:100%; background:var(--leaf); }
.eco-dyk{ background:linear-gradient(135deg,var(--forest),#2C7A32); border-radius:22px; padding:30px; color:#fff; display:flex; gap:20px; align-items:center; margin-bottom:36px; }
.eco-quiz-card{ background:#fff; border:1px solid var(--line); border-radius:20px; padding:26px; margin-bottom:36px; }
.eco-quiz-opt{ display:block; width:100%; text-align:left; padding:13px 16px; border-radius:13px; border:1.5px solid var(--line); background:#fff; margin-bottom:9px; cursor:pointer; font-size:14px; font-weight:600; color:var(--ink); transition:all .2s ease; }
.eco-quiz-opt:hover{ border-color:var(--forest); }
.eco-quiz-opt.correct{ background:#E6EFE2; border-color:var(--forest); color:var(--forest); }
.eco-quiz-opt.wrong{ background:#FDEDE7; border-color:var(--orange); color:var(--orange); }

/* ---------- challenges ---------- */
.eco-challenge-grid{ display:grid; grid-template-columns:repeat(2,1fr); gap:18px; margin-bottom:40px; }
.eco-challenge-card{ background:#fff; border:1px solid var(--line); border-radius:20px; padding:22px; }
.eco-challenge-top{ display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:12px; }
.eco-challenge-card h4{ margin:0 0 4px; font-size:15.5px; font-weight:700; }
.eco-challenge-card .deadline{ font-size:12px; color:var(--inkSoft); display:flex; align-items:center; gap:5px; }
.eco-badge-icon{ width:44px; height:44px; border-radius:12px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
.eco-leaderboard{ background:#fff; border:1px solid var(--line); border-radius:20px; padding:8px; margin-bottom:36px; }
.eco-lb-row{ display:flex; align-items:center; gap:13px; padding:13px 14px; border-radius:13px; }
.eco-lb-row.me{ background:#E6EFE2; }
.eco-lb-rank{ width:26px; text-align:center; font-family:'IBM Plex Mono',monospace; font-weight:700; color:var(--inkSoft); }
.eco-achv-grid{ display:grid; grid-template-columns:repeat(5,1fr); gap:14px; }
.eco-achv{ background:#fff; border:1px solid var(--line); border-radius:16px; padding:16px 10px; text-align:center; }
.eco-achv.locked{ opacity:0.4; }
.eco-achv .ic{ width:46px; height:46px; border-radius:50%; margin:0 auto 9px; display:flex; align-items:center; justify-content:center; }

/* ---------- nearby resources ---------- */
.eco-nearby-search{ display:flex; gap:10px; margin-bottom:18px; flex-wrap:wrap; }
.eco-nearby-search .box{ flex:1; min-width:220px; display:flex; align-items:center; gap:9px; background:#fff; border:1.5px solid var(--line); border-radius:13px; padding:11px 15px; }
.eco-nearby-search .box input{ border:none; outline:none; flex:1; font-size:14px; background:transparent; }
.eco-toggle-pair{ display:flex; border:1.5px solid var(--line); border-radius:13px; overflow:hidden; }
.eco-toggle-pair button{ padding:11px 16px; border:none; background:#fff; cursor:pointer; color:var(--inkSoft); display:flex; align-items:center; gap:7px; font-size:13.5px; font-weight:600; }
.eco-toggle-pair button.on{ background:var(--forest); color:#fff; }
.eco-resource-list{ display:flex; flex-direction:column; gap:12px; }
.eco-resource-card{ background:#fff; border:1px solid var(--line); border-radius:18px; padding:18px 20px; display:flex; align-items:center; gap:16px; }
.eco-res-icon{ width:46px; height:46px; border-radius:13px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
.eco-res-meta{ display:flex; gap:14px; font-size:12.5px; color:var(--inkSoft); margin-top:4px; }
.eco-mapview{ background:#E7E2D3; border-radius:22px; height:420px; width:100%; position:relative; overflow:hidden; border:1px solid var(--line); }
.eco-mapview .grid-lines{ position:absolute; inset:0; background-image:linear-gradient(var(--line) 1px,transparent 1px),linear-gradient(90deg,var(--line) 1px,transparent 1px); background-size:38px 38px; opacity:0.5; }
.eco-mappin{ position:absolute; transform:translate(-50%,-100%); display:flex; flex-direction:column; align-items:center; cursor:pointer; }
.eco-mappin .head{ width:30px; height:30px; border-radius:50% 50% 50% 0; transform:rotate(-45deg); display:flex; align-items:center; justify-content:center; box-shadow:0 4px 10px rgba(0,0,0,0.25); }
.eco-mappin .head svg{ transform:rotate(45deg); }

@media (max-width:1020px){
  .eco-toolkit-grid{ grid-template-columns:repeat(2,1fr) !important; }
}
@media (max-width:880px){
  .eco-tip-grid, .eco-habit-grid, .eco-challenge-grid{ grid-template-columns:1fr; }
  .eco-toolkit-grid{ grid-template-columns:1fr !important; }
  .eco-article-row{ grid-template-columns:repeat(2,1fr); }
  .eco-statstrip{ grid-template-columns:repeat(2,1fr); }
  .eco-achv-grid{ grid-template-columns:repeat(3,1fr); }
  .eco-dyk{ flex-direction:column; text-align:center; }
  .eco-hero-grid{ grid-template-columns:1fr; }
  .eco-hero h1{ font-size:38px; }
  .eco-feature-grid, .eco-testimonials{ grid-template-columns:1fr; }
  .eco-stats-band{ grid-template-columns:repeat(2,1fr); }
  .eco-navlinks{ display:none; }
  .eco-navmenu-btn{ display:flex; }
  .eco-chat-shell{ grid-template-columns:1fr; }
  .eco-chat-sidebar{ display:none; }
  .eco-results-grid{ grid-template-columns:1fr; }
  .eco-calc-card{ padding:24px; }
  .eco-wreath-wrap{ margin-top:30px; }
}

/* ---------- auth modal ---------- */
.eco-modal-overlay{
  position:fixed; inset:0; background:rgba(23,36,23,0.4); backdrop-filter:blur(5px);
  display:flex; align-items:center; justify-content:center; z-index:100;
}
.eco-modal-card{
  background:#fff; border:1px solid var(--line); border-radius:24px; padding:32px;
  width:90%; max-width:400px; position:relative; box-shadow:0 20px 48px -12px rgba(23,36,23,0.3);
  animation: modalFadeIn 0.3s ease-out;
}
@keyframes modalFadeIn {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}
.eco-modal-card .close-btn{
  position:absolute; top:20px; right:20px; border:none; background:transparent; cursor:pointer; color:var(--inkSoft);
}
.eco-modal-card h2{ font-size:24px; margin:0 0 8px; color:var(--forest); }
.eco-modal-card .field{ display:flex; flex-direction:column; gap:6px; margin-bottom:12px; }
.eco-modal-card .field label{ font-size:12.5px; font-weight:600; color:var(--inkSoft); }
.eco-modal-card .field input{
  padding:11px 14px; border:1.5px solid var(--line); border-radius:10px; outline:none; font-size:14px; transition:border-color .2s;
  background:#fff; color:var(--ink);
}
.eco-modal-card .field input:focus{ border-color:var(--forest); }
.eco-error-banner{
  background:#FDEDE7; border:1px solid var(--orange); color:var(--orange); padding:10px 14px; border-radius:10px; font-size:13px; margin-bottom:16px;
}
.eco-text-btn{ background:transparent; border:none; color:var(--forest); font-weight:700; cursor:pointer; padding:0; text-decoration:underline; font-size:13.5px; }
.eco-text-btn:hover{ color:var(--forestDark); }
`;

/* ---------------------------------------------------------------- */
/* Signature element: a "leaf wreath" radial gauge — leaves arranged */
/* in a ring fill in sequence instead of a generic progress arc.     */
/* ---------------------------------------------------------------- */
function LeafWreath({ percent = 60, size = 220, leafCount = 28, color = C.leaf, label, sublabel, trackColor = '#E2DDD0' }) {
  const radius = size / 2 - 22;
  const center = size / 2;
  const filledCount = Math.round((percent / 100) * leafCount);
  const leaves = Array.from({ length: leafCount }).map((_, i) => {
    const angle = (i / leafCount) * Math.PI * 2 - Math.PI / 2;
    const x = center + radius * Math.cos(angle);
    const y = center + radius * Math.sin(angle);
    const rotDeg = (angle * 180) / Math.PI + 90;
    const filled = i < filledCount;
    return (
      <g key={i} transform={`translate(${x},${y}) rotate(${rotDeg})`} style={{ transition: 'opacity .4s ease' }}>
        <path
          d="M0,-7.5 C3.6,-3.6 3.6,3.6 0,7.5 C-3.6,3.6 -3.6,-3.6 0,-7.5 Z"
          fill={filled ? color : trackColor}
          opacity={filled ? 1 : 0.7}
        />
        <line x1="0" y1="-6" x2="0" y2="6" stroke={filled ? 'rgba(255,255,255,0.4)' : 'transparent'} strokeWidth="0.6" />
      </g>
    );
  });
  return (
    <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size}>
      {leaves}
      <text x={center} y={center - 4} textAnchor="middle" fontFamily="Fraunces, serif" fontSize="30" fontWeight="600" fill={C.ink}>
        {label}
      </text>
      <text x={center} y={center + 20} textAnchor="middle" fontFamily="Inter, sans-serif" fontSize="12.5" fill={C.inkSoft}>
        {sublabel}
      </text>
    </svg>
  );
}

/* ---------------------------------------------------------------- */
/* Nav                                                                */
/* ---------------------------------------------------------------- */
/* ---------------------------------------------------------------- */
/* Small ring progress — used for individual habit cards, kept       */
/* visually related to the wreath (same forest/leaf palette) but     */
/* lighter-weight for dense grids.                                   */
/* ---------------------------------------------------------------- */
function RingProgress({ percent = 50, size = 56, stroke = 6, color = C.leaf }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (percent / 100) * c;
  return (
    <svg width={size} height={size} className="eco-ring">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={C.line} strokeWidth={stroke} />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={c} strokeDashoffset={offset} strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: 'stroke-dashoffset .5s ease' }}
      />
      <text x="50%" y="52%" textAnchor="middle" dominantBaseline="middle" fontFamily="IBM Plex Mono, monospace" fontSize={size * 0.24} fontWeight="600" fill={C.ink}>
        {Math.round(percent)}%
      </text>
    </svg>
  );
}

function Nav({ page, setPage, user, onLoginClick, onLogout }) {
  const [open, setOpen] = useState(false);
  const links = [
    { id: 'landing', label: 'Home' },
    { id: 'chat', label: 'AI Assistant' },
    { id: 'calculator', label: 'Calculator' },
    { id: 'tips', label: 'Eco Tips' },
    { id: 'tracker', label: 'Habit Tracker' },
    { id: 'learn', label: 'Learning Hub' },
    { id: 'challenges', label: 'Challenges' },
    { id: 'nearby', label: 'Nearby' },
  ];
  return (
    <nav className="eco-nav">
      <div className="eco-logo" onClick={() => setPage('landing')}>
        <img src="/logo.png" alt="EcoChat Logo" style={{ width: 32, height: 32, objectFit: 'contain' }} />
        EcoChat
      </div>
      <div className="eco-navlinks">
        {links.map((l) => (
          <button key={l.id} className={`eco-navlink ${page === l.id ? 'active' : ''}`} onClick={() => setPage(l.id)}>
            {l.label}
          </button>
        ))}
        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginLeft: 16 }}>
            <span style={{ fontSize: 13.5, fontWeight: 600, color: C.forest }}>👤 {user.name}</span>
            <button className="eco-btn eco-btn-ghost" style={{ padding: '8px 16px', fontSize: 12.5 }} onClick={onLogout}>
              Logout
            </button>
          </div>
        ) : (
          <button className="eco-btn eco-btn-primary" style={{ padding: '8px 18px', fontSize: 12.5, marginLeft: 16 }} onClick={onLoginClick}>
            Sign In
          </button>
        )}
      </div>
      <button className="eco-icon-btn eco-navmenu-btn" onClick={() => setOpen(!open)}>
        {open ? <X size={20} /> : <Menu size={20} />}
      </button>
      {open && (
        <div style={{ position: 'absolute', top: 65, left: 0, right: 0, background: '#fff', borderBottom: `1px solid ${C.line}`, padding: 14, display: 'flex', flexDirection: 'column', gap: 6, zIndex: 50 }}>
          {links.map((l) => (
            <button key={l.id} className={`eco-navlink ${page === l.id ? 'active' : ''}`} onClick={() => { setPage(l.id); setOpen(false); }}>
              {l.label}
            </button>
          ))}
          {user ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '10px 14px', borderTop: `1px solid var(--line)`, marginTop: 6 }}>
              <span style={{ fontSize: 13.5, fontWeight: 600, color: C.forest }}>👤 {user.name}</span>
              <button className="eco-btn eco-btn-ghost" style={{ padding: '8px 16px', fontSize: 12.5, width: '100%', justifyContent: 'center' }} onClick={() => { onLogout(); setOpen(false); }}>
                Logout
              </button>
            </div>
          ) : (
            <button className="eco-btn eco-btn-primary" style={{ padding: '8px 18px', fontSize: 12.5, width: '100%', justifyContent: 'center', marginTop: 6 }} onClick={() => { onLoginClick(); setOpen(false); }}>
              Sign In
            </button>
          )}
        </div>
      )}
    </nav>
  );
}

/* ---------------------------------------------------------------- */
/* Landing page                                                      */
/* ---------------------------------------------------------------- */
function Landing({ setPage }) {
  const features = [
    { icon: <MessageSquare size={20} color="#fff" />, bg: C.forest, title: 'Ask anything, climate-first', desc: 'A conversational guide trained on emissions science, energy systems, and everyday habits — no jargon, just answers you can act on.' },
    { icon: <Zap size={20} color="#fff" />, bg: C.orange, title: 'Footprint, measured precisely', desc: 'Walk through energy, transport, diet, and waste to see your annual CO₂ output stacked against national and global averages.' },
    { icon: <TreePine size={20} color="#fff" />, bg: C.leaf, title: 'Habits that actually stick', desc: 'Personalized, ranked recommendations sized to your effort and impact — small wins first, big shifts when you are ready.' },
  ];
  const stats = [
    { n: '48K+', l: 'tonnes CO₂ tracked' },
    { n: '120+', l: 'cities covered' },
    { n: '9.4', l: 'avg. rating' },
    { n: '310K', l: 'eco actions logged' },
  ];
  const testimonials = [
    { name: 'Ananya R.', role: 'Chennai, IN', text: 'Cut my monthly electricity emissions by 18% just from the personalized tips — the wreath gauge makes progress weirdly satisfying.', color: C.forest },
    { name: 'Marcus T.', role: 'Austin, US', text: 'I finally understand my own carbon math instead of just feeling vaguely guilty about it. The breakdown cards are excellent.', color: C.orange },
    { name: 'Priya N.', role: 'Bengaluru, IN', text: 'Asked it about circular economy basics before a client pitch and it explained things faster than the three articles I had open.', color: C.leaf },
  ];
  return (
    <div>
      <section className="eco-hero">
        <div className="eco-hero-grid">
          <div>
            <span className="eco-eyebrow"><Sparkles size={13} /> SDG 13 · SDG 7 · SDG 12 · SDG 11 · SDG 17 · SDG 4</span>
            <h1 className="eco-display">
              Your personal AI <em>climate</em> companion
            </h1>
            <p className="sub">
              Understand your footprint, get answers grounded in real climate science, and build habits that
              compound — one conversation, one calculation, one small swap at a time.
            </p>
            <div className="eco-hero-ctas">
              <button className="eco-btn eco-btn-primary" onClick={() => setPage('chat')}>
                Start chat <ArrowRight size={16} />
              </button>
              <button className="eco-btn eco-btn-ghost" onClick={() => setPage('calculator')}>
                Calculate footprint
              </button>
            </div>
          </div>
          <div className="eco-wreath-wrap">
            <LeafWreath percent={64} label="64%" sublabel="below avg." />
            <div className="eco-orbit-card" style={{ top: -6, left: -16 }}>
              <span className="eco-orbit-icon" style={{ background: '#E6EFE2' }}><Leaf size={16} color={C.forest} /></span>
              <div><div className="num">2.1t</div><div className="lbl">CO₂ saved / yr</div></div>
            </div>
            <div className="eco-orbit-card" style={{ bottom: 4, right: -22, animationDelay: '1.4s' }}>
              <span className="eco-orbit-icon" style={{ background: '#FDEDE7' }}><Zap size={16} color={C.orange} /></span>
              <div><div className="num">312</div><div className="lbl">kWh saved</div></div>
            </div>
          </div>
        </div>
      </section>

      <section className="eco-section">
        <div className="eco-section-head">
          <div className="eco-kicker">What it does</div>
          <h2 className="eco-display">Three tools, one ongoing habit</h2>
          <p>Built around the loop that actually changes behavior: learn, measure, act.</p>
        </div>
        <div className="eco-feature-grid">
          {features.map((f, i) => (
            <div className="eco-feature-card" key={i}>
              <span className="eco-feature-icon" style={{ background: f.bg }}>{f.icon}</span>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="eco-section" style={{ paddingTop: 0 }}>
        <div className="eco-stats-band">
          {stats.map((s, i) => (
            <div className="eco-stat" key={i}>
              <div className="n eco-display">{s.n}</div>
              <div className="l">{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="eco-section">
        <div className="eco-section-head">
          <div className="eco-kicker">The full toolkit</div>
          <h2 className="eco-display">Everything you need, in one place</h2>
          <p>Seven tools that work together — ask, measure, act, track, learn, compete, and find help nearby.</p>
        </div>
        <div className="eco-feature-grid eco-toolkit-grid">
          {[
            { id: 'chat', icon: <MessageSquare size={18} color="#fff" />, bg: C.forest, title: 'AI Assistant', desc: 'Climate Q&A on demand' },
            { id: 'calculator', icon: <Zap size={18} color="#fff" />, bg: C.orange, title: 'Footprint Calculator', desc: 'Measure your emissions' },
            { id: 'tips', icon: <Lightbulb size={18} color="#fff" />, bg: C.leaf, title: 'Personalized Eco Tips', desc: 'Actions sized to your life' },
            { id: 'tracker', icon: <Flame size={18} color="#fff" />, bg: C.brown, title: 'Green Habit Tracker', desc: 'Streaks that compound' },
            { id: 'learn', icon: <BookOpen size={18} color="#fff" />, bg: '#7A8C6F', title: 'Climate Learning Hub', desc: 'Articles, facts, quizzes' },
            { id: 'challenges', icon: <Trophy size={18} color="#fff" />, bg: '#A88B5C', title: 'Eco Challenges', desc: 'Weekly badges & rewards' },
            { id: 'nearby', icon: <MapPin size={18} color="#fff" />, bg: C.forestDark, title: 'Nearby Resources', desc: 'Recycling, EV, transit' },
          ].map((f) => (
            <div className="eco-feature-card" key={f.id} style={{ cursor: 'pointer' }} onClick={() => setPage(f.id)}>
              <span className="eco-feature-icon" style={{ background: f.bg }}>{f.icon}</span>
              <h3 style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>{f.title} <ArrowRight size={14} color={C.inkSoft} /></h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="eco-section">
        <div className="eco-section-head">
          <div className="eco-kicker">From the community</div>
          <h2 className="eco-display">People are noticing the difference</h2>
        </div>
        <div className="eco-testimonials">
          {testimonials.map((t, i) => (
            <div className="eco-tcard" key={i}>
              <p>"{t.text}"</p>
              <div className="eco-tperson">
                <span className="eco-avatar" style={{ background: t.color }}>{t.name[0]}</span>
                <div>
                  <div className="eco-tname">{t.name}</div>
                  <div className="eco-trole">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <footer className="eco-footer">
        <div className="eco-footer-inner">
          <div style={{ maxWidth: 280 }}>
            <div className="eco-logo" style={{ color: '#fff', marginBottom: 12 }}>
              <img src="/logo.png" alt="EcoChat Logo" style={{ width: 32, height: 32, objectFit: 'contain' }} />
              EcoChat
            </div>
            <p style={{ fontSize: 13.5, lineHeight: 1.6, color: '#9CB698', margin: 0 }}>
              An AI climate companion for SDG 13 and SDG 7 — built to make sustainable action measurable and personal.
            </p>
          </div>
          <div>
            <div style={{ fontSize: 12.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14 }}>Product</div>
            {['AI Assistant', 'Footprint Calculator', 'Eco Tips', 'Habit Tracker'].map((x) => (
              <div key={x} style={{ fontSize: 13.5, color: '#B9CDB5', marginBottom: 9, cursor: 'pointer' }}>{x}</div>
            ))}
          </div>
          <div>
            <div style={{ fontSize: 12.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14 }}>Learn</div>
            {['Climate Basics', 'Renewable Energy', 'Circular Economy'].map((x) => (
              <div key={x} style={{ fontSize: 13.5, color: '#B9CDB5', marginBottom: 9, cursor: 'pointer' }}>{x}</div>
            ))}
          </div>
        </div>
        <div className="eco-footer-bottom">© 2026 EcoChat by Team Solace</div>
      </footer>
    </div>
  );
}

/* ---------------------------------------------------------------- */
/* Chat page                                                          */
/* ---------------------------------------------------------------- */
const QUICK_PROMPTS = [
  'How do I reduce electricity usage?',
  'What is Circular Economy?',
  'How can I reduce plastic waste?',
  'Benefits of solar panels',
];

function Chat({
  messages,
  input,
  setInput,
  typing,
  send,
  sessions,
  activeSessionId,
  setActiveSessionId,
  onNewChat,
  onRenameChat,
  onDeleteChat,
}) {
  const [dark, setDark] = useState(false);
  const [recording, setRecording] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const endRef = useRef(null);
  const recognitionRef = useRef(null);

  const toggleSpeechRecognition = () => {
    if (recording) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setRecording(false);
    } else {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const rec = new SpeechRecognition();
        rec.continuous = false;
        rec.interimResults = false;
        rec.lang = 'en-US';
        rec.onstart = () => {
          setRecording(true);
        };
        rec.onresult = (event) => {
          const transcript = event.results[0][0].transcript;
          setInput(transcript);
        };
        rec.onend = () => {
          setRecording(false);
        };
        rec.onerror = (err) => {
          console.error(err);
          setRecording(false);
        };
        rec.start();
        recognitionRef.current = rec;
      } else {
        alert("Speech recognition is not supported in this browser. Please try Google Chrome.");
      }
    }
  };

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  const handleRenameStart = (id, currentTitle, e) => {
    e.stopPropagation();
    setEditingId(id);
    setEditTitle(currentTitle);
  };

  const handleRenameSave = (id) => {
    if (editTitle.trim()) {
      onRenameChat(id, editTitle.trim());
    }
    setEditingId(null);
  };

  const handleDeleteClick = (id, e) => {
    e.stopPropagation();
    onDeleteChat(id);
  };

  return (
    <div className={`eco-chat-shell ${dark ? 'dark' : ''}`}>
      <aside className="eco-chat-sidebar">
        <div className="eco-search">
          <Search size={15} color={C.inkSoft} />
          <input placeholder="Search conversations" />
        </div>
        <button className="eco-newchat" onClick={onNewChat}>
          <span style={{ fontSize: 16 }}>+</span> New chat
        </button>
        <div className="eco-history-label">Recent</div>
        <div className="eco-history-list">
          {sessions.map((s) => (
            <div key={s.id} className={`eco-history-item ${activeSessionId === s.id ? 'active' : ''}`} onClick={() => setActiveSessionId(s.id)}>
              <MessageSquare size={14} style={{ flexShrink: 0 }} />
              {editingId === s.id ? (
                <input
                  className="eco-history-rename-input"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  onBlur={() => handleRenameSave(s.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleRenameSave(s.id);
                    if (e.key === 'Escape') setEditingId(null);
                  }}
                  onClick={(e) => e.stopPropagation()}
                  autoFocus
                />
              ) : (
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{s.title}</span>
              )}
              {editingId !== s.id && (
                <div className="actions">
                  <button title="Rename chat" onClick={(e) => handleRenameStart(s.id, s.title, e)}>
                    <Edit2 size={12} />
                  </button>
                  <button title="Delete chat" onClick={(e) => handleDeleteClick(s.id, e)}>
                    <Trash2 size={12} />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </aside>

      <main className="eco-chat-main">
        <div className="eco-chat-topbar">
          <div style={{ fontWeight: 700, fontSize: 15, display: 'flex', alignItems: 'center', gap: 8, color: dark ? '#E7EEE5' : C.ink }}>
            <Leaf size={16} color={C.leaf} /> EcoChat Assistant
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Sun size={15} color={dark ? '#5B6B5A' : C.orange} />
            <div className={`eco-toggle ${dark ? 'on' : ''}`} onClick={() => setDark(!dark)}>
              <div className="dot" />
            </div>
            <Moon size={15} color={dark ? '#9FD49A' : '#A9B3A6'} />
          </div>
        </div>

        <div className="eco-messages">
          {messages.map((m, i) => (
            <div key={i} className={`eco-msg-row ${m.role}`}>
              <span className="eco-msg-avatar" style={{ background: m.role === 'ai' ? C.forest : C.brown }}>
                {m.role === 'ai' ? <Leaf size={15} color="#fff" /> : <span style={{ color: '#fff', fontWeight: 700, fontSize: 12 }}>You</span>}
              </span>
              <div>
                <div className={`eco-bubble ${m.role}`}>{m.text}</div>
                {m.role === 'ai' && m.sources && m.sources.length > 0 && (
                  <div className="eco-sources">
                    {m.sources.map((s, j) => <span className="eco-source-chip" key={j}>{s}</span>)}
                  </div>
                )}
                {m.role === 'ai' && (
                  <div className="eco-msg-actions">
                    <button onClick={() => navigator.clipboard?.writeText(m.text)}><Copy size={13} /></button>
                    <button><ThumbsUp size={13} /></button>
                    <button><ThumbsDown size={13} /></button>
                  </div>
                )}
              </div>
            </div>
          ))}
          {typing && (
            <div className="eco-msg-row ai">
              <span className="eco-msg-avatar" style={{ background: C.forest }}><Leaf size={15} color="#fff" /></span>
              <div className="eco-typing"><span /><span /><span /></div>
            </div>
          )}
          <div ref={endRef} />
        </div>

        <div className="eco-chips">
          {QUICK_PROMPTS.map((q, i) => (
            <button className="eco-chip" key={i} onClick={() => send(q)}>{q}</button>
          ))}
        </div>

        <div className="eco-composer">
          <div className="eco-composer-inner">
            <button className="eco-icon-btn" title="Text Input Mode"><Keyboard size={17} /></button>
            <textarea
              rows={1}
              placeholder="Ask EcoChat anything about climate action..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
            />
            <button className={`eco-icon-btn eco-mic ${recording ? 'recording' : ''}`} onClick={toggleSpeechRecognition} title="Voice Typing Mode">
              <Mic size={17} />
            </button>
            <button className="eco-send-btn" disabled={!input.trim()} onClick={() => send()}>
              <Send size={16} />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

/* ---------------------------------------------------------------- */
/* Carbon footprint calculator                                       */
/* ---------------------------------------------------------------- */
const STEP_DEFS = [
  { key: 'electricity', title: 'Electricity usage', hint: 'Your average monthly electricity consumption.', icon: <Zap size={18} /> },
  { key: 'vehicle', title: 'Vehicle distance', hint: 'How far do you drive in a typical month?', icon: <Car size={18} /> },
  { key: 'flights', title: 'Flights', hint: 'Roughly how many flights do you take per year?', icon: <Plane size={18} /> },
  { key: 'diet', title: 'Diet', hint: 'Which best describes your typical diet?', icon: <Utensils size={18} /> },
  { key: 'waste', title: 'Waste generation', hint: 'How much household waste do you generate weekly?', icon: <Trash2 size={18} /> },
  { key: 'water', title: 'Water consumption', hint: 'Average daily water usage per person.', icon: <Droplet size={18} /> },
  { key: 'shopping', title: 'Shopping habits', hint: 'How often do you buy new (non-essential) goods?', icon: <ShoppingBag size={18} /> },
];

const DIET_OPTIONS = ['Meat-heavy', 'Balanced', 'Vegetarian', 'Vegan'];
const SHOP_OPTIONS = ['Rarely', 'Monthly', 'Weekly', 'Frequently'];

function Calculator({ step, setStep, done, setDone, data, setData }) {
  const totalSteps = STEP_DEFS.length;

  function update(key, val) { setData((d) => ({ ...d, [key]: val })); }

  const results = useMemo(() => {
    const dietFactor = { 'Meat-heavy': 1.4, Balanced: 1.0, Vegetarian: 0.72, Vegan: 0.55 }[data.diet] || 0;
    const shopFactor = { Rarely: 0.7, Monthly: 1.0, Weekly: 1.3, Frequently: 1.6 }[data.shopping] || 0;

    const electricityCO2 = data.electricity * 0.82 * 12; // kg/yr
    const vehicleCO2 = data.vehicle * 0.21 * 12;
    const flightsCO2 = data.flights * 250;
    const dietCO2 = 1650 * dietFactor;
    const wasteCO2 = data.waste * 1.9 * 52;
    const waterCO2 = data.water * 0.001 * 365 * 1000 * 0.0003;
    const shoppingCO2 = 600 * shopFactor;

    const total = electricityCO2 + vehicleCO2 + flightsCO2 + dietCO2 + wasteCO2 + waterCO2 + shoppingCO2;
    const totalTons = total / 1000;

    return {
      totalTons,
      monthlyTons: totalTons / 12,
      indiaAvg: 1.9,
      globalAvg: 4.7,
      target: 2.0,
      breakdown: [
        { label: 'Electricity', value: electricityCO2 / 1000, icon: <Zap size={16} color="#fff" />, color: C.orange },
        { label: 'Vehicle', value: vehicleCO2 / 1000, icon: <Car size={16} color="#fff" />, color: C.forest },
        { label: 'Flights', value: flightsCO2 / 1000, icon: <Plane size={16} color="#fff" />, color: C.brown },
        { label: 'Diet', value: dietCO2 / 1000, icon: <Utensils size={16} color="#fff" />, color: C.leaf },
        { label: 'Waste', value: wasteCO2 / 1000, icon: <Trash2 size={16} color="#fff" />, color: '#7A8C6F' },
        { label: 'Shopping', value: shoppingCO2 / 1000, icon: <ShoppingBag size={16} color="#fff" />, color: '#A88B5C' },
      ],
    };
  }, [data]);

  const pieData = results.breakdown.map((b) => ({ name: b.label, value: Number(b.value.toFixed(2)) }));
  const pieColors = results.breakdown.map((b) => b.color);
  const barData = [
    { name: 'You', val: Number(results.totalTons.toFixed(2)) },
    { name: 'India avg.', val: results.indiaAvg },
    { name: 'Global avg.', val: results.globalAvg },
    { name: 'Target', val: results.target },
  ];

  const recommendations = [];
  
  if (data.electricity > 150) {
    recommendations.push({ title: 'Set AC to 24°C or higher', impact: 'High', diff: 'Easy', co2: '0.33t/yr', icon: <Zap size={18} /> });
  } else {
    recommendations.push({ title: 'Switch to LED lighting', impact: 'High', diff: 'Easy', co2: '0.18t/yr', icon: <Zap size={18} /> });
  }

  if (data.vehicle > 200) {
    recommendations.push({ title: 'Carpool for daily commute', impact: 'High', diff: 'Medium', co2: '0.40t/yr', icon: <Car size={18} /> });
  } else if (data.flights > 2) {
    recommendations.push({ title: 'One car-free day a week', impact: 'Medium', diff: 'Easy', co2: '0.22t/yr', icon: <Car size={18} /> });
  } else {
    recommendations.push({ title: 'Bike for trips under 3km', impact: 'High', diff: 'Medium', co2: '0.31t/yr', icon: <Bike size={18} /> });
  }

  if (data.diet === 'Meat-heavy' || data.diet === 'Balanced') {
    recommendations.push({ title: 'Cut red meat to 2x/week', impact: 'High', diff: 'Medium', co2: '0.45t/yr', icon: <Utensils size={18} /> });
  } else {
    recommendations.push({ title: 'Buy local, seasonal produce', impact: 'Medium', diff: 'Easy', co2: '0.12t/yr', icon: <ShoppingBag size={18} /> });
  }

  if (data.waste > 10) {
    recommendations.push({ title: 'Compost kitchen waste', impact: 'Medium', diff: 'Medium', co2: '0.15t/yr', icon: <Trash2 size={18} /> });
  } else {
    recommendations.push({ title: 'Carry reusable bottle & bag', impact: 'Medium', diff: 'Easy', co2: '0.06t/yr', icon: <Recycle size={18} /> });
  }

  if (done) {
    const pct = Math.max(8, Math.min(96, 100 - (results.totalTons / results.globalAvg) * 60));
    return (
      <div className="eco-calc-wrap">
        <button className="eco-btn eco-btn-ghost" style={{ marginBottom: 24 }} onClick={() => setDone(false)}>
          <ArrowLeft size={15} /> Edit answers
        </button>
        <div className="eco-section-head" style={{ marginBottom: 28 }}>
          <div className="eco-kicker">Your results</div>
          <h2 className="eco-display" style={{ fontSize: 30 }}>Here's your climate footprint</h2>
        </div>

        <div className="eco-results-grid">
          <div className="eco-result-card">
            <h4>Annual emissions</h4>
            <div className="eco-result-big eco-mono">{results.totalTons.toFixed(2)} t CO₂</div>
            <div className="eco-compare-row">
              <span style={{ width: 80, color: C.inkSoft }}>You</span>
              <div className="eco-compare-bar"><div className="fill" style={{ width: '100%', background: C.orange }} /></div>
            </div>
            <div className="eco-compare-row">
              <span style={{ width: 80, color: C.inkSoft }}>India avg.</span>
              <div className="eco-compare-bar"><div className="fill" style={{ width: `${(results.indiaAvg / results.totalTons) * 100}%`, background: C.leaf }} /></div>
            </div>
            <div className="eco-compare-row">
              <span style={{ width: 80, color: C.inkSoft }}>Global avg.</span>
              <div className="eco-compare-bar"><div className="fill" style={{ width: `${(results.globalAvg / results.totalTons) * 100}%`, background: C.brown }} /></div>
            </div>
          </div>

          <div className="eco-result-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <LeafWreath percent={pct} label={`${results.monthlyTons.toFixed(2)}t`} sublabel="per month" size={180} leafCount={24} />
          </div>
        </div>

        <div className="eco-results-grid">
          <div className="eco-result-card">
            <h4 style={{ marginBottom: 14 }}>Emission breakdown</h4>
            <ResponsiveContainer width="100%" height={210}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={85} paddingAngle={2}>
                  {pieData.map((_, i) => <Cell key={i} fill={pieColors[i]} />)}
                </Pie>
                <Tooltip formatter={(v) => `${v} t CO₂`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="eco-result-card">
            <h4 style={{ marginBottom: 14 }}>Vs. benchmarks (t CO₂/yr)</h4>
            <ResponsiveContainer width="100%" height={210}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" stroke={C.line} />
                <XAxis dataKey="name" tick={{ fontSize: 11.5 }} />
                <YAxis tick={{ fontSize: 11.5 }} />
                <Tooltip />
                <Bar dataKey="val" fill={C.forest} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="eco-result-card" style={{ marginBottom: 24 }}>
          <h4 style={{ marginBottom: 4 }}>Breakdown detail</h4>
          {results.breakdown.map((b, i) => (
            <div className="eco-breakdown-row" key={i}>
              <span className="eco-bicon" style={{ background: b.color }}>{b.icon}</span>
              <span style={{ flex: 1, fontWeight: 600, fontSize: 14 }}>{b.label}</span>
              <span className="eco-mono" style={{ color: C.inkSoft }}>{b.value.toFixed(2)} t</span>
            </div>
          ))}
        </div>

        <div className="eco-section-head" style={{ marginBottom: 18 }}>
          <h2 className="eco-display" style={{ fontSize: 24 }}>Recommended next steps</h2>
        </div>
        <div className="eco-feature-grid" style={{ gridTemplateColumns: 'repeat(2,1fr)' }}>
          {recommendations.map((r, i) => (
            <div className="eco-rec-card" key={i}>
              <span className="eco-rec-icon">{r.icon}</span>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14.5, marginBottom: 6 }}>{r.title}</div>
                <div style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
                  <span className="eco-tag" style={{ background: '#E6EFE2', color: C.forest }}>{r.impact} impact</span>
                  <span className="eco-tag" style={{ background: '#F4ECE0', color: C.brown }}>{r.diff}</span>
                </div>
                <div className="eco-mono" style={{ fontSize: 12.5, color: C.inkSoft }}>saves ~{r.co2}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const s = STEP_DEFS[step];

  return (
    <div className="eco-calc-wrap">
      <div className="eco-calc-steps">
        {STEP_DEFS.map((_, i) => (
          <div className="eco-step-dot" key={i}>
            <div className="fill" style={{ transform: `scaleX(${i <= step ? 1 : 0})` }} />
          </div>
        ))}
      </div>

      <div className="eco-calc-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <span className="eco-rec-icon" style={{ width: 36, height: 36 }}>{s.icon}</span>
          <span className="eco-mono" style={{ fontSize: 12.5, color: C.inkSoft }}>Step {step + 1} of {totalSteps}</span>
        </div>
        <h2 className="eco-display">{s.title}</h2>
        <p className="hint">{s.hint}</p>

        {s.key === 'electricity' && (
          <div className="eco-field">
            <label>Monthly usage <span className="val">{data.electricity} kWh</span></label>
            <input className="eco-slider" type="range" min="0" max="1000" value={data.electricity} onChange={(e) => update('electricity', +e.target.value)} />
            <p style={{ fontSize: '11.5px', color: C.inkSoft, marginTop: '6px' }}>Enter your value above to see it reflected in your results.</p>
          </div>
        )}
        {s.key === 'vehicle' && (
          <div className="eco-field">
            <label>Monthly distance <span className="val">{data.vehicle} km</span></label>
            <input className="eco-slider" type="range" min="0" max="3000" value={data.vehicle} onChange={(e) => update('vehicle', +e.target.value)} />
            <p style={{ fontSize: '11.5px', color: C.inkSoft, marginTop: '6px' }}>Enter your value above to see it reflected in your results.</p>
          </div>
        )}
        {s.key === 'flights' && (
          <div className="eco-field">
            <label>Flights per year <span className="val">{data.flights}</span></label>
            <input className="eco-slider" type="range" min="0" max="20" value={data.flights} onChange={(e) => update('flights', +e.target.value)} />
            <p style={{ fontSize: '11.5px', color: C.inkSoft, marginTop: '6px' }}>Enter your value above to see it reflected in your results.</p>
          </div>
        )}
        {s.key === 'diet' && (
          <div className="eco-field">
            <div className="eco-pillrow">
              {DIET_OPTIONS.map((o) => (
                <button key={o} className={`eco-pill ${data.diet === o ? 'sel' : ''}`} onClick={() => update('diet', o)}>{o}</button>
              ))}
            </div>
            {!data.diet && <p style={{ fontSize: '11.5px', color: C.orange, marginTop: '6px', fontWeight: '500' }}>Select one option</p>}
          </div>
        )}
        {s.key === 'waste' && (
          <div className="eco-field">
            <label>Weekly waste <span className="val">{data.waste} kg</span></label>
            <input className="eco-slider" type="range" min="0" max="40" value={data.waste} onChange={(e) => update('waste', +e.target.value)} />
            <p style={{ fontSize: '11.5px', color: C.inkSoft, marginTop: '6px' }}>Enter your value above to see it reflected in your results.</p>
          </div>
        )}
        {s.key === 'water' && (
          <div className="eco-field">
            <label>Daily water use <span className="val">{data.water} L</span></label>
            <input className="eco-slider" type="range" min="0" max="400" value={data.water} onChange={(e) => update('water', +e.target.value)} />
            <p style={{ fontSize: '11.5px', color: C.inkSoft, marginTop: '6px' }}>Enter your value above to see it reflected in your results.</p>
          </div>
        )}
        {s.key === 'shopping' && (
          <div className="eco-field">
            <div className="eco-pillrow">
              {SHOP_OPTIONS.map((o) => (
                <button key={o} className={`eco-pill ${data.shopping === o ? 'sel' : ''}`} onClick={() => update('shopping', o)}>{o}</button>
              ))}
            </div>
            {!data.shopping && <p style={{ fontSize: '11.5px', color: C.orange, marginTop: '6px', fontWeight: '500' }}>Select one option</p>}
          </div>
        )}

        <div className="eco-calc-nav">
          <button className="eco-btn eco-btn-ghost" disabled={step === 0} style={{ opacity: step === 0 ? 0.4 : 1 }} onClick={() => setStep((s2) => Math.max(0, s2 - 1))}>
            <ChevronLeft size={16} /> Back
          </button>
          {step < totalSteps - 1 ? (
            <button className="eco-btn eco-btn-primary" onClick={() => setStep((s2) => Math.min(totalSteps - 1, s2 + 1))}>
              Next <ChevronRight size={16} />
            </button>
          ) : (
            <button className="eco-btn eco-btn-orange" onClick={() => setDone(true)}>
              See my results <Check size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- */
/* ---------------------------------------------------------------- */
/* Personalized Eco Tips                                              */
/* ---------------------------------------------------------------- */
const TIP_CATEGORIES = ['All', 'Energy', 'Transport', 'Food', 'Water', 'Lifestyle'];
const TIPS = [
  { id: 1, cat: 'Energy', title: 'Switch to LED bulbs', co2: '0.18t/yr', diff: 'Easy', impact: 'High', icon: <Lightbulb size={20} /> },
  { id: 2, cat: 'Energy', title: 'Unplug idle electronics', co2: '0.09t/yr', diff: 'Easy', impact: 'Medium', icon: <Battery size={20} /> },
  { id: 3, cat: 'Transport', title: 'Bike for trips under 3km', co2: '0.31t/yr', diff: 'Medium', impact: 'High', icon: <Bike size={20} /> },
  { id: 4, cat: 'Transport', title: 'Take public transport twice a week', co2: '0.27t/yr', diff: 'Easy', impact: 'High', icon: <Bus size={20} /> },
  { id: 5, cat: 'Food', title: 'Try two meat-free days weekly', co2: '0.24t/yr', diff: 'Medium', impact: 'High', icon: <Utensils size={20} /> },
  { id: 6, cat: 'Food', title: 'Buy local, seasonal produce', co2: '0.12t/yr', diff: 'Easy', impact: 'Medium', icon: <ShoppingBag size={20} /> },
  { id: 7, cat: 'Water', title: 'Fix leaking taps promptly', co2: '0.05t/yr', diff: 'Easy', impact: 'Low', icon: <Droplet size={20} /> },
  { id: 8, cat: 'Water', title: 'Install a low-flow showerhead', co2: '0.07t/yr', diff: 'Medium', impact: 'Medium', icon: <Droplet size={20} /> },
  { id: 9, cat: 'Lifestyle', title: 'Carry a reusable bottle & bag', co2: '0.06t/yr', diff: 'Easy', impact: 'Medium', icon: <Recycle size={20} /> },
  { id: 10, cat: 'Lifestyle', title: 'Buy fewer, better-made goods', co2: '0.21t/yr', diff: 'Hard', impact: 'High', icon: <ShoppingBag size={20} /> },
  { id: 11, cat: 'Energy', title: 'Set AC to 24°C or higher', co2: '0.33t/yr', diff: 'Easy', impact: 'High', icon: <Zap size={20} /> },
  { id: 12, cat: 'Transport', title: 'Carpool for the daily commute', co2: '0.4t/yr', diff: 'Medium', impact: 'High', icon: <Car size={20} /> },
];
const DIFF_COLOR = { Easy: { bg: '#E6EFE2', fg: C.forest }, Medium: { bg: '#FBF1DD', fg: '#9A7B1F' }, Hard: { bg: '#FDEDE7', fg: C.orange } };
const IMPACT_COLOR = { High: { bg: '#E6EFE2', fg: C.forest }, Medium: { bg: '#F4ECE0', fg: C.brown }, Low: { bg: '#EFEFEF', fg: C.inkSoft } };

function EcoTips({ user, onRequireAuth, syncWithBackend }) {
  const [filter, setFilter] = useState('All');
  const [saved, setSaved] = useState(() => {
    if (user && user.saved_tips) {
      return new Set(user.saved_tips);
    }
    const stored = localStorage.getItem('ecochat_saved_tips');
    return stored ? new Set(JSON.parse(stored)) : new Set();
  });

  useEffect(() => {
    if (user && user.saved_tips) {
      setSaved(new Set(user.saved_tips));
    } else if (!user) {
      const stored = localStorage.getItem('ecochat_saved_tips');
      setSaved(stored ? new Set(JSON.parse(stored)) : new Set());
    }
  }, [user]);

  function toggleSave(id) {
    onRequireAuth(() => {
      setSaved((s) => {
        const n = new Set(s);
        n.has(id) ? n.delete(id) : n.add(id);
        const arr = Array.from(n);
        localStorage.setItem('ecochat_saved_tips', JSON.stringify(arr));
        syncWithBackend({ saved_tips: arr });
        return n;
      });
    });
  }

  const filtered = filter === 'All' ? TIPS : TIPS.filter((t) => t.cat === filter);

  return (
    <div className="eco-page">
      <div className="eco-page-head">
        <div>
          <h1>Personalized eco tips</h1>
          <p>Ranked recommendations sized to your effort and impact — start with the easy, high-impact ones.</p>
        </div>
        <div className="eco-statpill" style={{ minWidth: 200 }}>
          <span className="ic" style={{ background: '#E6EFE2' }}><Heart size={18} color={C.forest} /></span>
          <div><div className="v">{saved.size}</div><div className="l">tips saved</div></div>
        </div>
      </div>

      <div className="eco-filterrow">
        {TIP_CATEGORIES.map((c) => (
          <button key={c} className={`eco-filter ${filter === c ? 'sel green' : ''}`} onClick={() => setFilter(c)}>{c}</button>
        ))}
      </div>

      <div className="eco-tip-grid">
        {filtered.map((t) => (
          <div className="eco-tip-card" key={t.id}>
            <div className="eco-tip-top">
              <span className="eco-tip-icon">{t.icon}</span>
              <button className={`eco-iconbtn-sm ${saved.has(t.id) ? 'saved' : ''}`} onClick={() => toggleSave(t.id)}>
                <Heart size={14} fill={saved.has(t.id) ? C.orange : 'none'} />
              </button>
            </div>
            <h3>{t.title}</h3>
            <div className="eco-tip-meta">
              <span className="eco-tag" style={{ background: DIFF_COLOR[t.diff].bg, color: DIFF_COLOR[t.diff].fg }}>{t.diff}</span>
              <span className="eco-tag" style={{ background: IMPACT_COLOR[t.impact].bg, color: IMPACT_COLOR[t.impact].fg }}>{t.impact} impact</span>
            </div>
            <div className="eco-tip-foot">
              <span className="eco-co2save">saves {t.co2}</span>
              <div className="eco-iconbtn-row">
                <button className="eco-iconbtn-sm"><Share2 size={14} /></button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- */
/* Green Habit Tracker                                                */
/* ---------------------------------------------------------------- */
const INITIAL_HABITS = [
  { id: 1, title: 'Used bicycle or walked', icon: <Bike size={18} color="#fff" />, color: C.forest, streak: 0, weeklyGoal: 5, weeklyDone: 0, monthly: 0, doneToday: false },
  { id: 2, title: 'Took public transport', icon: <Bus size={18} color="#fff" />, color: C.brown, streak: 0, weeklyGoal: 4, weeklyDone: 0, monthly: 0, doneToday: false },
  { id: 3, title: 'Switched off unused lights', icon: <Lightbulb size={18} color="#fff" />, color: C.orange, streak: 0, weeklyGoal: 7, weeklyDone: 0, monthly: 0, doneToday: false },
  { id: 4, title: 'Used a reusable bottle', icon: <Droplet size={18} color="#fff" />, color: '#5C8AA8', streak: 0, weeklyGoal: 7, weeklyDone: 0, monthly: 0, doneToday: false },
  { id: 5, title: 'Brought reusable bags', icon: <ShoppingBag size={18} color="#fff" />, color: '#A88B5C', streak: 0, weeklyGoal: 5, weeklyDone: 0, monthly: 0, doneToday: false },
  { id: 6, title: 'Planted or watered a tree', icon: <TreePine size={18} color="#fff" />, color: C.leaf, streak: 0, weeklyGoal: 1, weeklyDone: 0, monthly: 0, doneToday: false },
  { id: 7, title: 'Avoided single-use plastic', icon: <Recycle size={18} color="#fff" />, color: '#7A8C6F', streak: 0, weeklyGoal: 6, weeklyDone: 0, monthly: 0, doneToday: false },
  { id: 8, title: 'Sorted recycling correctly', icon: <Recycle size={18} color="#fff" />, color: C.forestDark, streak: 0, weeklyGoal: 7, weeklyDone: 0, monthly: 0, doneToday: false },
];

function HabitTracker({ user, onRequireAuth, syncWithBackend }) {
  const restoreHabits = (rawList) => {
    if (!rawList || !Array.isArray(rawList)) return INITIAL_HABITS;
    return INITIAL_HABITS.map(initial => {
      const stored = rawList.find(p => p.id === initial.id);
      if (stored) {
        return {
          ...initial,
          streak: stored.streak ?? initial.streak,
          weeklyGoal: stored.weeklyGoal ?? initial.weeklyGoal,
          weeklyDone: stored.weeklyDone ?? initial.weeklyDone,
          monthly: stored.monthly ?? initial.monthly,
          doneToday: stored.doneToday ?? initial.doneToday
        };
      }
      return initial;
    });
  };

  const [habits, setHabits] = useState(() => {
    if (user && user.habits && user.habits.length > 0) {
      return restoreHabits(user.habits);
    }
    const stored = localStorage.getItem('ecochat_habits');
    if (stored) {
      try {
        return restoreHabits(JSON.parse(stored));
      } catch (e) {
        return INITIAL_HABITS;
      }
    }
    return INITIAL_HABITS;
  });

  useEffect(() => {
    if (user && user.habits && user.habits.length > 0) {
      setHabits(restoreHabits(user.habits));
    } else if (!user) {
      const stored = localStorage.getItem('ecochat_habits');
      if (stored) {
        try {
          setHabits(restoreHabits(JSON.parse(stored)));
        } catch (e) {
          setHabits(INITIAL_HABITS);
        }
      } else {
        setHabits(INITIAL_HABITS);
      }
    }
  }, [user]);

  function toggle(id) {
    onRequireAuth(() => {
      setHabits((hs) => {
        const nextHs = hs.map((h) => {
          if (h.id !== id) return h;
          const doneToday = !h.doneToday;
          const weeklyDone = Math.max(0, Math.min(h.weeklyGoal, h.weeklyDone + (doneToday ? 1 : -1)));
          const streak = doneToday ? h.streak + 1 : Math.max(0, h.streak - 1);
          return { ...h, doneToday, weeklyDone, streak };
        });
        localStorage.setItem('ecochat_habits', JSON.stringify(nextHs));
        syncWithBackend({ habits: nextHs });
        return nextHs;
      });
    });
  }

  const completedToday = habits.filter((h) => h.doneToday).length;
  const totalXP = habits.reduce((s, h) => s + h.streak * 4, 0);
  const level = Math.floor(totalXP / 150) + 1;
  const levelProgress = (totalXP % 150) / 150 * 100;

  return (
    <div className="eco-page">
      <div className="eco-page-head">
        <div>
          <h1>Green habit tracker</h1>
          <p>Small daily actions, tracked — streaks compound faster than willpower.</p>
        </div>
      </div>

      <div className="eco-statstrip">
        <div className="eco-statpill">
          <span className="ic" style={{ background: '#FDEDE7' }}><Flame size={18} color={C.orange} /></span>
          <div><div className="v">{Math.max(...habits.map((h) => h.streak))}</div><div className="l">day best streak</div></div>
        </div>
        <div className="eco-statpill">
          <span className="ic" style={{ background: '#E6EFE2' }}><CheckCircle2 size={18} color={C.forest} /></span>
          <div><div className="v">{completedToday}/{habits.length}</div><div className="l">done today</div></div>
        </div>
        <div className="eco-statpill">
          <span className="ic" style={{ background: '#F4ECE0' }}><Star size={18} color={C.brown} /></span>
          <div><div className="v">{totalXP} XP</div><div className="l">total earned</div></div>
        </div>
        <div className="eco-statpill">
          <span className="ic" style={{ background: '#EDEAF7' }}><Medal size={18} color="#6E5FA8" /></span>
          <div>
            <div className="v">Level {level}</div>
            <div className="eco-habit-bar" style={{ width: 90, marginTop: 4 }}><div className="fill" style={{ width: `${levelProgress}%`, background: '#6E5FA8' }} /></div>
          </div>
        </div>
      </div>

      <div className="eco-habit-grid">
        {habits.map((h) => (
          <div className="eco-habit-card" key={h.id}>
            <div className={`eco-habit-check ${h.doneToday ? 'done' : ''}`} onClick={() => toggle(h.id)}>
              {h.doneToday && <Check size={16} color="#fff" />}
            </div>
            <span className="eco-tip-icon" style={{ background: h.color }}>{h.icon}</span>
            <div className="eco-habit-body">
              <h4>{h.title}</h4>
              <div className="eco-habit-sub">
                <span className="eco-streak-flame"><Flame size={12} /> {h.streak}d streak</span>
                <span>{h.weeklyDone}/{h.weeklyGoal} this week</span>
              </div>
              <div className="eco-habit-bar"><div className="fill" style={{ width: `${(h.weeklyDone / h.weeklyGoal) * 100}%` }} /></div>
            </div>
            <RingProgress percent={h.monthly} color={h.color} />
          </div>
        ))}
      </div>
    </div>
  );
}

const LEARN_CATEGORIES = ['Climate Basics', 'Renewable Energy', 'Circular Economy', 'Carbon Footprint', 'Waste Management', 'Water Conservation', 'Green Technology'];
const ARTICLES = [
  { id: 1, cat: 'Climate Basics', title: 'What greenhouse gases actually do', read: '5 min read', color: '#1B5E20' },
  { id: 2, cat: 'Renewable Energy', title: 'Solar vs. wind: which fits your roof?', read: '6 min read', color: '#C7714D' },
  { id: 3, cat: 'Circular Economy', title: 'The life of a recycled plastic bottle', read: '4 min read', color: '#4CAF50' },
  { id: 4, cat: 'Carbon Footprint', title: 'Why flights weigh so much in your total', read: '5 min read', color: '#8D6E63' },
  { id: 5, cat: 'Waste Management', title: 'Composting for small apartments', read: '3 min read', color: '#7A8C6F' },
  { id: 6, cat: 'Water Conservation', title: 'The hidden water cost of your wardrobe', read: '6 min read', color: '#5C8AA8' },
  { id: 7, cat: 'Green Technology', title: 'How heat pumps beat gas boilers', read: '7 min read', color: '#A88B5C' },
  { id: 8, cat: 'Climate Basics', title: 'Reading a climate report without dread', read: '4 min read', color: '#6E5FA8' },
];

const ARTICLE_URLS = {
  'What greenhouse gases actually do': 'https://en.wikipedia.org/wiki/Greenhouse_gas',
  'Solar vs. wind: which fits your roof?': 'https://en.wikipedia.org/wiki/Solar_power',
  'The life of a recycled plastic bottle': 'https://en.wikipedia.org/wiki/Plastic_recycling',
  'Why flights weigh so much in your total': 'https://ourworldindata.org/travel-carbon-footprint',
  'Composting for small apartments': 'https://en.wikipedia.org/wiki/Compost',
  'The hidden water cost of your wardrobe': 'https://en.wikipedia.org/wiki/Environmental_impact_of_clothing',
  'How heat pumps beat gas boilers': 'https://en.wikipedia.org/wiki/Heat_pump',
  'Reading a climate report without dread': 'https://www.ipcc.ch/reports/',
};

const QUIZZES = [
  {
    q: 'Which sector produces the most greenhouse gas emissions globally?',
    options: ['Aviation', 'Energy production', 'Agriculture', 'Fashion'],
    correct: 1,
    explanation: 'Correct — energy production is the single largest emitting sector worldwide.',
    wrongExplanation: 'Not quite — energy production is actually the largest emitting sector.'
  },
  {
    q: 'Which of the following has the highest carbon footprint per gram of protein?',
    options: ['Beef', 'Chicken', 'Eggs', 'Tofu'],
    correct: 0,
    explanation: 'Correct — beef production produces significant emissions, primarily methane.',
    wrongExplanation: 'Not quite — beef has by far the highest carbon footprint per gram of protein.'
  },
  {
    q: 'How much of global greenhouse gas emissions come from food systems?',
    options: ['Around 10%', 'Around 26%', 'Around 50%', 'Around 5%'],
    correct: 1,
    explanation: 'Correct — food systems (production, transport, packaging, waste) account for about 26% of emissions.',
    wrongExplanation: 'Not quite — food systems actually account for roughly 26% of global emissions.'
  },
  {
    q: 'What is the most effective individual action to reduce carbon footprint?',
    options: ['Recycling', 'Using LED bulbs', 'Living car-free', 'Washing clothes in cold water'],
    correct: 2,
    explanation: 'Correct — living car-free saves about 2.4 tonnes of CO2 equivalent per year.',
    wrongExplanation: 'Not quite — living car-free is by far the most impactful individual action listed.'
  }
];

function LearningHub({ user, onRequireAuth, syncWithBackend }) {
  const [cat, setCat] = useState('All');
  const [quizAnswer, setQuizAnswer] = useState(null);
  const [bookmarked, setBookmarked] = useState(() => {
    if (user && user.bookmarked_articles) {
      return new Set(user.bookmarked_articles);
    }
    const stored = localStorage.getItem('ecochat_bookmarked_articles');
    return stored ? new Set(JSON.parse(stored)) : new Set();
  });

  useEffect(() => {
    if (user && user.bookmarked_articles) {
      setBookmarked(new Set(user.bookmarked_articles));
    } else if (!user) {
      const stored = localStorage.getItem('ecochat_bookmarked_articles');
      setBookmarked(stored ? new Set(JSON.parse(stored)) : new Set());
    }
  }, [user]);

  // Selected random quiz on render
  const [activeQuiz] = useState(() => {
    const idx = Math.floor(Math.random() * QUIZZES.length);
    return QUIZZES[idx];
  });

  // Track dynamic reading progress for articles (default 0%)
  const [readProgress, setReadProgress] = useState(() => {
    const stored = localStorage.getItem('ecochat_article_progress');
    return stored ? JSON.parse(stored) : {};
  });

  // Track recently viewed articles dynamically (default empty)
  const [recentlyViewedIds, setRecentlyViewedIds] = useState(() => {
    const stored = localStorage.getItem('ecochat_recently_viewed');
    return stored ? JSON.parse(stored) : [];
  });

  function toggleBookmark(id, e) {
    e.stopPropagation();
    onRequireAuth(() => {
      setBookmarked((s) => {
        const n = new Set(s);
        n.has(id) ? n.delete(id) : n.add(id);
        const arr = Array.from(n);
        localStorage.setItem('ecochat_bookmarked_articles', JSON.stringify(arr));
        syncWithBackend({ bookmarked_articles: arr });
        return n;
      });
    });
  }

  function handleArticleClick(articleId) {
    // Set reading progress to 100%
    setReadProgress((prev) => {
      const next = { ...prev, [articleId]: 100 };
      localStorage.setItem('ecochat_article_progress', JSON.stringify(next));
      return next;
    });

    // Add to recently viewed, shifting duplicates to the top
    setRecentlyViewedIds((prev) => {
      const filtered = prev.filter((id) => id !== articleId);
      const next = [articleId, ...filtered].slice(0, 4); // Keep top 4
      localStorage.setItem('ecochat_recently_viewed', JSON.stringify(next));
      return next;
    });
  }

  const trending = cat === 'All' ? ARTICLES : ARTICLES.filter((a) => a.cat === cat);

  const recentlyViewed = useMemo(() => {
    return recentlyViewedIds.map((id) => ARTICLES.find((a) => a.id === id)).filter(Boolean);
  }, [recentlyViewedIds]);

  return (
    <div className="eco-page">
      <div className="eco-page-head">
        <div>
          <h1>Climate learning hub</h1>
          <p>Short reads, sharp facts, and quizzes that make the science stick.</p>
        </div>
      </div>

      <div className="eco-dyk">
        <HelpCircle size={40} color="#fff" style={{ flexShrink: 0 }} />
        <div>
          <div style={{ fontSize: 12.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', opacity: 0.85, marginBottom: 6 }}>Did you know?</div>
          <p style={{ margin: 0, fontSize: 16, lineHeight: 1.5, fontFamily: 'Fraunces, serif', fontWeight: 500 }}>
            A single mature tree absorbs roughly 21kg of CO₂ per year — it would take about 48 trees to offset one round-trip transatlantic flight.
          </p>
        </div>
      </div>

      <div className="eco-filterrow">
        <button className={`eco-filter ${cat === 'All' ? 'sel green' : ''}`} onClick={() => setCat('All')}>All</button>
        {LEARN_CATEGORIES.map((c) => (
          <button key={c} className={`eco-filter ${cat === c ? 'sel green' : ''}`} onClick={() => setCat(c)}>{c}</button>
        ))}
      </div>

      <h3 style={{ fontFamily: 'Fraunces, serif', fontSize: 19, margin: '0 0 14px' }}>Trending articles</h3>
      <div className="eco-article-row">
        {trending.map((a) => (
          <a
            href={ARTICLE_URLS[a.title] || '#'}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => handleArticleClick(a.id)}
            className="eco-article-card"
            key={a.id}
            style={{ textDecoration: 'none', color: 'inherit', display: 'flex', flexDirection: 'column', height: '100%' }}
          >
            <div className="eco-article-img" style={{ background: `linear-gradient(135deg, ${a.color}, ${a.color}99)` }}>
              <BookOpen size={26} color="#fff" />
            </div>
            <div className="eco-article-body">
              <h4>{a.title}</h4>
              <div className="eco-article-meta">
                <span>{a.read}</span>
                <button
                  className="eco-iconbtn-sm"
                  style={{ border: 'none', background: 'transparent' }}
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleBookmark(a.id, e); }}
                >
                  <Bookmark size={14} fill={bookmarked.has(a.id) ? C.forest : 'none'} color={C.forest} />
                </button>
              </div>
            </div>
            <div className="eco-article-progress">
              <div className="fill" style={{ width: `${readProgress[a.id] || 0}%` }} />
            </div>
          </a>
        ))}
      </div>

      <div className="eco-quiz-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <span className="eco-tip-icon"><HelpCircle size={20} /></span>
          <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700 }}>Quick quiz</h3>
        </div>
        <p style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>{activeQuiz.q}</p>
        {activeQuiz.options.map((o, i) => {
          let cls = '';
          if (quizAnswer !== null) {
            if (i === activeQuiz.correct) cls = 'correct';
            else if (i === quizAnswer) cls = 'wrong';
          }
          return (
            <button key={i} className={`eco-quiz-opt ${cls}`} onClick={() => setQuizAnswer(i)} disabled={quizAnswer !== null}>
              {o}
            </button>
          );
        })}
        {quizAnswer !== null && (
          <p style={{ fontSize: 13.5, color: C.inkSoft, marginTop: 10, marginBottom: 0 }}>
            {quizAnswer === activeQuiz.correct ? activeQuiz.explanation : activeQuiz.wrongExplanation}
          </p>
        )}
      </div>

      <h3 style={{ fontFamily: 'Fraunces, serif', fontSize: 19, margin: '0 0 14px' }}>Recently viewed</h3>
      <div className="eco-article-row" style={{ marginBottom: 0 }}>
        {recentlyViewed.map((a) => (
          <a
            href={ARTICLE_URLS[a.title] || '#'}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => handleArticleClick(a.id)}
            className="eco-article-card"
            key={`rv-${a.id}`}
            style={{ textDecoration: 'none', color: 'inherit', display: 'flex', flexDirection: 'column', height: '100%' }}
          >
            <div className="eco-article-img" style={{ background: `linear-gradient(135deg, ${a.color}, ${a.color}99)` }}>
              <BookOpen size={26} color="#fff" />
            </div>
            <div className="eco-article-body">
              <h4>{a.title}</h4>
              <div className="eco-article-meta"><span>{a.read}</span><Share2 size={14} color={C.inkSoft} /></div>
            </div>
          </a>
        ))}
        {recentlyViewed.length === 0 && (
          <div style={{ 
            textAlign: 'center', 
            padding: '24px', 
            color: C.inkSoft, 
            fontStyle: 'italic', 
            background: '#F4ECE0', 
            border: '1px dashed var(--line)', 
            borderRadius: '18px', 
            gridColumn: 'span 4',
            fontSize: 14.5
          }}>
            No recently viewed articles yet. Click on any trending article above to start learning!
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- */
/* Eco Challenges & Rewards                                           */
/* ---------------------------------------------------------------- */
function getDaysLeftInWeek() {
  const now = new Date();
  const day = now.getDay(); // 0 is Sunday, 1 is Monday, etc.
  const daysToSunday = day === 0 ? 0 : 7 - day;
  return daysToSunday;
}

function getDaysLeftInMonth() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const lastDay = new Date(year, month + 1, 0).getDate();
  return lastDay - now.getDate();
}

const CHALLENGES = [
  { id: 1, title: 'Walk or cycle 10km this week', period: 'Weekly', xp: 80, diff: 'Easy', progress: 0, icon: <Bike size={20} color="#fff" />, color: C.forest },
  { id: 2, title: 'Plant 3 trees this month', period: 'Monthly', xp: 220, diff: 'Hard', progress: 0, icon: <TreePine size={20} color="#fff" />, color: C.leaf },
  { id: 3, title: 'No single-use plastic for 7 days', period: 'Weekly', xp: 100, diff: 'Medium', progress: 0, icon: <Recycle size={20} color="#fff" />, color: '#7A8C6F' },
  { id: 4, title: 'Save 20 units of electricity', period: 'Monthly', xp: 150, diff: 'Medium', progress: 0, icon: <Zap size={20} color="#fff" />, color: C.orange },
];
const LEADERBOARD = [
  { rank: 1, name: 'Priya N.', pts: 4820, color: C.forest },
  { rank: 2, name: 'Marcus T.', pts: 4510, color: C.orange },
  { rank: 3, name: 'Ananya R.', pts: 3960, color: C.brown },
  { rank: 4, name: 'David K.', pts: 3700, color: '#6E5FA8' },
  { rank: 5, name: 'You', pts: 0, color: C.leaf, me: true },
];
const ACHIEVEMENTS = [
  { title: 'First Step', icon: <Leaf size={20} color="#fff" />, color: C.forest, unlocked: false },
  { title: '7-Day Streak', icon: <Flame size={20} color="#fff" />, color: C.orange, unlocked: false },
  { title: 'Tree Planter', icon: <TreePine size={20} color="#fff" />, color: C.leaf, unlocked: false },
  { title: 'Quiz Master', icon: <HelpCircle size={20} color="#fff" />, color: '#6E5FA8', unlocked: false },
  { title: 'Top 3', icon: <Trophy size={20} color="#fff" />, color: '#A88B5C', unlocked: false },
];

function Challenges({ user, onRequireAuth, syncWithBackend }) {
  const [joined, setJoined] = useState(() => {
    if (user && user.joined_challenges) {
      return new Set(user.joined_challenges);
    }
    const stored = localStorage.getItem('ecochat_joined_challenges');
    return stored ? new Set(JSON.parse(stored)) : new Set();
  });

  useEffect(() => {
    if (user && user.joined_challenges) {
      setJoined(new Set(user.joined_challenges));
    } else if (!user) {
      const stored = localStorage.getItem('ecochat_joined_challenges');
      setJoined(stored ? new Set(JSON.parse(stored)) : new Set());
    }
  }, [user]);

  function toggleJoin(id) {
    onRequireAuth(() => {
      setJoined((s) => {
        const n = new Set(s);
        n.has(id) ? n.delete(id) : n.add(id);
        const arr = Array.from(n);
        localStorage.setItem('ecochat_joined_challenges', JSON.stringify(arr));
        syncWithBackend({ joined_challenges: arr });
        return n;
      });
    });
  }

  const earnedBadges = ACHIEVEMENTS.filter(a => a.unlocked).length;

  return (
    <div className="eco-page">
      <div className="eco-page-head">
        <div>
          <h1>Eco challenges & rewards</h1>
          <p>Join weekly and monthly challenges, earn XP, and climb the leaderboard.</p>
        </div>
      </div>

      <div className="eco-statstrip">
        <div className="eco-statpill">
          <span className="ic" style={{ background: '#E6EFE2' }}><Trophy size={18} color={C.forest} /></span>
          <div><div className="v">{joined.size}</div><div className="l">active challenges</div></div>
        </div>
        <div className="eco-statpill">
          <span className="ic" style={{ background: '#F4ECE0' }}><Gift size={18} color={C.brown} /></span>
          <div><div className="v">0</div><div className="l">reward coins</div></div>
        </div>
        <div className="eco-statpill">
          <span className="ic" style={{ background: '#FDEDE7' }}><Medal size={18} color={C.orange} /></span>
          <div><div className="v">{earnedBadges} / {ACHIEVEMENTS.length}</div><div className="l">badges earned</div></div>
        </div>
        <div className="eco-statpill">
          <span className="ic" style={{ background: '#E6EFE2' }}><Star size={18} color={C.forest} /></span>
          <div><div className="v">Rank #5</div><div className="l">on leaderboard</div></div>
        </div>
      </div>

      <h3 style={{ fontFamily: 'Fraunces, serif', fontSize: 19, margin: '0 0 14px' }}>Current challenges</h3>
      <div className="eco-challenge-grid">
        {CHALLENGES.map((c) => {
          const daysLeft = c.period === 'Weekly' ? getDaysLeftInWeek() : getDaysLeftInMonth();
          const deadlineText = `${daysLeft} days left`;
          return (
            <div className="eco-challenge-card" key={c.id}>
              <div className="eco-challenge-top">
                <div style={{ display: 'flex', gap: 12 }}>
                  <span className="eco-badge-icon" style={{ background: c.color }}>{c.icon}</span>
                  <div>
                    <h4>{c.title}</h4>
                    <span className="deadline"><Clock size={12} /> {deadlineText} · {c.period}</span>
                  </div>
                </div>
                <span className="eco-tag" style={{ background: DIFF_COLOR[c.diff].bg, color: DIFF_COLOR[c.diff].fg }}>{c.diff}</span>
              </div>
              <div className="eco-habit-bar" style={{ marginBottom: 12 }}><div className="fill" style={{ width: `${c.progress}%`, background: c.color }} /></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="eco-co2save">+{c.xp} XP reward</span>
                <button className={`eco-pill ${joined.has(c.id) ? 'sel' : ''}`} style={{ padding: '7px 16px', fontSize: 12.5 }} onClick={() => toggleJoin(c.id)}>
                  {joined.has(c.id) ? 'Joined' : 'Join challenge'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <h3 style={{ fontFamily: 'Fraunces, serif', fontSize: 19, margin: '0 0 14px' }}>Leaderboard</h3>
      <div className="eco-leaderboard">
        {LEADERBOARD.map((u) => (
          <div className={`eco-lb-row ${u.me ? 'me' : ''}`} key={u.rank}>
            <span className="eco-lb-rank">{u.rank}</span>
            <span className="eco-avatar" style={{ background: u.color }}>{u.name[0]}</span>
            <span style={{ flex: 1, fontWeight: u.me ? 700 : 600, fontSize: 14 }}>{u.name}</span>
            <span className="eco-mono" style={{ fontSize: 13.5, color: C.inkSoft }}>{u.pts.toLocaleString()} pts</span>
          </div>
        ))}
      </div>

      <h3 style={{ fontFamily: 'Fraunces, serif', fontSize: 19, margin: '0 0 14px' }}>Achievements</h3>
      <div className="eco-achv-grid">
        {ACHIEVEMENTS.map((a, i) => (
          <div className={`eco-achv ${a.unlocked ? '' : 'locked'}`} key={i}>
            <span className="ic" style={{ background: a.color }}>{a.icon}</span>
            <div style={{ fontSize: 12, fontWeight: 700 }}>{a.title}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- */
/* Nearby Green Resources                                             */
/* ---------------------------------------------------------------- */
const RESOURCE_CATEGORIES = ['All', 'Recycling', 'EV Charging', 'Solar', 'Tree Planting', 'Transit', 'Community Garden'];

const ICON_MAP = {
  Recycle: <Recycle size={20} color="#fff" />,
  Zap: <Zap size={20} color="#fff" />,
  Sun: <Sun size={20} color="#fff" />,
  TreePine: <TreePine size={20} color="#fff" />,
  Bus: <Bus size={20} color="#fff" />,
  Leaf: <Leaf size={20} color="#fff" />,
};

const RESOURCE_TEMPLATES = [
  { id: 1, name: 'Greenline Recycling Center', cat: 'Recycling', rating: 4.6, icon: 'Recycle', color: C.forest, offset: { lat: 0.008, lng: -0.012 } },
  { id: 2, name: 'ChargePoint EV Station', cat: 'EV Charging', rating: 4.3, icon: 'Zap', color: C.orange, offset: { lat: -0.012, lng: 0.008 } },
  { id: 3, name: 'SunRoof Solar Installers', cat: 'Solar', rating: 4.8, icon: 'Sun', color: '#A88B5C', offset: { lat: 0.005, lng: 0.015 } },
  { id: 4, name: 'Community Tree Planting Hub', cat: 'Tree Planting', rating: 4.9, icon: 'TreePine', color: C.leaf, offset: { lat: -0.006, lng: -0.009 } },
  { id: 5, name: 'Metro Transit Hub', cat: 'Transit', rating: 4.2, icon: 'Bus', color: C.brown, offset: { lat: 0.014, lng: 0.002 } },
  { id: 6, name: 'Riverside Community Garden', cat: 'Community Garden', rating: 4.7, icon: 'Leaf', color: '#7A8C6F', offset: { lat: -0.002, lng: 0.018 } },
];

function haversineDistance(coords1, coords2) {
  const toRad = (x) => (x * Math.PI) / 180;
  const R = 6371; // Earth radius in km
  const dLat = toRad(coords2.lat - coords1.lat);
  const dLon = toRad(coords2.lng - coords1.lng);
  const lat1 = toRad(coords1.lat);
  const lat2 = toRad(coords2.lat);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
}

function NearbyResources({ user, onRequireAuth, syncWithBackend }) {
  const [view, setView] = useState('list');
  const [cat, setCat] = useState('All');
  const [query, setQuery] = useState('');
  const [saved, setSaved] = useState(() => {
    if (user && user.saved_resources) {
      return new Set(user.saved_resources);
    }
    const stored = localStorage.getItem('ecochat_saved_resources');
    return stored ? new Set(JSON.parse(stored)) : new Set();
  });

  useEffect(() => {
    if (user && user.saved_resources) {
      setSaved(new Set(user.saved_resources));
    } else if (!user) {
      const stored = localStorage.getItem('ecochat_saved_resources');
      setSaved(stored ? new Set(JSON.parse(stored)) : new Set());
    }
  }, [user]);
  
  // Default coordinates (Chennai) if geolocation is denied or loading
  const [userCoords, setUserCoords] = useState({ lat: 13.0827, lng: 80.2707 });

  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);

  // Fetch actual location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        },
        (err) => {
          console.warn("Using default coordinates.");
        }
      );
    }
  }, []);

  const resources = useMemo(() => {
    return RESOURCE_TEMPLATES.map((t) => {
      const lat = userCoords.lat + t.offset.lat;
      const lng = userCoords.lng + t.offset.lng;
      const distKm = haversineDistance(userCoords, { lat, lng });
      return {
        ...t,
        lat,
        lng,
        dist: `${distKm.toFixed(1)} km`,
        icon: ICON_MAP[t.icon],
      };
    });
  }, [userCoords]);

  function toggleSave(id) {
    onRequireAuth(() => {
      setSaved((s) => {
        const n = new Set(s);
        n.has(id) ? n.delete(id) : n.add(id);
        const arr = Array.from(n);
        localStorage.setItem('ecochat_saved_resources', JSON.stringify(arr));
        syncWithBackend({ saved_resources: arr });
        return n;
      });
    });
  }

  const filtered = resources.filter((r) =>
    (cat === 'All' || r.cat === cat) && r.name.toLowerCase().includes(query.toLowerCase())
  );

  // Map loader and setup
  useEffect(() => {
    if (view !== 'map') {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      return;
    }

    // Inject Leaflet CSS if not already present
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    // Inject Leaflet JS if not already present
    if (!document.getElementById('leaflet-js')) {
      const script = document.createElement('script');
      script.id = 'leaflet-js';
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.async = true;
      script.onload = initMap;
      document.head.appendChild(script);
    } else if (window.L) {
      initMap();
    }

    function initMap() {
      if (!mapRef.current) return;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
      }

      const map = window.L.map(mapRef.current).setView([userCoords.lat, userCoords.lng], 13);
      mapInstanceRef.current = map;

      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(map);

      // User marker
      const userIcon = window.L.divIcon({
        html: `<div style="background-color: #3b82f6; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;"><span style="color: white; font-size: 10px;">🏠</span></div>`,
        className: 'leaflet-user-marker',
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });
      window.L.marker([userCoords.lat, userCoords.lng], { icon: userIcon }).addTo(map)
        .bindPopup('<b>Your Current Location</b>')
        .openPopup();

      // Add resource pins
      filtered.forEach((r) => {
        const markerIcon = window.L.divIcon({
          html: `<div style="background-color: ${r.color}; width: 32px; height: 32px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(0,0,0,0.25); border: 2px solid white;"><div style="transform: rotate(45deg); font-size: 14px; color: white;">📍</div></div>`,
          className: 'custom-leaflet-marker',
          iconSize: [32, 32],
          iconAnchor: [16, 32],
        });
        window.L.marker([r.lat, r.lng], { icon: markerIcon }).addTo(map)
          .bindPopup(`
            <div style="font-family: 'Inter', sans-serif; font-size: 13px; line-height: 1.4;">
              <b style="color: ${r.color}; font-size: 14px; display: block; margin-bottom: 2px;">${r.name}</b>
              <span style="font-weight: 600; color: #56624F;">${r.cat}</span> · <span>${r.dist}</span><br/>
              <span style="color: #ff9800; font-weight: 600;">⭐ ${r.rating}</span><br/>
              <button onclick="window.open('https://www.google.com/maps/dir/?api=1&origin=${userCoords.lat},${userCoords.lng}&destination=${r.lat},${r.lng}', '_blank')" style="margin-top: 6px; padding: 4px 8px; font-size: 11px; background-color: ${r.color}; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: 700;">Directions</button>
            </div>
          `);
      });
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [view, userCoords, filtered]);

  return (
    <div className="eco-page">
      <div className="eco-page-head">
        <div>
          <h1>Nearby green resources</h1>
          <p>Recycling centers, EV chargers, solar installers, and more — right around you.</p>
        </div>
      </div>

      <div className="eco-nearby-search">
        <div className="box">
          <Search size={16} color={C.inkSoft} />
          <input placeholder="Search nearby resources..." value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <div className="eco-toggle-pair">
          <button className={view === 'list' ? 'on' : ''} onClick={() => setView('list')}><List size={15} /> List</button>
          <button className={view === 'map' ? 'on' : ''} onClick={() => setView('map')}><MapIcon size={15} /> Map</button>
        </div>
      </div>

      <div className="eco-filterrow">
        {RESOURCE_CATEGORIES.map((c) => (
          <button key={c} className={`eco-filter ${cat === c ? 'sel green' : ''}`} onClick={() => setCat(c)}>{c}</button>
        ))}
      </div>

      {view === 'list' ? (
        <div className="eco-resource-list">
          {filtered.map((r) => (
            <div className="eco-resource-card" key={r.id}>
              <span className="eco-res-icon" style={{ background: r.color }}>{r.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 15 }}>{r.name}</div>
                <div className="eco-res-meta">
                  <span>{r.cat}</span>
                  <span><MapPin size={11} style={{ verticalAlign: -1 }} /> {r.dist}</span>
                  <span><Star size={11} fill={C.orange} color={C.orange} style={{ verticalAlign: -1 }} /> {r.rating}</span>
                </div>
              </div>
              <button className={`eco-iconbtn-sm ${saved.has(r.id) ? 'saved' : ''}`} onClick={() => toggleSave(r.id)}>
                <Heart size={14} fill={saved.has(r.id) ? C.orange : 'none'} />
              </button>
              <button 
                className="eco-btn eco-btn-primary" 
                style={{ padding: '10px 16px', fontSize: 13 }}
                onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&origin=${userCoords.lat},${userCoords.lng}&destination=${r.lat},${r.lng}`, '_blank')}
              >
                <Navigation size={14} /> Directions
              </button>
            </div>
          ))}
          {filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: 40, color: C.inkSoft, fontSize: 14 }}>No resources match that search.</div>
          )}
        </div>
      ) : (
        <div ref={mapRef} style={{ height: '420px', width: '100%', borderRadius: '22px', border: '1px solid var(--line)', zIndex: 1 }} />
      )}
    </div>
  );
}

/* AuthModal                                                         */
/* ---------------------------------------------------------------- */
function AuthModal({ isOpen, onClose, onAuthSuccess }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const endpoint = isSignUp ? '/auth/signup' : '/auth/login';
    const body = isSignUp ? { email, password, name } : { email, password };

    try {
      const res = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed');
      }
      onAuthSuccess(data.user);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="eco-modal-overlay" onClick={onClose}>
      <div className="eco-modal-card" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}><X size={18} /></button>
        <h2 className="eco-display" style={{ margin: '0 0 8px', fontSize: 22 }}>{isSignUp ? 'Create your account' : 'Welcome back'}</h2>
        <p style={{ color: C.inkSoft, fontSize: 13.5, marginBottom: 20, marginTop: 0 }}>
          {isSignUp ? 'Sign up to track your habits and save progress.' : 'Sign in to access your saved resources and tips.'}
        </p>

        {error && <div className="eco-error-banner">{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {isSignUp && (
            <div className="field">
              <label>Full Name</label>
              <input type="text" placeholder="Jane Doe" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
          )}
          <div className="field">
            <label>Email Address</label>
            <input type="email" placeholder="jane@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="field">
            <label>Password</label>
            <input type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <button type="submit" className="eco-btn eco-btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: 8 }} disabled={loading}>
            {loading ? 'Processing...' : isSignUp ? 'Sign Up' : 'Sign In'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 18, fontSize: 13.5, color: C.inkSoft }}>
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button className="eco-text-btn" onClick={() => { setIsSignUp(!isSignUp); setError(''); }}>
            {isSignUp ? 'Sign In' : 'Sign Up'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* App                                                                */
/* ---------------------------------------------------------------- */
const defaultCalcData = {
  electricity: 0,
  vehicle: 0,
  flights: 0,
  diet: '',
  waste: 0,
  water: 0,
  shopping: '',
};

export default function App() {
  const [page, setPage] = useState('landing');

  // User Authentication & Modal states
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('ecochat_user');
    return stored ? JSON.parse(stored) : null;
  });
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);

  const handleRequireAuth = (action) => {
    if (user) {
      action();
    } else {
      setPendingAction(() => action);
      setShowAuthModal(true);
    }
  };

  const handleAuthSuccess = (loggedUser) => {
    setUser(loggedUser);
    localStorage.setItem('ecochat_user', JSON.stringify(loggedUser));
    
    // Sync localStorage keys from user
    if (loggedUser.saved_tips) localStorage.setItem('ecochat_saved_tips', JSON.stringify(loggedUser.saved_tips));
    if (loggedUser.bookmarked_articles) localStorage.setItem('ecochat_bookmarked_articles', JSON.stringify(loggedUser.bookmarked_articles));
    if (loggedUser.joined_challenges) localStorage.setItem('ecochat_joined_challenges', JSON.stringify(loggedUser.joined_challenges));
    if (loggedUser.saved_resources) localStorage.setItem('ecochat_saved_resources', JSON.stringify(loggedUser.saved_resources));
    if (loggedUser.habits) localStorage.setItem('ecochat_habits', JSON.stringify(loggedUser.habits));

    if (pendingAction) {
      pendingAction();
      setPendingAction(null);
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('ecochat_user');
    localStorage.removeItem('ecochat_saved_tips');
    localStorage.removeItem('ecochat_bookmarked_articles');
    localStorage.removeItem('ecochat_joined_challenges');
    localStorage.removeItem('ecochat_saved_resources');
    localStorage.removeItem('ecochat_habits');
    
    // Clear chat history and active session from storage
    localStorage.removeItem('ecochat_history');
    sessionStorage.removeItem('ecochat_session_active');
    sessionStorage.removeItem('ecochat_active_session_id');

    // Reset chat states to a clean Welcome session
    const cleanSessionId = Date.now();
    const cleanSession = {
      id: cleanSessionId,
      title: 'New Chat',
      messages: [
        { role: 'ai', text: "Hi, I'm your EcoChat assistant. Ask me about energy, waste, transport, or anything climate-related — or try one of the prompts below.", sources: [] }
      ]
    };
    setChatSessions([cleanSession]);
    setActiveSessionId(cleanSessionId);
  };

  async function syncWithBackend(updatedFields = {}) {
    if (!user) return;

    const saved_tips = updatedFields.saved_tips ?? JSON.parse(localStorage.getItem('ecochat_saved_tips') || '[]');
    const bookmarked_articles = updatedFields.bookmarked_articles ?? JSON.parse(localStorage.getItem('ecochat_bookmarked_articles') || '[]');
    const joined_challenges = updatedFields.joined_challenges ?? JSON.parse(localStorage.getItem('ecochat_joined_challenges') || '[]');
    const saved_resources = updatedFields.saved_resources ?? JSON.parse(localStorage.getItem('ecochat_saved_resources') || '[]');
    const habits = updatedFields.habits ?? JSON.parse(localStorage.getItem('ecochat_habits') || '[]');

    try {
      await fetch(`${API_URL}/auth/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          saved_tips,
          bookmarked_articles,
          joined_challenges,
          saved_resources,
          habits
        })
      });
    } catch (err) {
      console.error("Failed to sync with backend:", err);
    }
  }

  // Chat Sessions and active ID (ChatGPT/Claude/Gemini style)
  const [chatSessions, setChatSessions] = useState(() => {
    const stored = localStorage.getItem('ecochat_history');
    let parsedHistory = [];
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          if (typeof parsed[0] === 'object' && parsed[0].id) {
            parsedHistory = parsed;
          } else if (typeof parsed[0] === 'string') {
            parsedHistory = parsed.map((title, idx) => ({
              id: Date.now() - idx * 1000,
              title: title,
              messages: [
                { role: 'ai', text: `Hi! This is your saved chat: ${title}. Ask me anything!`, sources: [] }
              ]
            }));
          }
        }
      } catch (e) {}
    }

    if (parsedHistory.length === 0) {
      parsedHistory = [
        {
          id: Date.now(),
          title: 'New Chat',
          messages: [
            { role: 'ai', text: "Hi, I'm your EcoChat assistant. Ask me about energy, waste, transport, or anything climate-related — or try one of the prompts below.", sources: [] }
          ]
        }
      ];
    }

    // Open a new chat session when the browser/tab is reopened (new session)
    const sessionActive = sessionStorage.getItem('ecochat_session_active');
    if (!sessionActive) {
      sessionStorage.setItem('ecochat_session_active', 'true');
      const mostRecent = parsedHistory[0];
      const isBlankNewChat = mostRecent && mostRecent.title === 'New Chat' && mostRecent.messages.length === 1;
      
      if (!isBlankNewChat) {
        const newSession = {
          id: Date.now(),
          title: 'New Chat',
          messages: [
            { role: 'ai', text: "Hi, I'm your EcoChat assistant. Ask me about energy, waste, transport, or anything climate-related — or try one of the prompts below.", sources: [] }
          ]
        };
        parsedHistory = [newSession, ...parsedHistory];
        localStorage.setItem('ecochat_history', JSON.stringify(parsedHistory));
      }
    }

    return parsedHistory;
  });

  const [activeSessionId, setActiveSessionId] = useState(() => {
    const storedActive = sessionStorage.getItem('ecochat_active_session_id');
    if (storedActive) {
      return Number(storedActive);
    }
    const defaultActive = chatSessions[0]?.id || Date.now();
    sessionStorage.setItem('ecochat_active_session_id', String(defaultActive));
    return defaultActive;
  });

  useEffect(() => {
    sessionStorage.setItem('ecochat_active_session_id', String(activeSessionId));
  }, [activeSessionId]);
  
  const [chatInput, setChatInput] = useState('');
  const [chatTyping, setChatTyping] = useState(false);

  const activeSession = chatSessions.find(s => s.id === activeSessionId) || chatSessions[0] || { messages: [] };
  const chatMessages = activeSession.messages;

  // New Chat handler
  const handleNewChat = () => {
    const newSessionId = Date.now();
    const newSession = {
      id: newSessionId,
      title: 'New Chat',
      messages: [
        { role: 'ai', text: "Hi, I'm your EcoChat assistant. Ask me about energy, waste, transport, or anything climate-related — or try one of the prompts below.", sources: [] }
      ]
    };
    setChatSessions((prev) => {
      const updated = [newSession, ...prev];
      localStorage.setItem('ecochat_history', JSON.stringify(updated));
      return updated;
    });
    setActiveSessionId(newSessionId);
  };

  // Rename Chat handler
  const handleRenameChat = (id, newTitle) => {
    setChatSessions((prev) => {
      const updated = prev.map((s) => (s.id === id ? { ...s, title: newTitle } : s));
      localStorage.setItem('ecochat_history', JSON.stringify(updated));
      return updated;
    });
  };

  // Delete Chat handler
  const handleDeleteChat = (id) => {
    setChatSessions((prev) => {
      let updated = prev.filter((s) => s.id !== id);
      if (updated.length === 0) {
        const newSessionId = Date.now();
        updated = [
          {
            id: newSessionId,
            title: 'New Chat',
            messages: [
              { role: 'ai', text: "Hi, I'm your EcoChat assistant. Ask me about energy, waste, transport, or anything climate-related — or try one of the prompts below.", sources: [] }
            ]
          }
        ];
      }
      localStorage.setItem('ecochat_history', JSON.stringify(updated));
      if (activeSessionId === id) {
        setActiveSessionId(updated[0].id);
      }
      return updated;
    });
  };

  // Calculator States (Requirement 4) - Using sessionStorage so it resets on window close
  const [calcStep, setCalcStep] = useState(0);
  const [calcDone, setCalcDone] = useState(() => {
    const stored = sessionStorage.getItem('ecochat_calculator');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        return parsed.done ?? false;
      } catch (e) {
        return false;
      }
    }
    return false;
  });
  const [calcData, setCalcData] = useState(() => {
    const stored = sessionStorage.getItem('ecochat_calculator');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        return parsed.data ?? defaultCalcData;
      } catch (e) {
        return defaultCalcData;
      }
    }
    return defaultCalcData;
  });

  // Persist Calculator state (Requirement 4)
  useEffect(() => {
    sessionStorage.setItem('ecochat_calculator', JSON.stringify({ done: calcDone, data: calcData }));
  }, [calcDone, calcData]);

  // Send function lifted & modified for sessions
  async function sendChat(text) {
    const t = text ?? chatInput;
    if (!t.trim()) return;

    setChatSessions((prevSessions) => {
      const nextSessions = prevSessions.map((session) => {
        if (session.id !== activeSessionId) return session;
        const newMessages = [...session.messages, { role: 'user', text: t }];
        const isFirstUserMessage = session.title === 'New Chat' || session.messages.length <= 1;
        const title = isFirstUserMessage ? t.split(/\s+/).filter(Boolean).slice(0, 6).join(' ') : session.title;
        return {
          ...session,
          title,
          messages: newMessages
        };
      });
      localStorage.setItem('ecochat_history', JSON.stringify(nextSessions));
      return nextSessions;
    });

    setChatInput('');
    setChatTyping(true);

    try {
      const res = await fetch(`${API_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: t }),
      });
      const data = await res.json();
      setChatTyping(false);

      setChatSessions((prevSessions) => {
        const nextSessions = prevSessions.map((session) => {
          if (session.id !== activeSessionId) return session;
          return {
            ...session,
            messages: [...session.messages, {
              role: 'ai',
              text: data.response,
              sources: data.match_found && data.source
                ? [`EcoChat Verified Knowledge Base: ${data.source}`]
                : data.match_found
                  ? ['EcoChat Verified Knowledge Base']
                  : [],
            }]
          };
        });
        localStorage.setItem('ecochat_history', JSON.stringify(nextSessions));
        return nextSessions;
      });
    } catch (err) {
      setChatTyping(false);

      setChatSessions((prevSessions) => {
        const nextSessions = prevSessions.map((session) => {
          if (session.id !== activeSessionId) return session;
          return {
            ...session,
            messages: [...session.messages, {
              role: 'ai',
              text: 'Sorry, I could not connect to the EcoChat server. Please try again.',
              sources: [],
            }]
          };
        });
        localStorage.setItem('ecochat_history', JSON.stringify(nextSessions));
        return nextSessions;
      });
    }
  }

  return (
    <div className="eco-root">
      <style>{css}</style>
      <Nav page={page} setPage={setPage} user={user} onLoginClick={() => setShowAuthModal(true)} onLogout={handleLogout} />
      {page === 'landing' && <Landing setPage={setPage} />}
      {page === 'chat' && (
        <Chat
          messages={chatMessages}
          input={chatInput}
          setInput={setChatInput}
          typing={chatTyping}
          send={sendChat}
          sessions={chatSessions}
          activeSessionId={activeSessionId}
          setActiveSessionId={setActiveSessionId}
          onNewChat={handleNewChat}
          onRenameChat={handleRenameChat}
          onDeleteChat={handleDeleteChat}
        />
      )}
      {page === 'calculator' && (
        <Calculator
          step={calcStep}
          setStep={setCalcStep}
          done={calcDone}
          setDone={setCalcDone}
          data={calcData}
          setData={setCalcData}
        />
      )}
      {page === 'tips' && <EcoTips user={user} onRequireAuth={handleRequireAuth} syncWithBackend={syncWithBackend} />}
      {page === 'tracker' && <HabitTracker user={user} onRequireAuth={handleRequireAuth} syncWithBackend={syncWithBackend} />}
      {page === 'learn' && <LearningHub user={user} onRequireAuth={handleRequireAuth} syncWithBackend={syncWithBackend} />}
      {page === 'challenges' && <Challenges user={user} onRequireAuth={handleRequireAuth} syncWithBackend={syncWithBackend} />}
      {page === 'nearby' && <NearbyResources user={user} onRequireAuth={handleRequireAuth} syncWithBackend={syncWithBackend} />}
      {showAuthModal && (
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => { setShowAuthModal(false); setPendingAction(null); }}
          onAuthSuccess={handleAuthSuccess}
        />
      )}
    </div>
  );
}
