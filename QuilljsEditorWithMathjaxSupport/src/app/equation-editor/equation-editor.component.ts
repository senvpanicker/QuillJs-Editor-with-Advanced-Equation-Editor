import { DOCUMENT } from '@angular/common';
import {
  AfterViewInit,
  EventEmitter,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import {
  Component,
  Inject,
  Input,
  OnInit,
  Output,
  Renderer2,
  ViewChild,
} from '@angular/core';
import { QuillEditorComponent, QuillModules } from 'ngx-quill';
import Quill from 'quill';
import { SPECIAL_CHARACTERS } from './equation-editor.constants';
import { ISpecialChacters } from './equation-editor.interfaces';
import { MathjaxParchment } from './mathjax-parchment';
declare const MathJax: any;

@Component({
  selector: 'app-equation-editor',
  templateUrl: './equation-editor.component.html',
  styleUrls: ['./equation-editor.component.scss'],
})
export class EquationEditor implements OnInit, OnChanges, AfterViewInit {
  @ViewChild(QuillEditorComponent, { static: true })
  editor!: QuillEditorComponent;

  charactertype = 'All';
  public editorStyle = {
    height: '200px',
  };
  public editorModules = <QuillModules>{
    toolbar: {
      container: [
        [
          {
            size: [
              'Default',
              '8px',
              '10px',
              '12px',
              '14px',
              '16px',
              '18px',
              '20px',
              '22px',
              '24px',
              '28px',
            ],
          },
        ],
        [
          {
            charactertypes: [
              'All',
              'Currency',
              'Text',
              'Mathematical',
              'Arrows',
              'Latin',
            ],
          },
        ],
      ],
    },
  };

  public specialCharacterDropdownOpen = false;
  public equationEditorOpen = false;
  public specialCharacter!: ISpecialChacters[];
  public hoverChar!: ISpecialChacters;

  @Input()
  public maxCharacter!: number;
  @Input()
  public contentId!: any;
  @Input()
  public content!: any;
  @Output() contentChanged = new EventEmitter<string>();

  constructor(
    private renderer2: Renderer2,
    @Inject(DOCUMENT) private document: Document
  ) {
    this.registerQuillToolbarComponents();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes) {
      if (this.editor && this.editor.quillEditor) {
        if (changes.contentId) {
          this.editor.quillEditor.getModule('history').clear();
          if (changes.content && !changes.content.firstChange) {
            this.editor.quillEditor.root.innerHTML = this.content;
            this.editor.quillEditor.focus();
            const lastIndex = this.editor.quillEditor.getLength();
            setTimeout(() =>
              this.editor.quillEditor.setSelection(lastIndex + 1, 0)
            );
          }
        }
      }
    }
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      if (this.editor && this.editor.quillEditor) {
        this.editor.quillEditor.root.innerHTML = this.content;
        this.editor.quillEditor.focus();
        const lastIndex = this.editor.quillEditor.getLength();
        setTimeout(() =>
          this.editor.quillEditor.setSelection(lastIndex + 1, 0)
        );
      }
    }, 500);
  }

  ngOnInit(): void {
    this.bindEventsToWindow();
    this.setSpecialCharacters();
    this.loadMathlive();
  }

  loadMathlive() {
    const script = this.renderer2.createElement('script');
    script.type = `text/javascript`;
    script.text = `
        const mf = document.getElementById('mathfield');
        mf.setOptions({
          virtualKeyboardMode: "manual",
          virtualKeyboards: "all",
          virtualKeyboardLayout: 'dvorak',
        });
        `;

    this.renderer2.appendChild(this.document.body, script);
  }

  registerQuillToolbarComponents() {
    const fontSizeStyle = Quill.import('attributors/style/size');
    fontSizeStyle.whitelist = [
      'Default',
      '8px',
      '10px',
      '12px',
      '14px',
      '16px',
      '18px',
      '20px',
      '22px',
      '24px',
      '28px',
    ];
    Quill.register(fontSizeStyle, true);

    const charactertypes = Quill.import('ui/picker');
    charactertypes.whitelist = [
      'All',
      'Currency',
      'Text',
      'Mathematical',
      'Arrows',
      'Latin',
    ];
    Quill.register(charactertypes, true);

    this.registerMathJaxParchment();
  }

  registerMathJaxParchment() {
    MathjaxParchment.blotName = 'mathjax';
    MathjaxParchment.className = 'ql-mathjax';
    MathjaxParchment.tagName = 'SPAN';
    Quill.register(MathjaxParchment);
  }

  characterTypeChanged(event: any) {
    this.setSpecialCharacters();
    if (this.charactertype !== 'All') {
      this.specialCharacter = this.specialCharacter.filter(
        (x) => x.category === this.charactertype
      );
    }
  }

  specialCharacterSelected(char: ISpecialChacters) {
    const selection = this.editor.quillEditor.getSelection(true);
    const lastIndex = this.editor.quillEditor.getLength();
    const selectionIndex = selection?.index || lastIndex || 0;
    this.editor.quillEditor.insertText(selectionIndex, char.symbol);
    setTimeout(() =>
      this.editor.quillEditor.setSelection(selectionIndex + 1, 0)
    );
    this.specialCharacterDropdownOpen = false;
    this.hoverChar = { name: '', category: '', symbol: '', unicode: '' };
  }

  setSpecialCharacters() {
    this.specialCharacter = SPECIAL_CHARACTERS;
  }

  enterEquation() {
    const mf = document.getElementById('mathfield');
    const EVAL_IS_BAD__AVOID_THIS = eval;
    const latex = EVAL_IS_BAD__AVOID_THIS('mf.getValue()');
    if (latex && latex.trim().length > 0) {
      const selection = this.editor.quillEditor.getSelection();
      const lastIndex = this.editor.quillEditor.getLength();
      const selectionIndex = selection?.index || lastIndex || 0;
      this.editor.quillEditor.insertEmbed(selectionIndex, 'mathjax', latex);
      this.editor.quillEditor.insertText(selectionIndex + 1, ' ');
      setTimeout(() =>
        this.editor.quillEditor.setSelection(selectionIndex + 2, 0)
      );
    }

    EVAL_IS_BAD__AVOID_THIS("mf.setValue('')");
    this.equationEditorOpen = false;
  }

  bindEventsToWindow() {
    window.onclick = (event: any) => {
      if (event && event.target) {
        const specialCharacterParentElement = document.getElementById(
          'special-character-dropdown-content'
        );
        const equationEditorParentElement = document.getElementById(
          'mathlive-editor-contents'
        );
        if (
          !event.target.matches('.ql-specialchars') &&
          specialCharacterParentElement &&
          !event.target.matches('#special-character-dropdown-content') &&
          !specialCharacterParentElement.contains(event.target)
        ) {
          this.specialCharacterDropdownOpen = false;
          this.hoverChar = { name: '', category: '', symbol: '', unicode: '' };
        }
        if (
          !event.target.matches('.ql-mathlive') &&
          equationEditorParentElement &&
          !event.target.matches('#mathlive-editor-contents') &&
          !equationEditorParentElement.contains(event.target)
        ) {
          this.equationEditorOpen = false;
        }
      }
    };
  }

  undo() {
    this.editor.quillEditor.getModule('history').undo();
  }

  redo() {
    this.editor.quillEditor.getModule('history').redo();
  }

  onContentChanged(event: any) {
    if (this.maxCharacter) {
      if (event.html?.length > this.maxCharacter) {
        this.editor.quillEditor.getModule('history').undo();
        return;
      }
    }
    if (!event.html || event.html?.trim().length < 1) {
      this.contentChanged.emit('');
    } else {
      this.contentChanged.emit(event.html);
    }
  }

  openEquationEditor() {
    this.equationEditorOpen = true;
    const mathfield = document.getElementById('mathfield');
    if (mathfield) {
      setTimeout(() => {
        mathfield.focus();
      });
    }
  }
}
