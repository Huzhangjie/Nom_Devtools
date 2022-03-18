// 监听message,当内容是initGetInst时调用getInst方法
window.addEventListener(
  "message",
  function (event) {
    console.log('1111111111111', event)
    if (event.data && event.data.name === "initGetInst") {
      getInst();
    }
  },
  false
);

// 获取唯一标识的dom元素，打印其实例
function getInst() {
  debugger
  const current = document.querySelector(".current-nom-target");
  const { component } = current;
  console.log('222222222222222222 current', current, component)
  if (component) {
    const obj = JSON.stringify(component,getCircularReplacer())
    console.log("🚀 ~ file: get-inst.js ~ line 20 ~ getInst ~ obj", obj)

    chrome.runtime.sendMessage({
      name: 'updateTree',
      value: JSON.parse(obj)
    });
  } 
  
}

// 处理JSON.stringify循环引用报错
const getCircularReplacer = () => {
  const seen = new WeakSet();
  return (key, value) => {
    if (typeof value === "object" && value !== null) {
      if (seen.has(value)) {
        return;
      }
      seen.add(value);
    }
    return value;
  };
}

