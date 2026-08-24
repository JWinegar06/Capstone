"use client";

import { useState } from "react";
import CollectionList from "./CollectionList";

type Library = {
  id: string;
  name: string;
};

const sampleLibraries: Library[] = [
  {
    id: "1",
    name: "Treasure House Relics",
  },
  {
    id: "2",
    name: "Personal Library",
  },
];

export default function LibraryList() {
  const [openLibraries, setOpenLibraries] = useState<string[]>(["1"]);

  const [selectedCollectionId, setSelectedCollectionId] =
    useState<string>("c7");

  function toggleLibrary(id: string) {
    setOpenLibraries((current) =>
      current.includes(id)
        ? current.filter((libraryId) => libraryId !== id)
        : [...current, id],
    );
  }

  function selectCollection(collectionId: string) {
    setSelectedCollectionId(collectionId);
  }

  return (
    <div className="sidebar-section">
      <h2 className="sidebar-heading">Libraries</h2>

      <ul className="sidebar-list">
        {sampleLibraries.map((library) => {
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
                  onSelectCollection={selectCollection}
                />
              )}
            </li>
          );
        })}
      </ul>

      <button type="button" className="sidebar-action">
        + New Library
      </button>

      <button type="button" className="sidebar-action">
        + New Collection
      </button>
    </div>
  );
}
