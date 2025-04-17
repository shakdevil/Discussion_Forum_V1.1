export interface Question {
  id: number;
  title: string;
  description: string;
  tags?: string;
  created_at: Date;
}

export interface QuestionCreate {
  title: string;
  description: string;
  tags?: string;
}
