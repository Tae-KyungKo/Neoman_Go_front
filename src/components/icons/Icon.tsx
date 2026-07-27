import type { SVGAttributes } from 'react';
import icons from './icon-data';

export type IconName = keyof typeof icons;

interface IconProps extends SVGAttributes<SVGSVGElement> {
  name: IconName;
  size?: number;
}

export function Icon({ name, size = 20, ...rest }: IconProps) {
  const entry = icons[name];
  if (!entry) return null;
  return (
    <svg
      width={size}
      height={size}
      viewBox={entry.viewBox}
      fill="none"
      dangerouslySetInnerHTML={{ __html: entry.body }}
      {...rest}
    />
  );
}

export default Icon;
