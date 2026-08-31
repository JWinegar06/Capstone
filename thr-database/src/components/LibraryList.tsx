"use client";

import { useEffect, useState } from "react";
import CollectionList from "./CollectionList";

type Library = {
  id: string;
  name: string;
  description: string | null;
};

type LibraryListProps = {
  selectedCollectionId?: string;
  onSelectCollection: (collectionId: string) => void;
};

export default function LibraryList({
  selectedCollectionId,
  onSelectCollection,
}: LibraryListProps) {
  const [libraries, setLibraries] = useState<Library[]>([]);

  const [openLibraries, setOpenLibraries] = useState<string[]>([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadLibraries() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch("/api/libraries");

        if (!response.ok) {
          throw new Error("Unable to load libraries.");
        }

        const data: Library[] = await response.json();

        setLibraries(data);

        if (data.length > 0) {
          setOpenLibraries([data[0].id]);
        }
      } catch (err) {
        console.error(err);

        setError("Unable to load libraries.");
      } finally {
        setLoading(false);
      }
    }

    loadLibraries();
  }, []);

  function toggleLibrary(id: string) {
    setOpenLibraries((current) =>
      current.includes(id)
        ? current.filter((libraryId) => libraryId !== id)
        : [...current, id],
    );
  }

  if (loading) {
    return (
      <div className="sidebar-section">
        <h2 className="sidebar-heading">Libraries</h2>

        <p className="sidebar-empty">Loading libraries...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="sidebar-section">
        <h2 className="sidebar-heading">Libraries</h2>

        <p className="sidebar-error">{error}</p>
      </div>
    );
  }

  return (
    <div className="sidebar-section">
      <h2 className="sidebar-heading">Libraries</h2>

      {libraries.length === 0 ? (
        <p className="sidebar-empty">No libraries have been created yet.</p>
      ) : (
        <ul className="sidebar-list">
          {libraries.map((library) => {
            const isOpen = openLibraries.includes(library.id);

            return (
              <li key={library.id}>
                <button
                  type="button"
                  className="library-button"
                  onClick={() => toggleLibrary(library.id)}
                >
                  <span className="library-arrow">{isOpen ? "▼" : "▶"}</span>

                  <span>{library.name}</span>
                </button>

                {isOpen && (
                  <CollectionList
                    libraryId={library.id}
                    selectedCollectionId={selectedCollectionId}
                    onSelectCollection={onSelectCollection}
                  />
                )}
              </li>
            );
          })}
        </ul>
      )}

      <button type="button" className="sidebar-action">
        + New Library
      </button>

      <button type="button" className="sidebar-action">
        + New Collection
      </button>
    </div>
  );
}
