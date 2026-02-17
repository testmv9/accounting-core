'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

/**
 * ARCHITECTURE ALIGNMENT:
 * As per NI_ARCHITECTURE.md, we limit to exactly 3 personas.
 */
export type NIPersona = 'SENIOR_PARTNER' | 'INTAKE_CLERK' | 'CHIEF_OF_STAFF';

interface Message {
    role: 'user' | 'assistant' | 'system';
    content: string;
    persona?: NIPersona;
    timestamp: string;
}

interface NIContextType {
    activePersona: NIPersona;
    setActivePersona: (persona: NIPersona) => void;
    messages: Message[];
    addMessage: (msg: Message) => void;
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
}

const NIContext = createContext<NIContextType | undefined>(undefined);

export function NIAgentProvider({ children }: { children: ReactNode }) {
    const [activePersona, setActivePersona] = useState<NIPersona>('SENIOR_PARTNER');
    const [messages, setMessages] = useState<Message[]>([]);
    const [isOpen, setIsOpen] = useState(false);

    const addMessage = (msg: Message) => {
        setMessages(prev => [...prev, msg]);
    };

    return (
        <NIContext.Provider value={{
            activePersona,
            setActivePersona,
            messages,
            addMessage,
            isOpen,
            setIsOpen
        }}>
            {children}
        </NIContext.Provider>
    );
}

export function useNIAgent() {
    const context = useContext(NIContext);
    if (!context) {
        throw new Error('useNIAgent must be used within an NIAgentProvider');
    }
    return context;
}
