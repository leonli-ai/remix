import { Loader2 } from "lucide-react";
import type { ReactNode } from "react";
import { createContext, useState } from "react";
import { useLoading } from "~/hooks/use-global-loading";
import type { LoadingContextType } from "~/types/global";

export const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export const LoadingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [isLoading, setIsLoading] = useState(false);

    const setLoading = (loading: boolean) => {
        setIsLoading(loading);
    };

    return (
        <LoadingContext.Provider value={{ isLoading, setLoading }}>
            {children}
        </LoadingContext.Provider>
    );
};

export const LoadingIndicator: React.FC = () => {
    const { isLoading } = useLoading();

    if (!isLoading) return null;

    return (
        <div className="fixed inset-0 z-[100] bg-black bg-opacity-50 flex justify-center items-center">
            <div className="text-white"><Loader2 className="h-6 w-6 animate-spin" /></div>
        </div>
    );
};

export const Loading = () => {
    return (
        <div className="fixed inset-0 z-[100] bg-black bg-opacity-50 flex justify-center items-center">
            <div className="text-white"><Loader2 className="h-6 w-6 animate-spin" /></div>
        </div>
    );
};
