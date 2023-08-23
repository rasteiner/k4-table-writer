// This plugin replaces the Writer component, so that the WriterField and WriterInput components of Kirby use it instead of the original.
// this allows us to reuse them instead of having to reimplement them too.

import Writer from '@/components/Writer/index.js';
import Dialogs from '@/components/Dialogs/index';

const icons = {
  'insert-column-left': `<path d="M20 3c.5523 0 1 .44772 1 1v16c0 .5523-.4477 1-1 1h-6c-.5523 0-1-.4477-1-1V4c0-.55228.4477-1 1-1h6Zm-1 2h-4v14h4V5ZM6 7c2.76142 0 5 2.23858 5 5 0 2.7614-2.23858 5-5 5s-5-2.2386-5-5c0-2.76142 2.23858-5 5-5Zm1 2H5v1.999L3 11v2l2-.001V15h2v-2.001L9 13v-2l-2-.001V9Z"/>`,
  'insert-column-right': `<path d="M10 3c.5523 0 1 .44772 1 1v16c0 .5523-.4477 1-1 1H4c-.55228 0-1-.4477-1-1V4c0-.55228.44772-1 1-1h6ZM9 5H5v14h4V5Zm9 2c2.7614 0 5 2.23858 5 5 0 2.7614-2.2386 5-5 5s-5-2.2386-5-5c0-2.76142 2.2386-5 5-5Zm1 2h-2v1.999L15 11v2l2-.001V15h2v-2.001L21 13v-2l-2-.001V9Z"/>`,
  'insert-row-top': `<path d="M20 13c.5523 0 1 .4477 1 1v6c0 .5523-.4477 1-1 1H4c-.55228 0-1-.4477-1-1v-6c0-.5523.44772-1 1-1h16Zm-1 2H5v4h14v-4ZM12 1c2.7614 0 5 2.23858 5 5s-2.2386 5-5 5c-2.76142 0-5-2.23858-5-5s2.23858-5 5-5Zm1 2h-2v1.999L9 5v2l2-.001V9h2V6.999L15 7V5l-2-.001V3Z"/>`,
  'insert-row-bottom': `<path d="M12 13c2.7614 0 5 2.2386 5 5s-2.2386 5-5 5c-2.76142 0-5-2.2386-5-5s2.23858-5 5-5Zm1 2h-2v1.999L9 17v2l2-.001V21h2v-2.001L15 19v-2l-2-.001V15Zm7-12c.5523 0 1 .44772 1 1v6c0 .5523-.4477 1-1 1H4c-.55228 0-1-.4477-1-1V4c0-.55228.44772-1 1-1h16ZM5 5v4h14V5H5Z"/>`,
  'delete-column': `<path d="M12 3c.5523 0 1 .44772 1 1l-.0002 7.9998C13.8355 11.372 14.8743 11 16 11c2.7614 0 5 2.2386 5 5s-2.2386 5-5 5c-1.0319 0-1.9908-.3126-2.7871-.8482L13 20c0 .5523-.4477 1-1 1H6c-.55228 0-1-.4477-1-1V4c0-.55228.44772-1 1-1h6Zm-1 2H7v14h4V5Zm8 10h-6v2h6v-2Z"/>`,
  'delete-row': `<path d="M20 5c.5523 0 1 .44772 1 1v6c0 .5523-.4477 1-1 1 .628.8355 1 1.8743 1 3 0 2.7614-2.2386 5-5 5s-5-2.2386-5-5c0-1.1257.372-2.1645.9998-3.0002L4 13c-.55228 0-1-.4477-1-1V6c0-.55228.44772-1 1-1h16Zm-7 10v2h6v-2h-6Zm6-8H5v4h14V7Z"/>`,
  'merge-cells': `<path d="M20 3c.5523 0 1 .44772 1 1v16c0 .5523-.4477 1-1 1H4c-.55228 0-1-.4477-1-1V4c0-.55228.44772-1 1-1h16Zm-9 2H5v5.999h2V9l3 3-3 3v-2H5v6h6v-2h2v2h6v-6h-2v2l-3-3 3-3v1.999h2V5h-6v2h-2V5Zm2 8v2h-2v-2h2Zm0-4v2h-2V9h2Z"/>`,
  'split-cell': `<path d="M20 3c.5523 0 1 .44772 1 1v16c0 .5523-.4477 1-1 1H4c-.55228 0-1-.4477-1-1V4c0-.55228.44772-1 1-1h16Zm-9 2H5v14h6v-4h2v4h6V5h-6v4h-2V5Zm4 4 3 3-3 3v-2H9v2l-3-3 3-3v2h6V9Z"/>`,
};

/**
 * TODO: Remove in k4 beta 1, when icons with 24x24 viewbox are supported
 */
function installIcons() {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.style.display = 'none';
  document.body.appendChild(svg);

  for (const name in icons) {
    const symbol = document.createElementNS('http://www.w3.org/2000/svg', 'symbol');
    symbol.setAttribute('id', `icon-${name}`);
    symbol.setAttribute('viewBox', '0 0 24 24');
    symbol.innerHTML = icons[name];
    svg.appendChild(symbol);
  }
}
installIcons();

panel.plugin('rasteiner/k4-table-writer', {
  components: {
    ...Dialogs,
  },
  use: [
    function (Vue) {
      Vue.use(Writer);
    }
  ],
});
