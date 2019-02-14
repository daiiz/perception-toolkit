/**
 * @license
 * Copyright (c) 2019 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
 */

import { html, styles } from './action-button.template.js';

/**
 * An action button for use with [[Card]] components.
 *
 * ```javascript
 * // Create an action button, give it a label and a click handler.
 * const button = new ActionButton();
 * button.label = 'Dismiss';
 * button.addEventListener('click', () => {
 *   card.close();
 * });
 *
 * // Now create a card, and append the button to it.
 * const card = new Card();
 * card.src = 'Card with Actions';
 * card.appendChild(button);
 * ```
 */
export class ActionButton extends HTMLElement {
  /**
   * The ActionButton's default tag name for registering with
   * `customElements.define`.
   */
  static defaultTagName = 'action-button';

  /**
   * The ActionButton's default label.
   */
  static readonly DEFAULT_LABEL = 'Button';

  private labelInternal = ActionButton.DEFAULT_LABEL;
  private root = this.attachShadow({ mode: 'open' });

  /* istanbul ignore next */
  constructor() {
    super();
  }

  /**
   * @ignore Only public because it's a Custom Element.
   */
  connectedCallback() {
    this.root.innerHTML = `<style>${styles}</style> ${html}`;
    this.render();
  }

  /**
   * Gets & sets the label for the instance.
   */
  get label() {
    return this.labelInternal;
  }

  set label(label: string) {
    this.labelInternal = label;
    this.render();
  }

  private render() {
    const button = this.root.querySelector('button');
    if (!button) {
      return;
    }

    button.textContent = this.label;
  }
}
