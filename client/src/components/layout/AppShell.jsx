export default function AppShell({ children }) {
  return (
    <div className="min-h-screen bg-scout-bg flex flex-col">
      <main className="flex-1 pt-16">
        {children}
      </main>
    </div>
  )
}
