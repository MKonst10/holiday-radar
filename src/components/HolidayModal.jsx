import "./HolidayModal.css";
import { useUnsplashImage } from "../hooks/useUnsplashImage";
import useRegionNames from "../hooks/useRegionNames";
import { fetchHolidayDescriptions } from "../services/calendarificAPI";
import { createShareMessage } from "../utils/shareMessage";
import { useMemo, useState, useEffect } from "react";
import {
  XMarkIcon,
  ShareIcon,
  GlobeAltIcon as GlobalIcon,
  CalendarDaysIcon as CalendarIcon,
  TagIcon as TypeIcon,
  MapPinIcon as PinIcon,
  DocumentTextIcon as DescriptionIcon,
  RocketLaunchIcon as LaunchYearIcon,
} from "@heroicons/react/24/outline";
import { SparklesIcon } from "@heroicons/react/24/solid";
import RadarLoader from "./RadarLoader";

const HolidayModal = ({ holiday, onClose }) => {
  const [description, setDescription] = useState("");
  const [descriptionLoading, setDescriptionLoading] = useState(true);
  const { title, text } = createShareMessage(holiday);

  const subdivisionCodes = useMemo(
    () => holiday.counties || [],
    [holiday.counties]
  );
  const regionNames = useRegionNames(subdivisionCodes);
  const { imageUrl, loading: imageLoading } = useUnsplashImage(
    holiday?.name || ""
  );

  const handleShare = async () => {
    try {
      await navigator.share({
        title,
        text,
      });
    } catch (err) {
      console.warn("Share failed:", err);
    }
  };

  const modalLoading = imageLoading || descriptionLoading;

  useEffect(() => {
    const loadDescription = async () => {
      if (!holiday?.name || !holiday?.date || !holiday?.countryCode) {
        setDescriptionLoading(false);
        return;
      }

      try {
        const year = new Date(holiday.date).getFullYear();
        const data = await fetchHolidayDescriptions(holiday.countryCode, year);

        const match = data.find(
          (item) =>
            item.name.toLowerCase().trim() ===
              holiday.name.toLowerCase().trim() && item.date === holiday.date
        );

        if (match?.description) {
          setDescription(match.description);
        }
      } catch (e) {
        console.warn("Failed to load description:", e);
      } finally {
        setDescriptionLoading(false);
      }
    };

    loadDescription();
  }, [holiday]);

  if (!holiday) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      {modalLoading ? (
        <RadarLoader content="card" />
      ) : (
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          {new Date(holiday.date).toDateString() ===
            new Date().toDateString() && (
            <div className="holiday-banner">
              <SparklesIcon className="icon today" /> Happy Holiday!
            </div>
          )}
          <div className="modal-buttons">
            <button
              className="modal-share"
              onClick={handleShare}
              aria-label="Share"
            >
              <ShareIcon className="icon" />
            </button>
            <button
              className="modal-close"
              onClick={onClose}
              aria-label="Close"
            >
              <XMarkIcon className="icon" />
            </button>
          </div>

          <h2>{holiday.localName}</h2>
          <p className="modal-sub">{holiday.name}</p>

          <div className="modal-detail">
            <p>
              <strong>
                <CalendarIcon className="icon" /> Date:
              </strong>{" "}
              {new Date(holiday.date).toLocaleDateString(undefined, {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>

            <p>
              <strong>
                <GlobalIcon className="icon" /> Global:
              </strong>{" "}
              {holiday.global ? "Yes" : "No"}
            </p>
            {holiday.launchYear && (
              <p>
                <strong>
                  <LaunchYearIcon /> Launch year:
                </strong>{" "}
                {holiday.launchYear}
              </p>
            )}
            {holiday.types?.length > 0 && (
              <p>
                <strong>
                  <TypeIcon className="icon" /> Type:
                </strong>{" "}
                {holiday.types.join(", ")}
              </p>
            )}
            {regionNames.length > 0 && (
              <p className="modal-regions">
                <strong>
                  <PinIcon className="icon" /> Applies to:
                </strong>{" "}
                {regionNames.join(", ")}
              </p>
            )}
            {description && (
              <p className="modal-description">
                <strong>
                  <DescriptionIcon className="icon" /> Description:
                </strong>{" "}
                {description}
              </p>
            )}
          </div>

          <img
            src={imageUrl || "/fallback.jpg"}
            alt={holiday.name}
            className={`modal-image`}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "/fallback.jpg";
            }}
            style={{ display: imageUrl ? "block" : "none" }}
          />
        </div>
      )}
    </div>
  );
};

export default HolidayModal;
