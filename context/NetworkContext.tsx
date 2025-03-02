import React, { createContext, useState, useContext, useEffect } from 'react';
import NetInfo from '@react-native-community/netinfo';

type NetworkContextType = {
    isConnected: boolean;
    checkConnection: () => Promise<boolean>;
};

const NetworkContext = createContext<NetworkContextType>({
    isConnected: true,
    checkConnection: async () => true,
});

export const NetworkProvider = ({ children }: { children: React.ReactNode }) => {
    const [isConnected, setIsConnected] = useState(true);

    const checkConnection = async () => {
        const state = await NetInfo.fetch();
        setIsConnected(!!state.isConnected);
        return !!state.isConnected;
    };

    useEffect(() => {
        // Initial check
        checkConnection();

        // Subscribe to network state updates
        const unsubscribe = NetInfo.addEventListener(state => {
            setIsConnected(!!state.isConnected);
        });

        return () => unsubscribe();
    }, []);

    return (
        <NetworkContext.Provider value={{ isConnected, checkConnection }}>
            {children}
        </NetworkContext.Provider>
    );
};

export const useNetwork = () => useContext(NetworkContext);
