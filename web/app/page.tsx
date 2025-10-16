export default function Page() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold">Welcome to MeditateNow</h1>
      <div className="grid gap-4">
        <div className="p-4 rounded-lg bg-white/5">
          <h2 className="text-xl font-medium">Your Journey</h2>
          <p>Sessions: 0 • Hours: 0 • Streak: 0</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <a className="p-4 rounded-lg bg-blue-600 text-white text-center" href="/meditate/feel-sahaj">I Feel Sahaj</a>
          <a className="p-4 rounded-lg bg-emerald-600 text-white text-center" href="/meditate/new">New Meditation</a>
          <a className="p-4 rounded-lg bg-purple-600 text-white text-center" href="/community">Community</a>
          <a className="p-4 rounded-lg bg-rose-600 text-white text-center" href="/history">History</a>
        </div>
      </div>
    </div>
  );
}
