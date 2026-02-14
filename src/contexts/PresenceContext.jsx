"use client";

import { createContext, useContext, useEffect, useState, useRef } from "react";
import Ably from "ably";
import { authAPI } from "@/lib/api";

const PresenceContext = createContext({
    onlineUsers: new Set(),
    ablyClient: null
});

export const PresenceProvider = ({ children }) => {
    const [onlineUsers, setOnlineUsers] = useState(new Set());
    const [ablyClient, setAblyClient] = useState(null);
    const channelRef = useRef(null);

    useEffect(() => {
        const user = authAPI.getStoredUser();
        if (!user) return;

        const publicKey = process.env.NEXT_PUBLIC_ABLY_PUBLIC_KEY;
        if (!publicKey) return;

        let client;
        try {
            // Initialize Ably with clientId
            client = new Ably.Realtime({
                key: publicKey,
                clientId: user.id || user._id
            });
            setAblyClient(client);

            const channel = client.channels.get("presence:global");
            channelRef.current = channel;

            // Enter presence
            channel.presence.enter({
                userId: user.id || user._id,
                name: user.fullName
            });

            // Subscribe to updates
            channel.presence.subscribe("enter", (member) => {
                setOnlineUsers((prev) => new Set(prev).add(member.clientId || member.data.userId));
            });

            channel.presence.subscribe("leave", (member) => {
                setOnlineUsers((prev) => {
                    const newSet = new Set(prev);
                    newSet.delete(member.clientId || member.data.userId);
                    return newSet;
                });
            });

            // Initial fetch
            channel.presence.get((err, members) => {
                if (!err) {
                    const userIds = members.map((m) => m.clientId || m.data.userId);
                    setOnlineUsers(new Set(userIds));
                }
            });

        } catch (error) {
            console.error("Presence initialization error:", error);
        }

        return () => {
            if (channelRef.current) {
                channelRef.current.presence.leave();
                channelRef.current.unsubscribe();
            }
            if (client) {
                client.close();
            }
        };
    }, []);

    return (
        <PresenceContext.Provider value={{ onlineUsers, ablyClient }}>
            {children}
        </PresenceContext.Provider>
    );
};

export const usePresence = () => {
    return useContext(PresenceContext);
};
