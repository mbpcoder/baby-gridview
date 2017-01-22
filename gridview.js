var Gridview = function (element, options) {

    // private variables

    // options
    var $containerElement = $(element) || undefined;
    var $paginationContainerElement = $(options.paginationContainerElement) || undefined;

    $paginationContainerElement.on('click', 'a', function (e) {
        var $this = $(this);
        $paginationContainerElement.closest('li').removeClass('active');
        $this.closest('li').addClass('active');
        pagination.curent_page = parseInt($this.text());
        pagination.from = ((pagination.curent_page - 1) * pagination.per_page) + 1
        pagination.to = pagination.from + pagination.per_page;

        send();
    });

    var onload = options.onload || new Function();
    var dataSourceUrl = options.dataSourceUrl;
    var extraData = options.extraData || {};

    // variables
    var resultRows = [];
    var pagination = {
        total: undefined,
        current_page: 1,
        per_page: 15,
        from: 1,
        to: 15,
    };
    var filters = [];
    var sorts = [];

    // private functions

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

    // pagination
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


    // request
    var send = function () {
        var params = extraData;
        params['req'] = JSON.stringify({
            filters: filters,
            sorts: sorts,
            pagination: pagination,
        });

        $.post(dataSourceUrl, params, function (result) {
            resultRows = result.data;
            pagination = result.pagination;
            console.log(pagination)
            for (var i = 0; i < resultRows.length; i++) {
                resultRows[i].row_number = pagination.from + i
            }
            createPagination();
            onload(resultRows);
        });
    };


    // public function
    this.addAscendingSort = addAscendingSort;
    this.addDescendingSort = addDescendingSort;
    this.addFilterEqual = addFilterEqual;
    this.addFilterContain = addFilterContain;
    this.removeFilter = removeFilter;
    this.removeAllFilters = removeAllFilters;
    this.send = send;
};