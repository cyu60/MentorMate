export function HackathonHeader({ name }: { name: string }) {
  return (
    <div className="bg-gradient-to-r from-[#003B4A] to-[#001E2F] text-white py-16">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-center">{name}</h1>
      </div>
    </div>
  );
}
