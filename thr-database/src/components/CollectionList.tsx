"use client";

import { useEffect, useState } from "react";

type Collection = {
  id: string;
  library_id: string;
  name: string;
  description: string | null;
  display_order: number;
};

type CollectionListProps = {
  libraryId?: string;

  selectedCollectionId?: string;

  onSelectCollection: (id: string) => void;
};

export default function CollectionList({
  libraryId,
  selectedCollectionId,
  onSelectCollection,
}: CollectionListProps) {
  const [collections, setCollections] = useState<Collection[]>([]);

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!libraryId) {
      return;
    }

    const controller = new AbortController();

    async function loadCollections() {
      try {
        const response = await fetch(
          `/api/collections?libraryId=${libraryId}`,
          {
            signal: controller.signal,
          },
        );

        if (!response.ok) {
          throw new Error("Unable to load collections.");
        }

        const data: Collection[] = await response.json();

        setCollections(data);
        setError(null);
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") {
          return;
        }

        console.error(err);

        setError("Unable to load collections.");
      }
    }

    loadCollections();

    return () => controller.abort();
  }, [libraryId]);

  if (!libraryId) {
    return null;
  }

  if (error) {
    return <p className="sidebar-error">{error}</p>;
  }

  return (
    <div className="sidebar-section">
      <h3 className="sidebar-heading">Collections</h3>

      <div className="sidebar-list">
        {collections.map((collection) => (
          <button
            key={collection.id}
            type="button"
            className={
              collection.id === selectedCollectionId
                ? "sidebar-item active"
                : "sidebar-item"
            }
            onClick={() => onSelectCollection(collection.id)}
          >
            {collection.name}
          </button>
        ))}
      </div>
    </div>
  );
}
