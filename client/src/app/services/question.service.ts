import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Question, QuestionCreate } from '../models/question.model';

@Injectable({
  providedIn: 'root'
})
export class QuestionService {
  private apiUrl = '/api/questions';

  constructor(private http: HttpClient) { }

  getAllQuestions(): Observable<Question[]> {
    return this.http.get<Question[]>(this.apiUrl);
  }

  getQuestionById(id: number): Observable<Question> {
    return this.http.get<Question>(`${this.apiUrl}/${id}`);
  }

  createQuestion(question: QuestionCreate): Observable<Question> {
    return this.http.post<Question>(this.apiUrl, question);
  }

  searchQuestions(keyword: string): Observable<Question[]> {
    return this.http.get<Question[]>(`${this.apiUrl}/search?keyword=${keyword}`);
  }

  getQuestionsByTag(tag: string): Observable<Question[]> {
    return this.http.get<Question[]>(`${this.apiUrl}/tag/${tag}`);
  }

  getRecentQuestions(): Observable<Question[]> {
    return this.http.get<Question[]>(`${this.apiUrl}/recent`);
  }
}
