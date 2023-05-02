app.controller("checkoutCtrl", function ($scope, $routeParams, $location, $http, $window) {

    $scope.isLoading = false;
    $scope.invoiceDetail = null;
    $scope.peopleInRoom = null;
    $scope.usedServices = [];
    $scope.hostedAts = [];

    $scope.init = async function () {
        $scope.isLoading = true;
        await $scope.loadInvoiceDetail();
        if ($scope.invoiceDetail) {
            await $scope.loadPeopleInRoom();
            await $scope.loadUsedServices();
        }
    }

    $scope.loadInvoiceDetail = async function () {
        await $http.get("http://localhost:8000/api/invoice-details/using-room/" + $routeParams.roomCode).then(function (resp) {
            $scope.invoiceDetail = resp.data;
            console.log("invoiceDetail", $scope.invoiceDetail);
        }, function () {
            alert("Có lỗi xảy ra vui lòng thử lại!");
            $location.path("/hotel-room");
        });
    }

    $scope.loadPeopleInRoom = async function () {
        await $http.get("http://localhost:8000/api/hotel/people-in-room/" + $scope.invoiceDetail.id).then(function (resp) {
            $scope.peopleInRoom = resp.data;
        });
    }

    $scope.loadUsedServices = async function () {
        await $http.get("http://localhost:8000/api/used-services?invoiceDetailId=" + $scope.invoiceDetail.id + "&status=true").then(function (resp) {
            $scope.usedServices = resp.data;
            $scope.isLoading = false;
        });
    }

    $scope.loadHostedAts = async function () {
        await $http.get("http://localhost:8000/api/hosted-ats/invoice-detail/" + $scope.invoiceDetail.id).then(function (resp) {
            $scope.hostedAts = resp.data;
        });
    }

    $scope.initTableHostedAt = function () {
        $(document).ready(async function () {
            tableHostedAt = $('#datatable-hosted-at').DataTable({
                language: {
                    url: '//cdn.datatables.net/plug-ins/1.13.4/i18n/vi.json',
                },
                dom: 't<"row"<"col-sm-12 col-md-5"i><"col-sm-12 col-md-7"p>>'
            });
        });

        $('#search-datatable-hosted-at').keyup(function () {
            tableHostedAt.search($(this).val()).draw();
        });
    }

    $scope.clearTableHostedAt = function () {
        $(document).ready(function () {
            tableHostedAt.clear();
            tableHostedAt.destroy();
        });
    }

    $scope.getTotalService = function (usedService) {
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        const startedTime = new Date(usedService.startedTime);
        startedTime.setHours(0, 0, 0, 0);
        const endedTime = new Date(usedService.endedTime);
        endedTime.setHours(0, 0, 0, 0);
        var days;
        if (now.getTime() === startedTime.getTime()) {
            days = 0;
        } else if (now.getTime() > endedTime.getTime()) {
            days = (endedTime.getTime() - startedTime.getTime()) / (1000 * 3600 * 24);
        } else {
            days = (now.getTime() - startedTime.getTime()) / (1000 * 3600 * 24);
        }
        return usedService.servicePrice * days;
    }

    $scope.totalUsedService = function () {
        if (!$scope.usedServices) {
            return 0;
        }
        return $scope.usedServices.reduce((total, usedService) => total + $scope.getTotalService(usedService), 0);
    }

    $scope.getDate = function () {
        if (!$scope.invoiceDetail) {
            return 0;
        }
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        const checkinExpected = new Date($scope.invoiceDetail.checkinExpected);
        checkinExpected.setHours(0, 0, 0, 0);
        const checkoutExpected = new Date($scope.invoiceDetail.checkoutExpected);
        checkoutExpected.setHours(0, 0, 0, 0);
        if (now.getTime() === checkinExpected.getTime()) {
            return 1;
        } else if (now.getTime() > checkoutExpected.getTime()) {
            return (checkoutExpected.getTime() - checkinExpected.getTime()) / (1000 * 3600 * 24);
        } else {
            return (now.getTime() - checkinExpected.getTime()) / (1000 * 3600 * 24);
        }
    }

    $scope.totalRoom = function () {
        if (!$scope.invoiceDetail) {
            return 0;
        }
        return $scope.invoiceDetail.roomPrice * $scope.getDate();
    }

    $scope.total = function () {
        if (!$scope.usedServices || !$scope.invoiceDetail || !$scope.peopleInRoom) {
            return 0;
        }
        return $scope.totalUsedService() +
            $scope.totalRoom() +
            $scope.peopleInRoom.adultSurcharge +
            $scope.peopleInRoom.childSurcharge +
            $scope.invoiceDetail.ortherSurcharge +
            $scope.invoiceDetail.earlyCheckinFee +
            $scope.invoiceDetail.lateCheckoutFee;
    }

    $scope.modalSurchargeRoom = async function (action) {
        $('#modal-surcharge-room').modal(action);
    }

    $scope.modalHostedAt = async function (action) {
        if (action == 'show') {
            await $scope.loadHostedAts();
            await $scope.initTableHostedAt();
        } else {
            $scope.clearTableHostedAt();
            $scope.hostedAts = [];
        }
        await $('#modal-hosted-at').modal(action);
        setTimeout(function () {
            $('#search-datatable-hosted-at').focus()
        }, 1000);
    }

    $scope.handlerUpdateRoom = function () {
        if ($scope.invoiceDetailUpdate.note === "") {
            alert("Vui lòng nhập ghi chú!");
            $('#note').focus()
            return;
        }
        if (!confirm("Bạn muốn cập nhật phòng " + $scope.invoiceDetail.room.code + "?")) {
            return;
        }
        $scope.isLoading = true;
        $http.post("http://localhost:8000/api/hotel/update-invoice-detail", $scope.invoiceDetailUpdate).then(function (resp) {
            alert("Cập nhật thành công!");
            $scope.isLoading = false;
            $window.location.reload();
        }, function (resp) {
            $scope.isLoading = false;
            alert(resp.data.error);
        });
    }

    $scope.handlerCheckout = function () {
        if (!confirm("Bạn muốn trả phòng " + $routeParams.roomCode + "?")) {
            return;
        }
        $scope.isLoading = true;
        $http.post("http://localhost:8000/api/hotel/checkout", {
            code: $routeParams.roomCode,
            lateCheckoutFee: $scope.invoiceDetail.lateCheckoutFee
        }).then(function (resp) {
            $scope.isLoading = false;
            alert("Trả phòng thành công!");
            $location.path("/invoices/" + $scope.invoiceDetail.invoice.code);
        }, function (resp) {
            $scope.isLoading = false;
            alert(resp.data.error);
        });
    }

    $scope.init();
});