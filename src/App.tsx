// Handoff test successful
import { LeaveRequestPage } from './features/leave-request/ui/pages/LeaveRequestPage';
import { ToastContainer } from 'react-toastify';
import { DEFAULT_TOAST_CONTAINER_CONFIG } from './shared/lib/toast';

/**
 * Main Application Component
 *
 * Renders the LeaveRequestPage and configures the ToastContainer
 * for displaying toast notifications throughout the application.
 */
function App() {
  return (
    <>
      <LeaveRequestPage />
      <ToastContainer {...DEFAULT_TOAST_CONTAINER_CONFIG} />
    </>
  );
}

export default App;

