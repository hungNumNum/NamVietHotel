app.controller("invoiceCtrl", function ($scope, $http, $location, $filter) {

    $scope.statuses = [
        {
            id: 1,
            name: "Đang chờ"
        },
        {
            id: 2,
            name: "Chưa thanh toán"
        },
        {
            id: 3,
            name: "Chờ thanh toán"
        },
        {
            id: 4,
            name: "Hoàn thành"
        }
    ]

    $scope.invoices = [];
    $scope.statusCounts = [];
    $scope.addBookings = [];
    $scope.search = {
        status: null,
        startDate: null,
        endDate: null
    };
    $scope.invoice = {};
    $scope.bookingRoom = {
        roomCodes: []
    };

    $scope.toggleSelection = function (roomCode) {
        var idx = $scope.bookingRoom.roomCodes.indexOf(roomCode);
        if (idx > -1) {
            $scope.bookingRoom.roomCodes.splice(idx, 1);
        } else {
            $scope.bookingRoom.roomCodes.push(roomCode);
        }
    };

    $scope.init = async function () {
        $scope.isLoading = true;
        await $scope.initFilterDate();
        await $scope.loadStatusCount();
        await $scope.loadInvoiceByStatusAndRangeDate();
        await $scope.initTableInvoice();
    }

    $scope.initFilterDate = async function () {
        const today = new Date();
        const nextDay = new Date();
        nextDay.setDate(nextDay.getDate() + 1);
        const monthAgo = new Date();
        monthAgo.setDate(today.getDate() - 7);

        $scope.search.startDate = monthAgo;
        $scope.search.endDate = nextDay;
    }

    $scope.initTableInvoice = async function () {
        $(document).ready(function () {
            tableInvoice = $('#datatable-invoices').DataTable({
                language: {
                    url: '//cdn.datatables.net/plug-ins/1.13.4/i18n/vi.json',
                },
                dom: 't<"row"<"col-sm-12 col-md-5"i><"col-sm-12 col-md-7"p>>',
                columnDefs: [
                    {
                        targets: 9,
                        orderable: false
                    },
                    {
                        type: "num",
                        targets: 0
                    }
                ],
                buttons: [
                    {
                        extend: 'excelHtml5',
                        exportOptions: {
                            columns: [0, 1, 2, 3, 4, 5, 6]
                        }
                    },
                    {
                        extend: 'pdfHtml5',
                        exportOptions: {
                            columns: [0, 1, 2, 3, 4, 5, 6]
                        }
                    },
                    {
                        extend: 'print',
                        exportOptions: {
                            columns: [0, 1, 2, 3, 4, 5, 6]
                        }
                    }
                ],
                dom: '<"row"<"col-sm-12 col-md-6"l><"col-sm-12 col-md-6 d-flex justify-content-end"B>>t<"row"<"col-sm-12 col-md-5"i><"col-sm-12 col-md-7"p>>'
            });

            $('#search-datatable-invoices').keyup(function () {
                tableInvoice.search($(this).val()).draw();
            });
        });
    }

    $scope.clearTableInvoice = function () {
        $(document).ready(function () {
            if (tableInvoice) {
                tableInvoice.clear();
                tableInvoice.destroy();
            }
        });
    }

    $scope.loadInvoice = async function () {
        await $http.get("http://localhost:8000/api/invoices").then(function (resp) {
            $scope.invoices = resp.data;
            $scope.isLoading = false;
        });
    }

    $scope.loadInvoiceByStatus = async function (_status) {
        await $http.get("http://localhost:8000/api/invoices?status=" + _status).then(function (resp) {
            $scope.invoices = resp.data;
            $scope.isLoading = false;
        });
    }

    $scope.loadInvoiceByStatusAndRangeDate = async function () {
        await $http.get("http://localhost:8000/api/invoices", {
            params: {
                status: $scope.search.status,
                startDate: $filter('date')($scope.search.startDate, 'dd-MM-yyyy'),
                endDate: $filter('date')($scope.search.endDate, 'dd-MM-yyyy')
            }
        }).then(function (resp) {
            $scope.invoices = resp.data;
            $scope.isLoading = false;
        });
    }

    $scope.loadStatusCount = async function () {
        await $http.get("http://localhost:8000/api/invoices/status-count").then(function (resp) {
            $scope.statusCounts = resp.data;
        });
    }

    $scope.loadBookingRoom = async function () {
        $scope.bookingRoom.roomCodes = [];
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if ($scope.bookingRoom.checkoutDate == null) {
            alert('Hãy chọn ngày check-out!');
            return;
        } else if ($scope.bookingRoom.checkoutDate <= today) {
            alert('Ngày check-out phải sau ngày hôm nay!');
            return;
        }
        $scope.isLoading = true;
        await $http.get('http://localhost:8000/api/bookings/info', {
            params: {
                checkinDate: $filter('date')(today, 'dd-MM-yyyy'),
                checkoutDate: $filter('date')($scope.bookingRoom.checkoutDate, 'dd-MM-yyyy'),
                roomType: ""
            }
        }).then(function (response) {
            $scope.addBookings = response.data;
            for (var i = 0; i < $scope.addBookings.length; i++) {
                if ($scope.addBookings[i].promotion != null) {
                    var percent = $scope.addBookings[i].promotion.percent;
                    var price = $scope.addBookings[i].price;
                    var maxDiscount = $scope.addBookings[i].promotion.maxDiscount;

                    $scope.addBookings[i].newPrice = price * (100 - percent) / 100;
                    if ((percent / 100 * price) > maxDiscount) {
                        $scope.addBookings[i].newPrice = price - maxDiscount;
                    }
                }
            }
            if ($scope.addBookings.length == 0) {
                alert('Không có phòng hợp lệ.');
            }
            $scope.isLoading = false;
        }).catch(function (error) {
            console.error('Error fetching data:', error);
            $scope.isLoading = false;
        });
    }

    $scope.getColor = function (name, status) {
        return name + (status == 1 ? '-secondary' : (status == 2 ? '-primary' : (status == 3 ? '-warning' : '-success')));
    }

    $scope.checkStatusCount = function (status) {
        const statusCount = $scope.statusCounts.find(item => item.status == status);
        if (statusCount) {
            return statusCount.count;
        }
        return 0;
    }

    $scope.getTotalStatus = function () {
        return $scope.statusCounts.reduce((total, statusCount) => total + statusCount.count, 0);
    }

    $scope.modalBookingRoom = async function (_action, _invoice) {    
        $scope.invoice = _invoice;
        if (_action == 'show') {
            var today = new Date();
            today.setDate(today.getDate() + 1);
            $scope.bookingRoom.checkoutDate = today;
        } else {
            $scope.invoice = {};
            $scope.addBookings = [];
        }
        $('#modal-booking-room').modal(_action);
    }

    $scope.handlerLoadByRangeDate = async function () {
        $scope.isLoading = true;
        await $scope.loadStatusCount();
        await $scope.clearTableInvoice();
        await $scope.loadInvoiceByStatusAndRangeDate();
        await $scope.initTableInvoice();
    }

    $scope.handlerLoadByStatus = async function (_status) {
        $scope.isLoading = true;
        $scope.search.status = _status;
        await $scope.initFilterDate();
        await $scope.loadStatusCount();
        await $scope.clearTableInvoice();
        await $scope.loadInvoiceByStatusAndRangeDate();
        await $scope.initTableInvoice();
    }

    $scope.handlerLoadAll = async function () {
        $scope.isLoading = true;
        $scope.search.status = null;
        await $scope.initFilterDate();
        await $scope.loadStatusCount();
        await $scope.clearTableInvoice();
        await $scope.loadInvoiceByStatusAndRangeDate();
        await $scope.initTableInvoice();
    }

    $scope.handlerBookingRoom = function () {
        console.log("bookingRoom", {
            invoiceCode: $scope.invoice.code,
            checkoutExpected: $filter('date')($scope.bookingRoom.checkoutDate, 'dd-MM-yyyy'),
            roomCodes: $scope.bookingRoom.roomCodes
        });
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if ($scope.bookingRoom.checkoutDate == null) {
            alert('Hãy chọn ngày check-out!');
            return;
        } else if ($scope.bookingRoom.checkoutDate <= today) {
            alert('Ngày check-out phải sau ngày hôm nay!');
            return;
        }
        if ($scope.bookingRoom.roomCodes.length <= 0) {
            alert('Vui lòng chọn phòng muốn thêm vào hoá đơn!');
            return;
        }
        if (!confirm("Bạn muốn đặt thêm phòng " + $scope.bookingRoom.roomCodes.join(', ') + " vào hoá đơn này?")) {
            return;
        }
        $scope.isLoading = true;
        $http.post("http://localhost:8000/api/hotel/booking-room", {
            invoiceCode: $scope.invoice.code,
            checkoutExpected: $filter('date')($scope.bookingRoom.checkoutDate, 'yyyy-MM-dd'),
            roomCodes: $scope.bookingRoom.roomCodes
        }).then(function () {
            const bookingCode = $scope.invoice.bookingCode;
            $scope.modalBookingRoom("hide");
            alert("Đặt thêm phòng thành công!");
            $scope.isLoading = false;
            $location.path("/hotel-room/" + bookingCode);
        }, function (resp) {
            alert(resp.data.error);
            $scope.isLoading = false;
        });
    }

    $scope.init();
});

