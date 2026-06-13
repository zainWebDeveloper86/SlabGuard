import DesktopBottombar from "./DesktopBottombar";
import MobileBottombar from "./MobileBottombar";

const Bottombar = () => {
  return (
    <>
      {/* MOBILE FOOTER */}
      <div className="block md:hidden">
        <MobileBottombar />
      </div>

      {/* DESKTOP FOOTER */}
      <div className="hidden md:block">
        <DesktopBottombar />
      </div>
    </>
  );
};

export default Bottombar;
