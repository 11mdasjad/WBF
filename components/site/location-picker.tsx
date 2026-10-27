"use client";
import { useEffect, useRef, useState } from "react";
import {
  ArrowUpRight,
  Check,
  ChevronDown,
  MapPin,
  Search,
  X,
} from "lucide-react";
import {
  cities,
  matchesCity,
  popularCities,
  searchCities,
  type City,
} from "@/lib/cities";
import { useSite } from "./context";
import { CityLandmark } from "./city-landmark";

const storageKey = "wbf-preferred-city";
export function LocationPicker() {
  const { content, organization } = useSite();
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<City | null>(null);
  const [draft, setDraft] = useState<City | null>(null);
  const [query, setQuery] = useState("");
  const [showAll, setShowAll] = useState(false);
  useEffect(() => {
    try {
      setSelected(
        cities.find((city) => city.name === localStorage.getItem(storageKey)) ||
          null,
      );
    } catch {
      /* Browsing without storage still supports city selection. */
    }
  }, []);
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);
  const close = () => dialog.current?.close();
  const choose = (city: City) => setDraft(city);
  const results = searchCities(query);
  const displayed = query.trim() || showAll ? results : popularCities;
  const activities = draft
    ? content.filter(
        (entry) =>
          ["event", "job"].includes(entry.kind) &&
          entry.status === "published" &&
          matchesCity(String(entry.data.location || ""), draft),
      )
    : [];
  function save() {
    if (!draft) return;
    setSelected(draft);
    try {
      localStorage.setItem(storageKey, draft.name);
    } catch {
      /* Session-only selection. */
    }
    close();
  }
  return (
    <>
      <button
        ref={trigger}
        type="button"
        className="masthead-location"
        aria-haspopup="dialog"
        aria-controls="city-picker"
        aria-expanded={open}
        aria-label={
          selected ? `Change location: ${selected.name}` : "Choose location"
        }
        onClick={() => {
          setDraft(selected);
          setQuery("");
          setShowAll(false);
          dialog.current?.showModal();
          setOpen(true);
          input.current?.focus();
        }}
      >
        <MapPin size={21} aria-hidden="true" />
        <span>
          <small>Location</small>
          <strong>{selected?.name || "Select city"}</strong>
        </span>
        <ChevronDown size={15} aria-hidden="true" />
      </button>
      <dialog
        ref={dialog}
        id="city-picker"
        className="location-dialog"
        aria-labelledby="city-picker-title"
        aria-describedby="city-picker-description"
        onKeyDown={(event) => {
          if (event.key !== "Tab") return;
          const controls = Array.from(
            event.currentTarget.querySelectorAll<HTMLElement>(
              'a[href], button:not([disabled]), input:not([disabled]), [tabindex="0"]',
            ),
          ).filter((element) => element.getClientRects().length > 0);
          const first = controls[0];
          const last = controls[controls.length - 1];
          if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last?.focus();
          } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first?.focus();
          }
        }}
        onClose={() => {
          setOpen(false);
          trigger.current?.focus();
        }}
        onClick={(event) => {
          if (event.target !== event.currentTarget) return;
          const r = event.currentTarget.getBoundingClientRect();
          if (
            event.clientX < r.left ||
            event.clientX > r.right ||
            event.clientY < r.top ||
            event.clientY > r.bottom
          )
            close();
        }}
      >
        <div className="location-dialog-heading">
          <span className="location-kicker">
            <MapPin size={15} aria-hidden="true" /> CONNECT WITH YOUR COMMUNITY
          </span>
          <button
            className="location-close"
            type="button"
            aria-label="Close location picker"
            onClick={close}
          >
            <X size={23} />
          </button>
        </div>
        <h2 id="city-picker-title">Every connection starts somewhere.</h2>
        <p id="city-picker-description">
          Choose your city to explore WBF activities and ways to get involved.
        </p>
        <form
          className="location-search"
          onSubmit={(event) => {
            event.preventDefault();
            if (query.trim() && results.length === 1) choose(results[0]);
            else input.current?.focus();
          }}
          role="search"
          aria-label="City search"
        >
          <Search size={22} aria-hidden="true" />
          <input
            ref={input}
            aria-label="Search for your city"
            placeholder="Search for your city"
            value={query}
            maxLength={80}
            onChange={(event) => {
              setQuery(event.target.value);
              setDraft(null);
            }}
          />
          {query && (
            <button
              className="location-clear"
              type="button"
              aria-label="Clear city search"
              onClick={() => {
                setQuery("");
                input.current?.focus();
              }}
            >
              <X size={17} />
            </button>
          )}
          <button className="location-search-submit" type="submit">
            Search
          </button>
        </form>
        <div className="location-list-heading">
          <h3>
            {query.trim()
              ? "Search results"
              : showAll
                ? "All cities"
                : "Popular cities"}
          </h3>
          <span aria-live="polite" role="status">
            {query.trim()
              ? `${results.length} ${results.length === 1 ? "city" : "cities"} found`
              : "Find your community"}
          </span>
        </div>
        {displayed.length ? (
          <div
            className={
              "location-cities" + (query.trim() || showAll ? " is-list" : "")
            }
          >
            {displayed.map((city) => (
              <button
                type="button"
                key={city.name}
                className="location-city"
                aria-pressed={draft?.name === city.name}
                onClick={() => choose(city)}
              >
                {!query.trim() && !showAll && (
                  <span className="location-landmark">
                    <CityLandmark city={city.name} />
                  </span>
                )}
                <span className="location-city-name">{city.name}</span>
                <small>{city.state}</small>
                {draft?.name === city.name && (
                  <Check
                    className="location-selected-check"
                    size={16}
                    aria-hidden="true"
                  />
                )}
              </button>
            ))}
          </div>
        ) : (
          <div className="location-empty">
            <MapPin size={24} aria-hidden="true" />
            <h3>No city found</h3>
            <p>
              Try another spelling, or <a href="/contact/">contact WBF</a> about
              getting involved in your area.
            </p>
          </div>
        )}
        {!query.trim() && (
          <button
            className="location-view-all"
            type="button"
            aria-expanded={showAll}
            onClick={() => setShowAll(!showAll)}
          >
            {showAll ? "Show popular cities" : "View all cities"}
            <ChevronDown size={18} className={showAll ? "is-expanded" : ""} />
          </button>
        )}
        {draft && (
          <section
            className="location-detail"
            aria-label={`WBF in ${draft.name}`}
            aria-live="polite"
          >
            <div className="location-detail-heading">
              <div>
                <span>YOUR SELECTED CITY</span>
                <h3>{draft.name}</h3>
              </div>
              <button className="location-save" type="button" onClick={save}>
                Use {draft.name}
                <Check size={17} aria-hidden="true" />
              </button>
            </div>
            {draft.name === "Delhi" && (
              <p className="location-office">
                <MapPin size={18} aria-hidden="true" />
                <span>
                  <strong>WBF office · New Delhi</strong>
                  {organization.address}
                  <a href="/contact/#office-location">
                    Office details & directions{" "}
                    <ArrowUpRight size={14} aria-hidden="true" />
                  </a>
                </span>
              </p>
            )}
            {activities.length ? (
              <>
                <p className="location-results-label">
                  Published activities & opportunities
                </p>
                <div className="location-activities">
                  {activities.slice(0, 4).map((entry) => (
                    <a
                      key={entry.id}
                      href={`/${entry.kind === "event" ? "events" : "careers"}/${entry.slug}/`}
                    >
                      <span>
                        {entry.title}
                        <small>{entry.data.location}</small>
                      </span>
                      <ArrowUpRight size={16} aria-hidden="true" />
                    </a>
                  ))}
                </div>
              </>
            ) : (
              <p>
                No local activities are listed here yet.{" "}
                <a href="/get-involved/">Explore ways to get involved</a> or{" "}
                <a href="/contact/">talk to our team</a>.
              </p>
            )}
          </section>
        )}
        <p className="location-note">
          Your preferred city is saved on this device.
        </p>
      </dialog>
    </>
  );
}
