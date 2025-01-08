import { Response } from "express";
import { defaultPaginationValues, IPaginationRequest } from "../../types/pagination/pagination";
import { HttpResponse } from "../../types/response/HttpResponse";
import { HttpErroredResponse } from "../../types/response/HttpErroredResponse";


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

const sendResponse = (res: Response, data: any, message?: string,status?:number) => {
    res.send(new HttpResponse(message ?? "", data,true,status || 200))
}
const sendErroredResponse = (res: Response, message?: string, status?: number) => {
    res.status(status || 500).send(new HttpErroredResponse(message, status || 500));
}

export { getPaginationValues, sendResponse, sendErroredResponse };