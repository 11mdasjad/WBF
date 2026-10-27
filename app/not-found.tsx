import { Brand, ButtonLink } from "@/components/site/shared";
export default function NotFound() {
  return (
    <main className="error-page">
      <div className="error-panel">
        <Brand light />
        <p className="eyebrow">404 · A SMALL DETOUR</p>
        <h1>
          Let’s find our way
          <br />
          back together.
        </h1>
        <p>This page isn’t here. There’s plenty of possibility ahead.</p>
        <ButtonLink href="/">Back to home</ButtonLink>
      </div>
    </main>
  );
}
