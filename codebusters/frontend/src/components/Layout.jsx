import { useState, useEffect, useRef } from 'react';
import { Outlet, NavLink, useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import ThemeSwitcher from './ThemeSwitcher';

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => { setMenuOpen(false); }, [location]);
  useEffect(() => {
    const handler = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <style>{`
        .nav-desktop { display: flex; }
        .nav-mobile { display: none; }
        @media (max-width: 600px) {
          .nav-desktop { display: none; }
          .nav-mobile { display: flex; }
        }
      `}</style>

      <nav style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 20px', height: 52,
        borderBottom: '1px solid var(--border)',
        background: 'var(--bg)',
        position: 'sticky', top: 0, zIndex: 100,
      }}>
        <NavLink to="/" style={{ display: 'flex', alignItems: 'center', gap: 7, textDecoration: 'none' }}>
          <XiMark />
          <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--accent)', letterSpacing: '0.04em', lineHeight: 1 }}>
            codebusters
          </span>
        </NavLink>

        {/* Desktop */}
        <div className="nav-desktop" style={{ alignItems: 'center', gap: 6 }}>
          {user ? (
            <>
              <NavItem to="/solve">solve</NavItem>
              <NavItem to="/dashboard">dashboard</NavItem>
              <NavItem to="/explorer">explorer</NavItem>
              <Divider />
              <ThemeSwitcher />
              <Divider />
              <span style={{ fontSize: 12, color: 'var(--text-3)', marginRight: 4 }}>{user.username}</span>
              <GhostBtn onClick={handleLogout}>logout</GhostBtn>
            </>
          ) : (
            <>
              <LockedItem label="solve" />
              <LockedItem label="dashboard" />
              <LockedItem label="explorer" />
              <Divider />
              <ThemeSwitcher />
              <Divider />
              <NavItem to="/login">login</NavItem>
              <AccentBtn to="/register">register</AccentBtn>
            </>
          )}
        </div>

        {/* Mobile */}
        <div className="nav-mobile" style={{ alignItems: 'center', gap: 10 }} ref={menuRef}>
          <ThemeSwitcher />
          <button
            onClick={() => setMenuOpen(o => !o)}
            style={{
              background: 'none', border: '1px solid var(--border)', borderRadius: 3,
              color: 'var(--text-2)', padding: '6px 10px', fontSize: 16, lineHeight: 1,
            }}
            aria-label="menu"
          >
            {menuOpen ? '✕' : '☰'}
          </button>

          {menuOpen && (
            <div style={{
              position: 'absolute', top: 52, right: 0, left: 0,
              background: 'var(--bg-2)', borderBottom: '1px solid var(--border)',
              display: 'flex', flexDirection: 'column', zIndex: 200, padding: '8px 0',
            }}>
              {user ? (
                <>
                  <div style={{ padding: '8px 20px 12px', borderBottom: '1px solid var(--border)', marginBottom: 6 }}>
                    <span style={{ fontSize: 12, color: 'var(--text-3)' }}>{user.username}</span>
                    <span style={{ fontSize: 11, color: 'var(--text-3)', marginLeft: 8 }}>· {user.school_name}</span>
                  </div>
                  <MobileNavItem to="/solve">solve</MobileNavItem>
                  <MobileNavItem to="/dashboard">dashboard</MobileNavItem>
                  <MobileNavItem to="/explorer">explorer</MobileNavItem>
                  <div style={{ borderTop: '1px solid var(--border)', marginTop: 6, padding: '8px 20px' }}>
                    <button onClick={handleLogout} style={{
                      background: 'none', border: 'none', color: 'var(--text-3)',
                      fontSize: 13, letterSpacing: '0.04em', padding: 0, cursor: 'pointer', fontFamily: 'var(--mono)',
                    }}>logout</button>
                  </div>
                </>
              ) : (
                <>
                  <MobileLockedItem label="solve" />
                  <MobileLockedItem label="dashboard" />
                  <MobileLockedItem label="explorer" />
                  <div style={{ borderTop: '1px solid var(--border)', marginTop: 6, padding: '8px 20px', display: 'flex', gap: 12 }}>
                    <Link to="/login" style={{ fontSize: 13, color: 'var(--text-2)', letterSpacing: '0.04em' }}>login</Link>
                    <Link to="/register" style={{ fontSize: 13, color: 'var(--accent)', fontWeight: 500, letterSpacing: '0.04em' }}>register →</Link>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </nav>

      <main style={{ flex: 1 }}><Outlet /></main>
    </div>
  );
}

const NavItem = ({ to, children }) => (
  <NavLink to={to} style={({ isActive }) => ({
    fontSize: 13, color: isActive ? 'var(--accent)' : 'var(--text-3)',
    padding: '6px 10px', borderRadius: 3, letterSpacing: '0.04em', transition: 'color 0.1s',
  })}>{children}</NavLink>
);

const MobileNavItem = ({ to, children }) => (
  <NavLink to={to} style={({ isActive }) => ({
    display: 'block', padding: '11px 20px', fontSize: 14,
    color: isActive ? 'var(--accent)' : 'var(--text-2)', letterSpacing: '0.04em',
    borderLeft: isActive ? '2px solid var(--accent)' : '2px solid transparent',
  })}>{children}</NavLink>
);

// Grey, not clickable, no emoji
const LockedItem = ({ label }) => (
  <span style={{
    fontSize: 13, color: 'var(--text-3)', padding: '6px 10px',
    letterSpacing: '0.04em', opacity: 0.4, cursor: 'default', userSelect: 'none',
  }}>{label}</span>
);

const MobileLockedItem = ({ label }) => (
  <span style={{
    display: 'block', padding: '11px 20px', fontSize: 14,
    color: 'var(--text-3)', letterSpacing: '0.04em', opacity: 0.4, userSelect: 'none',
  }}>{label}</span>
);

const GhostBtn = ({ onClick, children }) => (
  <button onClick={onClick} style={{
    background: 'none', border: '1px solid var(--border)', borderRadius: 3,
    color: 'var(--text-3)', fontSize: 11, padding: '4px 10px', letterSpacing: '0.06em',
  }}>{children}</button>
);

const AccentBtn = ({ to, children }) => (
  <Link to={to} style={{
    background: 'var(--accent)', color: 'var(--bg)', borderRadius: 3,
    padding: '5px 14px', fontSize: 12, fontWeight: 500, letterSpacing: '0.06em', marginLeft: 2,
  }}>{children}</Link>
);


// Xi (Ξ) logo mark — three horizontal bars inspired by the Greek capital letter
function XiMark({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" style={{ flexShrink: 0 }}>
      <rect x="6"  y="7"    width="20" height="3" rx="1" fill="var(--accent)" />
      <rect x="9"  y="14.5" width="14" height="3" rx="1" fill="var(--accent)" />
      <rect x="6"  y="22"   width="20" height="3" rx="1" fill="var(--accent)" />
    </svg>
  );
}
const Divider = () => (
  <div style={{ width: 1, height: 16, background: 'var(--border-2)', margin: '0 4px' }} />
);
