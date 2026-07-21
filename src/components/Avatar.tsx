import Icon from './icons/Icon';

interface AvatarProps {
  size?: number;
}

export function Avatar({ size = 40 }: AvatarProps) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: 'var(--fill-normal)',
        color: 'var(--label-alternative-2)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      <Icon name="Person" size={Math.round(size * 0.55)} />
    </div>
  );
}

export default Avatar;
