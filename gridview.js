var Gridview = function (options) {

    // private variables

    // options
    var $containerElement = $('#' + options.gridviewContainerId) || undefined;

    var autoGridTemplate = (options.autoGridTemplate == undefined) ? true : options.autoGridTemplate;
    var autoPagination = (options.autoPagination == undefined) ? true : options.autoPagination;
    var manualPageChange = (options.manualPageChange == undefined) ? true : options.manualPageChange;
    var emptyDataTemplate = options.emptyDataTemplate || 'Empty Data';

    if ($containerElement) {

        $containerElement.on('click', 'ul.pagination li a', function (e) {
            var $this = $(this);
            if (!$this.hasClass('disable')) {
                $containerElement.find('ul.pagination li').removeClass('active');
                $this.closest('li').addClass('active');
                pagination.current_page = parseInt($this.text());
                pagination.from = ((pagination.current_page - 1) * pagination.per_page);
                pagination.to = pagination.from + pagination.per_page;
                send();
            }
        });

        $containerElement.on('keydown', 'ul.pagination .pagination-input', function (e) {
            var $this = $(this);
            if (!$this.hasClass('disable')) {
                if (e.keyCode == 13) {
                    pagination.current_page = parseInt($this.val());
                    pagination.from = ((pagination.current_page - 1) * pagination.per_page);
                    pagination.to = pagination.from + pagination.per_page;
                    send();
                }
            }
        });

        $containerElement.on('click', '.js-sort-ascending', function (e) {
            var $this = $(this);
            var name = $this.closest('th').data('name');
            if (sorts[name] == 'ASC') {
                removeSort(name);
                $this.css('color', 'inherited');
            } else {
                addAscendingSort(name);
                $this.css('color', 'red');
            }
            send();
        });

        $containerElement.on('click', '.js-sort-descending', function (e) {
            var $this = $(this);
            var name = $this.closest('th').data('name');
            if (sorts[name] == 'DESC') {
                removeSort(name);
                $this.css('color', 'inherited');
            } else {
                addDescendingSort(name);
                $this.css('color', 'red');
            }
            send();
        });
    }

    var autoIncrementColumn = options.autoIncrementColumn || true;
    var autoIncrementColumnName = options.autoIncrementColumnName || '#';

    var onload = options.onload || new Function();
    var dataSourceUrl = options.dataSourceUrl;
    var extraData = options.extraData || {};

    var gridviewClassName = 'baby-gridview';

    // variables
    var columns = {};
    var resultRows = [];
    var pagination = {
        total: undefined,
        current_page: 1,
        per_page: 15,
        from: 0,
        to: 14,
    };
    var filters = {};
    var sorts = {};

    // private functions

    var addColumn = function (column) {
        columns[column.name] = column;
        //columns.push(column);
        //addFilter()
    };
    var removeColumn = function (name) {
        delete columns[name];
    };

    var getValue = function (elementId) {
        var $element = $('#' + elementId)

        var value = $element.val();
        if (value && value.constructor !== Array) {
            value = value.trim(value);
        }
        return value;

    };

    // sorting
    var addSort = function (name, type) {
        sorts[name] = type;
    };
    var addAscendingSort = function (name) {
        addSort(name, 'ASC');
    };
    var addDescendingSort = function (name) {
        addSort(name, 'DESC');
    };
    var removeSort = function (name) {
        delete sorts[name];
    };

    // filtering
    var addFilter = function (name, type, operator, oprand1, oprand2) {
        filters[name] = {
            name: name,
            type: type,
            operator: operator,
            oprand1: oprand1,
            oprand2: oprand2,
        };
    };
    var addFilterEqual = function (name, type, oprand1) {
        addFilter(name, type, 'equal', oprand1, undefined)
    };
    var addFilterContain = function (name, type, oprand1) {
        addFilter(name, type, 'contain', oprand1, undefined)
    };
    var addFilterIn = function (name, type, oprand1) {
        addFilter(name, type, 'in', oprand1, undefined)
    };
    var addFilterSmaller = function (name, type, oprand1) {
        addFilter(name, type, 'smaller', oprand1, undefined)
    };
    var addFilterGreater = function (name, type, oprand1) {
        addFilter(name, type, 'greater', oprand1, undefined)
    };
    var addFilterBetween = function (name, type, oprand1, oprand2) {
        addFilter(name, type, 'between', oprand1, oprand2)
    };
    var removeFilter = function (name) {
        delete filters[name];
    };
    var removeAllFilters = function () {
        filters = {};
        return true;
    };

    // Display Grid View

    var createGridView = function () {
        if ($containerElement) {
            $containerElement.html('');
            var html = '<div class="' + gridviewClassName + ' table-responsive">';
            html += createGridviewHeader();
            html += createGridviewTable();
            html += createPagination();
            html += '</div>';
            $containerElement.html(html);
        }
    };
    var createGridviewHeader = function () {
        var html = '<div class="gridview-header"></div>';
        return '';
    };
    var createGridViewTableHeader = function () {

        // string way
        // create table head
        var html = '';
        if (autoIncrementColumn) {
            html += '<th>' + autoIncrementColumnName + '</th>';
        }

        for (var i in columns) {
            var column = columns[i];

            var th = '';
            switch (column.type) {
                case 'hidden':
                    th = '<th class="gridview-column-header-' + column.name + '" style="display: none">' + column.caption;
                    break;
                case 'string':
                case 'number':
                    th = '<th data-name="' + column.name + '" class="gridview-column-header-' + column.name + '">' + column.caption;
                    break;
            }

            if (column.sort) {
                if (sorts[column.name] == 'ASC') {
                    th += '<i title="صعودی" style="cursor: pointer;color: red;" class="mdi mdi-sort-ascending pull-left js-sort-ascending"></i><i title="نزولی" style="cursor: pointer" class="mdi mdi-sort-descending pull-left js-sort-descending"></i></th>'
                }
                else if (sorts[column.name] == 'DESC') {
                    th += '<i title="صعودی" style="cursor: pointer" class="mdi mdi-sort-ascending pull-left js-sort-ascending"></i><i title="نزولی" style="cursor: pointer;color: red;" class="mdi mdi-sort-descending pull-left js-sort-descending"></i></th>'
                } else {
                    th += '<i title="صعودی" style="cursor: pointer" class="mdi mdi-sort-ascending pull-left js-sort-ascending"></i><i title="نزولی" style="cursor: pointer" class="mdi mdi-sort-descending pull-left js-sort-descending"></i></th>'
                }
            } else {
                th += '</th>'
            }

            html += th
        }

        html = '<thead><tr>' + html + '</tr></thead>';
        return html;

        // Object Way
        var $thead = $('<head>');
        var $tr = $('<tr>');
        if (autoIncrementColumn) {
            $tr.append('<th>' + autoIncrementColumnName + '</th>')
        }

        for (var i in columns) {
            var column = columns[i];

            var $th = $('<th class="gridview-column-header-' + column.name + '">' + column.caption + '</th>');
            switch (column.type) {
                case 'hidden':
                    $th.css('display', 'none');
                    break;
                case 'string':
                case 'number':
                    break;
            }

            if (column.sort) {
                var $ascending = $('<i class="mdi mdi-sort-ascending pull-left js-sort-ascending"></i>')
                var $descending = $('<i class="mdi mdi-sort-descending pull-left js-sort-descending"></i>')
                $th.append($ascending);
                $th.append($descending);
            }


            $tr.append($th);
        }
        $thead.append($th)
        return $thead;
    };
    var createGridviewTable = function () {
        if (autoGridTemplate) {
            var tableHtml = '<table class="table table-striped">';
            tableHtml += createGridViewTableHeader();

            // create table body
            tableHtml += '<tbody>';
            // empty result
            if (resultRows.length <= 0) {
                var columnsLength = Object.keys(columns).length;
                if (autoIncrementColumn) {
                    columnsLength = columnsLength + 1;
                }
                tableHtml += '<tr><td colspan="' + columnsLength + '">' + emptyDataTemplate + '</td></tr>';
            } else {
                var autoIncrementNumber = (pagination.current_page - 1) * pagination.per_page;
                for (var index in resultRows) {
                    var row = resultRows[index];
                    autoIncrementNumber = autoIncrementNumber + 1;
                    row.autoIncrementNumber = autoIncrementNumber;

                    tableHtml += createGridViewTableRow(row);
                }
            }
            tableHtml += '</tbody>';
            tableHtml += '</table>';
            return tableHtml;
        }
    };
    var createGridViewTableRow = function (row) {
        var tr = '<tr>';
        if (autoIncrementColumn) {
            tr += '<td>' + row.autoIncrementNumber + '</td>';
        }
        for (var i in columns) {

            var column = columns[i];
            var td = '';
            if (column.render) {
                td = '<td class="gridview-column-' + column.name + '">' + column.render(row[column.name], row) + '</td>';
            } else {
                switch (column.type) {
                    case 'hidden':
                        td = '<td class="gridview-column-' + column.name + '" style="display: none">' + row[column.name] + '</td>';
                        break;
                    case 'string':
                    case 'number':
                        td = '<td class="gridview-column-' + column.name + '">' + row[column.name] + '</td>';
                        break;
                }
            }
            tr += td;
        }
        tr += '</tr>';
        return tr;
    };
    var createPagination = function () {
        if (autoPagination) {

            var pageCount = Math.ceil(pagination.total / pagination.per_page);

            var paginationLinkCount = 7;

            var startPaginationNumber = pagination.current_page - 3;

            if (startPaginationNumber <= 0) {
                startPaginationNumber = 1;
            } else if ((pageCount - pagination.current_page) < 3) {
                startPaginationNumber = pagination.current_page - (paginationLinkCount - (pageCount - pagination.current_page) - 1);
            }
            var paginationHtml = '<ul class="pagination">';

            paginationHtml += '<li><a href="javascript:void(0)" class="previous disable">«</a></li>';

            for (var i = 1; i <= paginationLinkCount; i++) {
                if (i > pageCount) {
                    break;
                }
                if (pagination.current_page == startPaginationNumber) {
                    paginationHtml += '<li class="active"><a href="javascript:void(0)" class="disable">' + startPaginationNumber + '</a></li>';
                } else {
                    paginationHtml += '<li><a href="javascript:void(0)">' + startPaginationNumber + '</a></li>';
                }
                startPaginationNumber++;
            }

            paginationHtml += '<li><a href="javascript:void(0)" class="next disable">»</a></li>';
            paginationHtml += '<li><span>Page Count: ' + pageCount + '</span></li>';
            if (manualPageChange) {
                paginationHtml += '<li><input class="pagination-input" type="number" placeholder="Page Number"></li>';
            }
            paginationHtml += '</ul>';

            return paginationHtml;

        } else {
            return "";
        }
    };

    // request

    var send = function () {
        var params = extraData;
        for (var index in columns) {
            var column = columns[index];
            if (column.filter != undefined) {
                if (column.filter.operator == 'between') {
                    var oprand1Value = getValue(column.filter.oprand1.elementId);
                    var oprand2Value = getValue(column.filter.oprand2.elementId);

                    if (oprand1Value && !oprand2Value && oprand1Value != column.filter.oprand1.ignoreValue) {
                        addFilterSmaller(column.name, column.type, oprand1Value)
                    }
                    else if (!oprand1Value && oprand2Value && oprand2Value != column.filter.oprand2.ignoreValue) {
                        addFilterGreater(column.name, column.type, oprand2Value)
                    } else if ((oprand1Value && oprand1Value != column.filter.oprand1.ignoreValue) && (oprand2Value && oprand2Value != column.filter.oprand2.ignoreValue)) {
                        addFilterBetween(column.name, column.type, oprand1Value, oprand2Value)
                    } else {
                        removeFilter(column.name);
                    }
                } else {
                    var oprand1Value = getValue(column.filter.oprand1.elementId);
                    if (oprand1Value && oprand1Value != column.filter.oprand1.ignoreValue) {
                        addFilter(column.name, column.type, column.filter.operator, oprand1Value, undefined)
                    } else {
                        removeFilter(column.name)
                    }
                }
            }
        }

        params['req'] = JSON.stringify({
            filters: filters,
            sorts: sorts,
            pagination: pagination,
        });

        $.post(dataSourceUrl, params, function (result) {
            resultRows = result.data;
            pagination = result.pagination;
            createGridView();
            onload(resultRows);
        });
    };

    // public function
    this.addColumn = addColumn;
    this.removeColumn = removeColumn;
    this.addAscendingSort = addAscendingSort;
    this.addDescendingSort = addDescendingSort;
    this.removeSort = removeSort;
    this.addFilterEqual = addFilterEqual;
    this.addFilterContain = addFilterContain;
    this.addFilterIn = addFilterIn;
    this.addFilterSmaller = addFilterSmaller;
    this.addFilterGreater = addFilterGreater;
    this.addFilterBetween = addFilterBetween;
    this.removeFilter = removeFilter;
    this.removeAllFilters = removeAllFilters;
    this.send = send;
};