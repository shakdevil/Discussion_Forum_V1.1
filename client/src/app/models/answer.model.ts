export interface Answer {
  id: number;
  question_id: number;
  answer_text: string;
  likes: number;
  created_at: Date;
}

export interface AnswerCreate {
  question_id: number;
  answer_text: string;
}
