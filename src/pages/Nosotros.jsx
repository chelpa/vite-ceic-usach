import PageShell from "../components/PageShell";
import miembros from "../data/nosotros.json";

function hashHue(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return h % 360;
}

function initials(name) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function Avatar({ name }) {
  const hue = hashHue(name);
  return (
    <div
      className="block-border flex aspect-square w-full items-center justify-center font-[family-name:var(--font-display)] text-3xl font-bold"
      style={{
        background: `hsl(${hue} 55% 88%)`,
        color: `hsl(${hue} 45% 28%)`,
      }}
      aria-hidden="true"
    >
      {initials(name)}
    </div>
  );
}

export default function Nosotros() {
  return (
    <PageShell wide>
      <h2 className="border-b border-foreground pb-3 text-2xl">Mesa directiva</h2>
      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {miembros.map((m) => (
          <div className="block-border bg-card p-6" key={m.nombre}>
            <Avatar name={m.nombre} />
            <span className="mt-4 block text-xs font-bold uppercase tracking-widest text-primary">
              {m.rol}
            </span>
            <h3 className="text-lg">{m.nombre}</h3>
            <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
              {m.funciones.map((f, i) => (
                <li className="flex gap-2" key={i}>
                  <span className="text-primary">·</span>
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </PageShell>
  );
}
