import { Hammer } from "lucide-react";

export default function UnderConstruction({ title = "En construcción", children, icon: Extra, className = "" }) {
  return (
    <div className={"block-border flex flex-col items-center gap-3 bg-secondary p-10 text-center " + className}>
      <Hammer className="h-8 w-8 text-primary" aria-hidden="true" />
      <h2 className="text-lg">{title}</h2>
      <p className="max-w-md text-sm text-muted-foreground">{children}</p>
      {Extra ? <Extra className="h-5 w-5 text-muted-foreground" aria-hidden="true" /> : null}
    </div>
  );
}
