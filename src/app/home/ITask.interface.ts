export interface ITask {
  id: number;
  title: string;
  status: 'todo' | 'in-progress' | 'completed';
  priority: 'High' | 'Medium' | 'Low';
  category: 'Dev' | 'System' | 'Work' | 'Personal' | 'General';
  createdAt: Date;
  dueDate: string; 
}