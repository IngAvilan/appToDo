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

    const tasks = await this._Storage.get('tasks');

    this.tasks = tasks ? JSON.parse(tasks) : [];
  }

  async open() {
    const alert = await this._AlertController.create({
      header: 'Agrega nueva tarea',
      inputs: [
        {
          type: 'text',
          name: 'title',
          placeholder: 'Ingrese tarea'
        }
      ],
      buttons: [{
        text: 'Cancelar',
        role: 'cancel'
      },
      {
        text: 'Agregar',
        handler: (data) => {
          if (data.title.trim() === '') {
            this.isToastOpen = true;
            return;
          }

          this.tasks.push({
            id: this.tasks.length + 1,
            title: data.title,
            done: false
          });
          this.saveTask();
        }
      }]
    });

    await alert.present();
  }
  private async saveTask(){
    await this._Storage.set('tasks', JSON.stringify(this.tasks));
  }
  deleteTask(task: ITask){
    console.log(task);
  }
  setOpen(isOpen: boolean) {
    this.isToastOpen = isOpen;
  }
}