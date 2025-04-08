import { useTranslation } from "react-i18next";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "~/components/ui/pagination";
import { scrollToTop } from "~/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
interface CustomPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  itemsPerPage?: number;
  onItemsPerPageChange?: (itemsPerPage: number) => void;
  paginationText?: React.ReactNode;
}

export function CustomPagination({
  currentPage,
  totalPages,
  onPageChange,
  itemsPerPage = 10,
  onItemsPerPageChange,
  paginationText,
}: CustomPaginationProps) {
  const { t } = useTranslation();
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

  return (
    <div className="flex justify-center mt-4 flex-wrap md:flex-nowrap gap-y-4">
      {paginationText && paginationText}
      <Pagination className="mx-6 w-auto">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={() => {
                onPageChange(Math.max(1, currentPage - 1));
                scrollToTop();
              }}
              disabled={currentPage === 1}
              className="cursor-pointer"
            />
          </PaginationItem>

          {getPageNumbers().map((page, index) => (
            <PaginationItem key={index}>
              {page === "..." ? (
                <PaginationEllipsis />
              ) : (
                <PaginationLink
                  href="#"
                  onClick={() => {
                    onPageChange(Number(page));
                    scrollToTop();
                  }}
                  isActive={currentPage === page}
                >
                  {page}
                </PaginationLink>
              )}
            </PaginationItem>
          ))}

          <PaginationItem>
            <PaginationNext
              onClick={() => {
                onPageChange(Math.min(totalPages, currentPage + 1));
                scrollToTop();
              }}
              disabled={currentPage === totalPages}
              className="cursor-pointer"
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
      <div className="flex items-center">
        <label htmlFor="itemsPerPage" className="mr-2 flex-shrink-0">
          {t("common.pagination.per-page")}:
        </label>
        <Select
          value={String(itemsPerPage)}
          onValueChange={(newValue) => {
            onItemsPerPageChange?.(Number(newValue));
            scrollToTop();
          }}
        >
          <SelectTrigger>
            <SelectValue
              placeholder={t("common.pagination.per-page-placeholder")}
            />
          </SelectTrigger>
          <SelectContent>
            {[10, 20, 50].map((count) => (
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
