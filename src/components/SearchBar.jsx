function SearchBar({
  children,
  className,
  extraActions,
  loading = false,
  onSubmit,
  submitLabel = "ค้นหา",
}) {
  return (
    <form className={className} onSubmit={onSubmit}>
      {children}
      <div className="search-actions">
        <button type="submit" disabled={loading}>
          {loading ? "กำลังค้นหา..." : submitLabel}
        </button>
        {extraActions}
      </div>
    </form>
  );
}

export default SearchBar;
