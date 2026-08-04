import Link from "next/link";
import styles from "./NavBar.module.css";

export default function NavBar() {
  return (
    <nav className={styles.navbar}>
      <ul className={styles.navList}>
        <li><Link href="/">Home</Link></li>
        <li><Link href="/badges">Badges</Link></li>
        <li><Link href="/achievements">Achievements</Link></li>
        <li><Link href="/admin">Admin</Link></li>
      </ul>
    </nav>
  );
}
