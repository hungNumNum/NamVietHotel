app.controller("settingCtrl", function ($scope, $http) {

    $scope.setting = {};
    $scope.surcharge = {};
    $scope.earlyCheckinSurcharges = [];
    $scope.lateCheckoutSurcharges = [];
    $scope.paymentMethods = [];

    $scope.init = async function () {
        $scope.isLoading = true;
        await $scope.loadSetting();
        await $scope.loadPaymentMethod();
        $scope.initTableServiceRoom();
        // $scope.loadEarlyCheckinSurcharge();
        // $scope.loadLateCheckoutSurcharge();
    }

    $scope.initTableServiceRoom = function () {
        $(document).ready(function () {
            tablePaymentMethod = $('#datatable-payment-method').DataTable({
                language: {
                    url: '//cdn.datatables.net/plug-ins/1.13.4/i18n/vi.json',
                },
                dom: 't<"row"<"col-sm-12 col-md-5"i><"col-sm-12 col-md-7"p>>',
                columnDefs: [
                    {
                        targets: 4,
                        orderable: false
                    }
                ]
            });
            $('#search-datatable-payment-method').keyup(function(){
                tablePaymentMethod.search($(this).val()).draw() ;
            });
        });
    }

    $scope.loadSetting = async function () {
        await $http.get("http://localhost:8000/api/settings").then(function (resp) {
            $scope.setting = resp.data;
            $scope.setting.checkinTime = new Date($scope.setting.checkinTime);
            $scope.setting.checkoutTime = new Date($scope.setting.checkoutTime);
        });
    }

    $scope.loadPaymentMethod = async function () {
        await $http.get("http://localhost:8000/api/payment-methods").then(function (resp) {
            $scope.paymentMethods = resp.data;
            $scope.isLoading = false;
        });
    }

    $scope.loadEarlyCheckinSurcharge = function () {
        $http.get("http://localhost:8000/api/surcharges/early-checkin").then(function (resp) {
            $scope.earlyCheckinSurcharges = resp.data;
        });
    }

    $scope.loadLateCheckoutSurcharge = function () {
        $http.get("http://localhost:8000/api/surcharges/late-checkout").then(function (resp) {
            $scope.lateCheckoutSurcharges = resp.data;
        });
    }

    $scope.handlerUpdateSetting = function () {
        if (!confirm("Bạn muốn cập nhật cấu hình giờ?")) {
            return;
        }
        $http.post("http://localhost:8000/api/settings", $scope.setting).then(function (resp) {
            $scope.setting = resp.data;
            $scope.setting.checkinTime = new Date($scope.setting.checkinTime);
            $scope.setting.checkoutTime = new Date($scope.setting.checkoutTime);
            alert("Cập nhật cấu hình thành công?")
        });
    }

    $scope.init();
});