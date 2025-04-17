import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Answer, AnswerCreate } from '../models/answer.model';

@Injectable({
  providedIn: 'root'
})
export class AnswerService {
  private apiUrl = '/api';

  constructor(private http: HttpClient) { }

  getAnswersByQuestionId(questionId: number): Observable<Answer[]> {
    return this.http.get<Answer[]>(`${this.apiUrl}/questions/${questionId}/answers`);
  }

  createAnswer(questionId: number, answer: AnswerCreate): Observable<Answer> {
    return this.http.post<Answer>(`${this.apiUrl}/questions/${questionId}/answers`, answer);
  }

  likeAnswer(answerId: number): Observable<Answer> {
    return this.http.put<Answer>(`${this.apiUrl}/answers/${answerId}/reaction`, {});
  }

  deleteAnswer(answerId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/answers/${answerId}`);
  }
}
