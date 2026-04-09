interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export default function Card({ children, className = '', hover = false }: CardProps) {
  return (
    <div className={`
      bg-[var(--bg-surface)] backdrop-blur-xl
      border border-[var(--border-main)] rounded-2xl p-6
      shadow-sm transition-all duration-300
      ${hover ? 'hover:border-[var(--border-strong)] hover:bg-[var(--bg-surface-hover)] hover:shadow-md' : ''}
      ${className}
    `}>
      {children}
    </div>
  );
}
