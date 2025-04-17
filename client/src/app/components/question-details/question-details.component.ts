import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Question } from '../../models/question.model';
import { Answer } from '../../models/answer.model';
import { QuestionService } from '../../services/question.service';
import { AnswerService } from '../../services/answer.service';
import { catchError, finalize, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-question-details',
  template: `
    <div class="question-details-container">
      <button mat-button color="primary" class="back-button" (click)="goBack()">
        <mat-icon>arrow_back</mat-icon> Back to Questions
      </button>

      <div *ngIf="loading" class="loading-container">
        <mat-spinner diameter="40"></mat-spinner>
      </div>

      <div *ngIf="!loading && !question" class="not-found">
        <mat-icon>error_outline</mat-icon>
        <h2>Question not found</h2>
        <p>The question you're looking for doesn't exist or has been removed</p>
        <button mat-raised-button color="primary" routerLink="/">Return to Home</button>
      </div>

      <div *ngIf="!loading && question" class="question-content">
        <mat-card class="question-card">
          <mat-card-header>
            <mat-card-title class="question-title">{{ question.title }}</mat-card-title>
            <mat-card-subtitle class="question-meta">
              <span class="timestamp">
                <mat-icon>access_time</mat-icon>
                {{ question.created_at | date:'medium' }}
              </span>
            </mat-card-subtitle>
          </mat-card-header>
          
          <mat-card-content>
            <p class="question-description">{{ question.description }}</p>
            
            <div *ngIf="question.tags" class="tags-container">
              <span *ngFor="let tag of getTagsArray(question)" class="tag-chip" (click)="navigateToTag(tag)">
                {{ tag }}
              </span>
            </div>
          </mat-card-content>
        </mat-card>

        <div class="answers-section">
          <h2 class="section-title">
            <mat-icon>question_answer</mat-icon>
            {{ answers.length }} {{ answers.length === 1 ? 'Answer' : 'Answers' }}
          </h2>
          
          <div *ngIf="answersLoading" class="loading-answers">
            <mat-spinner diameter="30"></mat-spinner>
          </div>
          
          <div *ngIf="!answersLoading && answers.length === 0" class="no-answers">
            <p>No answers yet. Be the first to answer this question!</p>
          </div>
          
          <div *ngIf="!answersLoading && answers.length > 0" class="answers-list">
            <mat-card *ngFor="let answer of sortedAnswers" class="answer-card">
              <mat-card-content>
                <p class="answer-text">{{ answer.answer_text }}</p>
              </mat-card-content>
              
              <mat-card-actions>
                <app-like-button 
                  [answerId]="answer.id" 
                  [likes]="answer.likes"
                  (liked)="onAnswerLiked(answer.id)">
                </app-like-button>
                
                <span class="answer-timestamp">
                  <mat-icon>schedule</mat-icon>
                  {{ answer.created_at | date:'medium' }}
                </span>
              </mat-card-actions>
            </mat-card>
          </div>
        </div>

        <div class="post-answer-section">
          <h3 class="section-title">Your Answer</h3>
          <app-answer-form 
            [questionId]="questionId" 
            (answerSubmitted)="onAnswerSubmitted($event)">
          </app-answer-form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .question-details-container {
      max-width: 900px;
      margin: 0 auto;
      padding: 24px;
    }

    .back-button {
      margin-bottom: 20px;
      display: flex;
      align-items: center;
    }

    .back-button mat-icon {
      margin-right: 4px;
    }

    .loading-container, .not-found {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      margin: 60px 0;
      text-align: center;
    }

    .not-found mat-icon {
      font-size: 64px;
      height: 64px;
      width: 64px;
      margin-bottom: 16px;
      color: #f44336;
    }

    .not-found h2 {
      margin-bottom: 16px;
      font-weight: 500;
    }

    .not-found p {
      margin-bottom: 24px;
      color: #666;
    }

    .question-card {
      margin-bottom: 32px;
      border-left: 5px solid #673ab7;
    }

    .question-title {
      font-size: 24px;
      font-weight: 500;
      margin-bottom: 8px;
    }

    .question-meta {
      display: flex;
      align-items: center;
      color: #666;
    }

    .timestamp {
      display: flex;
      align-items: center;
    }

    .timestamp mat-icon {
      font-size: 16px;
      height: 16px;
      width: 16px;
      margin-right: 4px;
    }

    .question-description {
      white-space: pre-line;
      line-height: 1.6;
      margin: 24px 0;
    }

    .tags-container {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 16px;
    }

    .tag-chip {
      background-color: #f0f0f0;
      color: #555;
      padding: 6px 12px;
      border-radius: 16px;
      font-size: 13px;
      cursor: pointer;
      transition: background-color 0.2s;
    }

    .tag-chip:hover {
      background-color: #e0e0e0;
    }

    .section-title {
      display: flex;
      align-items: center;
      margin-bottom: 16px;
      font-weight: 500;
    }

    .section-title mat-icon {
      margin-right: 8px;
      color: #673ab7;
    }

    .answers-section {
      margin: 32px 0;
    }

    .loading-answers {
      display: flex;
      justify-content: center;
      margin: 24px 0;
    }

    .no-answers {
      background-color: #f5f5f5;
      padding: 24px;
      border-radius: 8px;
      text-align: center;
      color: #666;
    }

    .answers-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .answer-card {
      border-left: 4px solid #9c27b0;
    }

    .answer-text {
      white-space: pre-line;
      line-height: 1.6;
    }

    .answer-timestamp {
      display: flex;
      align-items: center;
      margin-left: auto;
      color: #888;
      font-size: 12px;
    }

    .answer-timestamp mat-icon {
      font-size: 14px;
      height: 14px;
      width: 14px;
      margin-right: 4px;
    }

    .post-answer-section {
      margin-top: 40px;
      padding-top: 24px;
      border-top: 1px solid #e0e0e0;
    }

    @media (max-width: 768px) {
      .question-details-container {
        padding: 16px;
      }
    }
  `]
})
export class QuestionDetailsComponent implements OnInit {
  questionId!: number;
  question: Question | null = null;
  answers: Answer[] = [];
  loading = true;
  answersLoading = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private questionService: QuestionService,
    private answerService: AnswerService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.questionId = +id;
        this.loadQuestion();
      }
    });
  }

  loadQuestion(): void {
    this.loading = true;
    this.questionService.getQuestionById(this.questionId).pipe(
      catchError(error => {
        console.error('Error loading question:', error);
        this.snackBar.open('Failed to load question', 'Close', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
        return of(null);
      }),
      finalize(() => {
        this.loading = false;
      }),
      switchMap(question => {
        this.question = question;
        if (question) {
          this.loadAnswers();
        }
        return of(question);
      })
    ).subscribe();
  }

  loadAnswers(): void {
    this.answersLoading = true;
    this.answerService.getAnswersByQuestionId(this.questionId).pipe(
      catchError(error => {
        console.error('Error loading answers:', error);
        this.snackBar.open('Failed to load answers', 'Close', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
        return of([]);
      }),
      finalize(() => {
        this.answersLoading = false;
      })
    ).subscribe(answers => {
      this.answers = answers;
    });
  }

  get sortedAnswers(): Answer[] {
    return [...this.answers].sort((a, b) => b.likes - a.likes);
  }

  onAnswerLiked(answerId: number): void {
    this.answerService.likeAnswer(answerId).pipe(
      catchError(error => {
        console.error('Error liking answer:', error);
        this.snackBar.open('Failed to like answer', 'Close', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
        return of(null);
      })
    ).subscribe(updatedAnswer => {
      if (updatedAnswer) {
        // Update the answer in the local array
        const index = this.answers.findIndex(a => a.id === answerId);
        if (index !== -1) {
          this.answers[index] = updatedAnswer;
        }
      }
    });
  }

  onAnswerSubmitted(answerText: string): void {
    // The new answer will be loaded in the answer form component
    this.loadAnswers();
  }

  getTagsArray(question: Question): string[] {
    if (!question.tags) return [];
    return question.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
  }

  navigateToTag(tag: string): void {
    this.router.navigate(['/'], { queryParams: { tag } });
  }

  goBack(): void {
    this.router.navigate(['/']);
  }
}
