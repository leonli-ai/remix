import { Ellipsis } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import type { Row } from "@tanstack/react-table";

interface TableActionGroupProps {
    row: Row<any>;
    actionGroup: {
        icon: React.ReactNode;
        label: string;
        onClick: (row: Row<any>) => void;
    }[];
}

export const TableActionGroup = ({ actionGroup, row }: TableActionGroupProps) => {
    return <DropdownMenu>
        <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="text-outline">
                <Ellipsis />
            </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
            {
                actionGroup.map((action) => {
                    return (
                        <DropdownMenuItem key={action.label} className="text-main-color">
                            <Button
                                variant="ghost"
                                className="w-full justify-start"
                                onClick={(event) => {
                                    event.stopPropagation();
                                    action.onClick(row);
                                }}
                            >
                                {action.icon}
                                <span>{action.label}</span>
                            </Button>
                        </DropdownMenuItem>
                    )
                })
            }
        </DropdownMenuContent>
    </DropdownMenu>
}