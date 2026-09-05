import { PASSWORD_RULES, getPasswordStrength } from "../../utils/passwordValidation.js";

const STRENGTH_META = [
  { label: "Very weak", color: "bg-danger" },
  { label: "Weak", color: "bg-danger" },
  { label: "Fair", color: "bg-accent" },
  { label: "Good", color: "bg-secondary" },
  { label: "Strong", color: "bg-secondary" },
];

/** Live password strength bar + checklist, shown while the user types. */
const PasswordStrengthMeter = ({ password = "" }) => {
  const strength = getPasswordStrength(password);
  const { label, color } = STRENGTH_META[strength];

  if (!password) return null;

  return (
    <div className="mt-2">
      <div className="flex gap-1.5" role="img" aria-label={`Password strength: ${label}`}>
        {PASSWORD_RULES.map((_, index) => (
          <span
            key={index}
            className={`h-1.5 flex-1 rounded-full transition-colors ${index < strength ? color : "bg-surface-muted"}`}
          />
        ))}
      </div>
      <p className="text-xs mt-1.5 font-medium text-text-muted">{label}</p>
      <ul className="mt-2 grid grid-cols-1 gap-1 sm:grid-cols-2">
        {PASSWORD_RULES.map((rule) => {
          const met = rule.test(password);
          return (
            <li key={rule.label} className={`text-xs flex items-center gap-1.5 ${met ? "text-secondary" : "text-text-muted"}`}>
              <span aria-hidden="true">{met ? "✓" : "○"}</span>
              {rule.label}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default PasswordStrengthMeter;
