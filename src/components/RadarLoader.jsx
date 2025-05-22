import "./RadarLoader.css";
import radarIcon from "../assets/icons/radar.svg";

const RadarLoader = () => {
  return (
    <div className="radar-loader">
      <img src={radarIcon} alt="Radar loading..." className="rotating-radar" />
      <p>Scanning holidays...</p>
    </div>
  );
};

export default RadarLoader;
