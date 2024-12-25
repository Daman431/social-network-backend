export class HttpResponse{
    message: string;
    isSuccessful: boolean;
    data: any;
    status: number;
    constructor(message?:string,isSuccessful?:boolean,data?:any,status?:number){
        this.data = data ?? null;
        this.isSuccessful = isSuccessful ?? false;
        this.message = message || '';
        this.status = status ?? 200;
    }
}