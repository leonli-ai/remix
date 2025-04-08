import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
} from "~/components/ui/pagination";
import { cn, scrollToTop } from "~/lib/utils";

import { ChevronLeftIcon, ChevronRightIcon, ChevronDownIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "../ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

interface CustomPaginationNewProps {
  currentPage: number;
  totalPages: number;
  itemsPerPage?: number;
  onItemsPerPageChange?: (itemsPerPage: number) => void;
  hasPreviousButton?: boolean;
  onPreviousPageChange?: () => void;
  hasNextButton?: boolean;
  onNextPageChange?: () => void;
  onPageChange?: (page: number) => void;
}

export function CustomPaginationNew({
  currentPage,
  totalPages,
  hasPreviousButton = false,
  onPreviousPageChange,
  hasNextButton = false,
  onNextPageChange,
  itemsPerPage = 10,
  onItemsPerPageChange,
  onPageChange,
}: CustomPaginationNewProps) {
  const isFirstPage = currentPage === 1;
  const isLastPage = currentPage === totalPages;
  // Generate array of page numbers to display
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    // Always show first page
    pages.push(1);
    if (currentPage > 3) {
      pages.push("...");
    }
    // Show pages around current page
    for (
      let i = Math.max(2, currentPage - 1);
      i <= Math.min(totalPages - 1, currentPage + 1);
      i++
    ) {
      if (i === 1 || i === totalPages) continue;
      pages.push(i);
    }
    if (currentPage < totalPages - 2) {
      pages.push("...");
    }
    // If total pages is greater than 1, show last page
    if (totalPages > 1) {
      pages.push(totalPages);
    }
    return pages;
  };

  const { t } = useTranslation();

  return (
    <div className="mt-4 flex flex-wrap justify-center md:flex-nowrap gap-y-3">
      <Pagination className="mx-6 w-auto">
        <PaginationContent className="gap-6">
          <Button
            variant="outline"
            size="icon"
            className={cn(
              "h-[38px] w-[38px]",
              isFirstPage && "border-grey-middle",
            )}
            disabled={!hasPreviousButton}
            onClick={() => {
              onPreviousPageChange?.();
              onPageChange?.(currentPage - 1);
              scrollToTop();
            }}
          >
            <ChevronLeftIcon
              className="!w-[20px] !h-[20px]"
              strokeWidth={3}
              stroke={isFirstPage ? "#BCBDB9" : "hsl(var(--outline))"}
            />
          </Button>

          {getPageNumbers().map((page, index) => (
            <PaginationItem key={index}>
              {page === "..." ? (
                <PaginationEllipsis className="w-auto pt-2" />
              ) : (
                <PaginationLink
                  onClick={() => {
                    onPageChange?.(Number(page));
                    scrollToTop();
                  }}
                  isActive={currentPage === page}
                  className={cn(
                    "w-auto cursor-default border-none p-0 shadow-none hover:bg-transparent",
                    onPageChange && "cursor-pointer",
                  )}
                >
                  {page}
                </PaginationLink>
              )}
            </PaginationItem>
          ))}

          {/* next button */}
          <Button
            variant="outline"
            size="icon"
            className={cn(
              "h-[38px] w-[38px]",
              isLastPage && "border-grey-middle",
            )}
            disabled={!hasNextButton}
            onClick={() => {
              onNextPageChange?.();
              onPageChange?.(currentPage + 1);
              scrollToTop();
            }}
          >
            <ChevronRightIcon
              className="!w-[20px] !h-[20px]"
              strokeWidth={3}
              stroke={isLastPage ? "#BCBDB9" : "hsl(var(--outline))"}
            />
          </Button>
        </PaginationContent>
      </Pagination>
      <div className="flex items-center">
        <label
          htmlFor="itemsPerPage"
          className="mr-[10px] flex-shrink-0 text-sm"
        >
          {t("common.pagination.per-page")}:
        </label>
        <Select
          value={String(itemsPerPage)}
          onValueChange={(newValue) => {
            onItemsPerPageChange?.(Number(newValue));
            scrollToTop();
          }}
        >
          <SelectTrigger
            className="h-[44px] w-auto border border-gray-middle"
            icon={<ChevronDownIcon className="!w-[20px] !h-[20px] ml-2" strokeWidth={3} />}
          >
            <SelectValue
              placeholder={t("common.pagination.per-page-placeholder")}
            />
          </SelectTrigger>
          <SelectContent>
            {[10, 20, 50, 100].map((count) => (
              <SelectItem key={count} value={String(count)}>
                {count}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
