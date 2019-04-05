/******************************************************************************
 *
 * Copyright (c) 2017, the Perspective Authors.
 *
 * This file is part of the Perspective library, distributed under the terms of
 * the Apache License 2.0.  The full license can be found in the LICENSE file.
 *
 */

export const getStyle = (container, name) => {
    if (window.ShadyCSS) {
        return window.ShadyCSS.getComputedStyleValue(container, name);
    } else {
        const containerStyles = getComputedStyle(container);
        return containerStyles.getPropertyValue(name);
    }
};

export function getThemeStyles(cssClass) {
    const headerLinks = document.querySelector("head").querySelectorAll("link[rel=stylesheet]");
    const links = [];
    for (let n = 0; n < headerLinks.length; n++) {
        if (headerLinks[n].href && headerLinks[n].href.endsWith(".css")) {
            links.push(headerLinks[n].href);
        }
    }

    const linkPromises = links.map(link => fetch(link).then(response => response.text().then(content => (content.indexOf(cssClass) !== -1 ? content : ""))));
    return Promise.all(linkPromises).then(themeStyles => (themeStyles.length ? themeStyles.join("") : null));
}
