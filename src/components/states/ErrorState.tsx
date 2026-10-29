export interface ErrorStateProps {
  message: string;
  onRetry: () => void;
}

export default function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div
      role="alert"
      className="flex flex-col items-start gap-3 rounded-xl border border-rose-300/20 bg-rose-300/5 p-4 text-slate-100 shadow-glass backdrop-blur-md sm:flex-row sm:items-center sm:justify-between"
    >
      <p className="text-sm">{message}</p>
      <button
        type="button"
        onClick={() => onRetry()}
        className="rounded-lg border border-accent-400/40 bg-accent-500 px-4 py-2 text-sm font-semibold text-night-900 transition-colors hover:bg-accent-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400 focus-visible:ring-offset-2 focus-visible:ring-offset-night-900"
      >
        Tentar novamente
      </button>
    </div>
  );
}
