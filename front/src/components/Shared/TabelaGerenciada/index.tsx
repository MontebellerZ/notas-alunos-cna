import { useEffect, useMemo, useRef, useState } from "react";
import { IoSettingsOutline } from "react-icons/io5";
import TabelaStorage from "../../../stores/store/tabela.store";
import Button from "../Button";
import styles from "./styles.module.scss";

export type TabelaGerenciadaColuna<T extends Record<string, unknown>> = {
  key: string;
  label: string;
  render?: (row: T) => React.ReactNode;
  default?: boolean;
};

type TabelaGerenciadaProps<T extends Record<string, unknown>> = {
  tabelaKey: string;
  columns: TabelaGerenciadaColuna<T>[];
  data: T[];
  itensPorPagina: number;
  page?: number;
  totalItems?: number;
  onPageChange?: (page: number) => void;
  isLoading?: boolean;
  emptyMessage?: string;
  renderActions?: (row: T) => React.ReactNode;
  allowColumnEdit?: boolean;
};

function defaultRenderCell(value: unknown) {
  if (value === null || value === undefined || value === "") {
    return "-";
  }

  return String(value);
}

function TabelaGerenciada<T extends Record<string, unknown>>({
  tabelaKey,
  columns,
  data,
  itensPorPagina,
  page,
  totalItems,
  onPageChange,
  isLoading = false,
  emptyMessage = "Nenhum registro encontrado.",
  renderActions,
  allowColumnEdit = true,
}: TabelaGerenciadaProps<T>) {
  const columnSelectorRef = useRef<HTMLDivElement | null>(null);
  const [isColumnMenuOpen, setIsColumnMenuOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const defaultVisibleColumns = useMemo(() => {
    const flagged = columns.filter((column) => column.default).map((column) => column.key);
    return flagged.length ? flagged : columns.map((column) => column.key);
  }, [columns]);

  const [selectedColumns, setSelectedColumns] = useState<string[]>(
    () => TabelaStorage.getByTabela(tabelaKey) || defaultVisibleColumns,
  );

  const columnsByKey = useMemo(() => {
    return Object.fromEntries(columns.map((column) => [column.key, column])) as Record<
      string,
      TabelaGerenciadaColuna<T>
    >;
  }, [columns]);

  const visibleColumns = useMemo(() => {
    const unique = Array.from(new Set(selectedColumns));
    return unique.filter((columnKey) => columns.some((column) => column.key === columnKey));
  }, [columns, selectedColumns]);

  useEffect(() => {
    const safeColumns = visibleColumns.length ? visibleColumns : defaultVisibleColumns;
    TabelaStorage.saveByTabela(tabelaKey, safeColumns);
  }, [defaultVisibleColumns, tabelaKey, visibleColumns]);

  useEffect(() => {
    if (!isColumnMenuOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (!columnSelectorRef.current?.contains(event.target as Node)) {
        setIsColumnMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isColumnMenuOpen]);

  const toggleColumn = (columnKey: string) => {
    setSelectedColumns((prev) => {
      if (prev.includes(columnKey)) {
        const next = prev.filter((item) => item !== columnKey);
        return next.length ? next : defaultVisibleColumns;
      }

      return [...prev, columnKey];
    });
  };

  const resolveRowKey = (row: T, index: number) => {
    if (typeof row.id === "number" || typeof row.id === "string") {
      return row.id;
    }

    if (typeof row.key === "string" || typeof row.key === "number") {
      return row.key;
    }

    return index;
  };

  const hasTrailingColumn = Boolean(renderActions);

  const safeItensPorPagina = Math.max(1, itensPorPagina);
  const usesServerPagination =
    typeof page === "number" &&
    Number.isFinite(page) &&
    typeof totalItems === "number" &&
    Number.isFinite(totalItems) &&
    Boolean(onPageChange);

  const safeTotalItems = usesServerPagination ? Math.max(0, totalItems) : data.length;
  const totalPages = Math.max(1, Math.ceil(safeTotalItems / safeItensPorPagina));
  const safeCurrentPage = Math.min(
    Math.max(1, usesServerPagination ? Number(page) : currentPage),
    totalPages,
  );

  const paginatedData = useMemo(() => {
    if (usesServerPagination) return data;

    const startIndex = (safeCurrentPage - 1) * safeItensPorPagina;
    return data.slice(startIndex, startIndex + safeItensPorPagina);
  }, [data, safeCurrentPage, safeItensPorPagina, usesServerPagination]);

  const tableData = paginatedData;

  const startItem = safeTotalItems === 0 ? 0 : (safeCurrentPage - 1) * safeItensPorPagina + 1;
  const endItem = Math.min(safeCurrentPage * safeItensPorPagina, safeTotalItems);

  const changePage = (nextPage: number) => {
    if (usesServerPagination) {
      onPageChange?.(nextPage);
      return;
    }

    setCurrentPage(nextPage);
  };

  return (
    <div className={styles.tableWrapper}>
      <div className={styles.tableOverflow}>
        <table className={styles.table}>
          <thead>
            <tr>
              {visibleColumns.map((columnKey) => {
                const column = columnsByKey[columnKey];
                return <th key={columnKey}>{column?.label || columnKey}</th>;
              })}

              {hasTrailingColumn && <th className={styles.actionsColumn}>Ações</th>}
            </tr>
          </thead>

          <tbody>
            {!isLoading && data.length === 0 && (
              <tr>
                <td
                  colSpan={visibleColumns.length + (hasTrailingColumn ? 1 : 0)}
                  className={styles.emptyState}
                >
                  {emptyMessage}
                </td>
              </tr>
            )}

            {isLoading &&
              Array.from({ length: safeItensPorPagina }).map((_, rowIndex) => (
                <tr key={`skeleton-${rowIndex}`}>
                  {visibleColumns.map((columnKey) => (
                    <td key={`skeleton-${rowIndex}-${columnKey}`} className={styles.skeletonCell}>
                      <span className={styles.skeletonShimmer} />
                    </td>
                  ))}

                  {hasTrailingColumn && (
                    <td className={styles.skeletonCell}>
                      <span className={styles.skeletonShimmer} />
                    </td>
                  )}
                </tr>
              ))}

            {!isLoading &&
              tableData.map((row, index) => {
                const rowIndex = (safeCurrentPage - 1) * safeItensPorPagina + index;
                const rowKey = resolveRowKey(row, index);

                return (
                  <tr key={`${rowKey}-${rowIndex}`}>
                    {visibleColumns.map((columnKey) => {
                      const column = columnsByKey[columnKey];
                      const rawValue = row[columnKey];
                      const value = column?.render
                        ? column.render(row)
                        : defaultRenderCell(rawValue);

                      return <td key={`${rowKey}-${columnKey}`}>{value}</td>;
                    })}

                    {hasTrailingColumn && (
                      <td className={styles.actionsColumn}>
                        {renderActions ? (
                          <div className={styles.rowActions}>{renderActions(row)}</div>
                        ) : null}
                      </td>
                    )}
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
      <div className={styles.tableFooter}>
        <span className={styles.paginationInfo}>
          Exibindo {startItem}-{endItem} de {safeTotalItems}
        </span>

        <div className={styles.paginationControls}>
          <Button
            onClick={() => changePage(Math.max(1, safeCurrentPage - 1))}
            disabled={safeCurrentPage === 1}
          >
            Anterior
          </Button>

          <span>
            Página {safeCurrentPage} de {totalPages}
          </span>

          <Button
            onClick={() => changePage(Math.min(totalPages, safeCurrentPage + 1))}
            disabled={safeCurrentPage === totalPages}
          >
            Próxima
          </Button>

          {allowColumnEdit && (
            <div className={styles.columnSelector} ref={columnSelectorRef}>
              <Button
                variant="icon"
                title="Selecionar colunas"
                aria-label="Selecionar colunas"
                className={styles.columnSelectorBtn}
                onClick={() => setIsColumnMenuOpen((prev) => !prev)}
              >
                <IoSettingsOutline />
              </Button>

              {isColumnMenuOpen && (
                <div className={styles.columnMenuUp}>
                  {columns.map((column) => (
                    <label key={column.key}>
                      <input
                        type="checkbox"
                        checked={visibleColumns.includes(column.key)}
                        onChange={() => toggleColumn(column.key)}
                      />
                      {column.label}
                    </label>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default TabelaGerenciada;
