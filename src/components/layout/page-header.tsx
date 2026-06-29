interface PageHeaderProps {
  title: string;
  description?: string;
  eyebrow?: string;
  action?: React.ReactNode;
}

export function PageHeader({ eyebrow, title, description, action }: PageHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0 space-y-1">
        {eyebrow ? (
          <p className="text-xs font-medium uppercase tracking-wider text-dark-red">{eyebrow}</p>
        ) : null}
        <h1 className="text-2xl font-semibold tracking-tight text-maroon">{title}</h1>
        {description ? (
          <p className="text-sm leading-relaxed text-muted">{description}</p>
        ) : null}
      </div>
      {action ? <div className="shrink-0 pt-1">{action}</div> : null}
    </div>
  );
}
