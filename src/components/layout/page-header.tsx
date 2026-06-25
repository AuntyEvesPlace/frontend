interface PageHeaderProps {
  eyebrow: string;
  title: string;
  action?: React.ReactNode;
}

export function PageHeader({ eyebrow, title, action }: PageHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0 space-y-1">
        <p className="text-xs font-medium uppercase tracking-wider text-dark-red">{eyebrow}</p>
        <h1 className="text-2xl font-semibold tracking-tight text-maroon">{title}</h1>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
