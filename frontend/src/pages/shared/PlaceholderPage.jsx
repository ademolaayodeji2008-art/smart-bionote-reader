import PageHeader from "../../components/layout/PageHeader.jsx";
import EmptyState from "../../components/ui/EmptyState.jsx";

/**
 * Generic "coming soon" dashboard route. Used for navigation targets that
 * exist so the sidebar/bottom-nav never link to a broken route, but whose
 * real functionality is built in a later phase.
 */
const PlaceholderPage = ({ title, description, emptyTitle, emptyDescription, icon }) => {
  return (
    <div>
      <PageHeader title={title} description={description} />
      <EmptyState
        icon={icon}
        title={emptyTitle || "Nothing here yet"}
        description={emptyDescription || "This area is part of a future phase and isn't built out yet."}
      />
    </div>
  );
};

export default PlaceholderPage;
