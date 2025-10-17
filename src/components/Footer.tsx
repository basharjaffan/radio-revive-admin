export default function Footer() {
  const version = process.env.NEXT_PUBLIC_BUILD_DATE || new Date().toISOString().split('T')[0];
  
  return (
    <div className="fixed bottom-2 right-4 text-xs text-gray-400">
      v{version}
    </div>
  );
}
