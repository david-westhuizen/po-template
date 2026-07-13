import MobileApp from "@/components/mobile/MobileApp";
import MobileDashboard from "@/components/mobile/MobileDashboard";

// Mobile app → Konsta UI (iOS / Material), not shadcn. See ARCHITECTURE.md.
const App1Dashboard = () => (
  <MobileApp>
    <MobileDashboard portal="app1" />
  </MobileApp>
);

export default App1Dashboard;
