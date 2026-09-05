/** Centers content with the app's standard max-width and horizontal padding. */
const PageContainer = ({ children, className = "" }) => {
  return <div className={`mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 ${className}`}>{children}</div>;
};

export default PageContainer;
