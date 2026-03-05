import { Component } from '@angular/core';

@Component({
  selector: 'app-group-list',
  templateUrl: './group-list.component.html',
  styleUrls: ['./group-list.component.css']
})
export class GroupListComponent {
  groups = [
    { id: 1, name: 'Développeurs Web', description: 'Un groupe pour les passionnés du web.' },
    { id: 2, name: 'Designers', description: 'Un groupe pour les créatifs.' }
  ];

  // ✅ Correction : ajouter la méthode
  createGroup() {
    console.log('Créer un groupe');
  }

  openGroup(id: number) {
    console.log('Ouvrir le groupe avec ID:', id);
  }
}
