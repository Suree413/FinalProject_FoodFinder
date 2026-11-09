function Loading({ message = "กำลังโหลด..." }) {
  return (
    <p className="status-message" role="status" aria-live="polite">
      {message}
    </p>
  );
}

export default Loading;
