'use client';

import { NIAgentProvider } from "./agent-context";
import NISidebar from "./sidebar";
import { ReactNode } from "react";

/**
 * Global AI Wrapper
 * 
 * Provides the NI Agency context and the resident sidebar to the entire application.
 */
export default function NIAIWrapper({ children }: { children: ReactNode }) {
    return (
        <NIAgentProvider>
            {children}
            <NISidebar />
        </NIAgentProvider>
    );
}
