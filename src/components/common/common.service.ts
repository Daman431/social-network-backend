import { defaultPaginationValues, IPaginationRequest } from "../../types/pagination/pagination";


const getPaginationValues = (query: IPaginationRequest) => {
    try {
        const limit = query.limit ?? defaultPaginationValues.limit;
        const page = query.page && query.page > 0 ? query.page - 1 : defaultPaginationValues.page;
        const sort = query.sort ?? defaultPaginationValues.sort;
        const skippedValues = limit * page;
        return { page, limit, skippedValues, sort }
    }
    catch (err) {
        return {
            limit: defaultPaginationValues.limit,
            page: defaultPaginationValues.page + 1,
            skippedValues: 0,
            sort: defaultPaginationValues.sort
        }
    }
}

export { getPaginationValues };