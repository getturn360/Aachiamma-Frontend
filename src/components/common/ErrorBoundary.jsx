import React from "react";
import { Button } from "@/components/ui/button";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("[ErrorBoundary]", error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[50vh] flex flex-col items-center justify-center px-4 py-16 text-center">
          <h1 className="text-xl font-semibold text-slate-900 mb-2">
            Something went wrong
          </h1>
          <p className="text-sm text-slate-600 mb-6 max-w-md">
            An unexpected error occurred. You can try again or return to the home page.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Button type="button" onClick={this.handleRetry}>
              Try again
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                window.location.href = "/";
              }}
            >
              Go to home
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
