import { Component } from '@angular/core';
interface Proposal {
  id: number;
  name: string;
  title: string;
  rate: number;
  coverLetter: string;
  rating: number;
  skills: string[];
  image: string;
  status: 'pending' | 'accepted' | 'rejected';
}

@Component({
  selector: 'app-project-proposals',
  templateUrl: './project-proposals.component.html',
  styleUrl: './project-proposals.component.css'
})
export class ProjectProposalsComponent {
proposals: Proposal[] = [
    {
      id: 1,
      name: 'Kenneth Silva',
      title: 'Senior Fullstack Dev',
      rate: 55,
      coverLetter: 'I have 5+ years of experience in Angular and Node.js...',
      rating: 5.0,
      skills: ['Angular', 'Node.js', 'MongoDB'],
      image: 'https://i.pravatar.cc/150?u=10',
      status: 'pending'
    },
    {
      id: 2,
      name: 'Sarah Jenkins',
      title: 'UI/UX Specialist',
      rate: 45,
      coverLetter: 'I specialize in creating clean, user-friendly dashboards...',
      rating: 4.8,
      skills: ['Figma', 'CSS/SCSS', 'Adobe XD'],
      image: 'https://i.pravatar.cc/150?u=20',
      status: 'pending'
    },
    {
      id: 3,
      name: 'David Miller',
      title: 'Angular Architect',
      rate: 65,
      coverLetter: 'I maintain open source libraries for the Angular community...',
      rating: 4.9,
      skills: ['RxJS', 'NgRx', 'TypeScript'],
      image: 'https://i.pravatar.cc/150?u=33',
      status: 'pending'
    },
    {
      id: 4,
      name: 'Lina Al-Fayeed',
      title: 'Frontend Developer',
      rate: 40,
      coverLetter: 'Experienced in building responsive web applications...',
      rating: 4.7,
      skills: ['HTML5', 'Bootstrap', 'JavaScript'],
      image: 'https://i.pravatar.cc/150?u=45',
      status: 'pending'
    }
  ];

  updateStatus(id: number, newStatus: 'accepted' | 'rejected') {
    const proposal = this.proposals.find(p => p.id === id);
    if (proposal) {
      proposal.status = newStatus;
    }
  }

}
