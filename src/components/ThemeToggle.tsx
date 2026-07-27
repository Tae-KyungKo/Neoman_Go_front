import { useTheme } from '../context/ThemeContext';
import Icon from './icons/Icon';
import './ThemeToggle.css';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      className="nm-theme-toggle"
      onClick={toggleTheme}
      aria-label={theme === 'dark' ? '라이트 모드로 전환' : '다크 모드로 전환'}
    >
      <Icon name={theme === 'dark' ? 'Sun' : 'Moon'} size={18} />
    </button>
  );
}

export default ThemeToggle;
