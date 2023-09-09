import Writer from '@/components/Writer/index.js';
import Dialogs from '@/components/Dialogs/index';

const iconsImport = import.meta.glob("./icons/*.svg", { eager: true, as: 'raw' })
const icons = Object.fromEntries(Object.entries(iconsImport).map(([k, v]) => [k.replace('./icons/', '').replace('.svg', ''), v]));

panel.plugin('rasteiner/k4-table-writer', {
  icons,
  components: {
    ...Dialogs,
  },
  use: [
    function (Vue) {
      Vue.use(Writer);
    }
  ],
});
