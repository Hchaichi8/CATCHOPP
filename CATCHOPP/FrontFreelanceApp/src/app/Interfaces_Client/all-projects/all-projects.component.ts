import { Component } from '@angular/core';

@Component({
  selector: 'app-all-projects',
  templateUrl: './all-projects.component.html',
  styleUrl: './all-projects.component.css'
})
export class AllProjectsComponent {
  selectedTab: 'active' | 'draft' | 'closed' = 'active';
  searchQuery = '';
  voiceSupported = false;
  voiceListening = false;
  private recognition: any | null = null;

  // Mock Data
  projects = [
    {
      id: 8291,
      title: 'Senior Angular Developer for SaaS Dashboard',
      category: 'Web Development',
      postedDate: 'Oct 24, 2025',
      proposals: 8,
      hires: 0,
      budget: '$45 - $60 / hr',
      status: 'active'
    },
    {
      id: 8292,
      title: 'UI/UX Design for Fintech Mobile App',
      category: 'Design',
      postedDate: 'Oct 20, 2025',
      proposals: 15,
      hires: 1,
      budget: '$1,200 Fixed',
      status: 'active'
    },
    {
      id: 8295,
      title: 'Marketing Campaign for Holiday Season',
      category: 'Marketing',
      postedDate: 'Oct 15, 2025',
      proposals: 0,
      hires: 0,
      budget: '$500 Fixed',
      status: 'draft'
    },
    {
      id: 8100,
      title: 'Python Script for Data Scraping',
      category: 'Development',
      postedDate: 'Sep 10, 2025',
      proposals: 24,
      hires: 1,
      budget: '$200 Fixed',
      status: 'closed'
    }
  ];

  // Helper to filter projects in the HTML
  get filteredProjects() {
    const q = (this.searchQuery || '').trim().toLowerCase();
    const parsed = this.parseVoiceQuery(q);
    return this.projects.filter((p) => {
      if (p.status !== this.selectedTab) return false;

      const title = String(p.title || '').toLowerCase();
      if (parsed.keywords.length > 0) {
        for (const kw of parsed.keywords) {
          if (!title.includes(kw)) return false;
        }
      } else if (q) {
        if (!title.includes(q)) return false;
      }

      if (parsed.maxBudget != null) {
        const b = this.budgetToNumber(p.budget);
        if (b != null && b > parsed.maxBudget) return false;
      }
      return true;
    });
  }

  setTab(tab: 'active' | 'draft' | 'closed') {
    this.selectedTab = tab;
  }

  ngOnInit(): void {
    const w = window as any;
    const SR = w.SpeechRecognition || w.webkitSpeechRecognition;
    this.voiceSupported = !!SR;
    if (SR) {
      const rec = new SR();
      rec.lang = 'en-US';
      rec.interimResults = false;
      rec.maxAlternatives = 1;
      rec.onresult = (event: any) => {
        const text = event?.results?.[0]?.[0]?.transcript || '';
        if (text) {
          this.searchQuery = text;
        }
      };
      rec.onend = () => {
        this.voiceListening = false;
      };
      rec.onerror = () => {
        this.voiceListening = false;
      };
      this.recognition = rec;
    }
  }

  toggleVoice(): void {
    if (!this.recognition) return;
    if (this.voiceListening) {
      try {
        this.recognition.stop();
      } catch {}
      this.voiceListening = false;
      return;
    }
    this.voiceListening = true;
    try {
      this.recognition.start();
    } catch {
      this.voiceListening = false;
    }
  }

  private parseVoiceQuery(q: string): { keywords: string[]; maxBudget: number | null } {
    if (!q) return { keywords: [], maxBudget: null };

    const cleaned = q
      .replace(/find me|show me|search for|projects|project|jobs|job/gi, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .toLowerCase();

    // budget extraction: "under 500", "below $500", "less than 500"
    const m =
      cleaned.match(/(?:under|below|less than|max)\s*\$?\s*([0-9]{2,6})/i) ||
      cleaned.match(/\$?\s*([0-9]{2,6})\s*(?:dollars|usd)?\s*(?:or less|max)/i);
    const maxBudget = m ? Number(m[1]) : null;

    const keywordPart = cleaned.replace(m?.[0] || '', '').trim();
    const keywords = keywordPart
      .split(' ')
      .map((x) => x.trim())
      .filter((x) => x.length >= 3);

    return { keywords, maxBudget: Number.isFinite(maxBudget as any) ? (maxBudget as number) : null };
  }

  private budgetToNumber(raw: string): number | null {
    if (!raw) return null;
    const s = raw.replace(/,/g, '');
    // fixed: "$1200 Fixed" => 1200
    const fixed = s.match(/\$([0-9]{2,7})\s*fixed/i);
    if (fixed) return Number(fixed[1]);
    // hourly: "$45 - $60 / hr" => max 60
    const range = s.match(/\$([0-9]{1,5})\s*-\s*\$([0-9]{1,5})/);
    if (range) return Number(range[2]);
    const single = s.match(/\$([0-9]{1,7})/);
    return single ? Number(single[1]) : null;
  }
}
