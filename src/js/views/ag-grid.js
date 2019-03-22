/******************************************************************************
 *
 * Copyright (c) 2017, the Perspective Authors.
 *
 * This file is part of the Perspective library, distributed under the terms of
 * the Apache License 2.0.  The full license can be found in the LICENSE file.
 *
 */

import {Grid} from "ag-grid-community";

const collapsedRows = [];
const isCollapsed = title => collapsedRows.some(r => title.join("|") === r.join("|"));
const isHidden = title => collapsedRows.some(r => title.length > r.length && title.slice(0, r.length).join("|") === r.join("|"));

function agGrid(container, settings) {
    // let the grid know which columns and what data to use
    const gridOptions = {
        suppressDragLeaveHidesColumns: true,
        suppressMakeColumnVisibleAfterUnGroup: true
    };

    // specify the columns
    const colSplits = [];

    // Work out what the columns are from the data
    if (settings.data.length > 0) {
        Object.keys(settings.data[0])
            .filter(key => key !== "__ROW_PATH__")
            .forEach(c => {
                const split = c.split("|");
                if (!settings.hidden.includes(split[split.length - 1])) {
                    if (!colSplits.includes(c)) {
                        colSplits.push(c);
                    }
                }
            });
    }

    const filtered = {
        data: null
    };

    const onSetData = () => {
        filtered.data = settings.data.filter(r => !isHidden(r.__ROW_PATH__));
        gridOptions.api.setRowData(filtered.data);
    };

    gridOptions.columnDefs = getRowHeaders(settings.row_pivots, filtered, onSetData).concat(getColumnHeaders(colSplits, settings.schema));

    // create the grid passing in the div to use together with the columns & data we want to use
    const style = getComputedStyle(container, "::after");
    container.className = style.content == `"dark"` ? "ag-theme-balham-dark" : "ag-theme-balham";
    new Grid(container, gridOptions);

    onSetData();
}

const getRowHeaders = (rowTitles, filtered, onToggle) => {
    return [
        {
            headerName: "",
            field: "__ROW_PATH__",
            cellClass: "row-title-cell",
            cellRenderer: ({eGridCell, value, rowIndex}) => {
                const span = (className, value = "&nbsp;") => `<span class="row-title ${className}">${value}</span>`;
                const sanitize = str => {
                    eGridCell.textContent = str;
                    const encoded = eGridCell.innerHTML;
                    eGridCell.textContent = "";
                    return encoded;
                };

                if (value.length) {
                    return ["", ""]
                        .concat(value)
                        .map((v, i) => {
                            const offset = value.length + 1 - i;
                            switch (offset) {
                                case 0:
                                    return span("name", sanitize(v));
                                case 1:
                                    if (value.length < rowTitles.length) {
                                        return isCollapsed(value) ? span("parent-node collapsed") : span("parent-node");
                                    } else {
                                        return span("node");
                                    }
                                default: {
                                    if (offset === 2 && (rowIndex >= filtered.data.length - 1 || filtered.data[rowIndex + 1].__ROW_PATH__.length < value.length)) {
                                        return span("branch last");
                                    }

                                    return span("branch");
                                }
                            }
                        })
                        .join("");
                }
                eGridCell.innerHTML = `${span("total-node")}${span("name", "TOTAL")}`;
            },
            onCellClicked: ({value}) => {
                if (value.length === 0) return;

                const index = collapsedRows.findIndex(r => value.join("|") == r.join("|"));
                if (index !== -1) {
                    collapsedRows.splice(index, 1);
                } else {
                    collapsedRows.push(value);
                }
                onToggle();
            }
        }
    ];
};

const getColumnHeaders = (columns, schema) => {
    const headers = {children: []};

    const findOrAddColumn = (parent, split) => {
        const childName = split[0];
        const rest = split.slice(1);
        let child = parent.children.find(c => c.headerName == childName);
        if (!child) {
            child = {
                headerName: childName,
                children: rest.length ? [] : undefined,
                width: 100,
                valueFormatter: ({value}) => {
                    if (value) {
                        switch (schema[childName]) {
                            case "float":
                            case "integer":
                                return value.toLocaleString(undefined, {style: "decimal"});
                        }
                    }
                    return value;
                },
                cellClass: ({value}) => (value < 0 ? "grid-negative" : "grid-positive")
            };
            parent.children.push(child);
        }

        if (rest.length) {
            return findOrAddColumn(child, rest);
        }
        return child;
    };

    columns.forEach(col => {
        const split = col.split("|");
        const column = findOrAddColumn(headers, split);
        column.field = col;
    });

    return headers.children;
};

agGrid.plugin = {
    type: "ag_grid",
    name: "AgGrid",
    max_size: 25000,
    initial: {}
};
export default agGrid;
