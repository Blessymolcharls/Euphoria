import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MdLibraryMusic, MdHome } from 'react-icons/md';
import styles from './Navbar.module.css';

export default function Navbar() {
  const { pathname } = useLocation();

  const navItems = [
    { to: '/', label: 'Home', icon: <MdHome size={20} /> },
    { to: '/library', label: 'Library', icon: <MdLibraryMusic size={20} /> },
  ];

  return (
    <nav className={styles.nav}>
      <Link to="/" className={styles.logo}>
        <span className="gradient-text">Euphoria</span>
      </Link>
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
