import DesktopNavbar from "./DesktopNavbar";
import MobileHeader from "./MobileHeader";
import BottomNavbar from "./BottomNavbar";

function Navbar() {
  return (
    <>
      {/* Desktop */}
      <div className="hidden lg:block">
        <DesktopNavbar />
      </div>

      {/* Mobile */}
      <div className="lg:hidden">
        <MobileHeader />
        <BottomNavbar />
      </div>
    </>
  );
}

export default Navbar;