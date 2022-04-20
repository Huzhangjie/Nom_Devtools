// 任务队列
class JobQueue {
  jobs = [];
  currentJob;

  queue(id, fn) {
    const job = {
      id,
      fn,
    };

    return new Promise((resolve) => {
      const onDone = () => {
        this.currentJob = null;
        const nextJob = this.jobs.shift();
        if (nextJob) {
          nextJob.fn();
        }
        resolve();
      };

      const run = () => {
        this.currentJob = job;
        return job
          .fn()
          .then(onDone)
          .catch((e) => {
            console.error(`Job ${job.id} failed:`);
            console.error(e);
          });
      };

      if (this.currentJob) {
        this.jobs.push({
          id: job.id,
          fn: () => run(),
        });
      } else {
        run();
      }
    });
  }
}

let overlay;
let overlayContent;
let currentInstance;

function createOverlay() {
  if (overlay) return;
  overlay = document.createElement("div");
  overlay.style.backgroundColor = "rgba(65, 184, 131, 0.35)";
  overlay.style.position = "fixed";
  overlay.style.zIndex = "99999999999998";
  overlay.style.pointerEvents = "none";
  overlay.style.borderRadius = "3px";
  overlayContent = document.createElement("div");
  overlayContent.style.position = "fixed";
  overlayContent.style.zIndex = "99999999999999";
  overlayContent.style.pointerEvents = "none";
  overlayContent.style.backgroundColor = "white";
  overlayContent.style.fontFamily = "monospace";
  overlayContent.style.fontSize = "11px";
  overlayContent.style.padding = "4px 8px";
  overlayContent.style.borderRadius = "3px";
  overlayContent.style.color = "#333";
  overlayContent.style.textAlign = "center";
  overlayContent.style.border = "rgba(65, 184, 131, 0.5) 1px solid";
  overlayContent.style.backgroundClip = "padding-box";
}

// Use a job queue to preserve highlight/unhighlight calls order
// This prevents "sticky" highlights that are not removed because highlight is async
const jobQueue = new JobQueue();

async function highlight({ __nom_selector, key, el }) {
  await jobQueue.queue("highlight", async () => {
    if (!__nom_selector && !el) return;

    const { bounds, componentType: name } = getComponentBoundsAndName({
      __nom_selector,
      key,
      el,
    });
    console.log("🚀 ~ file: highlighter.js ds, name", bounds, name);
    if (bounds) {
      createOverlay();

      // Name
      // const name = (await backend.api.getComponentName(instance)) || 'Anonymous'
      const pre = document.createElement("span");
      pre.style.opacity = "0.6";
      pre.innerText = "<";
      const text = document.createElement("span");
      text.style.fontWeight = "bold";
      text.style.color = "#09ab56";
      text.innerText = name;
      const post = document.createElement("span");
      post.style.opacity = "0.6";
      post.innerText = ">";

      // Size
      const size = document.createElement("span");
      size.style.opacity = "0.5";
      size.style.marginLeft = "6px";
      size.appendChild(
        document.createTextNode(
          (Math.round(bounds.width * 100) / 100).toString()
        )
      );
      const multiply = document.createElement("span");
      multiply.style.marginLeft = multiply.style.marginRight = "2px";
      multiply.innerText = "×";
      size.appendChild(multiply);
      size.appendChild(
        document.createTextNode(
          (Math.round(bounds.height * 100) / 100).toString()
        )
      );

      await showOverlay(bounds, [pre, text, post, size]);
    }

    startUpdateTimer();
  });
}

async function unHighlight() {
  await jobQueue.queue("unHighlight", async () => {
    overlay?.parentNode?.removeChild(overlay);
    overlayContent?.parentNode?.removeChild(overlayContent);
    currentInstance = null;

    stopUpdateTimer();
  });
}

function showOverlay(bounds, children = null) {
  if (!children.length) return;

  positionOverlay(bounds);
  document.body.appendChild(overlay);

  overlayContent.innerHTML = "";
  children.forEach((child) => overlayContent.appendChild(child));
  document.body.appendChild(overlayContent);

  positionOverlayContent(bounds);
}

function positionOverlay({ width = 0, height = 0, top = 0, left = 0 }) {
  overlay.style.width = Math.round(width) + "px";
  overlay.style.height = Math.round(height) + "px";
  overlay.style.left = Math.round(left) + "px";
  overlay.style.top = Math.round(top) + "px";
}

