import React from "react";
import { Pagination, PaginationItem, PaginationLink } from "reactstrap";

const TableButtons = ({
  totalPages,
  currentPage,
  onPageChange,
  t,
}) => {
  const pageRangeDisplayed = 2; 
  const pages = [];
  const startPage = Math.max(1, currentPage - pageRangeDisplayed);
  const endPage = Math.min(totalPages, currentPage + pageRangeDisplayed);

  for (let i = startPage; i <= endPage; i++) {
    pages.push(
      <PaginationItem active={i === currentPage} key={i}>
        <PaginationLink onClick={() => onPageChange(i)}>{i}</PaginationLink>
      </PaginationItem>
    );
  }

  return (
    <Pagination className="justify-content-center">
      <PaginationItem disabled={currentPage === 1}>
        <PaginationLink previous onClick={() => onPageChange(currentPage - 1)}>
          « {t("Previous")}
        </PaginationLink>
      </PaginationItem>

      {startPage > 1 && (
        <PaginationItem>
          <PaginationLink onClick={() => onPageChange(1)}>1</PaginationLink>
        </PaginationItem>
      )}
      {startPage > 2 && (
        <PaginationItem disabled>
          <PaginationLink>...</PaginationLink>
        </PaginationItem>
      )}

      {pages}

      {endPage < totalPages - 1 && (
        <PaginationItem disabled>
          <PaginationLink>...</PaginationLink>
        </PaginationItem>
      )}
      {endPage < totalPages && (
        <PaginationItem>
          <PaginationLink onClick={() => onPageChange(totalPages)}>
            {totalPages}
          </PaginationLink>
        </PaginationItem>
      )}

      <PaginationItem disabled={currentPage === totalPages}>
        <PaginationLink next onClick={() => onPageChange(currentPage + 1)}>
          {t("Next")} »
        </PaginationLink>
      </PaginationItem>
    </Pagination>
  );
};

export default TableButtons;
