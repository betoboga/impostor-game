import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Reveal } from './reveal';

describe('Reveal', () => {
  let component: Reveal;
  let fixture: ComponentFixture<Reveal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Reveal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Reveal);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
