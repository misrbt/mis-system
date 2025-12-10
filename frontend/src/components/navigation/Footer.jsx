function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 text-sm text-slate-500">
        <span>© {new Date().getFullYear()} MIS System</span>
        <span className="hidden sm:inline">Built with React, Tailwind, and Material Tailwind</span>
      </div>
    </footer>
  )
}

export default Footer
