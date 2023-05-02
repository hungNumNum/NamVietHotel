app.controller("supplyCtrl", function ($scope, $http) {
    $scope.items = [];
    $scope.supTypes = [];
    $scope.initialize = function () {

        $http.get("http://localhost:8000/api/supplies").then(resp => {
            $scope.items = resp.data;
            $(document).ready(function () {
                // khởi tạo table id 'datatable-invoice-detail-history'
                tableInvoiceDetailHistory = $('#data-table-supply').DataTable({
                    language: {
                        url: '//cdn.datatables.net/plug-ins/1.13.4/i18n/vi.json',
                    },
                    dom: 't<"row"<"col-sm-12 col-md-5"i><"col-sm-12 col-md-7"p>>'
                });
                // gắn ô tìm kiếm id 'search-datatable-invoice-detail-history' cho table
                $('#search-datatable-supply').keyup(function () {
                    tableInvoiceDetailHistory.search($(this).val()).draw();
                });
            });
        })

    }
    $scope.initialize();
});
app.controller("supplyCreateCtrl", function ($scope, $http) {
    $scope.form = {};
    $scope.supTypes = [];
    $scope.initialize = function () {
        $http.get("http://localhost:8000/api/supply-types").then(resp => {
            $scope.supTypes = resp.data;
        })
    }

    //create 
    $scope.create = function () {
        var supply = angular.copy($scope.form);
        console.log(supply);
        $http.post("http://localhost:8000/api/supplies", supply).then(resp => {
            alert("Thêm thành công !")
            //$scope.initialize();
        }).catch(error => {
            alert("Thêm thất bại !")
            console.log("Error", error)
        })

    }
    $scope.initialize();
});
app.controller("supplyUpdateCtrl", function ($scope, $routeParams, $http) {
    $scope.form = {};
    $scope.supTypes = [];
    $scope.initialize = function () {
        $http.get("http://localhost:8000/api/supply-types").then(resp => {
            $scope.supTypes = resp.data;
        })
    }

    //Load 1 supply lên form
    $scope.edit = function () {
        $http.get("http://localhost:8000/api/supplies/" + $routeParams.id).then(resp => {
            $scope.form = resp.data;
        }).catch(error => {
            alert("Error load form update")
            console.log("Error", error);
        })

    }

    //Update 
    $scope.update = function () {
        var supply = angular.copy($scope.form);
        $http.put("http://localhost:8000/api/supplies", supply).then(resp => {
            alert("Update thành công")
        }).catch(error => {
            alert("Update Thất bại")
            console.log("Error", error);
        })
    }

    $scope.initialize();
    $scope.edit();
});

/////////type
app.controller("supply-typeCtrl", function ($scope, $http) {
    $scope.supTypes = [];
    $scope.initialize = function () {
        $http.get("http://localhost:8000/api/supply-types").then(resp => {
            $scope.supTypes = resp.data;
            $(document).ready(function () {
                // khởi tạo table id 'datatable-invoice-detail-history'
                tableInvoiceDetailHistory = $('#data-table-supplyType').DataTable({
                    language: {
                        url: '//cdn.datatables.net/plug-ins/1.13.4/i18n/vi.json',
                    },
                    dom: 't<"row"<"col-sm-12 col-md-5"i><"col-sm-12 col-md-7"p>>'
                });
                // gắn ô tìm kiếm id 'search-datatable-invoice-detail-history' cho table
                $('#search-datatable-supplyType').keyup(function () {
                    tableInvoiceDetailHistory.search($(this).val()).draw();
                });
            });
        })

    }
    $scope.initialize();
});
app.controller("supplyCreate-typeCtrl", function ($scope, $http) {
    $scope.form = {};
    //create 
    $scope.create = function () {
        var supType = angular.copy($scope.form);
        $http.post("http://localhost:8000/api/supply-types", supType).then(resp => {
            alert("Thêm thành công !")
        }).catch(error => {
            alert("Thêm thất bại !")
            console.log("Error", error)
        })

    }
});

app.controller("supplyUpdate-typeCtrl", function ($scope, $routeParams, $http) {
    $scope.form = {};
    //Load 1 supply type lên form
    $scope.edit = function () {
        $http.get("http://localhost:8000/api/supply-types/" + $routeParams.id).then(resp => {
            $scope.form = resp.data;
        }).catch(error => {
            alert("Error load form update")
            console.log("Error", error);
        })

    }

    //Update 
    $scope.update = function () {
        var item = angular.copy($scope.form);
        $http.put("http://localhost:8000/api/supply-types", item).then(resp => {
            alert("Update thành công")
        }).catch(error => {
            alert("Update Thất bại")
            console.log("Error", error);
        })
    }
    $scope.edit();
});



