var Gridview = function (options) {

    // private variables

    // options
    var $containerElement = $('#' + options.gridviewContainerId) || undefined;
    var $paginationContainerElement = $('#' + options.paginationContainerId) || undefined;

    if ($paginationContainerElement) {
        $paginationContainerElement.on('click', 'a', function (e) {
            var $this = $(this);
            $paginationContainerElement.closest('li').removeClass('active');
            $this.closest('li').addClass('active');
            pagination.current_page = parseInt($this.text());
            pagination.from = ((pagination.current_page - 1) * pagination.per_page) + 1
            pagination.to = pagination.from + pagination.per_page;
            send();
        });
    }
    var autoIncrementColumn = options.autoIncrementColumn || true;
    var autoIncrementColumnName = options.autoIncrementColumnName || '#';

    var onload = options.onload || new Function();
    var dataSourceUrl = options.dataSourceUrl;
    var extraData = options.extraData || {};

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
    var getValue = function (element) {

        return $('#' + element).val();
        //switch (element.type) {
        //
        //}
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
    var createPagination = function () {
        if ($paginationContainerElement) {
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

            $paginationContainerElement.html(paginationHtml)
        }
    };
    var createGridviewTable = function () {
        if ($containerElement) {
            $containerElement.html('');
            var $tableBody = $('<tbody>');
            var $table = $('<table class="table table-striped">');

            // create table head
            var tr = '';
            if (autoIncrementColumn) {
                tr += '<th>' + autoIncrementColumnName + '</th>';
            }

            for (var i in columns) {
                var column = columns[i];

                var th = '';
                switch (column.type) {
                    case 'hidden':
                        th = '<th style="display: none">' + column.caption + '</th>';
                        break;
                    case 'string':
                    case 'number':
                        th = '<th>' + column.caption + '</th>';
                        break;
                }
                tr += th
            }
            $table.append('<thead><tr>' + tr + '</tr></thead>');

            // create table body
            var row_number = (pagination.current_page - 1) * pagination.per_page;
            for (var index in resultRows) {
                var row = resultRows[index];
                var tr = '<tr>';

                if (autoIncrementColumn) {
                    row_number = row_number + 1
                    tr += '<td>' + row_number + '</td>';
                }

                for (var i in columns) {
                    var column = columns[i];
                    var td = '';
                    if (column.render) {
                        td = '<td>' + column.render(row[column.name], row) + '</td>';
                    } else {
                        switch (column.type) {
                            case 'hidden':
                                td = '<td style="display: none">' + row[column.name] + '</td>';
                                break;
                            case 'string':
                            case 'number':
                                td = '<td>' + row[column.name] + '</td>';
                                break;
                        }
                    }
                    tr += td;
                }
                tr += '</tr>';
                $tableBody.append(tr);
            }


            $table.append($tableBody);

            $containerElement.append($table);
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
            for (var i = 0; i < resultRows.length; i++) {
                resultRows[i].row_number = pagination.from + i
            }
            createGridviewTable();
            createPagination();
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