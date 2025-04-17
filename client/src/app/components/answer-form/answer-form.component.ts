import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AnswerService } from '../../services/answer.service';

@Component({
  selector: 'app-answer-form',
  template: `
    <form [formGroup]="answerForm" (ngSubmit)="onSubmit()" class="answer-form">
      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Your Answer</mat-label>
        <textarea 
          matInput 
          formControlName="answerText" 
          placeholder="Share your knowledge or experience..." 
          rows="5">
        </textarea>
        <mat-error *ngIf="answerForm.get('answerText')?.hasError('required')">
          Answer text is required
        </mat-error>
        <mat-error *ngIf="answerForm.get('answerText')?.hasError('minlength')">
          Answer must be at least 5 characters
        </mat-error>
      </mat-form-field>

      <div class="form-actions">
        <button 
          mat-raised-button 
          color="accent" 
          type="submit" 
          [disabled]="answerForm.invalid || isSubmitting"
          class="submit-button">
          <mat-icon>send</mat-icon>
          Post Answer
        </button>
      </div>

      <mat-progress-bar *ngIf="isSubmitting" mode="indeterminate" class="submit-progress"></mat-progress-bar>
    </form>
  `,
  styles: [`
    .answer-form {
      background-color: #f8f8f8;
      padding: 24px;
      border-radius: 8px;
    }

    .full-width {
      width: 100%;
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      margin-top: 16px;
    }

    .submit-button {
      font-weight: 500;
    }

    .submit-progress {
      margin-top: 16px;
    }

    @media (max-width: 768px) {
      .answer-form {
        padding: 16px;
      }
    }
  `]
})
export class AnswerFormComponent implements OnInit {
  @Input() questionId!: number;
  @Output() answerSubmitted = new EventEmitter<string>();
  
  answerForm!: FormGroup;
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private answerService: AnswerService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.answerForm = this.fb.group({
      answerText: ['', [Validators.required, Validators.minLength(5)]]
    });
  }

  onSubmit(): void {
    if (this.answerForm.invalid) {
      return;
    }

    this.isSubmitting = true;
    const answerText = this.answerForm.get('answerText')?.value;
    
    this.answerService.createAnswer(this.questionId, {
      question_id: this.questionId,
      answer_text: answerText
    }).subscribe({
      next: (answer) => {
        this.snackBar.open('Answer posted successfully!', 'Close', {
          duration: 5000,
          panelClass: ['success-snackbar']
        });
        this.answerForm.reset();
        this.isSubmitting = false;
        this.answerSubmitted.emit(answerText);
      },
      error: (error) => {
        console.error('Error posting answer:', error);
        this.snackBar.open('Failed to post answer. Please try again.', 'Close', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
        this.isSubmitting = false;
      }
    });
  }
}
