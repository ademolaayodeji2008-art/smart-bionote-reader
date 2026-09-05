import { Search } from "lucide-react";

/** Search input with a leading icon. Purely presentational in this phase. */
const SearchBar = ({ placeholder = "Search...", value, onChange, className = "", ...rest }) => {
  return (
    <div className={`relative ${className}`}>
      <Search
        className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted"
        aria-hidden="true"
      />
      <input
        type="search"
        role="searchbox"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        aria-label={placeholder}
        className="w-full rounded-xl border border-border bg-surface py-2.5 pl-10 pr-4 text-body text-text-strong
          placeholder:text-text-muted transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-primary/40"
        {...rest}
      />
    </div>
  );
};

export default SearchBar;
