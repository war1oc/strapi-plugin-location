import { Flex, NumberInput, Typography } from "@strapi/design-system";
import React from "react";

const LocationInputForm = ({
  lat,
  lng,
  handleSetLocation,
}: {
  lat: number | undefined;
  lng: number | undefined;
  handleSetLocation: (
    newValue: [number | undefined, number | undefined],
  ) => void;
}) => {
  return (
    <Flex direction="column" gap={4}>
      <Flex gap={4}>
        <Flex direction="column" gap={2}>
          <Typography variant="pi" fontWeight="bold">
            Lat
          </Typography>
          <NumberInput
            name="lat"
            value={lat ?? 0}
            onValueChange={(value) => handleSetLocation([value, lng])}
          />
        </Flex>
        <Flex direction="column" gap={2}>
          <Typography variant="pi" fontWeight="bold">
            Lng
          </Typography>
          <NumberInput
            name="lng"
            value={lng ?? 0}
            onValueChange={(value) => handleSetLocation([lat, value])}
          />
        </Flex>
      </Flex>
    </Flex>
  );
};

export default LocationInputForm;
