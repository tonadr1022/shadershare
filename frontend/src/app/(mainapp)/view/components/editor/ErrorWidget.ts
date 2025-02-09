import { WidgetType } from "@codemirror/view";

export class ErrorWidget extends WidgetType {
  constructor(private readonly message: string) {
    super();
  }
  // eq(other: ErrorWidget) {
  //   return other.message == this.message;
  // }
  toDOM() {
    const div = document.createElement("div");
    div.id = "minecraft";
    div.textContent = this.message;
    div.style.color = "red";
    div.style.fontSize = "0.9em";
    div.style.marginTop = "4px";
    div.style.paddingLeft = "10px";
    return div;
  }
  destroy(dom: HTMLElement): void {
    if (dom.parentElement) {
      dom.parentElement.removeChild(dom);
    }
  }
  // ignoreEvent() {
  //   return true;
  // }
}
