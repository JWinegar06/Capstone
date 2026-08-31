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
  libraryId: string;
  selectedCollectionId?: string;
  onSelectCollection?: (collectionId: string) => void;
};

export default function CollectionList({
  libraryId,
  selectedCollectionId,
  onSelectCollection,
}: CollectionListProps) {
  const [collections, setCollections] = useState<Collection[]>([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadCollections() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/collections?libraryId=${libraryId}`);

        if (!response.ok) {
          throw new Error("Unable to load collections.");
        }

        const data: Collection[] = await response.json();

        setCollections(data);
      } catch (err) {
        console.error(err);

        setError("Unable to load collections.");
      } finally {
        setLoading(false);
      }
    }

    loadCollections();
  }, [libraryId]);

  if (loading) {
    return <p className="library-placeholder">Loading collections...</p>;
  }

  if (error) {
    return <p className="sidebar-error">{error}</p>;
  }

  if (collections.length === 0) {
    return <p className="library-placeholder">No collections yet.</p>;
  }

  return (
    <ul className="collection-list">
      {collections.map((collection) => {
        const isSelected = collection.id === selectedCollectionId;

        return (
          <li key={collection.id}>
            <button
              type="button"
              className={`collection-button ${isSelected ? "active" : ""}`}
              onClick={() => onSelectCollection?.(collection.id)}
            >
              {collection.name}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
