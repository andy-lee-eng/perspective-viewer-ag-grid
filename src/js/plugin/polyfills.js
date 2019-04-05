/******************************************************************************
 *
 * Copyright (c) 2017, the Perspective Authors.
 *
 * This file is part of the Perspective library, distributed under the terms of
 * the Apache License 2.0.  The full license can be found in the LICENSE file.
 *
 */

if (!String.prototype.endsWith) {
    String.prototype.endsWith = function(search, this_len) {
        if (this_len === undefined || this_len > this.length) {
            this_len = this.length;
        }
        return this.substring(this_len - search.length, this_len) === search;
    };
}

if (!window.fetch) {
    window.fetch = url => {
        return new Promise(resolve => {
            const client = new XMLHttpRequest();
            client.open("GET", url);
            client.onload = () => {
                resolve({
                    json: () => JSON.parse(client.responseText),
                    text: () => client.responseText
                });
            };
            client.send();
        });
    };
}
