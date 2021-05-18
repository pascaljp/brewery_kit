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

eval("\n// Tools this program depends on:\n// - curl\n// - docker (optional)\n// - npm\n// - git\nvar __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {\n    if (k2 === undefined) k2 = k;\n    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });\n}) : (function(o, m, k, k2) {\n    if (k2 === undefined) k2 = k;\n    o[k2] = m[k];\n}));\nvar __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {\n    Object.defineProperty(o, \"default\", { enumerable: true, value: v });\n}) : function(o, v) {\n    o[\"default\"] = v;\n});\nvar __importStar = (this && this.__importStar) || function (mod) {\n    if (mod && mod.__esModule) return mod;\n    var result = {};\n    if (mod != null) for (var k in mod) if (k !== \"default\" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);\n    __setModuleDefault(result, mod);\n    return result;\n};\nObject.defineProperty(exports, \"__esModule\", ({ value: true }));\nvar spawnSync = __webpack_require__(/*! child_process */ \"child_process\").spawnSync;\nvar fs = __importStar(__webpack_require__(/*! fs */ \"fs\"));\nvar os = __importStar(__webpack_require__(/*! os */ \"os\"));\nvar path = __importStar(__webpack_require__(/*! path */ \"path\"));\nvar run = function (command, cwd) {\n    var c = command.split(' ');\n    var result = spawnSync(c[0], c.slice(1), { cwd: cwd });\n    return {\n        stdout: new TextDecoder().decode(result.stdout),\n        stderr: new TextDecoder().decode(result.stderr),\n    };\n};\nvar GetRootDir = function () {\n    if (IsOnDocker()) {\n        return '/mnt/inkbird';\n    }\n    else {\n        run('mkdir -p /tmp/inkbird');\n        return '/tmp/inkbird';\n    }\n};\nvar GetUserName = function () {\n    return os.userInfo().username;\n};\nvar IsOnDocker = function () {\n    return GetUserName() == 'docker';\n};\nvar InstallInkbird = function (branch, rootDir) {\n    run(\"git clone https://github.com/pascaljp/brewery_kit.git -b \" + branch + \" --depth 1\", rootDir);\n    AddLog('git clone: done');\n};\nvar UpdateInkbird = function (branch, gitRootDir) {\n    run(\"git fetch origin \" + branch, gitRootDir);\n    var diff = run(\"git diff origin/\" + branch, gitRootDir).stdout;\n    if (!diff) {\n        AddLog('git: no diff');\n        return false;\n    }\n    run(\"git pull origin \" + branch, gitRootDir);\n    run(\"git checkout \" + branch, gitRootDir);\n    AddLog('git pull: done');\n    return true;\n};\nvar RestartJob = function () {\n    if (IsOnDocker()) {\n        run('docker restart brewery-kit-instance');\n        AddLog('restart job: done');\n        return;\n    }\n    AddLog('restart job: not executed');\n};\nvar InstallLatestInkbird = function (rootDir) {\n    var userName = GetUserName();\n    run(\"sudo chown \" + userName + \":\" + userName + \" -R \" + rootDir);\n    // const branch = run('curl http://brewery-app.com/current_version')[\n    //   'stdout'\n    // ].split('\\n')[0];\n    var branch = 'master';\n    AddLog(\"git branch: \" + branch);\n    if (!branch) {\n        return;\n    }\n    var monitoringDir = path.join(rootDir, 'brewery_kit', 'monitoring');\n    try {\n        fs.accessSync(monitoringDir);\n        var updated = UpdateInkbird(branch, monitoringDir);\n        if (!updated) {\n            return;\n        }\n    }\n    catch (e) {\n        InstallInkbird(branch, rootDir);\n    }\n    run('npm install', monitoringDir);\n    AddLog('npm install: done');\n    RestartJob();\n};\nvar AddLog = function (message) {\n    console.log(message);\n};\nfunction main() {\n    try {\n        var rootDir = GetRootDir();\n        InstallLatestInkbird(rootDir);\n        var setupScript = path.join(rootDir, 'brewery_kit/monitoring/maintenance/setup.js');\n        var target = IsOnDocker() ? 'docker' : 'native';\n        run(\"node \" + setupScript + \" \" + target);\n    }\n    catch (e) {\n        console.error(e);\n    }\n}\nmain();\n\n\n//# sourceURL=webpack://brewery_kit/./monitoring/maintenance/update_job.ts?");

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