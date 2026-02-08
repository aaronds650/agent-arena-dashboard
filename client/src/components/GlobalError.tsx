import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class GlobalErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({ error, errorInfo });
    console.error('GlobalErrorBoundary caught an error:', error, errorInfo);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '40px',
          fontFamily: 'monospace',
          backgroundColor: '#1a1a2e',
          color: '#eee',
          minHeight: '100vh',
          overflow: 'auto',
        }}>
          <h1 style={{ color: '#ff6b6b', marginBottom: '20px' }}>
            Application Error
          </h1>
          
          <div style={{
            backgroundColor: '#16213e',
            padding: '20px',
            borderRadius: '8px',
            marginBottom: '20px',
            border: '1px solid #e94560',
          }}>
            <h2 style={{ color: '#e94560', marginTop: 0 }}>Error Message:</h2>
            <pre style={{
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              color: '#fff',
              fontSize: '14px',
            }}>
              {this.state.error?.message || 'Unknown error'}
            </pre>
          </div>

          <div style={{
            backgroundColor: '#16213e',
            padding: '20px',
            borderRadius: '8px',
            border: '1px solid #0f3460',
          }}>
            <h2 style={{ color: '#e94560', marginTop: 0 }}>Component Stack:</h2>
            <pre style={{
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              color: '#aaa',
              fontSize: '12px',
              maxHeight: '400px',
              overflow: 'auto',
            }}>
              {this.state.errorInfo?.componentStack || 'No component stack available'}
            </pre>
          </div>

          <div style={{
            backgroundColor: '#16213e',
            padding: '20px',
            borderRadius: '8px',
            marginTop: '20px',
            border: '1px solid #0f3460',
          }}>
            <h2 style={{ color: '#e94560', marginTop: 0 }}>Stack Trace:</h2>
            <pre style={{
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              color: '#aaa',
              fontSize: '12px',
              maxHeight: '300px',
              overflow: 'auto',
            }}>
              {this.state.error?.stack || 'No stack trace available'}
            </pre>
          </div>

          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: '20px',
              padding: '12px 24px',
              backgroundColor: '#e94560',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
