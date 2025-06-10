import "./RadarLoader.css";
import radarIcon from "../assets/icons/radar.svg";

const RadarLoader = ({ content = "card" }) => {
  return (
    <div className="radar-loader">
      <img src={radarIcon} alt="Radar loading..." className="rotating-radar" />
      {content === "list" && (
        <p className="loader-text">Scanning holidays...</p>
      )}
      {content === "card" && <p className="loader-text white">Loading </p>}
    </div>
  );
};

export default RadarLoader;
