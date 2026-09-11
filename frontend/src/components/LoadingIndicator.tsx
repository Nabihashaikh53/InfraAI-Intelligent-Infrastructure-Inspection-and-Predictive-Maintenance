export default function LoadingIndicator({
  label = "Loading…",
}: {
  label?: string;
}) {
  return (
    <p
      style={{
        color: "var(--color-ink-muted)",
        fontSize: 14,
      }}
    >
      {label}
    </p>
  );
}