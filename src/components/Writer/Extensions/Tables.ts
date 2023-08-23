import { tableNodes as tableSchemas, TableMap, columnResizing, tableEditing, CellSelection, addColumnBefore, addColumnAfter, addRowBefore, addRowAfter, deleteRow, deleteColumn, mergeCells, setCellAttr, } from "prosemirror-tables";
import Extension from "../Extension";
import Node from "../Node";
import { splitCell, CellAttributes } from "prosemirror-tables";
import type { EditorView } from "prosemirror-view";
import type { EditorState } from "prosemirror-state";


/**
 * Generates the nodes which are used by the table extension.
 *
 * @param {{background?: boolean|string[]}} attributes
 * @returns {Node[]}
 */
export function generateTableNodes(attributes: Record<string,any> = {}) {
  const cellAttributes: Record<string, CellAttributes> = {
    width: {
      default: null,
      setDOMAttr: (value, attrs) => {
        if (attrs['data-colwidth']) {
          //attrs.width = attrs['data-colwidth'];
          attrs.style = (attrs.style || '') + `width:${attrs['data-colwidth']}px;`;
        }
      },
    },
    alignment: {
      default: 'left',
      getFromDOM: (dom) => {
        return dom.style.textAlign || 'left';
      },
      setDOMAttr: (value, attrs) => {
        if (value && value !== 'left') {
          attrs.style = (attrs.style || '') + `text-align:${value};`;
        }
      },
    },
  };

  if(attributes.background) {
    cellAttributes.background = {
      default: undefined,
      getFromDOM: (dom) => {
        return dom.style.backgroundColor;
      },
      setDOMAttr: (value, attrs) => {
        if(value) {
          attrs.style = (attrs.style || '') + `background-color:${value};`
        }
      }
    }
  }

  const schemas = tableSchemas({
    tableGroup: 'block',
    cellContent: 'block+',
    cellAttributes,
  });

  return Object.entries(schemas).map(([name, schema]) => {
    return new class extends Node {
      get name() {
        return name;
      }
      get schema() {
        return schema;
      }
    };
  });
}

// table specific buttons (name = command)
export function getTableButtons(editor) {
  const schema = editor.schema;

  // check if there is a background attribute for table_cell
  const hasBackground = !!schema.nodes.table_cell?.spec?.attrs?.background;

  const state = editor.view.state;
  let align = '';

  if(state.selection instanceof CellSelection) {
    const aligns = new Set();
    state.selection.forEachCell(cell => aligns.add(cell.attrs.alignment));
    if(aligns.size === 1) {
      align = aligns.values().next().value;
    }
  }

  const buttons = [
    [
      {
        value: 'table-alignLeft',
        icon: 'text-left',
        text: 'Align left',
        active: align === 'left',
      },
      {
        value: 'table-alignCenter',
        icon: 'text-center',
        text: 'Align center',
        active: align === 'center',
      },
      {
        value: 'table-alignRight',
        icon: 'text-right',
        text: 'Align right',
        active: align === 'right',
      },
    ],
    '|',
    {
      name: 'table-addColumnBefore',
      icon: 'insert-column-left',
      label: 'Add column to the left',
    },
    {
      name: 'table-addColumnAfter',
      icon: 'insert-column-right',
      label: 'Add column to the right',
    },
    {
      name: 'table-deleteColumn',
      icon: 'delete-column',
      label: 'Delete column',
    },
    '|',
    {
      name: 'table-addRowBefore',
      icon: 'insert-row-top',
      label: 'Add row above',
    },
    {
      name: 'table-addRowAfter',
      icon: 'insert-row-bottom',
      label: 'Add row below',
    },
    {
      name: 'table-deleteRow',
      icon: 'delete-row',
      label: 'Delete row',
    },
    '|',
    {
      name: 'table-mergeCells',
      icon: 'merge-cells',
      label: 'Merge cells',
    },
    {
      name: 'table-splitCell',
      icon: 'split-cell',
      label: 'Split cell',
    },
    '|',
    {
      name: 'table-resetWidths',
      icon: 'undo',
      label: 'Reset column widths',
    },
  ];

  if(hasBackground) {
    buttons.push(
      '|',
      {
        name: 'table-background',
        icon: 'palette',
        label: 'Background',
      }
    );
  };

  return buttons;
}


