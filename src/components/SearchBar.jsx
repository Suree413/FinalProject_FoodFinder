function SearchBar({
  children,
  className,
  extraActions,
  loading = false,
  onSubmit,
  submitLabel = "Search",
}) {
  return (
    <form className={className} onSubmit={onSubmit}>
      {children}
      <div className="search-actions">
        <button type="submit" disabled={loading}>
          {loading ? "Searching..." : submitLabel}
        </button>
        {extraActions}
      </div>
    </form>
  );
}

export default SearchBar;
