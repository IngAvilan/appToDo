import { Component, OnInit } from '@angular/core';
import { ITask } from "./ITask.interface";
import { AlertController, ToastController } from "@ionic/angular";
import { Storage } from "@ionic/storage-angular";

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage implements OnInit {
  tasks: ITask[] = [];
  filteredTasks: ITask[] = [];
  filterStatus: string = 'todo';
  showSearchBar = false;
  isCalendarOpen = false;
  highlightedDates: any[] = [];

  constructor(
    private _AlertController: AlertController,
    private _Storage: Storage,
    private _ToastController: ToastController
  ) {}

  async ngOnInit() {
    await this._Storage.create();
    const saved = await this._Storage.get('tasks');
    this.tasks = saved ? JSON.parse(saved) : [];
    this.updateCalendarHighlights();
    this.filterTasks();
  }

  handleToggleSearch(event: any) {
    setTimeout(() => {
      this.showSearchBar = !this.showSearchBar;
      event.target.complete();
    }, 400);
  }

  async confirmClearAll() {
    const alert = await this._AlertController.create({
      header: 'Confirm Delete',
      message: 'Are you sure you want to delete all tasks?',
      mode: 'ios',
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        { 
          text: 'Delete', 
          role: 'destructive', 
          handler: () => { this.tasks = []; this.updateData(); } 
        }
      ]
    });
    await alert.present();
  }

  getMostUrgentTask(): ITask | null {
    const pending = this.tasks.filter(t => t.status !== 'completed');
    if (pending.length === 0) return null;
    return pending.reduce((prev, curr) => 
      new Date(prev.dueDate) < new Date(curr.dueDate) ? prev : curr
    );
  }

  filterTasks() {
    this.filteredTasks = this.tasks
      .filter(t => t.status === this.filterStatus)
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  }

  searchTasks(event: any) {
    const query = event.target.value.toLowerCase();
    if (query && query.trim() !== '') {
      this.filteredTasks = this.tasks.filter(t => 
        t.title.toLowerCase().includes(query) || t.category.toLowerCase().includes(query)
      );
    } else {
      this.filterTasks();
    }
  }

  openCalendar() {
    this.updateCalendarHighlights();
    this.isCalendarOpen = true;
  }

  updateCalendarHighlights() {
    this.highlightedDates = this.tasks.map(t => ({
      date: t.dueDate.split('T')[0],
      textColor: '#000',
      backgroundColor: '#ff9f0a'
    }));
  }

  onDateSelect(event: any) {
    const selectedDate = event.detail.value.split('T')[0];
    this.filteredTasks = this.tasks.filter(t => t.dueDate.startsWith(selectedDate));
    this.isCalendarOpen = false;
  }

  async openAddTask() {
    const alert = await this._AlertController.create({
      header: 'NEW_TASK',
      mode: 'ios',
      inputs: [
        { name: 'title', type: 'text', placeholder: 'Task title...' },
        { name: 'date', type: 'date', min: new Date().toISOString().split('T')[0] }
      ],
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Next',
          handler: (data) => {
            if (!data.title || !data.date) return false;
            this.showCategorySelection(data.title, data.date);
            return true;
          }
        }
      ]
    });
    await alert.present();
  }

  async showCategorySelection(title: string, date: string) {
    const alert = await this._AlertController.create({
      header: 'CATEGORY',
      mode: 'ios',
      inputs: [
        { type: 'radio', label: 'Dev', value: 'Dev', checked: true },
        { type: 'radio', label: 'System', value: 'System' },
        { type: 'radio', label: 'Work', value: 'Work' },
        { type: 'radio', label: 'Personal', value: 'Personal' },
      ],
      buttons: [{ text: 'Next', handler: (cat) => this.showPrioritySelection(title, date, cat) }]
    });
    await alert.present();
  }

  async showPrioritySelection(title: string, date: string, category: any) {
    const alert = await this._AlertController.create({
      header: 'PRIORITY',
      mode: 'ios',
      inputs: [
        { type: 'radio', label: 'High', value: 'High' },
        { type: 'radio', label: 'Medium', value: 'Medium', checked: true },
        { type: 'radio', label: 'Low', value: 'Low' },
      ],
      buttons: [{ text: 'Deploy', handler: (pri) => this.addTask(title, date, category, pri) }]
    });
    await alert.present();
  }

  addTask(title: string, dueDate: string, category: any, priority: any) {
    const newTask: ITask = {
      id: Date.now(), title, dueDate, category: category as any,
      priority: priority as any, status: 'todo', createdAt: new Date()
    };
    this.tasks.push(newTask);
    this.updateData();
  }

  changeStatus(task: ITask, newStatus: any) {
    task.status = newStatus;
    this.updateData();
  }

  async deleteTask(task: ITask) {
    this.tasks = this.tasks.filter(t => t.id !== task.id);
    this.updateData();
  }

  private async updateData() {
    await this._Storage.set('tasks', JSON.stringify(this.tasks));
    this.updateCalendarHighlights();
    this.filterTasks();
  }

  getPriorityColorCode(priority: string) {
    if (priority === 'High') return '#ff453a';
    if (priority === 'Medium') return '#ff9f0a';
    return '#30d158';
  }
}