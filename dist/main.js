/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./node_modules/ip-regex/index.js":
/*!****************************************!*\
  !*** ./node_modules/ip-regex/index.js ***!
  \****************************************/
/***/ ((module) => {

"use strict";


const word = '[a-fA-F\\d:]';
const b = options => options && options.includeBoundaries ?
	`(?:(?<=\\s|^)(?=${word})|(?<=${word})(?=\\s|$))` :
	'';

const v4 = '(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]\\d|\\d)(?:\\.(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]\\d|\\d)){3}';

const v6seg = '[a-fA-F\\d]{1,4}';
const v6 = `
(?:
(?:${v6seg}:){7}(?:${v6seg}|:)|                                    // 1:2:3:4:5:6:7::  1:2:3:4:5:6:7:8
(?:${v6seg}:){6}(?:${v4}|:${v6seg}|:)|                             // 1:2:3:4:5:6::    1:2:3:4:5:6::8   1:2:3:4:5:6::8  1:2:3:4:5:6::1.2.3.4
(?:${v6seg}:){5}(?::${v4}|(?::${v6seg}){1,2}|:)|                   // 1:2:3:4:5::      1:2:3:4:5::7:8   1:2:3:4:5::8    1:2:3:4:5::7:1.2.3.4
(?:${v6seg}:){4}(?:(?::${v6seg}){0,1}:${v4}|(?::${v6seg}){1,3}|:)| // 1:2:3:4::        1:2:3:4::6:7:8   1:2:3:4::8      1:2:3:4::6:7:1.2.3.4
(?:${v6seg}:){3}(?:(?::${v6seg}){0,2}:${v4}|(?::${v6seg}){1,4}|:)| // 1:2:3::          1:2:3::5:6:7:8   1:2:3::8        1:2:3::5:6:7:1.2.3.4
(?:${v6seg}:){2}(?:(?::${v6seg}){0,3}:${v4}|(?::${v6seg}){1,5}|:)| // 1:2::            1:2::4:5:6:7:8   1:2::8          1:2::4:5:6:7:1.2.3.4
(?:${v6seg}:){1}(?:(?::${v6seg}){0,4}:${v4}|(?::${v6seg}){1,6}|:)| // 1::              1::3:4:5:6:7:8   1::8            1::3:4:5:6:7:1.2.3.4
(?::(?:(?::${v6seg}){0,5}:${v4}|(?::${v6seg}){1,7}|:))             // ::2:3:4:5:6:7:8  ::2:3:4:5:6:7:8  ::8             ::1.2.3.4
)(?:%[0-9a-zA-Z]{1,})?                                             // %eth0            %1
`.replace(/\s*\/\/.*$/gm, '').replace(/\n/g, '').trim();

// Pre-compile only the exact regexes because adding a global flag make regexes stateful
const v46Exact = new RegExp(`(?:^${v4}$)|(?:^${v6}$)`);
const v4exact = new RegExp(`^${v4}$`);
const v6exact = new RegExp(`^${v6}$`);

const ip = options => options && options.exact ?
	v46Exact :
	new RegExp(`(?:${b(options)}${v4}${b(options)})|(?:${b(options)}${v6}${b(options)})`, 'g');

ip.v4 = options => options && options.exact ? v4exact : new RegExp(`${b(options)}${v4}${b(options)}`, 'g');
ip.v6 = options => options && options.exact ? v6exact : new RegExp(`${b(options)}${v6}${b(options)}`, 'g');

module.exports = ip;


/***/ }),

/***/ "./node_modules/is-ip/index.js":
/*!*************************************!*\
  !*** ./node_modules/is-ip/index.js ***!
  \*************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";

const ipRegex = __webpack_require__(/*! ip-regex */ "./node_modules/ip-regex/index.js");

const isIp = string => ipRegex({exact: true}).test(string);
isIp.v4 = string => ipRegex.v4({exact: true}).test(string);
isIp.v6 = string => ipRegex.v6({exact: true}).test(string);
isIp.version = string => isIp(string) ? (isIp.v4(string) ? 4 : 6) : undefined;

module.exports = isIp;


/***/ }),

/***/ "./node_modules/is-online/browser.js":
/*!*******************************************!*\
  !*** ./node_modules/is-online/browser.js ***!
  \*******************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
/* eslint-env browser */

const publicIp = __webpack_require__(/*! public-ip */ "./node_modules/public-ip/browser.js");

const isOnline = async options => {
	options = {
		timeout: 5000,
		ipVersion: 4,
		...options
	};

	if (navigator && navigator.onLine === false) {
		return false;
	}

	const publicIpFunctionName = options.ipVersion === 4 ? 'v4' : 'v6';

	try {
		await publicIp[publicIpFunctionName](options);
		return true;
	} catch (_) {
		return false;
	}
};

module.exports = isOnline;


/***/ }),

/***/ "./node_modules/public-ip/browser.js":
/*!*******************************************!*\
  !*** ./node_modules/public-ip/browser.js ***!
  \*******************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";

const isIp = __webpack_require__(/*! is-ip */ "./node_modules/is-ip/index.js");

class CancelError extends Error {
	constructor() {
		super('Request was cancelled');
		this.name = 'CancelError';
	}

	get isCanceled() {
		return true;
	}
}

const defaults = {
	timeout: 5000
};

const urls = {
	v4: [
		'https://ipv4.icanhazip.com/',
		'https://api.ipify.org/'
	],
	v6: [
		'https://ipv6.icanhazip.com/',
		'https://api6.ipify.org/'
	]
};

const sendXhr = (url, options, version) => {
	const xhr = new XMLHttpRequest();

	let _reject;
	const promise = new Promise((resolve, reject) => {
		_reject = reject;
		xhr.addEventListener('error', reject, {once: true});
		xhr.addEventListener('timeout', reject, {once: true});

		xhr.addEventListener('load', () => {
			const ip = xhr.responseText.trim();

			if (!ip || !isIp[version](ip)) {
				reject();
				return;
			}

			resolve(ip);
		}, {once: true});

		xhr.open('GET', url);
		xhr.timeout = options.timeout;
		xhr.send();
	});

	promise.cancel = () => {
		xhr.abort();
		_reject(new CancelError());
	};

	return promise;
};

const queryHttps = (version, options) => {
	let request;
	const promise = (async function () {
		const urls_ = [].concat.apply(urls[version], options.fallbackUrls || []);
		for (const url of urls_) {
			try {
				request = sendXhr(url, options, version);
				// eslint-disable-next-line no-await-in-loop
				const ip = await request;
				return ip;
			} catch (error) {
				if (error instanceof CancelError) {
					throw error;
				}
			}
		}

		throw new Error('Couldn\'t find your IP');
	})();

	promise.cancel = () => {
		request.cancel();
	};

	return promise;
};

module.exports.v4 = options => queryHttps('v4', {...defaults, ...options});

module.exports.v6 = options => queryHttps('v6', {...defaults, ...options});


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
/*!**********************!*\
  !*** ./src/index.js ***!
  \**********************/
window.isOnline = __webpack_require__(/*! is-online */ "./node_modules/is-online/browser.js");

})();

/******/ })()
;
//# sourceMappingURL=main.js.map