import Badge from "./Badge.jsx";

const SUBJECT_VARIANTS = {
  Mathematics: "primary",
  Science: "secondary",
  English: "accent",
  History: "neutral",
  Art: "accent",
};

/** Semantic wrapper around Badge for labelling a lesson's subject. */
const SubjectBadge = ({ subject }) => {
  return <Badge variant={SUBJECT_VARIANTS[subject] || "neutral"}>{subject}</Badge>;
};

export default SubjectBadge;
