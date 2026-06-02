export default function Loading({ text = 'Memuat data...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="relative">
        <div className="w-12 h-12 rounded-full border-4 border-dark-700 border-t-primary-500 animate-spin" />
        <div className="absolute inset-0 w-12 h-12 rounded-full border-4 border-transparent border-b-primary-400 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
      </div>
      <p className="mt-4 text-sm text-dark-400">{text}</p>
    </div>
  );
}
