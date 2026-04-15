import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { SkillTestService, SkillTest, Certification, Question } from './skill-test.service';

const API = 'http://localhost:8086/SkillTests';

describe('SkillTestService', () => {
  let service: SkillTestService;
  let httpMock: HttpTestingController;

  const mockTest: SkillTest = {
    id: 1,
    title: 'Java Basics',
    description: 'Test your Java knowledge',
    category: 'Java',
    durationMinutes: 30,
    passScore: 70,
    active: true
  };

  const mockCertification: Certification = {
    id: 1,
    userId: 10,
    userName: 'Alice',
    skillTestId: 1,
    testTitle: 'Java Basics',
    category: 'Java',
    score: 85,
    passed: true,
    completedAt: '2026-04-15T10:00:00'
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [SkillTestService]
    });
    service = TestBed.inject(SkillTestService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify(); // ensure no outstanding requests
  });

  // ===== CRUD TESTS =====

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('getTests() should GET all active tests', () => {
    service.getTests().subscribe(tests => {
      expect(tests.length).toBe(1);
      expect(tests[0].title).toBe('Java Basics');
    });

    const req = httpMock.expectOne(`${API}/tests`);
    expect(req.request.method).toBe('GET');
    req.flush([mockTest]);
  });

  it('getTest() should GET a single test by id', () => {
    service.getTest(1).subscribe(test => {
      expect(test.id).toBe(1);
      expect(test.category).toBe('Java');
    });

    const req = httpMock.expectOne(`${API}/tests/1`);
    expect(req.request.method).toBe('GET');
    req.flush(mockTest);
  });

  it('createTest() should POST and return created test', () => {
    service.createTest(mockTest).subscribe(test => {
      expect(test.title).toBe('Java Basics');
    });

    const req = httpMock.expectOne(`${API}/admin/tests`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(mockTest);
    req.flush(mockTest);
  });

  it('updateTest() should PUT and return updated test', () => {
    const updated = { ...mockTest, title: 'Advanced Java', passScore: 80 };

    service.updateTest(1, updated).subscribe(test => {
      expect(test.title).toBe('Advanced Java');
      expect(test.passScore).toBe(80);
    });

    const req = httpMock.expectOne(`${API}/admin/tests/1`);
    expect(req.request.method).toBe('PUT');
    req.flush(updated);
  });

  it('deleteTest() should send DELETE request', () => {
    service.deleteTest(1).subscribe();

    const req = httpMock.expectOne(`${API}/admin/tests/1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  it('getCategories() should GET list of categories', () => {
    service.getCategories().subscribe(cats => {
      expect(cats).toContain('Java');
      expect(cats).toContain('Python');
    });

    const req = httpMock.expectOne(`${API}/categories`);
    expect(req.request.method).toBe('GET');
    req.flush(['Java', 'Python', 'Angular']);
  });

  // ===== COMPLEX BUSINESS LOGIC TESTS =====

  it('submitTest() with userName should POST to submit-with-name endpoint', () => {
    const answers = { 1: 'A', 2: 'B' };

    service.submitTest(10, 1, answers, 'Alice').subscribe(cert => {
      expect(cert.passed).toBeTrue();
      expect(cert.score).toBe(85);
    });

    const req = httpMock.expectOne(r => r.url.includes('submit-with-name'));
    expect(req.request.method).toBe('POST');
    expect(req.request.url).toContain('userId=10');
    expect(req.request.url).toContain('testId=1');
    expect(req.request.url).toContain('userName=Alice');
    req.flush(mockCertification);
  });

  it('submitTest() without userName should POST to submit endpoint', () => {
    const answers = { 1: 'A', 2: 'B' };

    service.submitTest(10, 1, answers).subscribe(cert => {
      expect(cert.userId).toBe(10);
    });

    const req = httpMock.expectOne(r => r.url.includes('/submit?'));
    expect(req.request.method).toBe('POST');
    req.flush(mockCertification);
  });

  it('getUserCertifications() should GET certifications for a user', () => {
    service.getUserCertifications(10).subscribe(certs => {
      expect(certs.length).toBe(1);
      expect(certs[0].userId).toBe(10);
      expect(certs[0].passed).toBeTrue();
    });

    const req = httpMock.expectOne(`${API}/certifications/user/10`);
    expect(req.request.method).toBe('GET');
    req.flush([mockCertification]);
  });

  it('getStatsByCategory() should GET stats grouped by category', () => {
    const stats = { Java: 5, Python: 3, Angular: 2 };

    service.getStatsByCategory().subscribe(result => {
      expect(result['Java']).toBe(5);
      expect(result['Python']).toBe(3);
    });

    const req = httpMock.expectOne(`${API}/admin/stats-by-category`);
    expect(req.request.method).toBe('GET');
    req.flush(stats);
  });

  it('generateAiTest() should POST with correct payload', () => {
    service.generateAiTest(10, 'Java', true, 'Alice').subscribe(test => {
      expect(test.category).toBe('Java');
    });

    const req = httpMock.expectOne(`${API}/ai/generate`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      userId: 10,
      category: 'Java',
      hasAiAccess: true,
      userName: 'Alice'
    });
    req.flush(mockTest);
  });

  it('getTestStatistics() should GET statistics for a test', () => {
    const stats = { totalAttempts: 50, passRate: 72, avgScore: 75 };

    service.getTestStatistics(1).subscribe(result => {
      expect(result.totalAttempts).toBe(50);
      expect(result.passRate).toBe(72);
    });

    const req = httpMock.expectOne(`${API}/admin/tests/1/statistics`);
    expect(req.request.method).toBe('GET');
    req.flush(stats);
  });

  it('createQuestion() should POST question to correct endpoint', () => {
    const question: Question = {
      questionText: 'What is JVM?',
      optionA: 'Java Virtual Machine',
      optionB: 'Java Variable Method',
      optionC: 'Java Version Manager',
      optionD: 'None',
      correctOption: 'A'
    };

    service.createQuestion(1, question).subscribe(q => {
      expect(q.questionText).toBe('What is JVM?');
    });

    const req = httpMock.expectOne(`${API}/admin/tests/1/questions`);
    expect(req.request.method).toBe('POST');
    req.flush(question);
  });
});
