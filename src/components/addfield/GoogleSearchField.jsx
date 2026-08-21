import React, { useEffect, useRef } from "react";
import { useMap } from "react-leaflet";

const COORD_PATTERN =
  /^\s*([+-]?\d+(?:\.\d+)?)\s*([NnSs])?\s*[,;\s/]+\s*([+-]?\d+(?:\.\d+)?)\s*([EeWw])?\s*$/;

const applyHemisphere = (value, hemisphere, negativeLetters) => {
  if (!hemisphere) return value;
  const abs = Math.abs(value);
  return negativeLetters.includes(hemisphere.toUpperCase()) ? -abs : abs;
};

export const parseLatLng = (value) => {
  if (!value || typeof value !== "string") return null;

  const match = value.trim().match(COORD_PATTERN);
  if (!match) return null;

  let lat = applyHemisphere(parseFloat(match[1]), match[2], "S");
  let lng = applyHemisphere(parseFloat(match[3]), match[4], "W");

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;

  // GIS paste order is sometimes lng, lat.
  if (Math.abs(lat) > 90 && Math.abs(lng) <= 90 && Math.abs(lat) <= 180) {
    [lat, lng] = [lng, lat];
  }

  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return null;

  return { lat, lng };
};

const GoogleSearchField = ({ setMapCenter, setHasCenteredOnUser }) => {
  const inputRef = useRef(null);
  const autocompleteRef = useRef(null);
  const goToLocationRef = useRef(() => {});
  useMap();

  goToLocationRef.current = (lat, lng) => {
    setMapCenter({ lat, lng });
    setHasCenteredOnUser(true);
  };

  useEffect(() => {
    const input = inputRef.current;
    if (!input) return undefined;

    const handleCoordinateSearch = (rawValue) => {
      const coords = parseLatLng(rawValue);
      if (!coords) return false;

      goToLocationRef.current(coords.lat, coords.lng);
      return true;
    };

    const onSearchKeyDown = (event) => {
      if (event.key !== "Enter") return;

      if (handleCoordinateSearch(event.target.value)) {
        event.preventDefault();
        event.stopPropagation();
      }
    };

    input.addEventListener("keydown", onSearchKeyDown, true);

    return () => {
      input.removeEventListener("keydown", onSearchKeyDown, true);
    };
  }, []);

  useEffect(() => {
    const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
      console.error("Missing GOOGLE_MAPS_API_KEY");
      return undefined;
    }

    let cancelled = false;

    const loadGoogleScript = () =>
      new Promise((resolve) => {
        if (window.google?.maps?.places) {
          resolve();
          return;
        }

        const existingScript = document.getElementById("google-places-script");

        if (existingScript) {
          existingScript.addEventListener("load", resolve, { once: true });
          return;
        }

        const script = document.createElement("script");
        script.id = "google-places-script";
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
        script.async = true;
        script.defer = true;
        script.onload = resolve;

        document.body.appendChild(script);
      });

    loadGoogleScript().then(() => {
      if (cancelled || !inputRef.current || autocompleteRef.current) return;

      autocompleteRef.current = new window.google.maps.places.Autocomplete(
        inputRef.current,
        {
          fields: ["geometry", "name", "formatted_address"],
        },
      );

      autocompleteRef.current.addListener("place_changed", () => {
        const query = inputRef.current?.value || "";
        const coords = parseLatLng(query);

        if (coords) {
          goToLocationRef.current(coords.lat, coords.lng);
          return;
        }

        const place = autocompleteRef.current.getPlace();

        if (!place.geometry?.location) {
          alert("Location not found. Try a place name or lat, lng.");
          return;
        }

        goToLocationRef.current(
          place.geometry.location.lat(),
          place.geometry.location.lng(),
        );
      });
    });

    return () => {
      cancelled = true;

      if (autocompleteRef.current && window.google?.maps?.event) {
        window.google.maps.event.clearInstanceListeners(
          autocompleteRef.current,
        );
      }
    };
  }, [setMapCenter, setHasCenteredOnUser]);

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[2000] w-[90%] max-w-[420px]">
      <input
        ref={inputRef}
        type="text"
        placeholder="Search location or lat, lng"
        className="w-full rounded-full bg-white px-5 py-3 text-sm text-gray-800 shadow-md outline-none"
      />
    </div>
  );
};

export default React.memo(GoogleSearchField);