export default class Tables extends Extension {
  writer: any;
  editor: any;

  constructor(writer) {
    super();
    this.writer = writer;
  }

  get name() {
    return "tables";
  }

  commands() {
    return {
      'table-addColumnBefore': () => addColumnBefore,
      'table-addColumnAfter': () => addColumnAfter,
      'table-addRowBefore': () => addRowBefore,
      'table-addRowAfter': () => addRowAfter,
      'table-deleteRow': () => deleteRow,
      'table-deleteColumn': () => deleteColumn,
      'table-mergeCells': () => mergeCells,
      'table-splitCell': () => splitCell,
      'table-alignLeft': () => setCellAttr('alignment', 'left'),
      'table-alignCenter': () => setCellAttr('alignment', 'center'),
      'table-alignRight': () => setCellAttr('alignment', 'right'),
      'table-resetWidths': () => (state: EditorState, dispatch: EditorView['dispatch'], view: EditorView) => {
        if(!(state.selection instanceof CellSelection)) {
          return false;
        }

        const $cell1 = state.selection.$anchorCell;
        const $cell2 = state.selection.$headCell;

        const table = $cell1.node(-1),
          map = TableMap.get(table),
          start = $cell1.start(-1);

        const [colStart, colEnd] = [
          map.colCount($cell1.pos - start) + $cell1.nodeAfter.attrs.colspan - 1,
          map.colCount($cell2.pos - start) + $cell2.nodeAfter.attrs.colspan - 1,
        ].sort();

        const tr = state.tr;
        for(let col = colStart; col <= colEnd; col++) {
          for (let row = 0; row < map.height; row++) {
            const mapIndex = row * map.width + col;
            // Rowspanning cell that has already been handled
            if (row && map.map[mapIndex] == map.map[mapIndex - map.width]) continue;
            const pos = map.map[mapIndex];
            const attrs = table.nodeAt(pos).attrs;

            tr.setNodeMarkup(start + pos, null, { ...attrs, colwidth: null });
          }
        }
        if (tr.docChanged) dispatch(tr);
      },
      'table-background': () => {
        return (state, dispatch) => {

          if(!(state.selection instanceof CellSelection)) {
            return false;
          }

          const currentColors = new Set();

          state.selection.forEachCell(cell => {
            let background = cell.attrs.background;
            if(typeof background === 'string') {
              if(background.startsWith('rgb(')) {
                background = background.replace(/rgb\((\d+), (\d+), (\d+)\)/, (match, r, g, b) => {
                  return `#${parseInt(r).toString(16)}${parseInt(g).toString(16)}${parseInt(b).toString(16)}`;
                });
              }

              background = background.toUpperCase();
              currentColors.add(background);
            }
          });

          let color = '';
          if(currentColors.size === 1) {
            color = currentColors.values().next().value;
          }


          // get node attributes from writer
          const backgrounds = this.writer.nodeAttributesOf('table')?.background;
          const palette = [];

          if(Array.isArray(backgrounds)) {
            palette.push(...backgrounds);
          }

          this.writer.$panel.dialog.open({
            component: 'rs-color-dialog',
            props: {
              value: color,
              palette,
            },
            on: {
              cancel: () => {
                this.editor.focus();
              },
              submit: (color) => {
                this.editor.focus();
                this.writer.$panel.dialog.close();
                setCellAttr('background', color)(state, dispatch);
              }
            }
          });
        }
      }
    }
  }

  init() {
    // when editor selects a Cell
    this.editor.on("select", ({hasChanged, transaction}) => {
      if(!hasChanged) {
        return;
      }
      if(!(transaction.curSelection instanceof CellSelection)) {
        return;
      }
      this.writer.$refs.toolbar?.tableOptions(true);
    });

    // when editor deselects anything
    this.editor.on("deselect", () => {
      if(!this.writer.$refs.toolbar) {
        return;
      }
      this.writer.$refs.toolbar?.tableOptions(false);
    });

  }

  plugins({schema}) {
    if(schema.nodes.table) {
      return [
        columnResizing(),
        tableEditing(),
      ]
    } else {
      return [];
    }
  }
}
