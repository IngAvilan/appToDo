import { Component } from '@angular/core';
import { ITask } from "./ITask.interface";
import { AlertController } from "@ionic/angular";
import { Storage } from "@ionic/storage-angular";

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage {

  isToastOpen = false;
  tasks: ITask[] = [];

  constructor(private _AlertController: AlertController, private _Storage: Storage) { }

  async ngOnInit() {
    await this._Storage.create();
    const savedTasks = await this._Storage.get('tasks');
    this.tasks = savedTasks ? JSON.parse(savedTasks) : [];
  }

  async open() {
    const alert = await this._AlertController.create({
      header: 'Agrega nueva tarea',
      inputs: [
        {
          type: 'text',
          name: 'title',
          placeholder: '¿Qué hay que hacer?'
        }
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Agregar',
          handler: (data) => {
            if (data.title.trim() === '') {
              this.isToastOpen = true;
              return;
            }

            this.tasks.push({
              id: Date.now(), // Genera un ID único basado en el tiempo
              title: data.title,
              status: 'sin hacer'
            });
            this.saveTask();
          }
        }
      ]
    });

    await alert.present();
  }

  // Guarda el estado actual del arreglo en el almacenamiento local
  private async saveTask() {
    await this._Storage.set('tasks', JSON.stringify(this.tasks));
  }

  // Elimina la tarea filtrando el arreglo
  deleteTask(task: ITask) {
    this.tasks = this.tasks.filter(t => t.id !== task.id);
    this.saveTask();
  }

  // Cambia el estado de forma cíclica
  changeStatus(task: ITask) {
    if (task.status === 'sin hacer') {
      task.status = 'en curso';
    } else if (task.status === 'en curso') {
      task.status = 'terminado';
    } else {
      task.status = 'sin hacer';
    }
    this.saveTask();
  }

  setOpen(isOpen: boolean) {
    this.isToastOpen = isOpen;
  }
}