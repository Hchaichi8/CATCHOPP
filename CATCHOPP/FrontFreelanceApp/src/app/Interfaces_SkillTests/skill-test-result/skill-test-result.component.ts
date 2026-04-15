import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-skill-test-result',
  templateUrl: './skill-test-result.component.html',
  styleUrl: './skill-test-result.component.css'
})
export class SkillTestResultComponent implements OnInit {
  testId = 0;
  score = 0;
  testTitle = '';
  passed = false;
  userName = 'Freelancer';
  today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.testId = +this.route.snapshot.paramMap.get('id')!;
    this.score = +(this.route.snapshot.queryParamMap.get('score') ?? 0);
    const passedParam = this.route.snapshot.queryParamMap.get('passed');
    this.passed = passedParam !== null ? passedParam === 'true' : this.score >= 70;
    this.testTitle = this.route.snapshot.queryParamMap.get('title') ?? 'Skill Test';
  }

  downloadCertificate(): void {
    const el = document.getElementById('certificate');
    if (!el) return;

    import('html2canvas').then(({ default: html2canvas }) => {
      html2canvas(el, { scale: 2, backgroundColor: '#fff' }).then(canvas => {
        import('jspdf').then(({ jsPDF }) => {
          const pdf = new jsPDF('landscape', 'mm', 'a4');
          const imgData = canvas.toDataURL('image/png');
          const pdfWidth = pdf.internal.pageSize.getWidth();
          const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
          pdf.addImage(imgData, 'PNG', 0, (pdf.internal.pageSize.getHeight() - pdfHeight) / 2, pdfWidth, pdfHeight);
          pdf.save(`CatchOPP-Certificate-${this.testTitle.replace(/\s+/g, '-')}.pdf`);
        });
      });
    });
  }
}
