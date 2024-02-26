import {ErrorTypes} from "./error.ts";

/**
 * @description 通过iframe触发请求
 * @param {String} url 请求地址
 * @param {String} data 请求数据
 * @param {String} callback 请求回调
 * @return {Null}
 **/
const sendByForm = function (url, data, callback) {
  let obj = {
    tempform: document.createElement("form"),
    frameId: "kjdp_sendBrowserLog" + Math.round(Math.random() * 100),
    iframe: document.createElement("iframe")
  }
  obj.iframe.id = obj.frameId;
  obj.iframe.name = obj.frameId;
  obj.iframe.style.display = "none";
  obj.iframe.src = "about:blank";
  obj.tempform.action = url;
  obj.tempform.method = "post";
  // obj.tempform.target =obj.frameId;
  obj.tempform.style.display = "none";
  for (var attr in data) {
    obj.opt = document.createElement("input");
    obj.opt.name = attr;
    obj.opt.value = data[attr];
    obj.tempform.appendChild(obj.opt);
  }
  obj.opt = document.createElement("input");
  obj.opt.type = "submit";
  obj.tempform.appendChild(obj.opt);
  document.body.appendChild(obj.iframe);
  try {
    obj.iframe.contentWindow.document.body.appendChild(obj.tempform);
    // document.body.appendChild();
    obj.tempform.submit();
    obj.iframe.onload = function () {
      callback && callback()
      setTimeout(function () {
        obj.iframe.parentNode.removeChild(obj.iframe)
        obj = {}
      }, 10)
    }
  } catch (err) {
    console.error(err)
  }
}

/**
 * @description 通过Img触发请求
 * @param {String} src 请求地址
 * @param {String} callback 请求回调
 * @return {Null}
 **/
const sendByImage = function (src, callback) {
  let image = new Image(1, 1);
  image.onload = image.onerror = function () {
    image.onload = image.onerror = null;
    image = null;
    callback && callback()
  };
  image.src = src;
}

const getConfigJson = function (url, callback) {
  try {
    const xhr = new XMLHttpRequest();
    // xhr.timeout = 5000; // 请求资源设置超时时间
    xhr.open('GET', url, true);
    xhr.onreadystatechange = function() {
      if (xhr.readyState === 4 && xhr.status === 200) {
        var jsonData = JSON.parse(xhr.responseText);
        callback(jsonData);
      }
    };
    xhr.send();
  } catch (e) {
    console.error(ErrorTypes.CONFIG_REQUEST_FAILED)
  }

}

export {
  sendByForm,
  sendByImage,
  getConfigJson
}
