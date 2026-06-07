import { createContext, useContext, useState, useEffect } from 'react';

export const THEMES = [
  { id: 'obsidian',     label: 'obsidian',     bg: '#111111', bg2: '#191919', bg3: '#202020', border: '#2a2a2a', border2: '#333333', text: '#eeeeee', text2: '#aaaaaa', text3: '#444444', accent: '#eeeeee' },
  { id: 'ivory',        label: 'ivory',        bg: '#eeeeee', bg2: '#dddddd', bg3: '#d0d0d0', border: '#c4c4c4', border2: '#b2b2b2', text: '#444444', text2: '#666666', text3: '#b2b2b2', accent: '#444444' },
  { id: 'wisteria',     label: 'wisteria',     bg: '#fffbfe', bg2: '#ecdcee', bg3: '#e4d0e6', border: '#d8c4da', border2: '#c8b0ca', text: '#5c2954', text2: '#8a4a7a', text3: '#e094c2', accent: '#b94189' },
  { id: 'dawnwood',     label: 'dawnwood',     bg: '#fffaf3', bg2: '#f0e9df', bg3: '#e8e0d4', border: '#ddd4c4', border2: '#c8c0b0', text: '#286983', text2: '#4a8a9a', text3: '#c4a7e7', accent: '#56949f' },
  { id: 'glacier',      label: 'glacier',      bg: '#e8e9ec', bg2: '#ccceda', bg3: '#bec0ce', border: '#b0b3c4', border2: '#adb1c4', text: '#33374c', text2: '#4a4f6a', text3: '#adb1c4', accent: '#2d539e' },
  { id: 'skyberry',     label: 'skyberry',     bg: '#dae0f5', bg2: '#c1c7df', bg3: '#b4bcd8', border: '#a8b0cc', border2: '#92a4be', text: '#678198', text2: '#506477', text3: '#92a4be', accent: '#506477' },
  { id: 'velvet',       label: 'velvet',       bg: '#dadbdc', bg2: '#bec1d2', bg3: '#b0b3c6', border: '#a4a8bc', border2: '#9094b0', text: '#414141', text2: '#585858', text3: '#3846b1', accent: '#ae185e' },
  { id: 'metro light',  label: 'metro light',  bg: '#dbdbdb', bg2: '#e8e8e8', bg3: '#d0d0d0', border: '#c4c4c4', border2: '#b8b8b8', text: '#454545', text2: '#666666', text3: '#a3a2a2', accent: '#8fd1c3' },
  { id: 'skyline',      label: 'skyline',      bg: '#ced7e0', bg2: '#b7cada', bg3: '#aabdd0', border: '#9ab0c4', border2: '#7599b1', text: '#3b4c58', text2: '#506070', text3: '#7599b1', accent: '#81c4dd' },
  { id: 'windflower',   label: 'windflower',   bg: '#e8d5c4', bg2: '#f6e6da', bg3: '#edd8c8', border: '#dfc8b4', border2: '#d0b8a4', text: '#3a98b9', text2: '#5a7a8a', text3: '#3a98b9', accent: '#7d67a9' },
  { id: 'aqua paper',   label: 'aqua paper',   bg: '#afcbdd', bg2: '#9fc1d4', bg3: '#8eb8cc', border: '#7eacc0', border2: '#85a5bb', text: '#1a2633', text2: '#2a3a4a', text3: '#85a5bb', accent: '#fcfbf6' },
  { id: 'willow mist',  label: 'willow mist',  bg: '#7b9c98', bg2: '#72908d', bg3: '#688480', border: '#5e7874', border2: '#495755', text: '#eaf1f3', text2: '#c8dde0', text3: '#495755', accent: '#eaf1f3' },
  { id: 'horizon',      label: 'horizon',      bg: '#6c687f', bg2: '#77738c', border: '#6a667c', border2: '#9994b8', bg3: '#5e5a70', text: '#ffffff', text2: '#ddddee', text3: '#9994b8', accent: '#ffffff' },
  { id: 'cloudveil',    label: 'cloudveil',    bg: '#4a5b6e', bg2: '#425366', bg3: '#3a4b5e', border: '#324358', border2: '#2e3e52', text: '#f5efee', text2: '#d8cac8', text3: '#9ec1cc', accent: '#f8cdc6' },
  { id: 'flux',         label: 'flux',         bg: '#263238', bg2: '#2e3c43', bg3: '#364550', border: '#3a4e58', border2: '#4c6772', text: '#e6edf3', text2: '#b0c4d0', text3: '#4c6772', accent: '#80cbc4' },
  { id: 'sandrift',     label: 'sandrift',     bg: '#1a2b3e', bg2: '#152231', bg3: '#101c28', border: '#223048', border2: '#3a506c', text: '#c9c8bf', text2: '#a0a090', text3: '#3a506c', accent: '#af8f5c' },
  { id: 'bliss',        label: 'bliss',        bg: '#262727', bg2: '#343231', bg3: '#3e3c3a', border: '#484644', border2: '#665957', text: '#ffffff', text2: '#cccccc', text3: '#665957', accent: '#f0d3c9' },
  { id: 'frost',        label: 'frost',        bg: '#242425', bg2: '#303333', bg3: '#383c3c', border: '#424848', border2: '#505b5e', text: '#ccc2b1', text2: '#a09888', text3: '#505b5e', accent: '#2b5f6d' },
  { id: 'nocturne',     label: 'nocturne',     bg: '#0b0e13', bg2: '#141a24', bg3: '#1c2430', border: '#243040', border2: '#394760', text: '#9fadc6', text2: '#7080a0', text3: '#394760', accent: '#60759f' },
  { id: 'abyss',        label: 'abyss',        bg: '#00021b', bg2: '#18214c', bg3: '#20285a', border: '#2a3468', border2: '#3c4c79', text: '#ffffff', text2: '#aabbdd', text3: '#3c4c79', accent: '#e51376' },
];

function makeFaviconSvg(bg, accent) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
    <rect width="32" height="32" rx="5" fill="${bg}"/>
    <rect x="6"  y="7"    width="20" height="3" rx="1" fill="${accent}"/>
    <rect x="9"  y="14.5" width="14" height="3" rx="1" fill="${accent}"/>
    <rect x="6"  y="22"   width="20" height="3" rx="1" fill="${accent}"/>
  </svg>`;
}

function setFavicon(bg, accent) {
  const url = `data:image/svg+xml,${encodeURIComponent(makeFaviconSvg(bg, accent))}`;
  let link = document.querySelector("link[rel~='icon']");
  if (!link) { link = document.createElement('link'); link.rel = 'icon'; document.head.appendChild(link); }
  link.href = url;
}

function applyTheme(t) {
  const root = document.documentElement;
  root.setAttribute('data-theme', 'custom');
  const map = {
    '--bg': t.bg, '--bg-2': t.bg2, '--bg-3': t.bg3,
    '--border': t.border, '--border-2': t.border2,
    '--text': t.text, '--text-2': t.text2, '--text-3': t.text3,
    '--accent': t.accent,
    '--green': '#4ade80', '--yellow': '#fbbf24', '--red': '#f87171',
  };
  Object.entries(map).forEach(([k, v]) => root.style.setProperty(k, v));
  setFavicon(t.bg, t.accent);
}

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => localStorage.getItem('cb_theme') || 'obsidian');

  const setTheme = (id) => {
    setThemeState(id);
    localStorage.setItem('cb_theme', id);
  };

  useEffect(() => {
    const t = THEMES.find(x => x.id === theme) || THEMES[0];
    applyTheme(t);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, themes: THEMES }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
