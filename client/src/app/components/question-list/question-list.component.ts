import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Question } from '../../models/question.model';
import { QuestionService } from '../../services/question.service';
import { debounceTime, distinctUntilChanged, switchMap, catchError } from 'rxjs/operators';
import { Observable, of } from 'rxjs';

@Component({
  selector: 'app-question-list',
  template: `
    <div class="question-list-container">
      <div class="header-section">
        <h1 class="main-title">Discussion Forum</h1>
        <p class="subtitle">Explore questions or start a new discussion</p>
      </div>

      <div class="actions-row">
        <button mat-raised-button color="accent" routerLink="/ask" class="ask-button">
          <mat-icon>add</mat-icon> Ask a Question
        </button>

        <mat-form-field appearance="outline" class="search-field">
          <mat-label>Search questions...</mat-label>
          <input matInput [formControl]="searchControl">
          <mat-icon matSuffix>search</mat-icon>
        </mat-form-field>

        <mat-button-toggle-group [(value)]="filterMode" (change)="applyFilter()" class="filter-toggle">
          <mat-button-toggle value="all">All</mat-button-toggle>
          <mat-button-toggle value="recent">Recent</mat-button-toggle>
        </mat-button-toggle-group>
      </div>

      <div *ngIf="loading" class="loading-spinner">
        <mat-spinner diameter="40"></mat-spinner>
      </div>

      <div *ngIf="!loading && questions.length === 0" class="no-questions">
        <mat-icon>question_answer</mat-icon>
        <p>No questions found. Be the first to ask one!</p>
      </div>

      <div class="question-cards" *ngIf="!loading && questions.length > 0">
        <mat-card *ngFor="let question of questions" class="question-card" [routerLink]="['/question', question.id]">
          <mat-card-header>
            <mat-card-title>{{ question.title }}</mat-card-title>
            <mat-card-subtitle>
              <mat-icon class="time-icon">access_time</mat-icon>
              {{ question.created_at | date:'medium' }}
            </mat-card-subtitle>
          </mat-card-header>

          <mat-card-content>
            <p class="description">{{ question.description | slice:0:200 }}{{ question.description.length > 200 ? '...' : '' }}</p>
          </mat-card-content>

          <mat-card-actions *ngIf="question.tags">
            <div class="tags-container">
              <span *ngFor="let tag of getTagsArray(question)" class="tag-chip" (click)="searchByTag(tag); $event.stopPropagation()">
                {{ tag }}
              </span>
            </div>
          </mat-card-actions>

          <div class="view-more">
            <span>View Discussion</span>
            <mat-icon>arrow_forward</mat-icon>
          </div>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .question-list-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }

    .header-section {
      text-align: center;
      margin-bottom: 40px;
      background: linear-gradient(135deg, #673ab7 0%, #9c27b0 100%);
      padding: 40px 20px;
      border-radius: 8px;
      color: white;
      box-shadow: 0 4px 20px rgba(0,0,0,0.1);
    }

    .main-title {
      font-size: 36px;
      margin-bottom: 10px;
      font-weight: 700;
    }

    .subtitle {
      font-size: 18px;
      opacity: 0.9;
    }

    .actions-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
      flex-wrap: wrap;
      gap: 16px;
    }

    .ask-button {
      font-weight: 500;
      padding: 0 24px;
      height: 52px;
    }

    .search-field {
      flex: 1;
      margin: 0 16px;
      min-width: 200px;
    }

    .loading-spinner {
      display: flex;
      justify-content: center;
      margin: 40px 0;
    }

    .no-questions {
      text-align: center;
      margin: 60px 0;
      color: #666;
    }

    .no-questions mat-icon {
      font-size: 64px;
      height: 64px;
      width: 64px;
      margin-bottom: 16px;
      opacity: 0.6;
    }

    .question-cards {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 24px;
    }

    .question-card {
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;
      height: 100%;
      display: flex;
      flex-direction: column;
    }

    .question-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 6px 20px rgba(0,0,0,0.1);
    }

    .time-icon {
      font-size: 16px;
      height: 16px;
      width: 16px;
      vertical-align: middle;
      margin-right: 4px;
    }

    .description {
      color: #555;
      margin: 10px 0;
    }

    mat-card-content {
      flex: 1;
    }

    .tags-container {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 12px;
    }

    .tag-chip {
      background-color: #f0f0f0;
      color: #555;
      padding: 4px 10px;
      border-radius: 16px;
      font-size: 12px;
      transition: background-color 0.2s;
    }

    .tag-chip:hover {
      background-color: #e0e0e0;
    }

    .view-more {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      margin-top: 16px;
      color: #673ab7;
      font-weight: 500;
    }

    .view-more mat-icon {
      font-size: 18px;
      margin-left: 4px;
    }

    @media (max-width: 768px) {
      .actions-row {
        flex-direction: column;
        align-items: stretch;
      }

      .search-field {
        margin: 16px 0;
        width: 100%;
      }
    }
  `]
})
export class QuestionListComponent implements OnInit {
  questions: Question[] = [];
  loading = true;
  searchControl = new FormControl('');
  filterMode = 'all';

  constructor(
    private questionService: QuestionService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.loadQuestions();

    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(term => {
        if (!term || term.trim() === '') {
          return this.getAllQuestions();
        }
        this.loading = true;
        return this.questionService.searchQuestions(term).pipe(
          catchError(error => {
            this.handleError('Error searching questions', error);
            return of([]);
          })
        );
      })
    ).subscribe(questions => {
      this.questions = questions;
      this.loading = false;
    });
  }

  loadQuestions(): void {
    this.loading = true;
    this.getAllQuestions().subscribe(questions => {
      this.questions = questions;
      this.loading = false;
    });
  }

  getAllQuestions(): Observable<Question[]> {
    return this.questionService.getAllQuestions().pipe(
      catchError(error => {
        this.handleError('Error loading questions', error);
        return of([]);
      })
    );
  }

  applyFilter(): void {
    this.loading = true;
    if (this.filterMode === 'recent') {
      this.questionService.getRecentQuestions().pipe(
        catchError(error => {
          this.handleError('Error loading recent questions', error);
          return of([]);
        })
      ).subscribe(questions => {
        this.questions = questions;
        this.loading = false;
      });
    } else {
      this.loadQuestions();
    }
  }

  searchByTag(tag: string): void {
    this.loading = true;
    this.questionService.getQuestionsByTag(tag).pipe(
      catchError(error => {
        this.handleError('Error loading questions by tag', error);
        return of([]);
      })
    ).subscribe(questions => {
      this.questions = questions;
      this.loading = false;
    });
  }

  getTagsArray(question: Question): string[] {
    if (!question.tags) return [];
    return question.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
  }

  private handleError(message: string, error: any): void {
    console.error(error);
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      panelClass: ['error-snackbar']
    });
  }
}
