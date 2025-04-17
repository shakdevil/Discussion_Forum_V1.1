import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { QuestionListComponent } from './components/question-list/question-list.component';
import { QuestionDetailsComponent } from './components/question-details/question-details.component';
import { QuestionFormComponent } from './components/question-form/question-form.component';

const routes: Routes = [
  { path: '', component: QuestionListComponent },
  { path: 'ask', component: QuestionFormComponent },
  { path: 'question/:id', component: QuestionDetailsComponent },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
