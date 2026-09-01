export default function PageShell({ wide, children }) {
  return (
    <div className={"mx-auto px-5 py-14 " + (wide ? "max-w-5xl" : "max-w-3xl")}>
      {children}
    </div>
  );
}
