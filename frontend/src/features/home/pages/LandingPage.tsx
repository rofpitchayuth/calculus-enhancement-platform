import { useNavigate } from "react-router-dom";

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <>
      <style>{`
        .calcurise-page {
          background: #deeef8;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 2.5rem 1.5rem 4rem;
          gap: 2rem;
        }

        /* ── Logo ── */
        .cr-logo {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .cr-logo-sym {
          width: 40px;
          height: 40px;
          background: #3b82f6;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          font-size: 20px;
          font-weight: 900;
        }
        .cr-logo-text {
          font-size: 40px;
          font-weight: 900;
          color: #1e3a5f;
          letter-spacing: -0.02em;
        }

        /* ── Hero Card ── */
        .cr-hero {
          background: #fff;
          border-radius: 28px;
          padding: 2.5rem 2rem;
          text-align: center;
          width: 100%;
          max-width: 520px;
          box-shadow: 0 4px 24px rgba(59, 130, 246, 0.09);
        }
        .cr-hero h1 {
          font-size: clamp(1.8rem, 5vw, 2.4rem);
          font-weight: 900;
          color: #1e3a5f;
          line-height: 1.2;
          margin-bottom: 0.85rem;
        }
        .cr-hero h1 span {
          color: #3b82f6;
        }
        .cr-hero p {
          font-size: 1rem;
          color: #64748b;
          line-height: 1.65;
          font-weight: 600;
          margin-bottom: 1.75rem;
        }

        /* ── Buttons ── */
        .cr-btns {
          display: flex;
          gap: 12px;
          justify-content: center;
          flex-wrap: wrap;
        }
        .cr-btn-login {
          padding: 11px 30px;
          border: 2.5px solid #3b82f6;
          background: transparent;
          color: #3b82f6;
          border-radius: 50px;
          font-size: 0.95rem;
          font-weight: 800;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .cr-btn-login:hover {
          background: #3b82f6;
          color: #fff;
          transform: translateY(-1px);
        }
        .cr-btn-signup {
          padding: 11px 30px;
          border: none;
          background: #f59e0b;
          color: #fff;
          border-radius: 50px;
          font-size: 0.95rem;
          font-weight: 800;
          cursor: pointer;
          box-shadow: 0 4px 14px rgba(245, 158, 11, 0.35);
          transition: all 0.2s ease;
        }
        .cr-btn-signup:hover {
          background: #d97706;
          transform: translateY(-1px);
          box-shadow: 0 6px 18px rgba(245, 158, 11, 0.45);
        }

        /* ── Features ── */
        .cr-feat-section {
          width: 100%;
          max-width: 520px;
        }
        .cr-feat-title {
          text-align: center;
          font-size: 1.1rem;
          font-weight: 900;
          color: #1e3a5f;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 1.25rem;
        }
        .cr-feat-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
        }
        .cr-feat-card {
          background: #fff;
          border-radius: 20px;
          padding: 1.5rem 1rem;
          text-align: center;
          box-shadow: 0 2px 14px rgba(59, 130, 246, 0.07);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .cr-feat-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(59, 130, 246, 0.13);
        }
        .cr-feat-card.wide {
          grid-column: 1 / -1;
          max-width: 55%;
          margin: 0 auto;
          width: 100%;
        }
        .cr-feat-icon {
          width: 56px;
          height: 56px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 0.85rem;
          font-size: 26px;
        }
        .cr-feat-icon.blue  { background: #dbeafe; }
        .cr-feat-icon.amber { background: #fef3c7; }
        .cr-feat-icon.green { background: #d1fae5; }
        .cr-feat-card h3 {
          font-size: 0.85rem;
          font-weight: 900;
          color: #1e3a5f;
          text-transform: uppercase;
          letter-spacing: 0.07em;
          margin-bottom: 6px;
        }
        .cr-feat-card p {
          font-size: 0.8rem;
          color: #64748b;
          line-height: 1.55;
          font-weight: 600;
        }

        @media (max-width: 480px) {
          .cr-feat-card.wide { max-width: 80%; }
        }
      `}</style>

      <div className="calcurise-page ">
        {/* Logo */}
     

        {/* Hero */}
        <div className="cr-hero flex flex-col items-center mt-10">
        <div className="cr-logo mb-4">
          <div className="cr-logo-sym">∫</div>
          <span className="cr-logo-text">CalcuRise</span>
        </div>
          <p>
            Practice smarter with adaptive problems,<br />
            instant analysis, and visual progress tracking.
          </p>
          <div className="cr-btns">
            <button className="cr-btn-login" onClick={() => navigate("/auth/login")}>
              Log In
            </button>
            <button className="cr-btn-signup" onClick={() => navigate("/auth/signup")}>
              Sign Up →
            </button>
          </div>
        </div>

        {/* Features */}
        <div className="cr-feat-section">
          <div className="cr-feat-grid">
            <div className="cr-feat-card">
              <div className="cr-feat-icon blue">📋</div>
              <h3>Generate</h3>
              <p>Adaptive questions from a curated bank</p>
            </div>
            <div className="cr-feat-card">
              <div className="cr-feat-icon amber">🔍</div>
              <h3>Analyze</h3>
              <p>Identify strengths and weaknesses from results</p>
            </div>
            <div className="cr-feat-card wide">
              <div className="cr-feat-icon green">📊</div>
              <h3>Visualize</h3>
              <p>Show progress in an easy-to-follow dashboard</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