function positionOverlayContent({ height = 0, top = 0, left = 0 }) {
  // Content position (prevents overflow)
  const contentWidth = overlayContent.offsetWidth;
  const contentHeight = overlayContent.offsetHeight;
  let contentLeft = left;
  if (contentLeft < 0) {
    contentLeft = 0;
  } else if (contentLeft + contentWidth > window.innerWidth) {
    contentLeft = window.innerWidth - contentWidth;
  }
  let contentTop = top - contentHeight - 2;
  if (contentTop < 0) {
    contentTop = top + height + 2;
  }
  if (contentTop < 0) {
    contentTop = 0;
  } else if (contentTop + contentHeight > window.innerHeight) {
    contentTop = window.innerHeight - contentHeight;
  }
  overlayContent.style.left = ~~contentLeft + "px";
  overlayContent.style.top = ~~contentTop + "px";
}

async function updateOverlay() {
  if (currentInstance) {
    const bounds = currentInstance.getBoundingClientRect();
    if (bounds) {
      const sizeEl = overlayContent.children.item(3);
      const widthEl = sizeEl.childNodes[0];
      widthEl.textContent = (Math.round(bounds.width * 100) / 100).toString();
      const heightEl = sizeEl.childNodes[2];
      heightEl.textContent = (Math.round(bounds.height * 100) / 100).toString();

      positionOverlay(bounds);
      positionOverlayContent(bounds);
    }
  }
}

let updateTimer;

function startUpdateTimer() {
  stopUpdateTimer();
  updateTimer = setInterval(() => {
    jobQueue.queue("updateOverlay", async () => {
      await updateOverlay();
    });
  }, 1000 / 30); // 30fps
}

function stopUpdateTimer() {
  clearInterval(updateTimer);
}

function getComponentBoundsAndName({ __nom_selector, key, el = null }) {
  console.log("🚀 ~ file: higoundsAndName ~ el", el);
  if (!el) {
    const els = document.querySelectorAll(__nom_selector);
    if (!els || !els.length) return;
    if (els.length > 1) {
      el = Array.from(els).find((item) => item.component.key === key);
    } else {
      el = els[0];
    }
  }

  currentInstance = el;

  const { width, height, top, left } = el.getBoundingClientRect();
  return {
    componentType: el.component.componentType,
    bounds: { width, height, top, left },
  };
}

// 从inst中传过来的数据无法直接使用, children会不出来

// 无法从dom带到devtools的 key
const IGNORE_COMP_KEYS = [
  "element",
  "reference",
  "referenceComponent",
  "_placeHolderElement",
  "referenceElement",
  "within",
  "firstRender",
  "mixins",
  // "props",
  "root",
  "parent",
  "_propStyleClasses",
  "__handleClick",
  // "__handleMouseEnter",
  // "__handleMouseLeave",
];

// 处理JSON.stringify循环引用报错
function getCircularReplacer() {
  const seen = new WeakSet();
  return (key, value) => {
    // if (count > 26595 && count % 2 === 0) {
    //   debugger
    // }
    if (
      value === window ||
      value instanceof HTMLElement ||
      IGNORE_COMP_KEYS.includes(key) ||
      typeof value === "function"
    ) {
      return;
    }
    if (typeof value === "object" && value !== null) {
      if (seen.has(value)) {
        return;
      }
      seen.add(value);
    }
    return value;
  };
}

/**
 * 递归从组件中获取 devtools中的 Tree数据
 * @param {*} component 组件对象
 * @param {*} lastSelector 选择器名称
 * @returns
 */
function getComponentTree(component, lastSelector = null) {
  const { componentType } = component;

  const { data, methods } = getDataAndMethodsFormComp(component);

  // delete component.props.children
  // delete component.props.reference

  // 选择器类名
  const __nom_selector = getSelectorFormComp(component, lastSelector);

  return {
    componentType: componentType,
    key: component.key,
    __nom_selector,
    // props: {},
    props: component.props,
    data,
    methods,
    children: component
      .getChildren()
      .filter((child) => child)
      .map((child) => getComponentTree(child, __nom_selector)),
  };
}

