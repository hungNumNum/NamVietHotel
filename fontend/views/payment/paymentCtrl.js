app.controller("paymentCreateCtrl", function ($scope, $http) {
    $scope.form = {};
    //Create 
    $scope.create = function () {
        var payment = angular.copy($scope.form);
        $http.post("http://localhost:8000/api/payment-methods", payment).then(resp => {
            alert("Them thanh cong")
        }).catch(error => {
            alert("Them that bai")
            console.log("Error", error);
        })
    }

    //Reset form
    $scope.reset = function () {
        $scope.form = {
            code: "",
            name: "",
            description: "",
            status: 0
        };
    };

});
//update
app.controller("paymentUpdateCtrl", function ($scope, $routeParams, $http) {
    $scope.form = {};
    //Load 1 payment lên form
    $scope.edit = function () {
        $http.get("http://localhost:8000/api/payment-methods/" + $routeParams.id).then(resp => {
            $scope.form = resp.data;
        }).catch(error => {
            alert("Error load form update")
            console.log("Error", error);
        })

    }

    //Update 
    $scope.update = function () {
        var payment = angular.copy($scope.form);
        $http.put("http://localhost:8000/api/payment-methods", payment).then(resp => {
            alert("Update thanh cong")
        }).catch(error => {
            alert("Update khong thanh cong")
            console.log("Error", error);
        })
    }

    //Reset form
    $scope.reset = function () {
        $scope.form = {
            code: "",
            name: "",
            description: "",
            status: 0
        };
    };
    $scope.edit();

});

//List
app.controller("paymentListCtrl", function ($scope, $sce, $http) {
    $scope.payments = [];
    $scope.view = function () {
        $http.get("http://localhost:8000/api/payment-methods").then(resp => {
            $scope.payments = resp.data;
        });
    }

    $scope.view();
});
