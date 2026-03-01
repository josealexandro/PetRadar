export default function NovoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-[70vh] w-full">
      {children}
    </div>
  );
}
