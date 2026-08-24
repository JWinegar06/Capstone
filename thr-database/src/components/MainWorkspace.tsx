"use client";

import { useState } from "react";
import CollectionToolbar from "./CollectionToolbar";

type ViewMode = "table" | "form";

export default function MainWorkspace() {
  const [viewMode, setViewMode] = useState<ViewMode>("table");

  const [searchQuery, setSearchQuery] = useState("");

  return (
    <main className="workspace">
      <div className="content-container">
        <div className="collection-header">
          <h2 className="collection-title">Stock Certificates</h2>
        </div>

        <CollectionToolbar
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        <div className="workspace-content">
          <p>
            Current view: <strong>{viewMode}</strong>
          </p>

          {searchQuery && (
            <p>
              Searching for: <strong>{searchQuery}</strong>
            </p>
          )}

          {!searchQuery && <p>Collection records will appear here.</p>}
        </div>
      </div>
    </main>
  );
}
