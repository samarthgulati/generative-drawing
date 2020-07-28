const p5EditorTemplate = document.createElement('template')
p5EditorTemplate.innerHTML = /* HTML */`
<style>
:host {
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: 50%;
  grid-gap: 2rem;
  gap: 2rem;
  align-items: center;
  justify-content: space-between;
}
iframe {
  border: none;
  box-shadow: 0 0 0.2rem 0.1rem white;
  width: 400px;
  height: 400px;
  border-radius: 4px;
}
</style>
<slot name="code">
function setup() {
  createCanvas(400, 400);
}

function draw() {
  background(220);
}
</slot>
<iframe></iframe>
`
class P5Editor extends HTMLElement {
  static get is() {
    return 'p5-editor'
  }
  _updateIFrame() {
    const code = this._codeEl.textContent
    this._container.open()
    this._container.writeln(/* HTML */`
    <html>
      <head>
        <style>
          html, body {
            width: 400px;
            height: 400px;
            margin: 0;
            overflow: hidden;
          }
          canvas {
            margin: 0;
            background: #efefef;
          }
        </style>
        <script src="../js/p5.min.js"></script>
        <script>${code}</script>
      </head>
      <body>
      </body>
    </html>`)
    this._container.close()
  }
  constructor() {
    super()
    this.attachShadow({mode: 'open'})
    this.shadowRoot.appendChild(p5EditorTemplate.content.cloneNode(true))
    this._slotEl = this.shadowRoot.querySelector('slot[name="code"]')
    this._container = this.shadowRoot.querySelector('iframe').contentWindow.document
  }
  _slotChange(e) {
    this._codeEl = this._slotEl.assignedNodes()[0].firstElementChild
    this._updateIFrame = this._updateIFrame.bind(this)
    this._codeEl.addEventListener('keyup', this._updateIFrame)
    this._updateIFrame()
  }
  connectedCallback() {
    this._slotChange = this._slotChange.bind(this)
    this._slotEl.addEventListener('slotchange', this._slotChange)
  }
}
window.customElements.define(P5Editor.is, P5Editor)