function Loading({ message = "Cooking up something good..." }) {
  return (
    <p className="status-message" role="status" aria-live="polite">
      {message}
    </p>
  );
}

export default Loading;
