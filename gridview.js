var Gridview = function (element, options) {

    // private variables

    // options
    var $containerElement = $(element) || undefined;
    var onload = options.onload || new Function();
    var dataSourceUrl = options.dataSourceUrl;
    var extraData = options.extraData;

    // variables
    var resultRows = [];
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


    // request
    var send = function () {
        var params = extraData;
        params['req'] = JSON.stringify({
            filters: filters,
            sorts: sorts,
        });

        $.post(dataSourceUrl, params, function (data) {
            resultRows = data;
            onload(resultRows);
        });
    };


    // public function
    this.addAscendingSort = addAscendingSort;
    this.addDescendingSort = addDescendingSort;
    this.addFilter = addFilter;
    this.removeFilter = removeFilter;
    this.removeAllFilters = removeAllFilters;
    this.send = send;
};