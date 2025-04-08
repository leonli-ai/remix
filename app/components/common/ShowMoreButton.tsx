import { Loader2 } from "lucide-react";
import { Button } from "../ui/button";

interface ShowMoreButtonProps {
    onClick: () => void;
    isLoading?: boolean;
}

export default function ShowMoreButton({
    onClick,
    isLoading,
}: ShowMoreButtonProps) {
    return (
        <Button
            variant={"ghost"}
            onClick={onClick}
            disabled={isLoading}
            className="w-full py-3 text-center text-main-color font-medium"
        >
            {isLoading ? <Loader2 /> : <span>Show More</span>}
        </Button>
    );
}
