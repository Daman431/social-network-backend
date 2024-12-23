export class HttpResponse{
    message: string;
    isSuccessful: boolean;
    data: any
    constructor(message?:string,isSuccessful?:boolean,data?:any){
        this.data = data ?? null;
        this.isSuccessful = isSuccessful ?? false;
        this.message = message || '';
    }
}