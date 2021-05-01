import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { QuillModule } from 'ngx-quill';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { EquationEditor } from './equation-editor';

@NgModule({
  declarations: [AppComponent, EquationEditor],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    QuillModule.forRoot(),
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
