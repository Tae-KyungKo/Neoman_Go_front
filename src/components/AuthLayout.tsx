import { Link } from 'react-router-dom';
import type { ReactNode } from 'react';
import ThemeToggle from './ThemeToggle';
import './AuthLayout.css';

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="nm-auth-layout">
      <div className="nm-auth-layout__topbar">
        <Link to="/" className="nm-auth-layout__logo">
          너만고
        </Link>
        <ThemeToggle />
      </div>
      <div className="nm-auth-layout__content">{children}</div>
    </div>
  );
}

export default AuthLayout;
