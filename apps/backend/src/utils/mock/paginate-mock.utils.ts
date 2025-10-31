import { PaginateConfig, Paginated, PaginateQuery } from 'nestjs-paginate';

export class PaginateMockUtils {
  static query: PaginateQuery = { path: '' };

  static config<T>(): PaginateConfig<T> {
    return {
      sortableColumns: ['id'],
      defaultSortBy: [['id', 'ASC']],
      defaultLimit: 1,
    } as PaginateConfig<T>;
  }

  static paginatedData<T>(data: T[]): Paginated<T> {
    return {
      meta: {
        itemsPerPage: 0,
        totalItems: 0,
        currentPage: 0,
        totalPages: 0,
        sortBy: [['createdAt', 'DESC']],
        searchBy: ['id'],
        search: 'string',
        select: [''],
      },
      data: data,
      links: {
        first: '',
        previous: '',
        current: '',
        next: '',
        last: '',
      },
    } as Paginated<T>;
  }
}
