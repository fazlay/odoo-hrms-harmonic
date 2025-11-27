// hooks/useLocation.ts
// Purpose: Hook to get current location with permission handling

import * as Location from "expo-location";
import { useState } from "react";

export interface LocationCoords {
    latitude: number;
    longitude: number;
}

export interface UseLocationResult {
    location: LocationCoords | null;
    isLoading: boolean;
    error: string | null;
    requestLocation: () => Promise<LocationCoords | null>;
}

export const useLocation = (): UseLocationResult => {
    const [location, setLocation] = useState<LocationCoords | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const requestLocation = async (): Promise<LocationCoords | null> => {
        try {
            setIsLoading(true);
            setError(null);

            // Request permission
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== "granted") {
                setError("Location permission denied");
                return null;
            }

            // Get current position
            const position = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.High,
            });

            const coords: LocationCoords = {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
            };

            setLocation(coords);
            return coords;
        } catch (err: any) {
            const errorMessage = err.message || "Failed to get location";
            setError(errorMessage);
            console.error("❌ Error getting location:", errorMessage);
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    return {
        location,
        isLoading,
        error,
        requestLocation,
    };
};
