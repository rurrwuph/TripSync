
const API_BASE_URL = "http://localhost:8000";

export const searchTrips = async (origin, destination, date) => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/search`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ origin, destination, date }),
        });

        if (!response.ok) {
            throw new Error("Failed to fetch trips");
        }

        const data = await response.json();

        return data.trips.map(trip => ({
            id: trip.trip_id,
            from: origin,
            to: destination,
            time: formatTime(trip.departure_time),
            date: formatDate(date),
            price: trip.price,
            seats: trip.seats_available,
            operator: trip.operator,
            type: trip.type
        }));
    } catch (error) {
        console.error("Error searching trips:", error);
        throw error;
    }
};

export const formatTime = (timeString) => {
    if (!timeString) return "";
    // Check if already in AM/PM format
    if (timeString.toLowerCase().includes('m')) return timeString;

    const [hours, minutes] = timeString.split(':');
    const date = new Date();
    date.setHours(parseInt(hours, 10));
    date.setMinutes(parseInt(minutes, 10));

    return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });
};

export const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
    const year = date.getFullYear();

    return `${day}-${month}-${year}`;
};
