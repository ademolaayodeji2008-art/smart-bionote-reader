import { Outlet } from "react-router-dom";
import Navbar from "../components/navigation/Navbar.jsx";
import Footer from "../components/navigation/Footer.jsx";

/** Shared shell (navbar + footer) for all public-facing pages. */
const MainLayout = () => {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;
