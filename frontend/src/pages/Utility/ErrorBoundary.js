import React from "react";
import PagesError from "./PagesError";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error caught by ErrorBoundary:", error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false });
    window.location.reload();
     
  };

  render() {
    if (this.state.hasError) {
      return <PagesError retryFunction={this.handleRetry} t={(text) => text} />;
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
