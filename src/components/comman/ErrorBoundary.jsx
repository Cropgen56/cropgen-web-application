import React from "react";
import PropTypes from "prop-types";

/**
 * Generic error boundary. Wrap any section that renders third-party/chart/map
 * widgets so a runtime error there degrades gracefully instead of blanking
 * the whole page. Keeps rendering its own DOM node (with `label` in it) on
 * failure, so parents that read the DOM (e.g. PDF capture) still find a node
 * in place rather than nothing.
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error(
      `[ErrorBoundary${this.props.label ? `: ${this.props.label}` : ""}]`,
      error,
      errorInfo
    );
  }

  handleRetry = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="flex flex-col items-center justify-center text-center py-10 px-4">
          <p className="text-white/80 text-sm font-semibold">
            {this.props.label
              ? `Couldn't load ${this.props.label}`
              : "Something went wrong loading this section"}
          </p>
          <p className="text-white/50 text-xs mt-1 max-w-sm">
            The rest of the report is unaffected. You can try again below.
          </p>
          <button
            type="button"
            onClick={this.handleRetry}
            className="mt-4 px-4 py-1.5 rounded-lg bg-ember-primary hover:bg-ember-primary-hover text-white text-xs font-semibold transition-colors"
          >
            Retry
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node,
  fallback: PropTypes.node,
  label: PropTypes.string,
};

export default ErrorBoundary;
