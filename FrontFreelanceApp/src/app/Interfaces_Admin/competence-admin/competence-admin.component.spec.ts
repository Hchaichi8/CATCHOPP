import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompetenceAdminComponent } from './competence-admin.component';

describe('CompetenceAdminComponent', () => {
  let component: CompetenceAdminComponent;
  let fixture: ComponentFixture<CompetenceAdminComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CompetenceAdminComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CompetenceAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
