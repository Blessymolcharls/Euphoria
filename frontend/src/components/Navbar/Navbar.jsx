import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MdLibraryMusic, MdHome, MdInfoOutline, MdSearch } from 'react-icons/md';
import DotText from '../DotMatrix/DotText';
import DOT_PRESETS from '../DotMatrix/dotPresets';
import styles from './Navbar.module.css';

export default function Navbar() {
  const { pathname } = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';

  const navItems = [
    { to: '/', label: 'Home', icon: <MdHome size={18} /> },
    { to: '/library', label: 'Library', icon: <MdLibraryMusic size={18} /> },
    { to: '/about', label: 'About', icon: <MdInfoOutline size={18} /> },
  ];

  return (
    <nav className={styles.nav}>
      <Link to="/" className={styles.logo} aria-label="Euphoria home">
        <div className={styles.logoDot} />
        <DotText
          text="EUPHORIA"
          {...DOT_PRESETS.logo}
          animated={false}
          offOpacity={0.05}
          style={{ gap: '3px' }}
        />
      </Link>

      <div className={styles.searchContainer}>
        <span className={styles.searchIcon}><MdSearch size={14} /></span>
        <input 
          type="text" 
          className={styles.searchBox}
          placeholder="Search tracks or artists..."
          value={query}
          onChange={(e) => setSearchParams(e.target.value ? { q: e.target.value } : {})}
        />
      </div>

      <div className={styles.links}>
        {navItems.map(({ to, label, icon }) => (
          <Link key={to} to={to} className={`${styles.link} ${pathname === to ? styles.active : ''}`}>
            {icon}
            <span>{label}</span>
            {pathname === to && (
              <motion.div
                layoutId="nav-underline"
                className={styles.underline}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
          </Link>
        ))}
      </div>
    </nav>
  );
}
