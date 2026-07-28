import { InvalidArgumentError } from "../errors/index.js";

export interface PageRequest {
  readonly page: number;
  readonly pageSize: number;
}

export interface Page<TItem> {
  readonly items: readonly TItem[];
  readonly page: number;
  readonly pageSize: number;
  readonly totalItems: number;
  readonly totalPages: number;
  readonly hasPreviousPage: boolean;
  readonly hasNextPage: boolean;
}

export function createPageRequest(
  page = 1,
  pageSize = 20,
): PageRequest {
  if (!Number.isInteger(page) || page < 1) {
    throw new InvalidArgumentError(
      "A página deve ser um número inteiro maior ou igual a 1.",
      "INVALID_PAGE_NUMBER",
    );
  }

  if (!Number.isInteger(pageSize) || pageSize < 1 || pageSize > 500) {
    throw new InvalidArgumentError(
      "O tamanho da página deve ser um inteiro entre 1 e 500.",
      "INVALID_PAGE_SIZE",
    );
  }

  return Object.freeze({ page, pageSize });
}

export function createPage<TItem>(
  items: readonly TItem[],
  request: PageRequest,
  totalItems: number,
): Page<TItem> {
  if (!Number.isInteger(totalItems) || totalItems < 0) {
    throw new InvalidArgumentError(
      "O total de itens deve ser um número inteiro não negativo.",
      "INVALID_TOTAL_ITEMS",
    );
  }

  const totalPages = totalItems === 0
    ? 0
    : Math.ceil(totalItems / request.pageSize);

  return Object.freeze({
    items: Object.freeze([...items]),
    page: request.page,
    pageSize: request.pageSize,
    totalItems,
    totalPages,
    hasPreviousPage: request.page > 1,
    hasNextPage: request.page < totalPages,
  });
}
