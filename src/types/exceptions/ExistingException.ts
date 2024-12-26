export class ExistingException {
    message:string;
    constructor(message?:string){
        this.message = message ?? "Already exists";
    }
}