const API_URL = "http://localhost:8000";

const getAuthHeader = () => {
    const token = localStorage.getItem("accessToken");
    return token ? { "Authorization": `Bearer ${token}` } : {};
};

export const apiRequest = async (endpoint, options = {}) => {
    const url = `${API_URL}${endpoint}`;
    const headers = {
        "Content-Type": "application/json",
        ...getAuthHeader(),
        ...options.headers,
    };

    const config = {
        ...options,
        headers,
    };

    const response = await fetch(url, config);

    if (response.status === 401) {
        // Optional: Handle unauthorized (e.g., redirect to login)
        localStorage.removeItem("accessToken");
        localStorage.removeItem("currentUser");
        // window.location.href = "/login";
    }

    return response;
};

export default apiRequest;
