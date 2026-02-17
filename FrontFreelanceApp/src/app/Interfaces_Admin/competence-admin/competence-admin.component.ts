import { Component } from '@angular/core';
interface Skill {
  id: number;
  name: string;
  category: string;
  usageCount: number; // Nombre de freelances/projets qui utilisent cette compétence
  status: 'active' | 'archived';
}
@Component({
  selector: 'app-competence-admin',
  templateUrl: './competence-admin.component.html',
  styleUrl: './competence-admin.component.css'
})
export class CompetenceAdminComponent {
skills: Skill[] = [
    { id: 1, name: 'Angular', category: 'Web Development', usageCount: 1240, status: 'active' },
    { id: 2, name: 'Spring Boot', category: 'Backend', usageCount: 980, status: 'active' },
    { id: 3, name: 'Figma', category: 'Design', usageCount: 850, status: 'active' },
    { id: 4, name: 'SEO Optimization', category: 'Marketing', usageCount: 420, status: 'active' },
    { id: 5, name: 'Flash Animation', category: 'Design', usageCount: 12, status: 'archived' }
  ];

  searchTerm: string = '';
  selectedCategory: string = 'All';
  categories: string[] = ['All', 'Web Development', 'Backend', 'Design', 'Marketing'];

  // Gestion du Modal d'ajout
  isModalOpen: boolean = false;
  newSkillName: string = '';
  newSkillCategory: string = 'Web Development';

  get filteredSkills() {
    return this.skills.filter(s => {
      const matchSearch = s.name.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchCat = this.selectedCategory === 'All' || s.category === this.selectedCategory;
      return matchSearch && matchCat;
    });
  }

  // Actions
  openAddModal() {
    this.isModalOpen = true;
    this.newSkillName = '';
    this.newSkillCategory = 'Web Development';
  }

  closeModal() {
    this.isModalOpen = false;
  }

  addSkill() {
    if (this.newSkillName.trim() === '') return;
    
    const newId = Math.max(...this.skills.map(s => s.id)) + 1;
    this.skills.unshift({
      id: newId,
      name: this.newSkillName,
      category: this.newSkillCategory,
      usageCount: 0,
      status: 'active'
    });
    
    this.closeModal();
  }

  deleteSkill(id: number) {
    if (confirm('Are you sure you want to delete this skill?')) {
      this.skills = this.skills.filter(s => s.id !== id);
    }
  }

  toggleStatus(skill: Skill) {
    skill.status = skill.status === 'active' ? 'archived' : 'active';
  }
}

