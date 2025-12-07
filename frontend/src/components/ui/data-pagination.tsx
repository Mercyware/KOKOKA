import React from 'react';
import { Button } from './button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
} from './pagination';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface DataPaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange?: (itemsPerPage: number) => void;
  showItemsPerPage?: boolean;
  itemsPerPageOptions?: number[];
}

export const DataPagination: React.FC<DataPaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  showItemsPerPage = true,
  itemsPerPageOptions = [10, 25, 50, 100],
}) => {
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const canGoPrevious = currentPage > 1;
  const canGoNext = currentPage < totalPages;

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 7;

    if (totalPages <= maxVisible) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      if (currentPage > 3) {
        pages.push('...');
      }

      // Show pages around current page
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) {
        pages.push('...');
      }

      // Always show last page
      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }

    return pages;
  };

  if (totalItems === 0) {
    return null;
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-200 pt-4">
      {/* Items info */}
      <div className="text-sm text-slate-600">
        Showing <span className="font-medium">{startItem}</span> to{' '}
        <span className="font-medium">{endItem}</span> of{' '}
        <span className="font-medium">{totalItems}</span> results
      </div>

      <div className="flex items-center gap-4">
        {/* Items per page selector */}
        {showItemsPerPage && onItemsPerPageChange && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-600">Per page:</span>
            <Select
              value={itemsPerPage.toString()}
              onValueChange={(value) => onItemsPerPageChange(parseInt(value))}
            >
              <SelectTrigger className="w-20 h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {itemsPerPageOptions.map((option) => (
                  <SelectItem key={option} value={option.toString()}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Page navigation */}
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={!canGoPrevious}
                className="h-9 gap-1 px-2"
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Previous</span>
              </Button>
            </PaginationItem>

            {getPageNumbers().map((page, index) => {
              if (page === '...') {
                return (
                  <PaginationItem key={`ellipsis-${index}`}>
                    <PaginationEllipsis />
                  </PaginationItem>
                );
              }

              return (
                <PaginationItem key={page}>
                  <PaginationLink
                    onClick={(e) => {
                      e.preventDefault();
                      onPageChange(page as number);
                    }}
                    isActive={currentPage === page}
                    className="cursor-pointer"
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              );
            })}

            <PaginationItem>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={!canGoNext}
                className="h-9 gap-1 px-2"
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
};
