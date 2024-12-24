import React, { useEffect, useRef, useState } from 'react';
import { withTranslation } from "react-i18next"; 



function loadAsyncScript(src) {
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.type = "text/javascript";
    script.async = true;
    script.src = src;
    script.onload = () => resolve(script);
    script.onerror = (e) => reject(e);
    document.head.appendChild(script);
  });
}

const extractAddress = (place) => {
  const address = {
    country: "",
    state: "",
    city: "",
    neighborhood: "",
    street: "",
    build: "",
    postalCode: ""
  };

  if (!Array.isArray(place?.address_components)) {
    return address;
  }

  place.address_components.forEach(component => {
    const types = component.types;
    const value = component.long_name;

    if (types.includes("country")) {
      address.country = value;
    }
    if (types.includes("administrative_area_level_2")) {
      address.state = value;
    }
    if (types.includes("administrative_area_level_1")) {
      address.city = value;
    }
    if (types.includes("administrative_area_level_4") || types.includes("neighborhood")) {
      address.neighborhood = value;
    }
    if (types.includes("route")) {
      address.street = value;
    }
    if (types.includes("street_number")) {
      address.build = value;
    }
    if (types.includes("postal_code")) {
      address.postalCode = value;
    }
  });

  return address;
};

const MapAddress = ({ apiKey, defaultCenter, onLocationChange, t }) => {
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [marker, setMarker] = useState(null);
  const [address, setAddress] = useState({
    country: "",
    state: "",
    city: "",
    neighborhood: "",
    street: "",
    build: "",
    postalCode: ""
  });
  const [error, setError] = useState(null);

  const initMapScript = () => {
    if (window.google) {
      return Promise.resolve();
    }
    if (!apiKey) {
      setError("Google Maps API key is missing!");
      return Promise.reject("Google Maps API key is missing!");
    }

    const src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&v=weekly`;
    return loadAsyncScript(src).catch((e) => {
      setError("Failed to load Google Maps script. Please try again later.");
      console.error("Failed to load Google Maps script:", e);
    });
  };

  const initMap = (lat, lng) => {
    if (!mapRef.current) return;

    const map = new window.google.maps.Map(mapRef.current, {
      center: { lat, lng },
      zoom: 12,
    });

    const marker = new window.google.maps.Marker({
      map: map,
      position: { lat, lng },
      draggable: true,
    });

    
    setMap(map);
    setMarker(marker);

    window.google.maps.event.addListener(marker, 'dragend', () => {
      const position = marker.getPosition();
      reverseGeocode(position);
    });

    window.google.maps.event.addListener(map, 'click', (event) => {
      const position = event.latLng;
      marker.setPosition(position);
      reverseGeocode(position.lat(), position.lng());
    });
  };

  const reverseGeocode = (lat, lng) => {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?key=${apiKey}&latlng=${lat},${lng}`;

    fetch(url)
      .then(response => response.json())
      .then(location => {
        if (location.status === "OK") {
          const place = location.results[0];
          const _address = extractAddress(place);
          const formattedAddress = place.formatted_address;
          const latlng = `${lat},${lng}`;
          onLocationChange(latlng, formattedAddress);
          setAddress(prev => ({
            ...prev,
            ..._address
          }));
        } else {
          setError("Failed to retrieve location details. Please try again.");
        }
      })
      .catch(error => {
        setError('Error with reverse geocoding. Please try again.');
      });
  };

  useEffect(() => {
    const getLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            reverseGeocode(position.coords.latitude, position.coords.longitude);
            initMap(position.coords.latitude, position.coords.longitude);
          },
          (error) => {
            setError("Unable to retrieve your location.");
            initMap(defaultCenter.lat, defaultCenter.lng);
          }
        );
      } else {
        setError("Geolocation is not supported by this browser.");
        initMap(defaultCenter.lat, defaultCenter.lng);
      }
    };

    initMapScript().then(() => {
      if (window.google) {
        getLocation();
      }
    });
  }, [apiKey]);

  return (
    <div>
      <div className="map-container">
        {error ? (
          <div className="error-message">
            {error}
          </div>
        ) : (
          <div ref={mapRef} className="map" style={{ height: '400px', width: '100%' }}></div>
        )}
      </div>
      <div className="address-container">
      <div className="address-field">
          <label>{t("Country")}:</label>
          <input
            type="text"
            value={address.country}
            onChange={(e) => setAddress(prev => ({ ...prev, country: e.target.value }))}
          />
        </div>
        <div className="address-field">
          <label>{t("State")}:</label>
          <input
            type="text"
            value={address.state}
            onChange={(e) => setAddress(prev => ({ ...prev, state: e.target.value }))}
          />
        </div>
        <div className="address-field">
          <label>{t("City")}:</label>
          <input
            type="text"
            value={address.city}
            onChange={(e) => setAddress(prev => ({ ...prev, city: e.target.value }))}
          />
        </div>
        <div className="address-field">
          <label>{t("Neighborhood")}:</label>
          <input
            type="text"
            value={address.neighborhood}
            onChange={(e) => setAddress(prev => ({ ...prev, neighborhood: e.target.value }))}
          />
        </div>
        <div className="address-field">
          <label>{t("Street")}:</label>
          <input
            type="text"
            value={address.street}
            onChange={(e) => setAddress(prev => ({ ...prev, street: e.target.value }))}
          />
        </div>
        <div className="address-field">
          <label>{t("Build")}:</label>
          <input
            type="text"
            value={address.build}
            onChange={(e) => setAddress(prev => ({ ...prev, build: e.target.value }))}
          />
        </div>
        <div className="address-field">
          <label>{t("Postal Code")}:</label>
          <input
            type="text"
            value={address.postalCode}
            onChange={(e) => setAddress(prev => ({ ...prev, postalCode: e.target.value }))}
          />
        </div>
      </div>
    </div>
  );
};

export default withTranslation()(MapAddress); 