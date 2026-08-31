"use client";

import { useEffect, useState } from "react";
import CollectionToolbar from "./CollectionToolbar";
import RecordList from "./RecordList";
import RecordForm from "./RecordForm";

type ViewMode = "table" | "form";

type Collection = {
  id: string;
  library_id: string;
  name: string;
  description: string | null;
  display_order: number;
};

type MainWorkspaceProps = {
  selectedCollectionId?: string;
};

export default function MainWorkspace({
  selectedCollectionId,
}: MainWorkspaceProps) {
  const [collection, setCollection] = useState<Collection | null>(null);

  const [viewMode, setViewMode] = useState<ViewMode>("table");

  const [searchQuery, setSearchQuery] = useState("");

  const [selectedRecordId, setSelectedRecordId] = useState<
    string | undefined
  >();

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedCollectionId) {
      return;
    }

    const controller = new AbortController();

    async function loadCollection() {
      try {
        const response = await fetch(
          `/api/collections/${selectedCollectionId}`,
          {
            signal: controller.signal,
          },
        );

        if (!response.ok) {
          throw new Error("Unable to load collection.");
        }

        const data: Collection = await response.json();

        setCollection(data);
        setError(null);
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") {
          return;
        }

        console.error(err);

        setError("Unable to load collection.");
      }
    }

    loadCollection();

    return () => {
      controller.abort();
    };
  }, [selectedCollectionId]);

  if (!selectedCollectionId) {
    return (
      <main className="workspace">
        <div className="content-container">
          <h2 className="collection-title">Welcome</h2>

          <p>Select a collection from the sidebar to begin.</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="workspace">
        <div className="content-container">
          <p className="workspace-error">{error}</p>
        </div>
      </main>
    );
  }

  if (!collection || collection.id !== selectedCollectionId) {
    return (
      <main className="workspace">
        <div className="content-container">
          <p className="loading-message">Loading collection...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="workspace">
      <div className="content-container">
        <div className="collection-header">
          <div>
            <h2 className="collection-title">{collection.name}</h2>

            {collection.description && (
              <p className="collection-description">{collection.description}</p>
            )}
          </div>
        </div>

        <CollectionToolbar
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        <div className="workspace-content">
          {viewMode === "table" ? (
            <>
              <RecordList
                collectionId={collection.id}
                searchQuery={searchQuery}
                selectedRecordId={selectedRecordId}
                onSelectRecord={setSelectedRecordId}
              />

              {selectedRecordId && (
                <p className="selected-record-note">
                  Selected record: <strong>{selectedRecordId}</strong>
                </p>
              )}
            </>
          ) : (
            <>
              {selectedRecordId ? (
                <RecordForm recordId={selectedRecordId} />
              ) : (
                <div className="form-view-placeholder">
                  <h3>Form View</h3>

                  <p>
                    Select a record in Table View, then switch to Form View.
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </main>
  );
}
