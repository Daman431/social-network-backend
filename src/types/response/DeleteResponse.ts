export class DeleteResponse{
    message: string;
    isDeleteSuccessful: boolean;
    constructor(message:string,isDeleteSuccessful:boolean){
        this.message = message;
        this.isDeleteSuccessful = isDeleteSuccessful;
    }
}