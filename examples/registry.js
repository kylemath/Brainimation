/**
 * Global registry for example animations.
 *
 * Each file in this folder calls `BrainimationExamples.register({...})` to
 * add itself to the registry. index.html loads these files dynamically based
 * on `manifest.json` and then walks the registry to populate the dropdown.
 *
 * This file must be loaded before any example file.
 */
(function () {
  if (window.BrainimationExamples) return;

  const registry = {};
  const order = [];

  window.BrainimationExamples = {
    register(example) {
      if (!example || !example.id) {
        console.warn('BrainimationExamples.register: missing id', example);
        return;
      }
      if (registry[example.id]) {
        console.warn(
          `BrainimationExamples.register: duplicate id "${example.id}", overwriting`
        );
      } else {
        order.push(example.id);
      }
      registry[example.id] = {
        id: example.id,
        title: example.title || example.id,
        category: example.category || 'Uncategorized',
        code: example.code || '',
      };
    },
    get(id) {
      return registry[id];
    },
    has(id) {
      return Object.prototype.hasOwnProperty.call(registry, id);
    },
    all() {
      return order.map((id) => registry[id]);
    },
    ids() {
      return order.slice();
    },
    count() {
      return order.length;
    },
  };
})();
