"use client";

import { useEffect, useState } from "react";

type Library = {
  id: string;
  name: string;
  description: string | null;
};

type LibraryListProps = {
  selectedLibraryId?: string;

  onSelectLibrary: (id: string) => void;
};

export default function LibraryList({
  selectedLibraryId,
  onSelectLibrary,
}: LibraryListProps) {
  const [libraries, setLibraries] = useState<Library[]>([]);

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadLibraries() {
      try {
        const response = await fetch("/api/libraries", {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Unable to load libraries.");
        }

        const data: Library[] = await response.json();

        setLibraries(data);
        setError(null);
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") {
          return;
        }

        console.error(err);

        setError("Unable to load libraries.");
      }
    }

    loadLibraries();

    return () => controller.abort();
  }, []);

  if (error) {
    return <p className="sidebar-error">{error}</p>;
  }

  return (
    <div className="sidebar-section">
      <h3 className="sidebar-heading">Libraries</h3>

      <div className="sidebar-list">
        {libraries.map((library) => (
          <button
            key={library.id}
            type="button"
            className={
              library.id === selectedLibraryId
                ? "sidebar-item active"
                : "sidebar-item"
            }
            onClick={() => onSelectLibrary(library.id)}
          >
            {library.name}
          </button>
        ))}
      </div>
    </div>
  );
}
