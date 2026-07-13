import MobileApp from "@/components/mobile/MobileApp";
import MobileDashboard from "@/components/mobile/MobileDashboard";

// Mobile app → Konsta UI (iOS / Material), not shadcn. See ARCHITECTURE.md.
const App2Dashboard = () => (
  <MobileApp>
    <MobileDashboard portal="app2" />
  </MobileApp>
);

export default App2Dashboard;
