/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./monitoring/maintenance/update_job.ts":
/*!**********************************************!*\
  !*** ./monitoring/maintenance/update_job.ts ***!
  \**********************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

eval("\n// Tools this program depends on:\n// - curl\n// - npm\n// - git\nvar __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {\n    if (k2 === undefined) k2 = k;\n    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });\n}) : (function(o, m, k, k2) {\n    if (k2 === undefined) k2 = k;\n    o[k2] = m[k];\n}));\nvar __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {\n    Object.defineProperty(o, \"default\", { enumerable: true, value: v });\n}) : function(o, v) {\n    o[\"default\"] = v;\n});\nvar __importStar = (this && this.__importStar) || function (mod) {\n    if (mod && mod.__esModule) return mod;\n    var result = {};\n    if (mod != null) for (var k in mod) if (k !== \"default\" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);\n    __setModuleDefault(result, mod);\n    return result;\n};\nObject.defineProperty(exports, \"__esModule\", ({ value: true }));\nvar os = __importStar(__webpack_require__(/*! os */ \"os\"));\nvar update_job_internal_1 = __webpack_require__(/*! ./update_job_internal */ \"./monitoring/maintenance/update_job_internal.ts\");\nfunction getUserName() {\n    return os.userInfo().username;\n}\nfunction isOnDocker() {\n    return getUserName() == 'docker';\n}\nfunction getRootDir() {\n    if (isOnDocker()) {\n        var userName = getUserName();\n        update_job_internal_1.run(\"sudo chown \" + userName + \":\" + userName + \" -R /mnt/inkbird\");\n        return '/mnt/inkbird';\n    }\n    else {\n        update_job_internal_1.run('mkdir -p /tmp/inkbird');\n        return '/tmp/inkbird';\n    }\n}\nfunction installLatestInkbird(branch, rootDir) {\n    try {\n        update_job_internal_1.updateInkbird(branch, rootDir);\n    }\n    catch (e) {\n        update_job_internal_1.installInkbird(branch, rootDir);\n    }\n}\n;\nfunction main() {\n    try {\n        var rootDir = getRootDir();\n        var branch = update_job_internal_1.run('curl -sS http://brewery-app.com/current_version').split('\\n')[0];\n        if (!branch) {\n            return;\n        }\n        installLatestInkbird(branch, rootDir);\n    }\n    catch (e) {\n        console.error(e);\n    }\n}\nmain();\n\n\n//# sourceURL=webpack://brewery_kit/./monitoring/maintenance/update_job.ts?");

/***/ }),

/***/ "./monitoring/maintenance/update_job_internal.ts":
/*!*******************************************************!*\
  !*** ./monitoring/maintenance/update_job_internal.ts ***!
  \*******************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

eval("\n// Tools this program depends on:\n// - npm\n// - git\nvar __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {\n    if (k2 === undefined) k2 = k;\n    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });\n}) : (function(o, m, k, k2) {\n    if (k2 === undefined) k2 = k;\n    o[k2] = m[k];\n}));\nvar __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {\n    Object.defineProperty(o, \"default\", { enumerable: true, value: v });\n}) : function(o, v) {\n    o[\"default\"] = v;\n});\nvar __importStar = (this && this.__importStar) || function (mod) {\n    if (mod && mod.__esModule) return mod;\n    var result = {};\n    if (mod != null) for (var k in mod) if (k !== \"default\" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);\n    __setModuleDefault(result, mod);\n    return result;\n};\nObject.defineProperty(exports, \"__esModule\", ({ value: true }));\nexports.installInkbird = exports.updateInkbird = exports.run = void 0;\nvar child_process_1 = __webpack_require__(/*! child_process */ \"child_process\");\nvar fs = __importStar(__webpack_require__(/*! fs */ \"fs\"));\nvar path = __importStar(__webpack_require__(/*! path */ \"path\"));\nfunction run(command, cwd) {\n    var result = child_process_1.execSync(\"\" + command, { cwd: cwd, encoding: 'utf8' });\n    addLog(\"$ \" + command + \"\\n\" + result);\n    return result;\n}\nexports.run = run;\nfunction installInkbird(branch, rootDir) {\n    run('rm -rf brewery_kit', rootDir);\n    run(\"git clone https://github.com/pascaljp/brewery_kit.git -b \" + branch + \" --depth 1\", rootDir);\n    var monitoringDir = path.join(rootDir, 'brewery_kit', 'monitoring');\n    run('npm install', monitoringDir);\n}\nexports.installInkbird = installInkbird;\n;\nfunction updateInkbird(branch, rootDir) {\n    var gitRootDir = path.join(rootDir, 'brewery_kit');\n    var monitoringDir = path.join(gitRootDir, 'monitoring');\n    try {\n        fs.accessSync(monitoringDir);\n    }\n    catch (err) {\n        throw new Error('Git repository does not exist');\n    }\n    var branches = run('git branch --format=\"%(refname:short)\"', gitRootDir).split('\\n');\n    if (branches.includes(branch)) {\n        run(\"git checkout \" + branch, gitRootDir);\n    }\n    else {\n        run(\"git checkout -b \" + branch, gitRootDir);\n    }\n    run(\"git fetch origin \" + branch, gitRootDir);\n    var diff = run(\"git diff origin \" + branch, gitRootDir);\n    if (!diff) {\n        return;\n    }\n    run(\"git merge origin/\" + branch, gitRootDir);\n    run('npm install', monitoringDir);\n}\nexports.updateInkbird = updateInkbird;\n;\nfunction addLog(message) {\n    console.log(message);\n}\n;\n\n\n//# sourceURL=webpack://brewery_kit/./monitoring/maintenance/update_job_internal.ts?");

/***/ }),

/***/ "child_process":
/*!********************************!*\
  !*** external "child_process" ***!
  \********************************/
/***/ ((module) => {

module.exports = require("child_process");;

/***/ }),

/***/ "fs":
/*!*********************!*\
  !*** external "fs" ***!
  \*********************/
/***/ ((module) => {

module.exports = require("fs");;

/***/ }),

/***/ "os":
/*!*********************!*\
  !*** external "os" ***!
  \*********************/
/***/ ((module) => {

module.exports = require("os");;

/***/ }),

/***/ "path":
/*!***********************!*\
  !*** external "path" ***!
  \***********************/
/***/ ((module) => {

module.exports = require("path");;

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
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	var __webpack_exports__ = __webpack_require__("./monitoring/maintenance/update_job.ts");
/******/ 	
/******/ })()
;