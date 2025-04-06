export function HackathonHeader({ name }: { name: string }) {
  return (
    <div className="bg-blue-950 text-white py-16 relative">
      <div className="container mx-auto px-4 mt-12">
        <h1 className="text-4xl font-bold text-center relative">{name}</h1>
      </div>
    </div>
  );
}
