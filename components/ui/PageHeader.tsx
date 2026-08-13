interface PageHeaderProps {
  section?: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
}

export default function PageHeader({
  section,
  title,
  description,
  actions,
}: PageHeaderProps) {
  return (
    <div className="border-b border-zinc-200 pb-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div className="space-y-1">
        {section && (
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-zinc-400">
            <span>{section}</span>
            <span>/</span>
            <span className="text-zinc-950 font-semibold">{title}</span>
          </div>
        )}
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-950">
          {title}
        </h1>
        {description && (
          <p className="text-sm text-zinc-500 max-w-2xl leading-relaxed">
            {description}
          </p>
        )}
      </div>
      {actions && <div className="flex items-center gap-3 shrink-0">{actions}</div>}
    </div>
  );
}
