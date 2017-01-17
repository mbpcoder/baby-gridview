var Gridview = function (element, options) {

    var dataSourceUrl = options.dataSourceUrl;
    var extraData = options.extraData;

    var filters = [];

    var $containerElement = $(element) || undefined;
    this.send = function (callback) {
        var params = extraData;
        params['req'] = JSON.stringify({
            filters: filters
        });

        $.post(dataSourceUrl, params, function (data) {
            callback(data)
        });
    };

    this.addFilter = function (name, type, operator, oprand1, oprand2) {
        filters.push({
            name: name,
            type: type,
            operator: operator,
            oprand1: oprand1,
            oprand2: oprand2,
        });
    };
};