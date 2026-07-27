import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../components/MainLayout';
import Button from '../components/Button';
import Icon from '../components/icons/Icon';
import { CATEGORIES } from '../data/categories';
import lolImg from '../assets/categories/lol.jpeg';
import valorantImg from '../assets/categories/valorant.jpeg';
import pubgImg from '../assets/categories/pubg.jpeg';
import fifaImg from '../assets/categories/fifa.jpeg';
import soccerImg from '../assets/categories/soccer.jpg';
import basketballImg from '../assets/categories/basketball.jpeg';
import './HomePage.css';

const CATEGORY_IMAGES: Record<string, string> = {
  lol: lolImg,
  valorant: valorantImg,
  pubg: pubgImg,
  fifa: fifaImg,
  soccer: soccerImg,
  basketball: basketballImg,
};

export function HomePage() {
  const navigate = useNavigate();
  const [centerIndex, setCenterIndex] = useState(0);
  const dragRef = useRef({ startX: 0, active: false });
  const n = CATEGORIES.length;

  const go = (dir: number) => setCenterIndex((i) => (i + dir + n) % n);

  const onPointerDown = (e: React.PointerEvent) => {
    dragRef.current = { startX: e.clientX, active: true };
  };
  const onPointerUp = (e: React.PointerEvent) => {
    if (!dragRef.current.active) return;
    const dx = e.clientX - dragRef.current.startX;
    dragRef.current.active = false;
    if (dx > 60) go(-1);
    else if (dx < -60) go(1);
  };

  return (
    <MainLayout active="카테고리">
      <div className="nm-home-hero">
        <span className="nm-home-hero__eyebrow">GAME &amp; SPORTS MATCHING</span>
        <h1 className="nm-home-hero__title">오늘 바로, 팀원을 찾아보세요</h1>
        <p className="nm-home-hero__desc">좋아하는 종목을 고르고 실력과 시간이 맞는 팀에 바로 신청하세요.</p>
      </div>

      <div className="nm-category-section">
        <h2 className="nm-category-section__title">카테고리를 선택하세요</h2>
        <p className="nm-category-section__subtitle">나와 맞는 팀원들을 찾아보세요!</p>

        <div className="nm-carousel">
          <div className="nm-carousel-arrow" onClick={() => go(-1)} aria-label="이전 카테고리">
            <Icon name="ChevronLeft" size={20} />
          </div>
          <div className="nm-carousel-viewport" onPointerDown={onPointerDown} onPointerUp={onPointerUp}>
            {CATEGORIES.map((c, i) => {
              let delta = i - centerIndex;
              if (delta > n / 2) delta -= n;
              if (delta < -n / 2) delta += n;
              const abs = Math.abs(delta);
              const scale = abs === 0 ? 1 : abs === 1 ? 0.76 : 0.6;
              const x = delta * 220;
              const opacity = abs <= 1 ? 1 : 0;

              return (
                <div
                  key={c.id}
                  className="nm-carousel-card"
                  style={{
                    transform: `translate(-50%, -50%) translateX(${x}px) scale(${scale})`,
                    opacity,
                    zIndex: 10 - abs,
                    pointerEvents: abs > 1 ? 'none' : 'auto',
                    cursor: abs === 0 ? 'default' : 'pointer',
                  }}
                  onClick={() => abs !== 0 && setCenterIndex(i)}
                >
                  <div className="nm-carousel-card__art">
                    <img src={CATEGORY_IMAGES[c.id]} alt={c.ko} />
                  </div>
                  {delta === 0 ? (
                    <div className="nm-carousel-card__caption">
                      <Button
                        label="카테고리 이동"
                        variant="solid"
                        color="primary"
                        size="md"
                        fullWidth
                        onClick={() => navigate(`/categories/${c.id}`)}
                      />
                    </div>
                  ) : (
                    <div className="nm-carousel-card__caption">
                      <div className="nm-carousel-card__caption-name">{c.ko}</div>
                      <div className="nm-carousel-card__caption-en">{c.en}</div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <div className="nm-carousel-arrow" onClick={() => go(1)} aria-label="다음 카테고리">
            <Icon name="ChevronRight" size={20} />
          </div>
        </div>

        <div className="nm-carousel-dots">
          {CATEGORIES.map((c, i) => (
            <div
              key={c.id}
              className={'nm-carousel-dot' + (i === centerIndex ? ' nm-carousel-dot--active' : '')}
              onClick={() => setCenterIndex(i)}
            />
          ))}
        </div>
      </div>
    </MainLayout>
  );
}

export default HomePage;
