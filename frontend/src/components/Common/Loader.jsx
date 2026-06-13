import loadingLogo from "../../assets/slabguard_logo.png";

const Loader = () => {
  return (
    <div className="loader-container">
      <div className="loader-wrapper">
        
        {/* Glow background */}
        <div className="loader-glow"></div>

        {/* Logo */}
        <img
          src={loadingLogo}
          alt="SlabGuard Logo"
          className="logo-animation"
        />
      </div>

      {/* Optional Text */}
      <p className="loader-text">Loading SlabGuard...</p>
    </div>
  );
};

export default Loader;