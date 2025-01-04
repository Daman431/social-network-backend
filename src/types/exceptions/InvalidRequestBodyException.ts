export class InvalidRequestException {
    message:string;
    constructor(message?:string){
        this.message = message ?? "Invalid request";
    }
}