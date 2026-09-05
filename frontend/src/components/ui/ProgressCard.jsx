import Card from "./Card.jsx";
import ProgressCircle from "./ProgressCircle.jsx";

/** Card pairing a circular progress ring with a title/description. */
const ProgressCard = ({ title, description, value, color = "primary" }) => {
  return (
    <Card className="flex items-center gap-5">
      <ProgressCircle value={value} color={color} size={80} strokeWidth={7} />
      <div>
        <h3 className="text-h4">{title}</h3>
        {description && <p className="text-small mt-1 text-text-muted">{description}</p>}
      </div>
    </Card>
  );
};

export default ProgressCard;
