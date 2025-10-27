import { FilterOperator, FilterSuffix, PaginateConfig } from 'nestjs-paginate';
import { FileEntity } from '../entities/file.entity.js';

export const filePaginationConfig: PaginateConfig<FileEntity> = {
  defaultSortBy: [['createdAt', 'DESC']],
  relations: [],
  searchableColumns: ['path'],
  sortableColumns: ['createdAt', 'updatedAt', 'path'],
  maxLimit: 100,
  loadEagerRelations: true,
  filterableColumns: {
    path: [FilterOperator.EQ, FilterSuffix.NOT, FilterOperator.ILIKE],
  },
};
