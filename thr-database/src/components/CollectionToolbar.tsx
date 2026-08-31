"use client";

type ViewMode = "table" | "form";

type CollectionToolbarProps = {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onCreateRecord: () => void;
  creatingRecord?: boolean;
};

export default function CollectionToolbar({
  viewMode,
  onViewModeChange,
  searchQuery,
  onSearchChange,
  onCreateRecord,
  creatingRecord = false,
}: CollectionToolbarProps) {
  return (
    <div className="collection-toolbar">
      <div className="collection-toolbar-left">
        <button
          type="button"
          className="button primary"
          onClick={onCreateRecord}
          disabled={creatingRecord}
        >
          {creatingRecord ? "Creating..." : "+ Record"}
        </button>

        <div className="view-switcher">
          <button
            type="button"
            className={viewMode === "table" ? "active" : ""}
            onClick={() => onViewModeChange("table")}
          >
            Table
          </button>

          <button
            type="button"
            className={viewMode === "form" ? "active" : ""}
            onClick={() => onViewModeChange("form")}
          >
            Form
          </button>
        </div>
      </div>

      <div className="collection-toolbar-right">
        <input
          type="search"
          className="search-input"
          placeholder="Search collection..."
          value={searchQuery}
          onChange={(event) => onSearchChange(event.target.value)}
        />
      </div>
    </div>
  );
}
