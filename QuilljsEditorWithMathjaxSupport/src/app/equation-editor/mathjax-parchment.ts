import Quill from 'quill';
const Parchment = Quill.import('parchment');
declare const MathJax: any;

export class MathjaxParchment extends Parchment.Embed {
  static create(value: any) {
    const node = super.create(value);
    if (typeof value === 'string') {
      node.innerHTML = '&#65279;' + this.latexToMathML(value) + '&#65279;';
      node.contentEditable = 'false';
      node.setAttribute('data-value', value);
    }
    return node;
  }

  static value(domNode: any) {
    return domNode.getAttribute('data-value');
  }

  static latexToMathML(latex: any) {
    const MathJaxNode = document.createElement('DIV');
    MathJaxNode.style.visibility = 'hidden';
    MathJaxNode.innerHTML = '\\(' + latex + '\\)';
    document.body.appendChild(MathJaxNode);
    MathJax.Hub.Queue(['Typeset', MathJax.Hub, MathJaxNode]);
    const svg = MathJaxNode.innerHTML;
    document.body.removeChild(MathJaxNode);
    return svg;
  }
}
