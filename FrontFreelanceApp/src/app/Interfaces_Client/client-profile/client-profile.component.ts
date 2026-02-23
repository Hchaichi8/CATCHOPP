import { Component, OnInit } from '@angular/core';
import { UserService } from '../../Services/user.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-client-profile',
  templateUrl: './client-profile.component.html',
  styleUrl: './client-profile.component.css'
})
export class ClientProfileComponent implements OnInit {

  currentTab: string = 'about'; 
  
  
  clientProfile: any = null;

  constructor(
    private userService: UserService,
    private route: ActivatedRoute 
  ) {}

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile() {
    
    const urlId = this.route.snapshot.paramMap.get('id');
    if (urlId) {
     
      this.fetchUser(Number(urlId));
    } else {
      const storedData = localStorage.getItem('currentUser');
      if (storedData) {
        try {
          let token = storedData.includes('token') ? JSON.parse(storedData).token : storedData;
          if (token) {
            const payload = token.split('.')[1];
            const decodedPayload = JSON.parse(decodeURIComponent(escape(window.atob(payload))));
            this.fetchUser(decodedPayload.id);
          }
        } catch (e) {
          console.error("🔴 Erreur Token :", e);
        }
      }
    }
  }

  // 🟢 Méthode pour appeler le backend
  fetchUser(id: number) {
    this.userService.getUserById(id).subscribe({
      next: (user) => {
        this.clientProfile = user;
      },
      error: (err) => console.error("🔴 Erreur chargement profil :", err)
    });
  }

  setTab(tabName: string) {
    this.currentTab = tabName;
  }
}