// 获取 data 和 methods
function getDataAndMethodsFormComp(component) {
  let data = {},
    methods = {};
  Object.keys(component).forEach((key) => {
    let value = component[key];
    if (
      IGNORE_COMP_KEYS.includes(key) ||
      key === "props" ||
      value instanceof HTMLElement
    ) {
      return;
    } else if (nomui.utils.isFunction(value) && !key.startsWith("_")) {
      methods[key] = value.toString();
    } else {
      data[key] = value;
    }
  });

  return { data, methods };
}

/**
 * @param {*} component 当前组件对象
 * @param {*} lastSelector 上一级的选择器
 * @returns 组件的选择器类名 ex: body > div.nom-xxx > xxx
 */
function getSelectorFormComp(component, lastSelector) {
  const tag = component.props.tag;
  const classList = Array.from(component.element.classList);

  const currentSel = classList.length ? `${tag}.${classList.join(".")}` : tag;

  return lastSelector ? `${lastSelector} > ${currentSel}` : currentSel;
}

class ComponentPicker {
  constructor() {
    this.bindMethods();
  }

  /**
   * Adds event listeners for mouseover and mouseup
   */
  startSelecting() {
    window.addEventListener("mouseover", this.elementMouseOver, true);
    window.addEventListener("click", this.elementClicked, true);
    window.addEventListener("mouseout", this.cancelEvent, true);
    window.addEventListener("mouseenter", this.cancelEvent, true);
    window.addEventListener("mouseleave", this.cancelEvent, true);
    window.addEventListener("mousedown", this.cancelEvent, true);
    window.addEventListener("mouseup", this.cancelEvent, true);
  }

  /**
   * Removes event listeners
   */
  stopSelecting() {
    window.removeEventListener("mouseover", this.elementMouseOver, true);
    window.removeEventListener("click", this.elementClicked, true);
    window.removeEventListener("mouseout", this.cancelEvent, true);
    window.removeEventListener("mouseenter", this.cancelEvent, true);
    window.removeEventListener("mouseleave", this.cancelEvent, true);
    window.removeEventListener("mousedown", this.cancelEvent, true);
    window.removeEventListener("mouseup", this.cancelEvent, true);

    unHighlight();
  }

  /**
   * Highlights a component on element mouse over
   */
  async elementMouseOver(e) {
    this.cancelEvent(e);

    const el = e.target;

    unHighlight();
    if (el && el.component && el.component.componentType !== "Component") {
      this.selectedEl = el;
      highlight({ el });
    } else {
      this.selectedEl = null;
    }
  }

  /**
   * Selects an instance in the component view
   */
  async elementClicked(e) {
    this.cancelEvent(e);

    if (this.selectedEl) {
      window.postMessage({
        name: "TO_FRONT_COMPONENT_PICK",
        payload: { key: this.selectedEl.component.key },
      });
    } else {
      window.postMessage({
        name: "TO_FRONT_COMPONENT_PICK_CANCELED",
        payload: {},
      });
    }

    this.stopSelecting();
  }

  /**
   * Cancel a mouse event
   */
  cancelEvent(e) {
    e.stopImmediatePropagation();
    e.preventDefault();
  }

  bindMethods() {
    this.startSelecting = this.startSelecting.bind(this);
    this.stopSelecting = this.stopSelecting.bind(this);
    this.elementMouseOver = this.elementMouseOver.bind(this);
    this.elementClicked = this.elementClicked.bind(this);
  }
}

const componentPicker = new ComponentPicker();

window.addEventListener(
  "message",
  function (event) {
    console.log("1111111111111", event);
    if (!event.data) return;
    const { name, payload } = event.data;

    if (name === "initDevtools") {
      getInst();
    } else if (name === "TO_BACK_COMPONENT_MOUSE_OVER") {
      hightlightDOM(payload);
    } else if (name === "TO_BACK_COMPONENT_MOUSE_LEAVE") {
      unHighlight();
    } else if (name === "TO_BACK_COMPONENT_PICK") {
      // 给 window加上 mouseover事件
      componentPicker.startSelecting();
    } else if (name === "TO_BACK_COMPONENT_PICK_CANCELED") {
      // 去掉 window 的mouseover事件
      componentPicker.stopSelecting();
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
      payload: JSON.parse(JSON.stringify(obj, getCircularReplacer())),
    });
  }
}

/**
 * @param {string} __nom_selector 选择器
 * @param {key} key component的Key
 */
function hightlightDOM({ __nom_selector, key }) {
  highlight({ __nom_selector, key });
}
