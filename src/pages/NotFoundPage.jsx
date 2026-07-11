import { Link, useNavigate } from 'react-router-dom'

function NotFoundPage() {
  const navigate = useNavigate()

  return (
    <section className="not-found-page">
      <div className="placeholder-panel not-found-panel">
        <h1>Page not found</h1>
        <p>The requested page does not exist.</p>
        <div className="login-actions">
          <Link className="button-link" to="/">
            Go home
          </Link>
          <button
            className="button-like"
            type="button"
            onClick={() => navigate(-1)}
          >
            Go back
          </button>
        </div>
      </div>
    </section>
  )
}

export default NotFoundPage
