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

  const [recordRefreshKey, setRecordRefreshKey] = useState(0);

  const [creatingRecord, setCreatingRecord] = useState(false);

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

  async function handleCreateRecord() {
    if (!collection) {
      return;
    }

    try {
      setCreatingRecord(true);
      setError(null);

      const response = await fetch("/api/records", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          collectionId: collection.id,
        }),
      });

      if (!response.ok) {
        throw new Error("Unable to create record.");
      }

      const newRecord = await response.json();

      setSelectedRecordId(newRecord.id);

      setRecordRefreshKey((current) => current + 1);

      setViewMode("form");
    } catch (err) {
      console.error(err);

      setError("Unable to create record.");
    } finally {
      setCreatingRecord(false);
    }
  }

  function handleRecordSaved() {
    setRecordRefreshKey((current) => current + 1);
  }

  function handleRecordDeleted() {
    setSelectedRecordId(undefined);

    setRecordRefreshKey((current) => current + 1);

    setViewMode("table");
  }

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
          onCreateRecord={handleCreateRecord}
          creatingRecord={creatingRecord}
        />

        <div className="workspace-content">
          {viewMode === "table" ? (
            <RecordList
              collectionId={collection.id}
              searchQuery={searchQuery}
              selectedRecordId={selectedRecordId}
              onSelectRecord={setSelectedRecordId}
              refreshKey={recordRefreshKey}
            />
          ) : selectedRecordId ? (
            <RecordForm
              recordId={selectedRecordId}
              onSaved={handleRecordSaved}
              onDeleted={handleRecordDeleted}
            />
          ) : (
            <div className="form-view-placeholder">
              <h3>Form View</h3>

              <p>Select a record in Table View, then switch to Form View.</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
