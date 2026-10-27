"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main className="error-page">
      <div className="error-panel">
        <p className="eyebrow">A MOMENTARY PAUSE</p>
        <h1>Something didn’t go as planned.</h1>
        <p>Please try again. Your saved records are kept in the database.</p>
        <button className="button" onClick={reset}>
          Try again
        </button>
        <a href="/">Back to home</a>
      </div>
    </main>
  );
}
