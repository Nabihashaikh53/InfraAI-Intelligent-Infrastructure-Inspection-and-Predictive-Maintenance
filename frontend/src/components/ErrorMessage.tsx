export default function ErrorMessage({
  message,
}: {
  message: string;
}) {
  return (
    <p
      style={{
        color: "var(--risk-critical)",
        fontSize: 14,
        padding: 12,
        border: "1px solid var(--risk-critical)",
        borderRadius: 4,
      }}
    >
      {message}
    </p>
  );
}