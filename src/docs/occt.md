# occt-import-js

[](#occt-import-js)

The [emscripten](https://emscripten.org) interface for [OpenCascade](https://www.opencascade.com) import functionalities. It runs entirely in the browser, and allows you to import brep, step and iges files and access the result in JSON format.

[![npm version](https://camo.githubusercontent.com/546a5f39dae111684811e0b04eaf4ddd208194917b7972c711319336d34a27f7/68747470733a2f2f62616467652e667572792e696f2f6a732f6f6363742d696d706f72742d6a732e737667)](https://badge.fury.io/js/occt-import-js) [![WASM Build](https://github.com/kovacsv/occt-import-js/actions/workflows/wasm_build.yml/badge.svg)](https://github.com/kovacsv/occt-import-js/actions/workflows/wasm_build.yml) [![Native Build](https://github.com/kovacsv/occt-import-js/actions/workflows/native_build.yml/badge.svg)](https://github.com/kovacsv/occt-import-js/actions/workflows/native_build.yml)

See it in action in [Online 3D Viewer](https://3dviewer.net/#model=https://dl.dropbox.com/s/utieopxrxwujgmd/as1_pe_203.stp), or check [this fiddle](https://jsfiddle.net/kovacsv/rzhq9gxj) for a code example.

## How to install?

[](#how-to-install)

You can get occt-import-js from [npm](https://www.npmjs.com/package/occt-import-js):

```
npm install occt-import-js
```

## How to use?

[](#how-to-use)

The library runs in the browser and as a node.js module as well.

You will need two files from the `dist` folder: `occt-import-js.js` and `occt-import-js.wasm`. The wasm file is loaded runtime by the js file. There are three public functions in the library:

* `ReadBrepFile` to import brep file.
* `ReadStepFile` to import step file.
* `ReadIgesFile` to import iges file.

All functions have two parameters:

* `content`: The file content as a `Uint8Array` object.

* `params`: Triangulation parameters as an object, can be `null`.

  * `linearUnit`: Defines the linear unit of the output. Possible values: `millimeter`, `centimeter`, `meter`, `inch`, `foot`. Default is `millimeter`. Has no effect on brep files.

  * `linearDeflectionType`: Defines what the linear deflection value means. Default is `bounding_box_ratio`. Possible values:

    * `bounding_box_ratio`: The `linearDeflection` value contains a ratio of the average bounding box.
    * `absolute_value`: The `linearDeflection` value contains an absolute value in the unit defined by `linearUnit`.

  * `linearDeflection`: The linear deflection value based on the value of the `linearDeflectionType` parameter.

  * `angularDeflection`: The angular deflection value.

You can find more information about deflection values [here](https://dev.opencascade.org/doc/overview/html/occt_user_guides__mesh.html).

### Use from the browser

[](#use-from-the-browser)

First, include the `occt-import-js.js` file in your website.

```
<script type="text/javascript" src="occt-import-js.js"></script>
```

After that, download the model file, and pass them to occt-import-js.

```
occtimportjs ().then (async function (occt) {
    let fileUrl = '../test/testfiles/simple-basic-cube/cube.stp';
    let response = await fetch (fileUrl);
    let buffer = await response.arrayBuffer ();
    let fileBuffer = new Uint8Array (buffer);
    let result = occt.ReadStepFile (fileBuffer, null);
    console.log (result);
});
```

### Use as a node.js module

[](#use-as-a-nodejs-module)

You should require the `occt-import-js` module in your script.

```
let fs = require ('fs');
const occtimportjs = require ('occt-import-js')();

occtimportjs.then ((occt) => {
    let fileUrl = '../test/testfiles/simple-basic-cube/cube.stp';
    let fileContent = fs.readFileSync (fileUrl);
    let result = occt.ReadStepFile (fileContent, null);
    console.log (result);
});
```

### Processing the result

[](#processing-the-result)

The result of the import is a JSON object with the following structure.

* **success** (boolean): Tells if the import was successful.

* **root** (object): The root node of the hierarchy.

  * **name** (string): Name of the node.
  * **meshes** (array): Indices of the meshes in the meshes array for this node.
  * **children** (array): Array of child nodes for this node.

* **meshes** (array): Array of mesh objects. The geometry representation is compatible with [three.js](https://github.com/mrdoob/three.js).

  * **name** (string): Name of the mesh.

  * **color** (array, optional): Array of r, g, and b values of the mesh color.

  * **brep\_faces** (array): Array representing the faces of the source b-rep.

    * **first** (number): The first triangle index of the face.
    * **last** (number): The last triangle index of the face.
    * **color** (array): Array of r, g, and b values of the color or null.

  * **attributes** (object)

    * **position** (object)
      * **array** (array): Array of number triplets defining the vertex positions.
    * **normal** (object, optional)
      * **array** (array): Array of number triplets defining the normal vectors.

  * **index** (object):
    * **array** (array): Array of number triplets defining triangles by indices.

## How to build on Windows?

[](#how-to-build-on-windows)

A set of batch scripts are prepared for building on Windows.

### 1. Install Prerequisites

[](#1-install-prerequisites)

Install [CMake](https://cmake.org) (3.6 minimum version is needed). Make sure that the cmake executable is in the PATH.

### 2. Install Emscripten SDK

[](#2-install-emscripten-sdk)

Run the Emscripten setup script.

```
tools\setup_emscripten_win.bat
```

### 3. Compile the WASM library

[](#3-compile-the-wasm-library)

Run the release build script.

```
tools\build_wasm_win_release.bat
```

### 4. Build the native project (optional)

[](#4-build-the-native-project-optional)

If you want to debug the code, it's useful to build a native project. To do that, just use cmake to generate the project of your choice.

## How to run locally?

[](#how-to-run-locally)

To run the demo and the examples locally, you have to start a web server. Run `npm install` from the root directory, run `npm start` and visit `http://localhost:8080`.