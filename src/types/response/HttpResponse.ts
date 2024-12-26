export class HttpResponse{
    message: string;
    isSuccessful: boolean;
    data: any;
    status: number;
    constructor(message?:string,data?:any,isSuccessful?:boolean,status?:number){
        this.data = data ?? null;
        this.isSuccessful = isSuccessful ?? true;
        this.message = message || '';
        this.status = status ?? 200;
    }
}