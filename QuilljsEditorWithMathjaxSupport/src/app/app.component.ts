import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'QuilljsEditorWithMathjaxSupport';
  public maxChars = 30000;
  public answerText = '';
  public contentId = '12345';
  public content!: string;

  setContent(event: any) {
    this.content = event;
  }
}
