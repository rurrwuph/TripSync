import React, { createContext, useState, useContext } from 'react';

const TripContext = createContext();

export const useTrips = () => useContext(TripContext);

export const TripProvider = ({ children }) => {
    const [searchResults, setSearchResults] = useState([]);
    const [isSearchActive, setIsSearchActive] = useState(false);

    // You might want to persist 'allTrips' here if it's dynamic, 
    // but for now we focus on sharing search results from the bot.

    return (
        <TripContext.Provider value={{ searchResults, setSearchResults, isSearchActive, setIsSearchActive }}>
            {children}
        </TripContext.Provider>
    );
};
