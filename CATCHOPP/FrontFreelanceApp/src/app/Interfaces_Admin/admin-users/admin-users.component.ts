import { Component, OnInit } from '@angular/core';
import { UserService, User } from '../../services/user.service';

@Component({
  selector: 'app-admin-users',
  templateUrl: './admin-users.component.html',
  styleUrl: './admin-users.component.css'
})
export class AdminUsersComponent implements OnInit {
  users: User[] = [];
  loading = true;
  showForm = false;
  editingUser: User | null = null;
  form: Partial<User> = {};
  message = '';

  roles = ['CLIENT', 'FREELANCER', 'ADMIN'];

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.userService.getAllUsers().subscribe((u) => {
      this.users = u || [];
      this.loading = false;
    });
  }

  openCreate(): void {
    this.editingUser = null;
    this.form = { 
      email: '', 
      firstName: '', 
      lastName: '', 
      password: 'changeme', 
      role: 'FREELANCER' 
    };
    this.showForm = true;
    this.message = '';
  }

  openEdit(user: User): void {
    this.editingUser = user;
    this.form = { ...user };
    this.showForm = true;
    this.message = '';
  }

  closeForm(): void {
    this.showForm = false;
    this.editingUser = null;
    this.form = {};
  }

  save(): void {
    if (!this.form.email || !this.form.firstName || !this.form.lastName || !this.form.role) {
      this.message = 'Email, first name, last name and role are required.';
      return;
    }
    if (this.editingUser?.id) {
      this.userService.updateUser(this.editingUser.id, this.form).subscribe({
        next: () => { this.message = 'User updated.'; this.load(); this.closeForm(); },
        error: () => (this.message = 'Update failed.')
      });
    } else {
      this.userService.register(this.form as User).subscribe({
        next: () => { this.message = 'User created.'; this.load(); this.closeForm(); },
        error: () => (this.message = 'Create failed.')
      });
    }
  }

  deleteUser(user: User): void {
    if (!user.id || !confirm('Delete user "' + user.firstName + ' ' + user.lastName + '"?')) return;
    this.userService.deleteUser(user.id).subscribe({
      next: (ok) => { if (ok) { this.message = 'User deleted.'; this.load(); } else this.message = 'Delete failed.'; },
      error: () => (this.message = 'Delete failed.')
    });
  }
}
