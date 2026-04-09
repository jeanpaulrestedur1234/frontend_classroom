interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export default function Card({ children, className = '', hover = false }: CardProps) {
  return (
    <div className={`
      bg-surface-50/50 backdrop-blur-xl
      border border-surface-200 rounded-2xl p-6
      shadow-sm
      ${hover ? 'transition-all duration-200 hover:border-surface-300 hover:bg-surface-100/50 hover:shadow-md' : ''}
      ${className}
    `}>
      {children}
    </div>
  );
}
