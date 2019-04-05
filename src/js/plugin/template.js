/******************************************************************************
 *
 * Copyright (c) 2017, the Perspective Authors.
 *
 * This file is part of the Perspective library, distributed under the terms of
 * the Apache License 2.0.  The full license can be found in the LICENSE file.
 *
 */

import {bindTemplate} from "@jpmorganchase/perspective-viewer/cjs/js/utils";
import {getStyle, getThemeStyles} from "../style/theme";
import style from "../../less/plugin.less";
import {name} from "../../../package.json";

import "./polyfills";

const template = `<template id="${name}"><div id="container"></div></template>`;

@bindTemplate(template, style) // eslint-disable-next-line no-unused-vars
class TemplateElement extends HTMLElement {
    connectedCallback() {
        this._container = this.shadowRoot.querySelector("#container");
        this.themes = [];
    }

    render(view, settings) {
        this._container.innerHTML = "";
        this.importThemeStyle();
        view(this._container, settings);
    }

    importThemeStyle() {
        const themeName = getStyle(this._container, "--aggrid-theme");
        if (themeName && !this.themes.includes(themeName)) {
            getThemeStyles(themeName).then(themeStyles => {
                if (themeStyles) {
                    const style = document.createElement("style");
                    style.innerHTML = themeStyles;
                    this.shadowRoot.appendChild(style);
                }
            });

            this.themes.push(themeName);
        }
    }

    resize() {
        // Called by perspective-viewer when the container is resized
    }
}
