import logoIcon from "../../assets/images/logo/smart-bionote-reader-icon.png";
import { APP_NAME } from "../../utils/constants.js";

const SIZE_CLASSES = {
  sm: "h-8 w-8",
  md: "h-10 w-10",
  lg: "h-14 w-14",
};

/** Brand mark used across the splash screen, navbar, sidebar, and footer. */
const Logo = ({ size = "md", showName = true, className = "" }) => {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <img src={logoIcon} alt={`${APP_NAME} logo`} className={`${SIZE_CLASSES[size]} object-contain`} />
      {showName && (
        <span className="text-lg font-semibold tracking-tight text-text-strong">{APP_NAME}</span>
      )}
    </div>
  );
};

export default Logo;
