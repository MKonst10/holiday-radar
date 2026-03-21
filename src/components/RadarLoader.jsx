import "./RadarLoader.css";
import radarIcon from "../assets/icons/radar.svg";
import radarIconWhite from "../assets/icons/radar-w.svg";

const RadarLoader = ({ content = "card", theme }) => {
  return (
    <div className="radar-loader">
      <img
        src={theme === "dark" ? radarIconWhite : radarIcon}
        alt="Radar loading..."
        className="rotating-radar"
      />
      {content === "list" && (
        <p className="loader-text">Scanning holidays...</p>
      )}
      {content === "card" && <p className="loader-text white">Loading </p>}
      {content === "preview" && <></>}
    </div>
  );
};

export default RadarLoader;
