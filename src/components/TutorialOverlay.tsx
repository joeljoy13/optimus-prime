export interface TutorialStep {
  title: string;
  description: string;
}

interface HighlightBox {
  top: number;
  left: number;
  width: number;
  height: number;
}

interface TutorialOverlayProps {
  open: boolean;
  step: TutorialStep;
  stepIndex: number;
  totalSteps: number;
  highlight: HighlightBox | null;
  onNext: () => void;
  onBack: () => void;
  onExit: () => void;
}

const TutorialOverlay = ({
  open,
  step,
  stepIndex,
  totalSteps,
  highlight,
  onNext,
  onBack,
  onExit
}: TutorialOverlayProps): JSX.Element | null => {
  if (!open) {
    return null;
  }

  return (
    <div className="tutorial-overlay" role="dialog" aria-modal="true" aria-label="Tutorial Mode">
      {highlight ? (
        <div
          className="tutorial-highlight"
          style={{
            top: `${highlight.top}px`,
            left: `${highlight.left}px`,
            width: `${highlight.width}px`,
            height: `${highlight.height}px`
          }}
        />
      ) : null}

      <section className="tutorial-card">
        <p className="tutorial-kicker">
          Tutorial Mode {stepIndex + 1}/{totalSteps}
        </p>
        <h3 className="tutorial-title">{step.title}</h3>
        <p className="tutorial-copy">{step.description}</p>
        <div className="flex flex-wrap gap-2 pt-2">
          <button type="button" className="secondary-button" onClick={onBack} disabled={stepIndex === 0}>
            Back
          </button>
          <button type="button" className="secondary-button" onClick={onNext}>
            {stepIndex === totalSteps - 1 ? 'Finish' : 'Next'}
          </button>
          <button type="button" className="danger-button" onClick={onExit}>
            Exit
          </button>
        </div>
      </section>
    </div>
  );
};

export default TutorialOverlay;
