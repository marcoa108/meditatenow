export default function Community() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Community</h1>
      <div className="grid md:grid-cols-3 gap-4">
        <section className="p-4 rounded border border-white/10 space-y-2">
          <h2 className="font-semibold">Latest</h2>
          <p className="text-sm opacity-70">Recent meditations and activities from everyone.</p>
          <ul className="text-sm opacity-80 list-disc pl-5 space-y-1">
            <li>Coming soon</li>
          </ul>
        </section>
        <section className="p-4 rounded border border-white/10 space-y-2">
          <h2 className="font-semibold">Best</h2>
          <p className="text-sm opacity-70">Curated sequences and most helpful practices.</p>
          <ul className="text-sm opacity-80 list-disc pl-5 space-y-1">
            <li>Coming soon</li>
          </ul>
        </section>
        <section className="p-4 rounded border border-white/10 space-y-2">
          <h2 className="font-semibold">Friends</h2>
          <p className="text-sm opacity-70">See what your friends have been practicing.</p>
          <ul className="text-sm opacity-80 list-disc pl-5 space-y-1">
            <li>Coming soon</li>
          </ul>
        </section>
      </div>
    </div>
  );
}
