var Gridview = function (options) {

    // private variables

    // options
    var $containerElement = $('#' + options.gridviewContainerId) || undefined;

    var autoGridTemplate = options.autoGridTemplate || true;
    var autoPagination = options.autoPagination || true;

    if ($containerElement) {
        $containerElement.on('click', 'ul.pagination li a', function (e) {
            var $this = $(this);
            $containerElement.find('ul.pagination li').removeClass('active');
            $this.closest('li').addClass('active');
            pagination.current_page = parseInt($this.text());
            pagination.from = ((pagination.current_page - 1) * pagination.per_page);
            pagination.to = pagination.from + pagination.per_page;
            send();
        });

        $containerElement.on('click', '.js-sort', function (e) {
            var $this = $(this);
            $this.removeClass('js-sort').addClass('js-sort-ascending');
            $this.removeClass('mdi-sort').addClass('mdi-sort-ascending');

            addAscendingSort(name);
            //send();
        });

        $containerElement.on('click', '.js-sort-ascending', function (e) {
            var $this = $(this);
            console.log(this)
            $this.removeClass('js-sort-ascending').addClass('js-sort-descending');
            $this.removeClass('mdi-sort-ascending').addClass('mdi-sort-descending');
        });

        $containerElement.on('click', '.js-sort-descending', function (e) {
            var $this = $(this);
            console.log(this)
            $this.removeClass('js-sort-descending').addClass('js-sort');
            $this.removeClass('mdi-sort-descending').addClass('mdi-sort');
        });
    }

    var autoIncrementColumn = options.autoIncrementColumn || true;
    var autoIncrementColumnName = options.autoIncrementColumnName || '#';

    var onload = options.onload || new Function();
    var dataSourceUrl = options.dataSourceUrl;
    var extraData = options.extraData || {};

    var gridviewClassName = 'anonymous-gridview';

    // variables
    var columns = [];
    var resultRows = [];
    var pagination = {
        total: undefined,
        current_page: 1,
        per_page: 15,
        from: 0,
        to: 14,
    };
    var filters = [];
    var sorts = [];

    // private functions

    var addColumn = function (column) {
        columns.push(column);
    };
    var getValue = function (elementId) {
        var value = $('#' + elementId).val();
        if (value) {
            value = value.trim(value);
        }
        return value;

    };

    // sorting
    var addSort = function (name, type) {
        sorts.push({
            name: name,
            type: type,
        });
    };
    var addAscendingSort = function (name) {
        addSort(name, 'ACS');
    };
    var addDescendingSort = function (name) {
        addSort(name, 'DESC');
    };

    // filtering
    var addFilter = function (name, type, operator, oprand1, oprand2) {
        filters.push({
            name: name,
            type: type,
            operator: operator,
            oprand1: oprand1,
            oprand2: oprand2,
        });
    };
    var addFilterEqual = function (name, type, oprand1) {
        addFilter(name, type, 'equal', oprand1, undefined)
    };
    var addFilterContain = function (name, type, oprand1) {
        addFilter(name, type, 'contain', oprand1, undefined)
    };
    var removeFilter = function (name) {
        var result = false;
        for (var index = 0; index > filters.length; index++) {
            var filter = filters[index];
            if (name == filter.name) {
                filters.splice(index);
                result = true;
            }
        }
        return result;
    };
    var removeAllFilters = function () {
        filters = [];
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
                    th = '<th class="gridview-column-header-' + column.name + '">' + column.caption;
                    break;
            }

            if (column.sort) {
                th += '<i class="mdi mdi-sort pull-left js-sort"></i></th>'
            } else {
                th += '</th>'
            }


            html += th
        }

        html = '<thead><tr>' + html + '</tr></thead>';
        return html;
    };
    var createGridviewTable = function () {
        if (autoGridTemplate) {
            var tableHtml = '<table class="table table-striped">';
            tableHtml += createGridViewTableHeader();

            // create table body
            tableHtml += '<tbody>';
            var autoIncrementNumber = (pagination.current_page - 1) * pagination.per_page;
            for (var index in resultRows) {
                var row = resultRows[index];
                autoIncrementNumber = autoIncrementNumber + 1;
                row.autoIncrementNumber = autoIncrementNumber;

                tableHtml += createGridViewTableRow(row);
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
            var pageCount = pagination.total / pagination.per_page
            if ((pagination.total % pagination.per_page) > 0) {
                pageCount++;
            }

            var paginationHtml = '<ul class="pagination">';
            for (var i = 1; i <= pageCount; i++) {
                if (pagination.current_page == i) {
                    paginationHtml += '<li class="active"><a href="javascript:void(0)">' + i + '</a></li>';
                } else {
                    paginationHtml += '<li><a href="javascript:void(0)">' + i + '</a></li>';
                }
            }
            paginationHtml += '</ul>';

            return paginationHtml;

        }
    };

    // request
    var send = function () {
        var params = extraData;

        filters = [];

        for (var index in columns) {
            var column = columns[index];

            if (column.filter != undefined) {
                var oprand1Value = getValue(column.filter.oprand1.elementId);
                if (oprand1Value && oprand1Value != column.filter.oprand1.ignoreValue) {
                    addFilter(column.name, column.type, column.filter.operator, oprand1Value, undefined)
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
    this.addAscendingSort = addAscendingSort;
    this.addDescendingSort = addDescendingSort;
    this.addFilterEqual = addFilterEqual;
    this.addFilterContain = addFilterContain;
    this.removeFilter = removeFilter;
    this.removeAllFilters = removeAllFilters;
    this.send = send;
};