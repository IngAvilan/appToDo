export interface ITask {
    id: number;
    title: string;
    status: 'sin hacer' | 'en curso' | 'terminado';
}