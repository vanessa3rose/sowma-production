export default function SoftCard({
  children,
  className = "",
  style = {},
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={className}
      style={{
        backgroundColor: "#ffffff",
        borderRadius: "18px",
        padding: "20px",
        boxShadow: "0 22px 44px rgba(0,0,0,0.08), 0 8px 16px rgba(0,0,0,0.06)",
        border: "1px solid rgba(148,163,184,0.18)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}
