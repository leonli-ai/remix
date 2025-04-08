import { Filter } from "lucide-react";
import { Button } from "../ui/button";
import { cn } from "~/lib/utils";
import { Separator } from "../ui/separator";
import { useMediaQuery } from "@shopify/polaris";
import { useTranslation } from "react-i18next";

interface DynamicFilterBuilderHeaderControlButtonProps {
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;
  setShowMobileFilter: (show: boolean) => void;
  hideFilterTextWhileMobile?: boolean;
}

interface DynamicFilterBuilderHeaderProps
  extends DynamicFilterBuilderHeaderControlButtonProps {
  totalItems?: number;
  showTotalItems?: boolean;
  title?: string;
  children?: React.ReactNode;
  className?: string;
  hideSeparator?: boolean;
}

export function DynamicFilterBuilderHeaderControlButton({
  showFilters,
  setShowFilters,
  setShowMobileFilter,
  hideFilterTextWhileMobile = false,
}: DynamicFilterBuilderHeaderControlButtonProps) {
  const isMobile = useMediaQuery("(max-width: 1024px)");
  const { t } = useTranslation();
  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="icon"
        onClick={() => {
          if (isMobile) {
            setShowMobileFilter(true);
          } else {
            setShowFilters(!showFilters);
          }
        }}
        className={cn(
          " border-gray-300 text-transparent hover:text-transparent",
          showFilters && !isMobile ? "bg-blue-50 border-blue-500" : "",
        )}
      >
        <Filter
          className={cn(
            "h-4 w-4",
            showFilters && !isMobile ? "fill-blue-900" : "fill-black",
          )}
        />
      </Button>

      {hideFilterTextWhileMobile && isMobile ? null : (
        <span
          className={cn(
            "text-sm text-primary-text",
            showFilters && !isMobile ? "text-primary-main font-bold" : "",
          )}
        >
          {t("dynamic-filter-builder.header.filters")}
        </span>
      )}
    </div>
  );
}

export function DynamicFilterBuilderHeader({
  showFilters,
  setShowFilters,
  totalItems,
  showTotalItems = true,
  title = "items",
  children,
  setShowMobileFilter,
  hideFilterTextWhileMobile = false,
  className,
  hideSeparator = false,
}: DynamicFilterBuilderHeaderProps) {
  const isMobile = useMediaQuery("(max-width: 768px)");
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <DynamicFilterBuilderHeaderControlButton
        showFilters={showFilters}
        setShowFilters={setShowFilters}
        setShowMobileFilter={setShowMobileFilter}
        hideFilterTextWhileMobile={hideFilterTextWhileMobile}
      />
      {!hideSeparator &&
        (isMobile && hideFilterTextWhileMobile ? null : (
          <Separator orientation="vertical" className="h-6" />
        ))}
      {showTotalItems && totalItems !== undefined && (
        <span className="text-sm text-primary-text">
          <span className="font-bold">{totalItems.toLocaleString()}</span>{" "}
          {title}
        </span>
      )}
      {children}
    </div>
  );
}
