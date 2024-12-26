export class HttpErroredResponse{
    message:string;
    isSuccessful:boolean;
    status:number;
    constructor(message?:string,status?:number){
        this.status = status ?? 500;
        this.message = message ?? "Something went wrong";
    }
}