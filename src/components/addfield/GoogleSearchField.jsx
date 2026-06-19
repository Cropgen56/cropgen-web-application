import React, { useEffect, useRef } from "react";
import { useMap } from "react-leaflet";

const GoogleSearchField = ({ setMapCenter, setHasCenteredOnUser }) => {
  const inputRef = useRef(null);
  const autocompleteRef = useRef(null);
  useMap();

  useEffect(() => {
    const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
      console.error("Missing GOOGLE_MAPS_API_KEY");
      return;
    }

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
      if (!inputRef.current) return;
      if (autocompleteRef.current) return;

      autocompleteRef.current = new window.google.maps.places.Autocomplete(
        inputRef.current,
        {
          fields: ["geometry", "name", "formatted_address"],
          componentRestrictions: { country: "in" },
        },
      );

      autocompleteRef.current.addListener("place_changed", () => {
        const place = autocompleteRef.current.getPlace();

        if (!place.geometry?.location) {
          alert("Location not found");
          return;
        }

        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();

        setMapCenter({ lat, lng });
        setHasCenteredOnUser(true);
      });
    });

    return () => {
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
        placeholder="Search location"
        className="w-full rounded-full bg-white px-5 py-3 text-sm text-gray-800 shadow-md outline-none"
      />
    </div>
  );
};

export default React.memo(GoogleSearchField);