import React from 'react';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';
import './ErrorBoundary.css';

/**
 * Enterprise Cyberpunk Error Boundary for VOID HUNTER
 * Catches JavaScript errors anywhere in the child component tree,
 * logs the telemetry, and displays a graceful sci-fi fallback HUD.
 */
export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null 
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[CRITICAL] Space Flight Telemetry Error Intercepted:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReload = () => {
    window.location.reload();
  };

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary-viewport" role="alert">
          <div className="error-boundary-backdrop" aria-hidden="true" />
          
          <div className="cyber-panel error-boundary-card">
            <span className="hud-corner hud-tl" aria-hidden="true" />
            <span className="hud-corner hud-tr" aria-hidden="true" />
            <span className="hud-corner hud-bl" aria-hidden="true" />
            <span className="hud-corner hud-br" aria-hidden="true" />

            <div className="error-card-header">
              <div className="error-icon-box">
                <AlertTriangle size={24} color="#FF5577" />
              </div>
              <div>
                <span className="error-brand-tag">SYSTEM ANOMALY DETECTED // SECTOR CRITICAL</span>
                <h2 className="error-card-title">FLIGHT DECK TELEMETRY INTERRUPTED</h2>
              </div>
            </div>

            <p className="error-card-desc">
              An unexpected neural uplink interruption occurred within this sector. Space Fleet Command has safeguarded your pilot credentials and combat currency.
            </p>

            {this.state.error && (
              <div className="error-diagnostic-terminal">
                <div className="diagnostic-header">
                  <span>TERMINAL LOG // RECOVERY TRACE</span>
                </div>
                <pre className="diagnostic-body">
                  {this.state.error.toString()}
                </pre>
              </div>
            )}

            <div className="error-action-row">
              <button 
                type="button" 
                onClick={this.handleReload} 
                className="error-btn-primary"
              >
                <RotateCcw size={15} />
                <span>RE-ESTABLISH UPLINK</span>
              </button>

              <button 
                type="button" 
                onClick={this.handleReset} 
                className="error-btn-secondary"
              >
                <Home size={15} />
                <span>RETURN TO COMMAND HQ</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
