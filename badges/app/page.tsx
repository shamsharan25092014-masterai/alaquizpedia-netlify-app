// app/page.tsx
import Image from "next/image";

export default function Home() {
  const badges = [
    { id: 1, name: "Champion", img: "/badge1.png" },
    { id: 2, name: "Explorer", img: "/badge2.png" },
    { id: 3, name: "Innovator", img: "/badge3.png" },
  ];
  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-4xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
        Badge Catalog
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 w-full max-w-5xl">
        {badges.map((b) => (
          <div
            key={b.id}
            className="bg-glass backdrop-blur-sm rounded-xl p-4 flex flex-col items-center hover:scale-105 transition-transform"
          >
            <Image src={b.img} alt={b.name} width={120} height={120} className="rounded-md" />
            <p className="mt-2 text-lg font-medium">{b.name}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
