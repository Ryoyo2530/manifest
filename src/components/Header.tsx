import { Link, NavLink } from 'react-router-dom'

export function Header({ showAccount = true }: { showAccount?: boolean }) {
  return (
    <header className="relative z-10 flex items-center justify-between px-6 py-5 md:px-10">
      <Link to="/" className="font-serif text-2xl italic tracking-wide text-plum">
        Manifest
      </Link>
      <nav className="flex items-center gap-6 text-sm">
        <NavLink
          to="/manifest"
          className={({ isActive }) => (isActive ? 'text-plum' : 'text-ink/70 hover:text-plum')}
        >
          My Manifest
        </NavLink>
        {showAccount && (
          <NavLink
            to="/account"
            className={({ isActive }) => (isActive ? 'text-plum' : 'text-ink/70 hover:text-plum')}
          >
            Account
          </NavLink>
        )}
      </nav>
    </header>
  )
}
