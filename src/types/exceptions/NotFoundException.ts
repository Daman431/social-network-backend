export class NotFoundException {
    message:string;
    constructor(message?:string){
        this.message = message ?? "Not Found";
    }
}