import { Component, OnInit } from '@angular/core';
import { Contract } from '../../models/contract';
import { ContractService } from '../../Services/contract.service';
import { UserService } from '../../Services/user.service'; // 🟢 INJECTION

@Component({
  selector: 'app-client-contract',
  templateUrl: './client-contract.component.html',
  styleUrls: ['./client-contract.component.css'] // 🟢 Attention: styleUrls avec un 's'
})
export class ClientContractComponent implements OnInit {
  
  contracts: Contract[] = [];
  isLoading: boolean = true;
  
  // 🟢 VARIABLES UTILISATEUR
  currentUser: any = null;
  clientId!: number; // Fini le "= 2" en dur !

  constructor(
    private contractService: ContractService,
    private userService: UserService // 🟢 INJECTION
  ) {}

  ngOnInit(): void {
    // 🟢 On commence par charger l'utilisateur
    this.loadUserData();
  }

  loadUserData() {
    const storedData = localStorage.getItem('currentUser');
    if (storedData) {
      try {
        let token = storedData.includes('token') ? JSON.parse(storedData).token : storedData;
        if (token) {
          const payload = token.split('.')[1];
          const decodedPayload = JSON.parse(decodeURIComponent(escape(window.atob(payload))));
          this.clientId = decodedPayload.id;

          if (this.clientId) {
            this.userService.getUserById(this.clientId).subscribe({
              next: (user) => {
                this.currentUser = user;
                // 🟢 Une fois le client connu, on charge SES contrats
                this.loadContracts();
              },
              error: (err) => {
                console.error("Erreur Backend Profil :", err);
                this.isLoading = false;
              }
            });
          }
        }
      } catch (e) {
        console.error("Erreur token :", e);
        this.isLoading = false;
      }
    } else {
      this.isLoading = false;
    }
  }

  loadContracts() {
    if (!this.clientId) return;

    this.contractService.getClientContracts(this.clientId).subscribe({
      next: (data) => {
        this.contracts = data.reverse(); // Les plus récents en premier
        this.isLoading = false;
      },
      error: (err) => {
        console.error("Error loading contracts:", err);
        this.isLoading = false;
      }
    });
  }

  // Count active contracts for the stats card
  getActiveCount(): number {
    return this.contracts.filter(c => c.status === 'SENT' || c.status === 'SIGNED' || c.status === 'ACTIVE').length;
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'SENT': return 'status-sent';
      case 'SIGNED': return 'status-signed';
      case 'ACTIVE': return 'status-signed';
      case 'DRAFT': return 'status-draft';
      default: return '';
    }
  }
}