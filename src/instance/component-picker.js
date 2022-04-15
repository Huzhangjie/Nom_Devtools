import { highlight, unHighlight } from './highlighter'

export default class ComponentPicker {
  constructor() {
    this.bindMethods()
  }

  /**
   * Adds event listeners for mouseover and mouseup
   */
  startSelecting() {
    window.addEventListener('mouseover', this.elementMouseOver, true)
    window.addEventListener('click', this.elementClicked, true)
    window.addEventListener('mouseout', this.cancelEvent, true)
    window.addEventListener('mouseenter', this.cancelEvent, true)
    window.addEventListener('mouseleave', this.cancelEvent, true)
    window.addEventListener('mousedown', this.cancelEvent, true)
    window.addEventListener('mouseup', this.cancelEvent, true)
  }

  /**
   * Removes event listeners
   */
  stopSelecting() {
    window.removeEventListener('mouseover', this.elementMouseOver, true)
    window.removeEventListener('click', this.elementClicked, true)
    window.removeEventListener('mouseout', this.cancelEvent, true)
    window.removeEventListener('mouseenter', this.cancelEvent, true)
    window.removeEventListener('mouseleave', this.cancelEvent, true)
    window.removeEventListener('mousedown', this.cancelEvent, true)
    window.removeEventListener('mouseup', this.cancelEvent, true)

    unHighlight()
  }

  /**
   * Highlights a component on element mouse over
   */
  async elementMouseOver(e) {
    this.cancelEvent(e)

    const el = e.target

    unHighlight()
    if (el && el.component && el.component.componentType !== 'Component') {
      this.selectedEl = el
      highlight({ el })
    } else {
      this.selectedEl = null
    }
  }

  /**
   * Selects an instance in the component view
   */
  async elementClicked(e) {
    this.cancelEvent(e)

    if (this.selectedEl) {
      window.postMessage({
        name: 'TO_FRONT_COMPONENT_PICK',
        payload: { key: this.selectedEl.component.key },
      })
    } else {
      window.postMessage({
        name: 'TO_FRONT_COMPONENT_PICK_CANCELED',
        payload: {},
      })
    }

    this.stopSelecting()
  }

  /**
   * Cancel a mouse event
   */
  cancelEvent(e) {
    e.stopImmediatePropagation()
    e.preventDefault()
  }

  bindMethods() {
    this.startSelecting = this.startSelecting.bind(this)
    this.stopSelecting = this.stopSelecting.bind(this)
    this.elementMouseOver = this.elementMouseOver.bind(this)
    this.elementClicked = this.elementClicked.bind(this)
  }
}
