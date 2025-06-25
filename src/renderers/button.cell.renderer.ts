import type { ICellRendererComp } from 'ag-grid-community';

export class ButtonCellRenderer implements ICellRendererComp {
  private cellWidget: HTMLElement;
  private button: HTMLButtonElement;
  private onButtonClickEventHandler: any;

  init(params: any) {
    this.cellWidget = document.createElement('span');
    let buttonLabel = '';

    buttonLabel = params.label
      ? params.label
      : typeof params.getLabel === 'function'
      ? params.getLabel(params)
      : params.value || '';
    this.button = document.createElement('button');
    this.button.setAttribute('type', 'button');
    this.button.className = 'btn btn-link my-0 mr-2 p-0';
    this.button.tabIndex = -1;
    this.button.title = params.title
      ? params.title
      : typeof params.getTitle === 'function'
      ? params.getTitle(params)
      : params.value || '';
    this.button.style.textDecoration = params.showUnderline
      ? 'underline'
      : 'none';

    if (params.iconClass) {
      this.button.innerHTML =
        "<span class='" + params.iconClass + "'>" + buttonLabel + '</span>';
    } else {
      this.button.innerHTML = buttonLabel;
    }

    if (params.linkColor) {
      this.button.style.color = params.linkColor;
    }
    this.cellWidget.appendChild(this.button);

    this.onButtonClickEventHandler = params.onClick.bind(params.colDef, params);
    this.button.addEventListener('click', this.onButtonClickEventHandler);
  }

  getGui(): HTMLElement {
    return this.cellWidget;
  }

  refresh(_params: any): boolean {
    return true;
  }

  destroy() {
    if (this.button) {
      this.button.removeEventListener('click', this.onButtonClickEventHandler);
    }
  }
}
