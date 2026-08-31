"use client";

import LibraryList from "./LibraryList";
import FieldList from "./FieldList";

type SidebarProps = {
  selectedCollectionId?: string;
  onSelectCollection: (collectionId: string) => void;
};

export default function Sidebar({
  selectedCollectionId,
  onSelectCollection,
}: SidebarProps) {
  return (
    <aside className="sidebar">
      <LibraryList
        selectedCollectionId={selectedCollectionId}
        onSelectCollection={onSelectCollection}
      />

      <section className="sidebar-section">
        <h2 className="sidebar-heading">Fields</h2>

        <FieldList collectionId={selectedCollectionId} />

        {selectedCollectionId && (
          <button type="button" className="sidebar-action">
            + New Field
          </button>
        )}
      </section>
    </aside>
  );
}
