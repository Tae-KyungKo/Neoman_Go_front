import { Link } from 'react-router-dom';
import './Footer.css';

export function Footer() {
  return (
    <footer className="nm-footer">
      <div>
        <div className="nm-footer__brand">너만고</div>
        <div className="nm-footer__tagline">게임과 스포츠, 함께할 팀원을 찾는 가장 빠른 방법</div>
      </div>
      <div className="nm-footer__links">
        <Link to="/notices">공지사항</Link>
        <span className="nm-footer__copy">© 2026 너만고</span>
      </div>
    </footer>
  );
}

export default Footer;
