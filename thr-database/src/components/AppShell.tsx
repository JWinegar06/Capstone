import TopBar from "./TopBar";
import Sidebar from "./SideBar";
import MainWorkspace from "./MainWorkspace";

export default function AppShell() {
  return (
    <div className="app-shell">
      <TopBar />

      <div className="app-body">
        <Sidebar />
        <MainWorkspace />
      </div>
    </div>
  );
}
