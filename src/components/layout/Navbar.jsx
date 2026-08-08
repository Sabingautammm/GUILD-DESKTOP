import DesktopNavbar from "./DesktopNavbar";
import MobileHeader from "./MobileHeader";
import BottomNavbar from "./BottomNavbar";

export default function Navbar() {
  return (
    <>
      <div className="hidden lg:block">
        <DesktopNavbar />
      </div>
      <div className="lg:hidden">
        <MobileHeader />
        <BottomNavbar />
      </div>
    </>
  );
}
