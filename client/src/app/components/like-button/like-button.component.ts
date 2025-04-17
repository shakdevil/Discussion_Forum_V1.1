import { Component, EventEmitter, Input, Output } from '@angular/core';
import { trigger, state, style, transition, animate } from '@angular/animations';

@Component({
  selector: 'app-like-button',
  template: `
    <button 
      mat-button 
      class="like-button" 
      (click)="likeAnswer()"
      [disabled]="hasLiked"
      [ngClass]="{'liked': hasLiked}">
      <mat-icon [@thumbAnimation]="animationState">thumb_up</mat-icon>
      <span class="like-count">{{ likes }}</span>
    </button>
  `,
  styles: [`
    .like-button {
      display: flex;
      align-items: center;
      gap: 4px;
      transition: all 0.2s ease;
    }

    .like-button.liked {
      color: #9c27b0;
    }

    .like-count {
      font-weight: 500;
    }
  `],
  animations: [
    trigger('thumbAnimation', [
      state('initial', style({
        transform: 'scale(1)'
      })),
      state('liked', style({
        transform: 'scale(1.2)'
      })),
      transition('initial => liked', [
        animate('0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)')
      ]),
      transition('liked => initial', [
        animate('0.2s ease-out')
      ])
    ])
  ]
})
export class LikeButtonComponent {
  @Input() answerId!: number;
  @Input() likes: number = 0;
  @Output() liked = new EventEmitter<number>();

  hasLiked = false;
  animationState: 'initial' | 'liked' = 'initial';

  likeAnswer(): void {
    if (this.hasLiked) return;
    
    this.hasLiked = true;
    this.animationState = 'liked';
    this.liked.emit(this.answerId);
    
    // Local storage could be used to persist the like state across page refreshes
    // For simplicity, we're just tracking it in the component
  }
}
