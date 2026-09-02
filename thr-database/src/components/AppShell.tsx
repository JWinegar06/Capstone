"use client";

import { useState } from "react";

import TopBar from "./TopBar";
import Sidebar from "./SideBar";
import MainWorkspace from "./MainWorkspace";

export default function AppShell() {
  const [selectedCollectionId, setSelectedCollectionId] = useState<
    string | undefined
  >();

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  function handleSelectCollection(collectionId: string) {
    if (collectionId === selectedCollectionId) {
      return;
    }

    if (hasUnsavedChanges) {
      const confirmed = window.confirm(
        "You have unsaved changes. Switch collections and discard them?",
      );

      if (!confirmed) {
        return;
      }
    }

    setHasUnsavedChanges(false);

    setSelectedCollectionId(collectionId);
  }

  return (
    <div className="app-shell">
      <TopBar />

      <div className="app-body">
        <Sidebar
          selectedCollectionId={selectedCollectionId}
          onSelectCollection={handleSelectCollection}
        />

        <MainWorkspace
          key={selectedCollectionId ?? "no-collection"}
          selectedCollectionId={selectedCollectionId}
          onDirtyChange={setHasUnsavedChanges}
        />
      </div>
    </div>
  );
}
