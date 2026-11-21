import { useState } from 'react';
import { STYLE_IMAGES, STYLE_IMAGE_SIZE, STYLE_TINT } from './styleMeta';

interface Props {
  styleId: string;
  className: string;
  eager?: boolean;
  /** View-transition name, when this photo is the one that travels between steps. */
  transitionName?: string;
}

/** A style photo that fades in over its average colour, so nothing pops. Decorative: the name is always in text beside it. */
export function Photo({ styleId, className, eager = false, transitionName }: Props) {
  const [loaded, setLoaded] = useState(false);
  return (
    <span className={`photo ${className}`} style={{ background: STYLE_TINT[styleId], viewTransitionName: transitionName }}>
      <img
        src={STYLE_IMAGES[styleId]}
        alt=""
        width={STYLE_IMAGE_SIZE}
        height={STYLE_IMAGE_SIZE}
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
        data-loaded={loaded}
        onLoad={() => setLoaded(true)}
        ref={(img) => { if (img?.complete && !loaded) setLoaded(true); }} // already in cache: no load event
      />
    </span>
  );
}
