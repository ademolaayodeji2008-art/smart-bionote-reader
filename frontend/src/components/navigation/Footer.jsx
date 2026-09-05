import { Link } from "react-router-dom";
import Logo from "../ui/Logo.jsx";
import { APP_SLOGAN } from "../../utils/constants.js";

const FOOTER_LINKS = [
  { label: "Features", to: "/features" },
  { label: "About", to: "/about" },
  { label: "Login", to: "/login" },
  { label: "Register", to: "/register" },
];

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-6 text-center md:flex-row md:items-start md:justify-between md:text-left">
          <div>
            <Logo size="sm" />
            <p className="text-small mt-2 text-text-muted">{APP_SLOGAN}</p>
          </div>

          <nav aria-label="Footer" className="flex flex-wrap justify-center gap-x-6 gap-y-2 md:justify-end">
            {FOOTER_LINKS.map((link) => (
              <Link key={link.to} to={link.to} className="text-small text-text-muted hover:text-primary">
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <p className="text-small mt-8 text-center text-text-muted md:text-left">
          &copy; {year} Smart Bionote Reader. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
