import { useState } from 'react';
import type { MouseEvent } from 'react';
import type { TransformType } from '../engine/types';
import { transformTitles } from '../utils/format';

interface Ripple {
  id: number;
  x: number;
  y: number;
  size: number;
}

interface TransformButtonProps {
  transform: TransformType;
  disabled?: boolean;
  onClick: (transform: TransformType) => void;
}

const TransformButton = ({ transform, disabled, onClick }: TransformButtonProps): JSX.Element => {
  const [ripples, setRipples] = useState<Ripple[]>([]);

  const handleClick = (event: MouseEvent<HTMLButtonElement>): void => {
    if (disabled) {
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const nextRipple: Ripple = {
      id: Date.now(),
      x: event.clientX - rect.left - size / 2,
      y: event.clientY - rect.top - size / 2,
      size
    };

    setRipples((current) => [...current, nextRipple]);
    window.setTimeout(() => {
      setRipples((current) => current.filter((ripple) => ripple.id !== nextRipple.id));
    }, 620);

    onClick(transform);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      className="transform-button"
      aria-label={transformTitles[transform]}
    >
      <span className="relative z-10">{transformTitles[transform]}</span>
      {ripples.map((ripple) => (
        <span
          key={ripple.id}
          className="ripple"
          style={{
            left: `${ripple.x}px`,
            top: `${ripple.y}px`,
            width: `${ripple.size}px`,
            height: `${ripple.size}px`
          }}
        />
      ))}
    </button>
  );
};

export default TransformButton;
