import { Sort } from "./sort"

export interface IPaginationRequest{
    page:number
    limit:number
    sort: Sort
}
export const defaultPaginationValues:IPaginationRequest = {
    limit: 10,
    page:0,
    sort:'asc'
}
export interface IPaginationResponse {
    limit: number,
    page: number,
    skippedValues: number,
    sort: Sort
}