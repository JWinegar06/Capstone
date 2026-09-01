"use client";

import { useState } from "react";

import LibraryList from "./LibraryList";
import CollectionList from "./CollectionList";
import FieldList from "./FieldList";

type SidebarProps = {
  selectedCollectionId?: string;

  onSelectCollection: (id: string) => void;
};

export default function Sidebar({
  selectedCollectionId,
  onSelectCollection,
}: SidebarProps) {
  const [selectedLibraryId, setSelectedLibraryId] = useState<
    string | undefined
  >();

  return (
    <aside className="sidebar">
      <LibraryList
        selectedLibraryId={selectedLibraryId}
        onSelectLibrary={setSelectedLibraryId}
      />

      <CollectionList
        libraryId={selectedLibraryId}
        selectedCollectionId={selectedCollectionId}
        onSelectCollection={onSelectCollection}
      />

      <FieldList collectionId={selectedCollectionId} />
    </aside>
  );
}
