type QueryParams = Record<string, unknown>;

export class QueryBuilder<T = any> {
  public query: any;
  private readonly queryParams: QueryParams;

  constructor(modelQuery: any, queryParams: QueryParams) {
    this.query = modelQuery;
    this.queryParams = queryParams;
  }

  search(searchableFields: string[]): this {
    const q = this.queryParams.q;
    if (typeof q === 'string' && q.trim()) {
      const regex = { $regex: q.trim(), $options: 'i' };
      this.query = this.query.find({
        $or: searchableFields.map((field) => ({ [field]: regex })),
      });
    }
    return this;
  }

  filter(allowed: string[]): this {
    const filters: Record<string, unknown> = {};
    for (const key of allowed) {
      const value = this.queryParams[key];
      if (value !== undefined && value !== null && value !== '') {
        filters[key] = value;
      }
    }
    this.query = this.query.find(filters);
    return this;
  }

  sort(defaultSort = '-createdAt'): this {
    const sortParam = this.queryParams.sort;
    const sortBy =
      typeof sortParam === 'string' && sortParam.trim()
        ? sortParam.split(',').join(' ')
        : defaultSort;
    this.query = this.query.sort(sortBy);
    return this;
  }

  paginate(defaultLimit = 12, maxLimit = 100): this {
    const page = Math.max(1, Number(this.queryParams.page) || 1);
    let limit = Number(this.queryParams.limit) || defaultLimit;
    limit = Math.min(Math.max(1, limit), maxLimit);
    const skip = (page - 1) * limit;
    this.query = this.query.skip(skip).limit(limit);
    return this;
  }

  select(fields?: string): this {
    if (fields) this.query = this.query.select(fields);
    return this;
  }

  async execWithMeta(countModel: any, countFilter: Record<string, unknown> = {}) {
    const page = Math.max(1, Number(this.queryParams.page) || 1);
    let limit = Number(this.queryParams.limit) || 12;
    limit = Math.min(Math.max(1, limit), 100);
    const [data, total] = await Promise.all([
      this.query.exec(),
      countModel.countDocuments(countFilter),
    ]);
    return {
      data: data as T[],
      meta: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    };
  }
}

export function paginationMeta(page: number, limit: number, total: number, gated?: boolean) {
  return {
    page,
    limit,
    total,
    totalPages: Math.max(1, Math.ceil(total / limit)),
    ...(gated ? { gated: true } : {}),
  };
}
