interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export default function Card({ children, className = '', hover = false }: CardProps) {
  return (
    <div className={`
      bg-white/[0.03] backdrop-blur-xl
      border border-white/[0.08] rounded-2xl p-6
      ${hover ? 'transition-all duration-200 hover:border-white/[0.15] hover:bg-white/[0.05]' : ''}
      ${className}
    `}>
      {children}
    </div>
  );
}
