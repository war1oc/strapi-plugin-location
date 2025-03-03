/**
 *
 * LocationInput
 *
 */

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Box, Button, Flex, Modal, Typography } from "@strapi/design-system";
import * as L from "leaflet";
import { MapContainer, Marker, TileLayer, useMap } from "react-leaflet";
import LocationInputForm from "./LocationInputForm";
import LocationTextInput from "./LocationTextInput";

import "leaflet/dist/leaflet.css";

// Utility function to parse the input value
const parseValue = (
  value: string,
): [number | undefined, number | undefined] => {
  try {
    const object = JSON.parse(value);

    if (!object?.lat || !object?.lng) {
      return [undefined, undefined];
    }

    return [object.lat, object.lng];
  } catch (error) {
    return [undefined, undefined];
  }
};

// Define component props type
interface LocationInputProps {
  value: string;
  onChange: (e: {
    target: { name: string; value: string; type: string };
  }) => void;
  name: string;
  attribute: { type: string };
}

const LocationInput: React.FC<LocationInputProps> = ({
  value,
  onChange,
  name,
  attribute,
}) => {
  const defaultCoordinates = [49.195678016117164, 16.608182539182483];
  const [[lat, lng], setLocation] = useState<
    [number | undefined, number | undefined]
  >(parseValue(value));

  const markerRef = useRef<L.Marker>(null);

  // Map fly-to functionality
  const FlyMapTo = () => {
    const map = useMap();

    useEffect(() => {
      map.setView(
        [lat || defaultCoordinates[0], lng || defaultCoordinates[1]],
        15,
      );
    }, [lat, lng, map]);

    return null;
  };

  // Handle drag events for the marker
  const eventHandlers = useMemo(
    () => ({
      dragend() {
        if (markerRef.current) {
          const { lat: newLat, lng: newLng } = markerRef.current.getLatLng();
          handleSetLocation([newLat, newLng]);
        }
      },
    }),
    [],
  );

  // Update location and trigger onChange
  const handleSetLocation = (
    newValue: [number | undefined, number | undefined],
  ) => {
    setLocation(newValue);
    onChange({
      target: {
        name,
        value: JSON.stringify({ lat: newValue[0], lng: newValue[1] }),
        type: attribute.type,
      },
    });
  };

  return (
    <Box>
      <Typography fontWeight="bold" variant="pi">
        {name}
      </Typography>
      <Flex direction="column" gap={4}>
        <LocationInputForm
          lat={lat}
          lng={lng}
          handleSetLocation={handleSetLocation}
        />
        <Modal.Root>
          <Modal.Trigger>
            <Button>Open map</Button>
          </Modal.Trigger>
          <Modal.Content>
            <Modal.Header>
              <Modal.Title>Set Location</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Flex direction="column" gap={6}>
                <LocationInputForm
                  lat={lat}
                  lng={lng}
                  handleSetLocation={handleSetLocation}
                />
                <LocationTextInput handleSetLocation={handleSetLocation} />
                <Box height="300px" style={{ width: "100%" }}>
                  <MapContainer
                    center={[
                      lat || defaultCoordinates[0],
                      lng || defaultCoordinates[1],
                    ]}
                    zoom={12}
                    scrollWheelZoom={false}
                    style={{ height: "100%", width: "100%" }}
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <Marker
                      draggable
                      eventHandlers={eventHandlers}
                      ref={markerRef}
                      position={[
                        lat || defaultCoordinates[0],
                        lng || defaultCoordinates[1],
                      ]}
                    />
                    <FlyMapTo />
                  </MapContainer>
                </Box>
              </Flex>
            </Modal.Body>
            <Modal.Footer>
              <Modal.Close>
                <Button variant="tertiary">Done</Button>
              </Modal.Close>
            </Modal.Footer>
          </Modal.Content>
        </Modal.Root>
      </Flex>
    </Box>
  );
};

export default LocationInput;
