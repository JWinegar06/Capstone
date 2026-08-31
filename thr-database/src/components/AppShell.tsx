"use client";

import { useState } from "react";
import TopBar from "./TopBar";
import Sidebar from "./Sidebar";
import MainWorkspace from "./MainWorkspace";

export default function AppShell() {
  const [selectedCollectionId, setSelectedCollectionId] = useState<
    string | undefined
  >();

  return (
    <div className="app-shell">
      <TopBar />

      <div className="app-body">
        <Sidebar
          selectedCollectionId={selectedCollectionId}
          onSelectCollection={setSelectedCollectionId}
        />

        <MainWorkspace selectedCollectionId={selectedCollectionId} />
      </div>
    </div>
  );
}
