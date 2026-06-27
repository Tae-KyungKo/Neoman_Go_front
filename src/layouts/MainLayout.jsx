import { Outlet } from 'react-router-dom'
import Header from '../components/layout/Header'
import RealtimeNotificationToast from '../components/notifications/RealtimeNotificationToast'
import SseStatusBadge from '../components/notifications/SseStatusBadge'
import { useNotificationStream } from '../hooks/useNotificationStream'

function MainLayout() {
  const {
    status,
    errorMessage,
    toasts,
    dismissToast,
  } = useNotificationStream()

  return (
    <div className="router-shell">
      <Header />
      <div className="sse-status-row">
        <SseStatusBadge errorMessage={errorMessage} status={status} />
      </div>
      <main className="route-content">
        <Outlet />
      </main>
      <RealtimeNotificationToast
        onDismiss={dismissToast}
        toasts={toasts}
      />
    </div>
  )
}

export default MainLayout
