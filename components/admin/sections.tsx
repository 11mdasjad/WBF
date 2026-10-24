"use client";
import { Plus, ArrowUp, ArrowDown, Trash2 } from "lucide-react";
import { Field } from "../site/shared";
export type PageSection = {
  id: string;
  type: "text" | "image" | "callout";
  title: string;
  body: string;
  image: string;
  link: string;
  linkLabel: string;
  visible: boolean;
};
export function SectionsEditor({
  sections,
  onChange,
}: {
  sections: PageSection[];
  onChange: (sections: PageSection[]) => void;
}) {
  const edit = (i: number, key: string, value: any) =>
    onChange(sections.map((s, j) => (i === j ? { ...s, [key]: value } : s)));
  const move = (i: number, delta: number) => {
    const copy = [...sections];
    [copy[i], copy[i + delta]] = [copy[i + delta], copy[i]];
    onChange(copy);
  };
  return (
    <div className="sections-editor">
      <h3>Page sections</h3>
      <p className="field-help">
        Arrange approved text, images and calls to action. Hidden sections stay
        in the draft but do not appear publicly.
      </p>
      {sections.map((s, i) => (
        <div className="section-editor-card" key={s.id}>
          <div className="section-editor-tools">
            <strong>Section {i + 1}</strong>
            <label>
              <input
                type="checkbox"
                checked={s.visible}
                onChange={(e) => edit(i, "visible", e.target.checked)}
              />{" "}
              Visible
            </label>
            <button
              type="button"
              className="icon-button"
              disabled={i === 0}
              onClick={() => move(i, -1)}
              aria-label="Move section up"
            >
              <ArrowUp size={16} />
            </button>
            <button
              type="button"
              className="icon-button"
              disabled={i === sections.length - 1}
              onClick={() => move(i, 1)}
              aria-label="Move section down"
            >
              <ArrowDown size={16} />
            </button>
            <button
              type="button"
              className="icon-button"
              onClick={() => onChange(sections.filter((_, j) => i !== j))}
              aria-label="Remove section"
            >
              <Trash2 size={16} />
            </button>
          </div>
          <div className="form-grid">
            <Field label="Section style">
              <select
                value={s.type}
                onChange={(e) => edit(i, "type", e.target.value)}
              >
                <option value="text">Text</option>
                <option value="image">Image and text</option>
                <option value="callout">Call to action</option>
              </select>
            </Field>
            <Field
              label="Section heading"
              value={s.title}
              onChange={(e: any) => edit(i, "title", e.target.value)}
              maxLength={200}
            />
          </div>
          <Field label="Section text">
            <textarea
              rows={3}
              value={s.body}
              onChange={(e) => edit(i, "body", e.target.value)}
              maxLength={5000}
            />
          </Field>
          {s.type === "image" && (
            <Field
              label="Section image URL"
              value={s.image}
              onChange={(e: any) => edit(i, "image", e.target.value)}
            />
          )}
          <div className="form-grid">
            <Field
              label="Link label"
              value={s.linkLabel}
              onChange={(e: any) => edit(i, "linkLabel", e.target.value)}
            />
            <Field
              label="Link destination"
              value={s.link}
              onChange={(e: any) => edit(i, "link", e.target.value)}
            />
          </div>
        </div>
      ))}
      <button
        type="button"
        className="button secondary small"
        disabled={sections.length >= 20}
        onClick={() =>
          onChange([
            ...sections,
            {
              id: crypto.randomUUID(),
              type: "text",
              title: "",
              body: "",
              image: "",
              link: "",
              linkLabel: "Learn more",
              visible: true,
            },
          ])
        }
      >
        <Plus size={15} /> Add section
      </button>
    </div>
  );
}
