import { highlight, unHighlight } from "./highlighter";
import { IGNORE_COMP_KEYS, getCircularReplacer, getComponentTree } from "../utils";

window.addEventListener(
  "message",
  function (event) {
    console.log("1111111111111", event);
    if (event.data && event.data.name === "initDevtools") {
      getInst();
    }

    if (event.data && event.data.name === "TO_BACK_COMPONENT_MOUSE_OVER") {
      hightlightDOM(event.data.payload)
    }

    if (event.data && event.data.name === "TO_BACK_COMPONENT_MOUSE_LEAVE") {
      unHighlight()
    }

  },
  false
);

// 从dom节点中获取完整的 componentData 的数据
function getInst() {
  const current = document.querySelector(".nom-app");
  const { component } = current;
  if (component) {
    const obj = getComponentTree(component);
    console.log("🚀 ~ file: get-inst.js ~ line 20 ~ getInst ~ obj", obj);
    window.postMessage({
      name: "updateTree",
      data: JSON.parse(JSON.stringify(obj, getCircularReplacer())),
    });
  }
}

/**
 * @param {string} __nom_selector 选择器 
 * @param {key} key component的Key
 */
 function hightlightDOM({__nom_selector, key }) {
  highlight({__nom_selector, key })
}