import {
  Button,
  Flex,
  Box,
  TextInput,
  Typography,
} from "@strapi/design-system";
import React, { useState } from "react";

interface LocationTextInputProps {
  handleSetLocation: (
    newValue: [number | undefined, number | undefined],
  ) => void;
}

export default function LocationTextInput({
  handleSetLocation,
}: LocationTextInputProps) {
  const [address, setAddress] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setErrorMsg(undefined); // Clear previous errors
    try {
      const url = encodeURI(
        `https://nominatim.openstreetmap.org/search?format=json&q=${address}`,
      );
      const response = await fetch(url);
      const data = await response.json();

      if (Array.isArray(data) && data.length > 0) {
        const { lat, lon } = data[0];
        handleSetLocation([parseFloat(lat), parseFloat(lon)]);
        setErrorMsg(undefined);
      } else {
        setErrorMsg("Address not found. Please try again.");
      }
    } catch (error) {
      setErrorMsg(
        "An error occurred while fetching the location. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box width={"100%"} maxWidth={"436px"}>
      <Flex direction="column" alignItems="stretch" gap={4}>
        <Box>
          <Typography
            variant="pi"
            fontWeight="bold"
            textColor="neutral800"
            as={"label" as any}
          >
            Address
          </Typography>
          <TextInput
            id="address-input"
            placeholder="Enter your address"
            name="address"
            value={address}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setAddress(e.target.value)
            }
            width="100%" // Make the input width larger
            {...(errorMsg ? { "aria-invalid": true } : {})} // Accessibility
          />
        </Box>
        <Flex justifyContent="flex-end" alignItems="center">
          <Button variant="default" loading={loading} onClick={fetchData}>
            Search
          </Button>
        </Flex>
        {errorMsg && (
          <Typography variant="pi" textColor="danger600">
            {errorMsg}
          </Typography>
        )}
      </Flex>
    </Box>
  );
}
