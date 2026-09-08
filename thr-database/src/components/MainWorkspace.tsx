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

  onDirtyChange?: (isDirty: boolean) => void;
};

export default function MainWorkspace({
  selectedCollectionId,
  onDirtyChange,
}: MainWorkspaceProps) {
  const [collection, setCollection] = useState<Collection | null>(null);

  const [viewMode, setViewMode] = useState<ViewMode>("table");

  const [searchQuery, setSearchQuery] = useState("");

  const [selectedRecordId, setSelectedRecordId] = useState<
    string | undefined
  >();

  const [recordIds, setRecordIds] = useState<string[]>([]);

  const [recordRefreshKey, setRecordRefreshKey] = useState(0);

  const [creatingRecord, setCreatingRecord] = useState(false);

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const [error, setError] = useState<string | null>(null);

  /*
   * Determine current position
   * in the collection.
   */
  const selectedRecordIndex = selectedRecordId
    ? recordIds.indexOf(selectedRecordId)
    : -1;

  const hasPreviousRecord = selectedRecordIndex > 0;

  const hasNextRecord =
    selectedRecordIndex >= 0 && selectedRecordIndex < recordIds.length - 1;

  /*
   * Load selected collection.
   *
   * AppShell remounts this
   * component when the collection
   * changes by using a key.
   */
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

  /*
   * Warn before abandoning
   * unsaved form changes.
   */
  function confirmDiscardChanges() {
    if (!hasUnsavedChanges) {
      return true;
    }

    return window.confirm(
      "You have unsaved changes. Leave without saving them?",
    );
  }

  /*
   * Receive dirty-state changes
   * from RecordForm.
   */
  function handleDirtyChange(isDirty: boolean) {
    setHasUnsavedChanges(isDirty);

    onDirtyChange?.(isDirty);
  }

  /*
   * Switch Table / Form View.
   */
  function handleViewModeChange(mode: ViewMode) {
    if (mode === viewMode) {
      return;
    }

    if (!confirmDiscardChanges()) {
      return;
    }

    setHasUnsavedChanges(false);

    onDirtyChange?.(false);

    setViewMode(mode);
  }

  /*
   * Select a table record.
   */
  function handleSelectRecord(recordId: string) {
    if (recordId === selectedRecordId) {
      return;
    }

    if (!confirmDiscardChanges()) {
      return;
    }

    setHasUnsavedChanges(false);

    onDirtyChange?.(false);

    setSelectedRecordId(recordId);
  }

  /*
   * Move to previous record
   * while keeping permanent
   * collection order.
   */
  function handlePreviousRecord() {
    if (!hasPreviousRecord) {
      return;
    }

    if (!confirmDiscardChanges()) {
      return;
    }

    const previousRecordId = recordIds[selectedRecordIndex - 1];

    if (!previousRecordId) {
      return;
    }

    setHasUnsavedChanges(false);

    onDirtyChange?.(false);

    setSelectedRecordId(previousRecordId);
  }

  /*
   * Move to next record.
   */
  function handleNextRecord() {
    if (!hasNextRecord) {
      return;
    }

    if (!confirmDiscardChanges()) {
      return;
    }

    const nextRecordId = recordIds[selectedRecordIndex + 1];

    if (!nextRecordId) {
      return;
    }

    setHasUnsavedChanges(false);

    onDirtyChange?.(false);

    setSelectedRecordId(nextRecordId);
  }

  /*
   * Create a new record.
   */
  async function handleCreateRecord() {
    if (!collection) {
      return;
    }

    if (!confirmDiscardChanges()) {
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
        let message = "Unable to create record.";

        try {
          const errorData = await response.json();

          message = errorData.details || errorData.error || message;
        } catch {
          // Keep fallback.
        }

        throw new Error(message);
      }

      const newRecord = await response.json();

      setHasUnsavedChanges(false);

      onDirtyChange?.(false);

      setSelectedRecordId(newRecord.id);

      setRecordRefreshKey((current) => current + 1);

      setViewMode("form");
    } catch (err) {
      console.error(err);

      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Unable to create record.");
      }
    } finally {
      setCreatingRecord(false);
    }
  }

  /*
   * Refresh table after save.
   */
  function handleRecordSaved() {
    setHasUnsavedChanges(false);

    onDirtyChange?.(false);

    setRecordRefreshKey((current) => current + 1);
  }

  /*
   * Clean up after deletion.
   */
  function handleRecordDeleted() {
    setHasUnsavedChanges(false);

    onDirtyChange?.(false);

    setSelectedRecordId(undefined);

    setRecordRefreshKey((current) => current + 1);

    setViewMode("table");
  }

  function handleRecordDuplicated(recordId: string) {
    setHasUnsavedChanges(false);

    onDirtyChange?.(false);

    setSelectedRecordId(recordId);

    setRecordRefreshKey((current) => current + 1);

    setViewMode("form");
  }

  function handleOpenRecord(recordId: string) {
    if (recordId !== selectedRecordId) {
      if (!confirmDiscardChanges()) {
        return;
      }

      setHasUnsavedChanges(false);

      onDirtyChange?.(false);

      setSelectedRecordId(recordId);
    }

    setViewMode("form");
  }

  /*
   * No collection selected.
   */
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

  /*
   * Collection loading error.
   */
  if (error) {
    return (
      <main className="workspace">
        <div className="content-container">
          <p className="workspace-error">{error}</p>
        </div>
      </main>
    );
  }

  /*
   * Loading collection.
   */
  if (!collection) {
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
        {/* Collection Header */}
        <div className="collection-header">
          <div>
            <h2 className="collection-title">{collection.name}</h2>

            {collection.description && (
              <p className="collection-description">{collection.description}</p>
            )}
          </div>
        </div>

        {/* Collection Toolbar */}
        <CollectionToolbar
          viewMode={viewMode}
          onViewModeChange={handleViewModeChange}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onCreateRecord={handleCreateRecord}
          creatingRecord={creatingRecord}
        />

        {/* Main Content */}
        <div className="workspace-content">
          {viewMode === "table" ? (
            <>
              <RecordList
                collectionId={collection.id}
                searchQuery={searchQuery}
                selectedRecordId={selectedRecordId}
                onSelectRecord={handleSelectRecord}
                onOpenRecord={handleOpenRecord}
                refreshKey={recordRefreshKey}
                onRecordsLoaded={setRecordIds}
              />

              {selectedRecordId && (
                <div className="selected-record-status">
                  <span>Record selected</span>

                  <button
                    type="button"
                    className="selected-record-open"
                    onClick={() => handleOpenRecord(selectedRecordId)}
                  >
                    Open in Form View →
                  </button>
                </div>
              )}
            </>
          ) : selectedRecordId ? (
            <RecordForm
              recordId={selectedRecordId}
              onSaved={handleRecordSaved}
              onDeleted={handleRecordDeleted}
              onDirtyChange={handleDirtyChange}
              onPrevious={handlePreviousRecord}
              onNext={handleNextRecord}
              hasPrevious={hasPreviousRecord}
              hasNext={hasNextRecord}
              recordPosition={
                selectedRecordIndex >= 0 ? selectedRecordIndex + 1 : undefined
              }
              recordCount={recordIds.length}
              onDuplicated={handleRecordDuplicated}
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
