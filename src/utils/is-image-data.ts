/**
 * @license
 * Copyright (c) 2019 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
 */

/**
 * Convenience function used internally for detecting `ImageData` vs
 * `HTMLImageElement`.
 */
export function isImageData(imgData: ImageData | HTMLImageElement): imgData is ImageData {
  return typeof (imgData as ImageData).data !== 'undefined';
}
