import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { QuestionService } from '../../services/question.service';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatChipInputEvent } from '@angular/material/chips';

@Component({
  selector: 'app-question-form',
  template: `
    <div class="question-form-container">
      <div class="form-header">
        <h1>Ask a Question</h1>
        <p>Get help from the community by posting your question</p>
      </div>

      <mat-card class="form-card">
        <mat-card-content>
          <form [formGroup]="questionForm" (ngSubmit)="onSubmit()">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Question Title</mat-label>
              <input matInput formControlName="title" placeholder="e.g. How to implement authentication in Angular?">
              <mat-error *ngIf="questionForm.get('title')?.hasError('required')">
                Title is required
              </mat-error>
              <mat-error *ngIf="questionForm.get('title')?.hasError('maxlength')">
                Title must be less than 255 characters
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Description</mat-label>
              <textarea 
                matInput 
                formControlName="description" 
                placeholder="Provide details about your question..." 
                rows="8">
              </textarea>
              <mat-error *ngIf="questionForm.get('description')?.hasError('required')">
                Description is required
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Tags</mat-label>
              <mat-chip-grid #chipGrid aria-label="Tags input">
                <mat-chip-row *ngFor="let tag of tags" (removed)="removeTag(tag)">
                  {{tag}}
                  <button matChipRemove aria-label="remove {{tag}}">
                    <mat-icon>cancel</mat-icon>
                  </button>
                </mat-chip-row>
                <input 
                  placeholder="Add tags..."
                  [matChipInputFor]="chipGrid"
                  [matChipInputSeparatorKeyCodes]="separatorKeysCodes"
                  (matChipInputTokenEnd)="addTag($event)">
              </mat-chip-grid>
              <mat-hint>Add relevant tags separated by commas</mat-hint>
            </mat-form-field>

            <div class="form-actions">
              <button 
                mat-raised-button 
                color="primary" 
                type="submit" 
                [disabled]="questionForm.invalid || isSubmitting"
                class="submit-button">
                <mat-icon>send</mat-icon>
                Post Question
              </button>
              <button 
                mat-button 
                type="button" 
                routerLink="/" 
                [disabled]="isSubmitting"
                class="cancel-button">
                Cancel
              </button>
            </div>

            <mat-progress-bar *ngIf="isSubmitting" mode="indeterminate" class="submit-progress"></mat-progress-bar>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .question-form-container {
      max-width: 800px;
      margin: 0 auto;
      padding: 24px;
    }

    .form-header {
      text-align: center;
      margin-bottom: 32px;
      background: linear-gradient(135deg, #673ab7 0%, #9c27b0 100%);
      padding: 40px 20px;
      border-radius: 8px;
      color: white;
      box-shadow: 0 4px 20px rgba(0,0,0,0.1);
    }

    .form-header h1 {
      font-size: 32px;
      margin-bottom: 8px;
      font-weight: 700;
    }

    .form-header p {
      font-size: 16px;
      opacity: 0.9;
    }

    .form-card {
      padding: 16px;
    }

    .full-width {
      width: 100%;
      margin-bottom: 20px;
    }

    .form-actions {
      display: flex;
      gap: 16px;
      margin-top: 24px;
    }

    .submit-button {
      padding: 0 24px;
      height: 48px;
    }

    .submit-progress {
      margin-top: 20px;
    }

    mat-hint {
      color: rgba(0, 0, 0, 0.6);
    }

    @media (max-width: 768px) {
      .question-form-container {
        padding: 16px;
      }
      
      .form-actions {
        flex-direction: column;
      }
      
      .submit-button, .cancel-button {
        width: 100%;
      }
    }
  `]
})
export class QuestionFormComponent implements OnInit {
  questionForm!: FormGroup;
  isSubmitting = false;
  tags: string[] = [];
  separatorKeysCodes: number[] = [ENTER, COMMA];

  constructor(
    private fb: FormBuilder,
    private questionService: QuestionService,
    private router: Router,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.questionForm = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(255)]],
      description: ['', [Validators.required]],
      tags: ['']
    });
  }

  addTag(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();
    if (value) {
      this.tags.push(value);
    }
    event.chipInput!.clear();
  }

  removeTag(tag: string): void {
    const index = this.tags.indexOf(tag);
    if (index >= 0) {
      this.tags.splice(index, 1);
    }
  }

  onSubmit(): void {
    if (this.questionForm.invalid) {
      return;
    }

    this.isSubmitting = true;
    const formValue = this.questionForm.value;
    
    // Convert tags array to comma-separated string
    const tagsString = this.tags.join(',');
    
    const question = {
      title: formValue.title,
      description: formValue.description,
      tags: tagsString
    };

    this.questionService.createQuestion(question).subscribe({
      next: (createdQuestion) => {
        this.snackBar.open('Question posted successfully!', 'Close', {
          duration: 5000,
          panelClass: ['success-snackbar']
        });
        this.router.navigate(['/question', createdQuestion.id]);
      },
      error: (error) => {
        console.error('Error creating question:', error);
        this.snackBar.open('Failed to post question. Please try again.', 'Close', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
        this.isSubmitting = false;
      }
    });
  }
}
