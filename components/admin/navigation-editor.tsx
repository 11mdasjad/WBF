"use client";
import { ArrowUp, ArrowDown, Plus, X } from "lucide-react";
import { Field } from "../site/shared";
export function NavigationEditor({
  items,
  onChange,
}: {
  items: any[];
  onChange: (items: any[]) => void;
}) {
  const edit = (i: number, k: string, v: any) =>
    onChange(items.map((x, j) => (j === i ? { ...x, [k]: v } : x)));
  const move = (i: number, d: number) => {
    const list = [...items];
    [list[i], list[i + d]] = [list[i + d], list[i]];
    onChange(list);
  };
  return (
    <div className="navigation-editor">
      <h2>Main navigation</h2>
      <p className="field-help">
        Edit labels, destinations, visibility and order. Keep labels short
        enough to fit the header.
      </p>
      {items.map((x, i) => (
        <div className="navigation-edit-row" key={i}>
          <Field
            label={"Link " + (i + 1) + " label"}
            value={x.label}
            onChange={(e: any) => edit(i, "label", e.target.value)}
            maxLength={25}
          />
          <Field
            label="Destination"
            value={x.href}
            onChange={(e: any) => edit(i, "href", e.target.value)}
          />
          <label className="check-label">
            <input
              type="checkbox"
              checked={x.visible}
              onChange={(e) => edit(i, "visible", e.target.checked)}
            />
            Show
          </label>
          <button
            type="button"
            className="icon-button"
            onClick={() => move(i, -1)}
            disabled={i === 0}
            aria-label="Move link up"
          >
            <ArrowUp size={15} />
          </button>
          <button
            type="button"
            className="icon-button"
            onClick={() => move(i, 1)}
            disabled={i === items.length - 1}
            aria-label="Move link down"
          >
            <ArrowDown size={15} />
          </button>
          <button
            type="button"
            className="icon-button"
            onClick={() => onChange(items.filter((_, j) => i !== j))}
            aria-label="Remove link"
          >
            <X size={15} />
          </button>
        </div>
      ))}
      <button
        type="button"
        className="button secondary small"
        disabled={items.length >= 8}
        onClick={() =>
          onChange([...items, { label: "New link", href: "/", visible: true }])
        }
      >
        <Plus size={15} />
        Add link
      </button>
    </div>
  );
}
