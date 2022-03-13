// import { readResAsString } from "../src/utils.js"

const fetch = window.fetch.bind(window);
function readResAsString(response, autoDetectCharset) {
	// 未启用自动检测
	if (!autoDetectCharset) {
		return response.text();
	}

	// 如果没headers，发生在test环境下的mock数据，为兼容原有测试用例
	if (!response.headers) {
		return response.text();
	}

	// 如果没返回content-type，走默认逻辑
	const contentType = response.headers.get('Content-Type');
	if (!contentType) {
		return response.text();
	}

	// 解析content-type内的charset
	// Content-Type: text/html; charset=utf-8
	// Content-Type: multipart/form-data; boundary=something
	// GET请求下不会出现第二种content-type
	let charset = 'utf-8';
	const parts = contentType.split(';');
	if (parts.length === 2) {
		const [, value] = parts[1].split('=');
		const encoding = value && value.trim();
		if (encoding) {
			charset = encoding;
		}
	}

	// 如果还是utf-8，那么走默认，兼容原有逻辑，这段代码删除也应该工作
	if (charset.toUpperCase() === 'UTF-8') {
		return response.text();
	}

	// 走流读取，编码可能是gbk，gb2312等，比如sofa 3默认是gbk编码
	return response.blob()
		.then(file => new Promise((resolve, reject) => {
			const reader = new window.FileReader();
			reader.onload = () => {
				resolve(reader.result);
			};
			reader.onerror = reject;
			reader.readAsText(file, charset);
		}));
}
const result = readResAsString(fetch('http://dev3.leadwaycloud.com/'))
console.log('result:', result)
