import type { PropsWithChildren } from 'react';

interface GlassPanelProps extends PropsWithChildren {
  className?: string;
}

const GlassPanel = ({ children, className }: GlassPanelProps): JSX.Element => (
  <section className={`glass-panel ${className ?? ''}`.trim()}>{children}</section>
);

export default GlassPanel;
