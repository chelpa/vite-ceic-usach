export default function PageIntro({ title, subtitle, wide }) {
  return (
    <>
      <h1 className="text-4xl">{title}</h1>
      {subtitle ? (
        <p className={"mt-3 text-muted-foreground " + (wide ? "max-w-2xl" : "max-w-xl")}>
          {subtitle}
        </p>
      ) : null}
    </>
  );
}