app.controller("invoiceDetailCtrl", function ($scope, $routeParams, $http, $window, $location) {

    $scope.isLoading = false;
    $scope.invoice = {};
    $scope.payment = {
        money: 0
    };
    $scope.invoiceDetail = {};
    $scope.invoiceDetailUpdate = {};
    $scope.invoiceDetails = [];
    $scope.invoiceDetailHistories = [];
    $scope.paymentMethods = [];
    $scope.promotions = [];
    $scope.slpitInvoice = {
        selection: []
    };

    $scope.filterFn = function (item) {
        if (item.status == 2 && item.total > 0) {
            return true;
        } else {
            return false;
        }
    };

    $scope.init = async function () {
        $scope.isLoading = true;
        await $scope.loadInvoice();
        await $scope.loadInvoiceDetails();
    }

    $scope.loadInvoice = async function () {
        await $http.get("http://localhost:8000/api/invoices/" + $routeParams.code).then(function (resp) {
            $scope.invoice = resp.data;
        }, function () {
            alert("Có lỗi xảy ra vui lòng thử lại!");
            $location.path("/invoices");
        });
    }

    $scope.loadPaymentMethods = async function () {
        await $http.get("http://localhost:8000/api/payment-methods").then(function (resp) {
            $scope.paymentMethods = resp.data;
        });
    }

    $scope.loadPromotions = async function () {
        await $http.get("http://localhost:8000/api/promotions/by-invoice-amount?amount=" + $scope.invoice.total).then(function (resp) {
            $scope.promotions = resp.data;
        });
    }

    $scope.loadInvoiceDetails = async function () {
        await $http.get("http://localhost:8000/api/invoice-details/invoice-code/" + $routeParams.code).then(function (resp) {
            $scope.invoiceDetails = resp.data;
            $scope.isLoading = false;
        });
    }

    $scope.loadUsedServices = async function (invoiceDetail) {
        await $http.get("http://localhost:8000/api/used-services?invoiceDetailId=" + invoiceDetail.id + "&status=true").then(function (resp) {
            invoiceDetail.usedServices = resp.data;
        });
        await $http.get("http://localhost:8000/api/hotel/people-in-room/" + invoiceDetail.id).then(function (resp) {
            invoiceDetail.peopleInRoom = resp.data;
        });
    }

    $scope.loadInvoiceDetailHistories = async function () {
        await $http.get("http://localhost:8000/api/invoice-detail-histories?invoiceDetailId=" + $scope.invoiceDetail.id).then(function (resp) {
            $scope.invoiceDetailHistories = resp.data;
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

    $scope.initTableInvoiceDetailHistory = function () {
        $(document).ready(function () {
            tableInvoiceDetailHistory = $('#datatable-invoice-detail-history').DataTable({
                language: {
                    url: '//cdn.datatables.net/plug-ins/1.13.4/i18n/vi.json',
                },
                dom: 't<"row"<"col-sm-12 col-md-5"i><"col-sm-12 col-md-7"p>>'
            });
            $('#search-datatable-invoice-detail-history').keyup(function () {
                tableInvoiceDetailHistory.search($(this).val()).draw();
            });
        });
    }

    $scope.clearTableInvoiceDetailHistory = function () {
        $(document).ready(function () {
            tableInvoiceDetailHistory.clear();
            tableInvoiceDetailHistory.destroy();
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

    $scope.getTotalUsedService = function (usedServices) {
        if (!usedServices) {
            return 0;
        }
        return usedServices.reduce((total, usedService) => total + $scope.getTotalService(usedService), 0);
    }

    $scope.getDays = function (invoiceDetail) {
        if (!invoiceDetail) {
            return 0;
        }
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        const checkinExpected = new Date(invoiceDetail.checkinExpected);
        checkinExpected.setHours(0, 0, 0, 0);
        const checkoutExpected = new Date(invoiceDetail.checkoutExpected);
        checkoutExpected.setHours(0, 0, 0, 0);
        if (now.getTime() === checkinExpected.getTime()) {
            return 1;
        } else if (now.getTime() > checkoutExpected.getTime()) {
            return (checkoutExpected.getTime() - checkinExpected.getTime()) / (1000 * 3600 * 24);
        } else {
            return (now.getTime() - checkinExpected.getTime()) / (1000 * 3600 * 24);
        }
    }

    $scope.getDiscount = function () {
        if ($scope.payment.promotion) {
            const discount = $scope.invoice.total / 100 * $scope.payment.promotion.percent;
            if (discount >= $scope.payment.promotion.maxDiscount) {
                return $scope.payment.promotion.maxDiscount;
            }
            return discount;
        } else {
            return 0;
        }
    }

    $scope.getTotalRoom = function (invoiceDetail) {
        if (!invoiceDetail) {
            return 0;
        }
        return invoiceDetail.roomPrice * $scope.getDays(invoiceDetail);
    }

    $scope.getTotalInvoiceDetail = function (invoiceDetail, usedServices) {
        if (!usedServices || !invoiceDetail || !invoiceDetail.peopleInRoom) {
            return 0;
        }
        return $scope.getTotalUsedService(usedServices) + 
        $scope.getTotalRoom(invoiceDetail) +
        invoiceDetail.peopleInRoom.adultSurcharge +
        invoiceDetail.peopleInRoom.childSurcharge +
        invoiceDetail.ortherSurcharge +
        invoiceDetail.earlyCheckinFee + 
        invoiceDetail.lateCheckoutFee;
    }

    $scope.getTotalInvoice = function () {
        return $scope.invoiceDetails.reduce((total, invoiceDetail) => {
            if (invoiceDetail.status == 1) {
                return total + $scope.getTotalInvoiceDetail(invoiceDetail, invoiceDetail.usedServices);
            } else {
                return total + invoiceDetail.total;
            }
        }, 0);
    }

    $scope.getTotalDeposit = function () {
        return $scope.invoiceDetails.reduce((total, invoiceDetail) => total + invoiceDetail.deposit, 0);
    }

    $scope.getRemainingDeposit = function () {
        if ($scope.getTotalDeposit() - $scope.getTotalInvoice() <= 0) {
            return 0;
        } else {
            return $scope.getTotalDeposit() - $scope.getTotalInvoice();
        }
    }

    $scope.getTotalPayment = function () {
        if (!$scope.invoice) {
            return 0;
        }
        if ($scope.getTotalDeposit() - $scope.getTotalInvoice() + $scope.getDiscount() <= 0) {
            return $scope.getTotalInvoice() - $scope.getTotalDeposit() - $scope.getDiscount();
        } else {
            return 0;
        }
    }

    $scope.isSplitInvoice = function () {
        if ($scope.invoiceDetails.length >= 2) {
            return true;
        }
        return false;
    }

    $scope.isPaymentInvoice = function () {
        if ($scope.invoice.status == 2 || $scope.invoice.status == 3) {
            return true;
        }
        return false;
    }

    $scope.modalSplit = async function (action) {
        $('#modal-split').modal(action);
    }

    $scope.modalPayment = async function (action) {
        if (action == "show") {
            $scope.payment = {
                money: 0
            };
            await $scope.loadPromotions();
            await $scope.loadPaymentMethods();
        } else {
            $scope.paymentMethods = [];
        }
        $('#modal-payment').modal(action);
    }

    $scope.modalUpdateRoom = async function (action, invoiceDetail) {
        $scope.invoiceDetail = invoiceDetail;
        if (action == "show") {
            $scope.invoiceDetailUpdate.invoiceDetailId = $scope.invoiceDetail.id;
            $scope.invoiceDetailUpdate.roomPrice = $scope.invoiceDetail.roomPrice;
            $scope.invoiceDetailUpdate.deposit = $scope.invoiceDetail.deposit;
            $scope.invoiceDetailUpdate.adultSurcharge = $scope.invoiceDetail.adultSurcharge;
            $scope.invoiceDetailUpdate.childSurcharge = $scope.invoiceDetail.childSurcharge;
            $scope.invoiceDetailUpdate.ortherSurcharge = $scope.invoiceDetail.ortherSurcharge;
            $scope.invoiceDetailUpdate.earlyCheckinFee = $scope.invoiceDetail.earlyCheckinFee;
            $scope.invoiceDetailUpdate.lateCheckoutFee = $scope.invoiceDetail.lateCheckoutFee;
            $scope.invoiceDetailUpdate.note = "";
        } else {
            $scope.invoiceDetailUpdate = {};
        }
        $('#modal-update-room').modal(action);
    }

    $scope.modalHostedAt = async function (action, invoiceDetail) {
        $scope.invoiceDetail = invoiceDetail;
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

    $scope.modalHistoryRoom = async function (action, invoiceDetail) {
        $scope.invoiceDetail = invoiceDetail;
        $('#modal-history-room').modal(action);
        if (action == "show") {
            await $scope.loadInvoiceDetailHistories();
            await $scope.initTableInvoiceDetailHistory();
        } else {
            await $scope.clearTableInvoiceDetailHistory();
            $scope.invoiceDetailHistories = [];
        }
        setTimeout(function () {
            $('#search-datatable-invoice-detail-history').focus()
        }, 1000);
    }

    $scope.toggleSelection = function (roomCode) {
        var idx = $scope.slpitInvoice.selection.indexOf(roomCode);

        if (idx > -1) {
            $scope.slpitInvoice.selection.splice(idx, 1);
        }

        else {
            $scope.slpitInvoice.selection.push(roomCode);
        }
    };

    $scope.handlerSplitInvoice = function () {
        if (!confirm("Bạn muốn tách phòng " + $scope.slpitInvoice.selection.join(', ') + " sang hoá đơn mới?")) {
            return;
        }
        console.log($scope.slpitInvoice.selection.join(','));
        $scope.isLoading = true;
        $http.post("http://localhost:8000/api/hotel/split-invoice", {
            invoiceCode: $scope.invoice.code,
            roomCodes: $scope.slpitInvoice.selection
        }).then(function (resp) {
            $scope.modalSplit("hide");
            alert("Tách hoá đơn thành công!");
            $scope.isLoading = false;
            $location.path("/invoices/" + resp.data.code);
        }, function (resp) {
            alert(resp.data.error);
            $scope.isLoading = false;
        });
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
        $http.post("http://localhost:8000/api/hotel/update-invoice-detail", $scope.invoiceDetailUpdate).then(function (resp) {
            alert("Cập nhật thành công!");
            $window.location.reload();
        }, function () {
            alert("Cập nhật thất bại!");
        });
    }

    $scope.handlerVNPay = function () {
        $window.open("http://localhost:8000/payment/invoice/" + $scope.invoice.code, "_blank")
    }

    $scope.handlerPayment = function () {
        if ($scope.getTotalPayment() == 0) {
            $scope.payment.paymentMethod = {
                code: "DEPOSIT"
            };
        }
        console.log("payment", {
            invoiceCode: $scope.invoice.code,
            promotionCode: $scope.payment.promotion ? $scope.payment.promotion.code : null,
            paymentMethodCode: $scope.payment.paymentMethod ? $scope.payment.paymentMethod.code : null
        });
        if (!$scope.payment.paymentMethod) {
            alert("Vui lòng chọn phương thức thanh toán!")
            return;
        }
        if ($scope.payment.paymentMethod.code == 'CASH' && ($scope.payment.money - $scope.getTotalPayment()) < 0) {
            alert("Tiền khách đưa không đủ để thanh toán!");
            return;
        }
        var text = "";
        if ($scope.payment.paymentMethod.code == "BANK" || $scope.payment.paymentMethod.code == "VNPAY" || $scope.payment.paymentMethod.code == "CREDIT") {
            text = "Xác nhận thanh toán " + $scope.payment.paymentMethod.name;
        } else {
            text = "Bạn muốn thanh toán"
        }
        if (!confirm(text + " hoá đơn " + $scope.invoice.code + "?")) {
            return;
        }
        $http.post("http://localhost:8000/api/hotel/payment", {
            invoiceCode: $scope.invoice.code,
            promotionCode: $scope.payment.promotion ? $scope.payment.promotion.code : null,
            paymentMethodCode: $scope.payment.paymentMethod ? $scope.payment.paymentMethod.code : null,
            note: $scope.invoice.note
        }).then(function () {
            if ($scope.payment.paymentMethod.code == "CASH") {
                alert("Thanh toán thành công!");
            } else {
                alert(text + " thành công!");
            }
            $window.location.reload();
        }, function (resp) {
            alert(resp.data.error);
        });
    }

    $scope.confirmPayment = function () {
        if (!confirm("Bạn muốn xác nhận đã thanh toán hoá đơn " + $scope.invoice.code + "?")) {
            return;
        }
        $http.post("http://localhost:8000/api/hotel/confirm-payment", {
            invoiceCode: $scope.invoice.code
        }).then(function () {
            alert("Xác nhận thành công!");
            $window.location.reload();
        }, function () {
            alert("Xác nhận thất bại!");
        });
    }

    $scope.init();

});