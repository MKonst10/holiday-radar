import "./HolidayModal.css";
import { useUnsplashImage } from "../hooks/useUnsplashImage";

const HolidayModal = ({ holiday, onClose }) => {
  const { imageUrl, loading: imageLoading } = useUnsplashImage(
    holiday?.name || ""
  );
  if (!holiday) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          ✖
        </button>

        <h2>{holiday.localName}</h2>
        <p className="modal-sub">{holiday.name}</p>

        <div className="modal-detail">
          <p>
            <strong>📅 Date:</strong> {holiday.date}
          </p>
          <p>
            <strong>🌐 Global:</strong> {holiday.global ? "Yes" : "No"}
          </p>
          {holiday.launchYear && (
            <p>
              <strong>🚀 Launch year:</strong> {holiday.launchYear}
            </p>
          )}
          {holiday.types?.length > 0 && (
            <p>
              <strong>🏷️ Types:</strong> {holiday.types.join(", ")}
            </p>
          )}
          {holiday.counties && (
            <p>
              <strong>📍 Applies to:</strong> {holiday.counties.join(", ")}
            </p>
          )}
        </div>

        {!imageLoading && imageUrl && (
          <img
            src={imageUrl || "/fallback.jpg"}
            alt={holiday.name}
            className={`modal-image ${imageUrl ? "loaded" : ""}`}
            onLoad={(e) => e.target.classList.add("loaded")}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "/fallback.jpg";
            }}
          />
        )}
      </div>
    </div>
  );
};

export default HolidayModal;
