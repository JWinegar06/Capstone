import LibraryList from "./LibraryList";

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <LibraryList />

      <section className="sidebar-section">
        <h2 className="sidebar-heading">Fields</h2>

        <p className="sidebar-empty">Select a collection to view its fields.</p>
      </section>
    </aside>
  );
}
