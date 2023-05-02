app.controller("hotelRoomCtrl", function ($scope, $routeParams, $location, $http, $window, $filter) {

    $scope.statuses = [
        {
            id: 0,
            name: "Trống",
            description: ""
        },
        {
            id: 4,
            name: "Chờ nhận phòng",
            description: ""
        },
        {
            id: 2,
            name: "Đang ở",
            description: "Phòng đang được khách hàng sử dụng"
        },
        {
            id: 5,
            name: "Quá hạn trả",
            description: ""
        },
        {
            id: 6,
            name: "Đang dọn dẹp",
            description: ""
        },
        {
            id: 1,
            name: "Không hoạt động",
            description: "Phòng đang được sửa chữa"
        }
    ]
    $scope.isLoading = false;
    $scope.statusCounts = [];
    $scope.hotelRooms = [];
    $scope.services = [];
    $scope.usedServices = [];
    $scope.hostedAts = [];
    $scope.roomTypes = [];
    $scope.roomUnbookeds = [];
    $scope.customers = [];
    $scope.room = {};
    $scope.selectRoom = {};
    $scope.invoiceDetail = {};
    $scope.bookingDetail = {};
    $scope.extendCheckoutRoom = {};
    $scope.cancelRoom = {};
    $scope.changeRoom = {};
    $scope.usedServiceDate = {};
    $scope.customer = {
        gender: false
    };
    $scope.booking = {};
    $scope.promotionRoomType = {};
    $scope.search = {
        status: null,
        keyword: ""
    };
    $scope.peopleInRoom = {};

    $scope.frontIdCardBase64 = null;
    $scope.backIdCardBase64 = null;
    $scope.frontIdCardDisplay = null;
    $scope.backIdCardDisplay = null;
    $scope.isFrontImageCaptured = false;
    $scope.addBookings = [];

    $scope.filterFn = function (item) {
        const keyword = $scope.search.keyword.toLowerCase();
        const bookingCode = item.bookingCode.toLowerCase();
        const fullName = item.customer.toLowerCase();
        const phoneNumber = item.phoneNumber.toLowerCase();
        if ((item.status == $scope.search.status || $scope.search.status == null) && (bookingCode.includes(keyword) || fullName.includes(keyword) || phoneNumber.includes(keyword))) {
            return true;
        } else {
            return false;
        }
    };

    $scope.init = async function () {
        await $scope.loadHotelRooms();
    }

    $scope.loadHotelRooms = async function () {
        $scope.hotelRooms = [];
        $scope.isLoading = true;
        await $http.get("http://localhost:8000/api/hotel").then(function (resp) {
            $scope.hotelRooms = resp.data.hotelRooms;
            $scope.statusCounts = resp.data.statusCounts;
            if ($routeParams.bookingCode) {
                $scope.search.keyword = $routeParams.bookingCode;
            }
            $scope.isLoading = false;
        });
    }

    $scope.loadRoom = async function () {
        await $http.get("http://localhost:8000/api/rooms/code-room/" + $scope.selectRoom.code).then(function (resp) {
            $scope.room = resp.data;
        });
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

    $scope.loadServices = async function () {
        await $http.get("http://localhost:8000/api/services?status=true").then(function (resp) {
            $scope.services = resp.data;
        });
    }

    $scope.loadInvoiceDetail = async function () {
        await $http.get("http://localhost:8000/api/invoice-details/" + $scope.selectRoom.invoiceDetailId).then(function (resp) {
            $scope.invoiceDetail = resp.data;
        });
    }

    $scope.loadBookingDetail = async function () {
        await $http.get("http://localhost:8000/api/booking-details/" + $scope.selectRoom.bookingDetailId).then(function (resp) {
            $scope.bookingDetail = resp.data;
        });
    }

    $scope.loadUsedServices = async function () {
        await $http.get("http://localhost:8000/api/used-services?invoiceDetailId=" + $scope.selectRoom.invoiceDetailId + "&status=true").then(function (resp) {
            $scope.usedServices = resp.data;
        });
    }

    $scope.loadHostedAts = async function () {
        await $http.get("http://localhost:8000/api/hosted-ats/invoice-detail/" + $scope.selectRoom.invoiceDetailId).then(function (resp) {
            $scope.hostedAts = resp.data;
        });
    }

    $scope.loadCustomers = async function () {
        await $http.get("http://localhost:8000/api/customers").then(function (resp) {
            $scope.customers = resp.data;
        });
    }

    $scope.loadPromotionRoomType = async function (code) {
        await $http.get("http://localhost:8000/api/promotion-rooms/curr-by-room-type/" + code).then(function (resp) {
            $scope.promotionRoomType = resp.data;
        });
    }

    $scope.loadChangeRooms = async function () {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if ($scope.changeRoom.checkoutDate <= today) {
            alert('Ngày check-out phải sau ngày hôm nay!');
            return;
        }
        $scope.isLoading = true;
        await $http.get('http://localhost:8000/api/bookings/info', {
            params: {
                checkinDate: $filter('date')(today, 'dd-MM-yyyy'),
                checkoutDate: $filter('date')($scope.changeRoom.checkoutDate, 'dd-MM-yyyy'),
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
            $scope.isLoading = false;
        }).catch(function (error) {
            console.error('Error fetching data:', error);
            $scope.isLoading = false;
        });
    }

    $scope.loadBooking = async function () {
        await $http.get("http://localhost:8000/api/hotel/booking/" + $scope.selectRoom.bookingCode).then(resp => {
            $scope.booking = resp.data;
        });
    }

    $scope.loadPeopleInRoom = async function () {
        await $http.get("http://localhost:8000/api/hotel/people-in-room/" + $scope.selectRoom.invoiceDetailId).then(function (resp) {
            $scope.peopleInRoom = resp.data;
        });
    }

    $scope.getStatus = function (_status) {
        return $scope.statuses.find(item => item.id == _status);;
    }

    $scope.getColor = function (name, status) {
        return name + (status == 0 ? '-success' : (status == 1 ? '-sliver' : (status == 2 ? '-danger' : (status == 3 ? '-purple' : (status == 4 ? '-primary' : (status == 5 ? '-warning' : '-secondary'))))))
    }

    $scope.getTotalUsedService = function (usedService) {
        const startedTime = new Date(usedService.startedTime);
        startedTime.setHours(0, 0, 0, 0);
        const endedTime = new Date(usedService.endedTime);
        endedTime.setHours(0, 0, 0, 0);
        const days = (endedTime.getTime() - startedTime.getTime()) / (1000 * 3600 * 24);
        return usedService.servicePrice * days;
    }

    $scope.initTableUsedService = function () {
        $(document).ready(async function () {
            tableUsedService = $('#datatable-used-service').DataTable({
                language: {
                    url: '//cdn.datatables.net/plug-ins/1.13.4/i18n/vi.json',
                },
                dom: 't<"row"<"col-sm-12 col-md-5"i><"col-sm-12 col-md-7"p>>',
                columnDefs: [
                    {
                        targets: 6,
                        orderable: false
                    }
                ]
            });
            $('#search-datatable-used-service').keyup(function () {
                tableUsedService.search($(this).val()).draw();
            });
        });
    }

    $scope.clearTableUsedService = function () {
        $(document).ready(function () {
            tableUsedService.clear();
            tableUsedService.destroy();
        });
    }

    $scope.initTableServiceRoom = function () {
        $(document).ready(async function () {
            tableServiceRoom = $('#datatable-service-room').DataTable({
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
            $('#search-datatable-service-room').keyup(function () {
                tableServiceRoom.search($(this).val()).draw();
            });
        });
    }

    $scope.clearTableServiceRoom = function () {
        $(document).ready(function () {
            tableServiceRoom.clear();
            tableServiceRoom.destroy();
        });
    }

    $scope.initTableHostedAt = function () {
        $(document).ready(async function () {
            tableHostedAt = $('#datatable-hosted-at').DataTable({
                language: {
                    url: '//cdn.datatables.net/plug-ins/1.13.4/i18n/vi.json',
                },
                dom: 't<"row"<"col-sm-12 col-md-5"i><"col-sm-12 col-md-7"p>>',
                columnDefs: [
                    {
                        targets: 5,
                        orderable: false
                    }
                ]
            });

            $('#search-datatable-hosted-at').keyup(function () {
                tableHostedAt.search($(this).val()).draw();
            });
        });
    }

    $scope.clearTableHostedAt = function () {
        $(document).ready(function () {
            tableHostedAt.clear();
            tableHostedAt.destroy();
        });
    }

    $scope.initTableCustomer = function () {
        $(document).ready(function () {
            tableCustomer = $('#datatable-customer').DataTable({
                language: {
                    url: '//cdn.datatables.net/plug-ins/1.13.4/i18n/vi.json',
                },
                dom: 't<"row"<"col-sm-12 col-md-5"i><"col-sm-12 col-md-7"p>>',
                columnDefs: [
                    {
                        targets: 5,
                        orderable: false
                    }
                ]
            });
            $('#search-datatable-customer').keyup(function () {
                tableCustomer.search($(this).val()).draw();
            });
        });
    }

    $scope.clearTableCustomer = function () {
        $(document).ready(function () {
            tableCustomer.clear();
            tableCustomer.destroy();
        });
    }

    $scope.initTableChangeRoom = function () {
        $(document).ready(function () {
            tableChangeRoom = $('#datatable-change-room').DataTable({
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
            $('#search-datatable-change-room').keyup(function () {
                tableChangeRoom.search($(this).val()).draw();
            });
        });
    }

    $scope.clearTableChangeRoom = function () {
        $(document).ready(function () {
            tableChangeRoom.clear();
            tableChangeRoom.destroy();
        });
    }

    $scope.addServiceRoom = function (service) {
        const usedService = $scope.usedServices.find(item => {
            const startedTime = new Date(item.startedTime);
            const endedTime = new Date(item.endedTime);
            return item.serviceRoom.id == service.id && startedTime < $scope.usedServiceDate.endedTime && endedTime > $scope.usedServiceDate.startedTime;
        });
        if (usedService) {
            alert("Dịch vụ đang được sử dụng!");
        } else {
            const now = new Date();
            now.setHours(0, 0, 0, 0);
            const checkoutExpected = new Date($scope.selectRoom.checkoutExpected);
            if (now > $scope.usedServiceDate.startedTime) {
                alert("Không thể chọn ngày bắt đầu trước ngày hiện tại!");
                return;
            }
            if (checkoutExpected < $scope.usedServiceDate.endedTime) {
                alert("Không thể chọn ngày kết thúc sau ngày trả phòng!");
                return;
            }
            if (!($scope.usedServiceDate.startedTime > $scope.usedServiceDate.endedTime) && !($scope.usedServiceDate.startedTime < $scope.usedServiceDate.endedTime)) {
                alert("Không thể chọn ngày bắt đầu trùng ngày kết thúc!");
                return;
            }
            if (!confirm("Bạn muốn thêm " + service.name + "?")) {
                return;
            }
            console.log($scope.usedServiceDate.startedTime, $scope.usedServiceDate.endedTime);
            $http.post("http://localhost:8000/api/used-services", {
                serviceRoom: {
                    id: service.id
                },
                invoiceDetail: {
                    id: $scope.selectRoom.invoiceDetailId
                },
                startedTime: $scope.usedServiceDate.startedTime,
                endedTime: $scope.usedServiceDate.endedTime,
                quantity: 1
            }).then(async function (resp) {
                alert("Thêm dịch vụ thành công!");
                await $scope.clearTableUsedService();
                await $scope.loadUsedServices();
                await $scope.initTableUsedService();
                $('.nav-tabs a[href="#used-service-tab"]').tab('show');
            }, function (resp) {
                alert(resp.data.error);
            });
        }
    }

    $scope.removeServiceRoom = function (usedService) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const startedTime = new Date(usedService.startedTime);
        const endedTime = new Date(usedService.endedTime);
        if (endedTime < today) {
            alert("Dịch vụ này không còn được sử dụng!");
            return;
        }
        if (!confirm("Bạn muốn ngừng sử dụng dịch vụ này?")) {
            return;
        }
        $http.post("http://localhost:8000/api/used-services/stop-service/" + usedService.id).then(async function () {
            alert("Ngừng sử dụng dịch vụ thành công!");
            await $scope.clearTableUsedService();
            await $scope.loadUsedServices();
            await $scope.initTableUsedService();
        }, function (resp) {
            alert(resp.data.error);
        });
    }

    $scope.checkin = function (room) {
        $location.path("/checkin/" + room.code);
    }

    $scope.checkout = function (room) {
        const now = new Date();
        const checkout = new Date(room.checkoutExpected);

        if (checkout > now) {
            if (!confirm("Bạn muốn trả phòng " + room.code + " sớm?")) {
                return;
            }
        }
        $location.path("/checkout/" + room.code);
    }

    $scope.modalInfoRoom = async function (action, _room) {
        $scope.selectRoom = _room;
        if (action == 'show') {
            await $scope.loadRoom();
            await $scope.loadPromotionRoomType($scope.room.roomType.code)
            if ($scope.selectRoom.bookingCode !== '') {
                await $scope.loadBooking();
            }
        } else {
            $scope.room = {};
            $scope.promotionRoomType = {};
        }
        $('#modal-info-room').modal(action);
    }

    $scope.modalHostedAt = async function (action, room) {
        $scope.selectRoom = room;
        if (action == 'show') {
            await $scope.loadRoom();
            await $scope.loadPeopleInRoom();
            await $scope.loadHostedAts();
            await $scope.loadCustomers();
            await $scope.initTableHostedAt();
            await $scope.initTableCustomer();
        } else {
            $scope.clearTableHostedAt();
            $scope.clearTableCustomer();
            $scope.room = {};
            $scope.peopleInRoom = {};
            $scope.hostedAts = [];
            $scope.customers = [];
            $scope.customer = {
                gender: false
            };
            $scope.frontIdCardBase64 = null;
            $scope.backIdCardBase64 = null;
            $scope.frontIdCardDisplay = null;
            $scope.backIdCardDisplay = null;
            $scope.isFrontImageCaptured = false;
        }
        await $('#modal-hosted-at').modal(action);
        $('.nav-tabs a[href="#hosted-at-tab"]').click(function () {
            $('#search-datatable-hosted-at').focus()
        });
        $('.nav-tabs a[href="#customer-tab"]').click(function () {
            $('#search-datatable-customer').focus()
        });
        $('.nav-tabs a[href="#hosted-at-tab"]').tab('show');
        setTimeout(function () {
            $('#search-datatable-hosted-at').focus()
        }, 1000);
    }

    $scope.modalAddCustomer = function (action) {
        if (action == "show") {
            $scope.modalHostedAt('hide');
            $scope.customer = {
                gender: false
            };
        }
        $('#modal-add-customer').modal(action);
    }

    $scope.modalUsedService = async function (action, room) {
        $scope.selectRoom = room;
        if (action == 'show') {
            $scope.usedServiceDate.startedTime = new Date();
            $scope.usedServiceDate.startedTime.setHours(0, 0, 0, 0);
            $scope.usedServiceDate.endedTime = new Date($scope.selectRoom.checkoutExpected);
            await $scope.loadServices();
            await $scope.loadUsedServices();
            await $scope.initTableUsedService();
            await $scope.initTableServiceRoom();
        } else {
            $scope.clearTableUsedService();
            $scope.clearTableServiceRoom();
            $scope.services = [];
            $scope.usedServices = [];
            $scope.usedServiceDate = {};
        }
        await $('#modal-used-service').modal(action);
        $('.nav-tabs a[href="#used-service-tab"]').click(function () {
            $('#search-datatable-used-service').focus()
        });
        $('.nav-tabs a[href="#service-tab"]').click(function () {
            $('#search-datatable-service-room').focus()
        });
        $('.nav-tabs a[href="#used-service-tab"]').tab('show');
        setTimeout(function () {
            $('#search-datatable-used-service').focus()
        }, 1000);
    }

    $scope.modalCancelRoom = async function (action, room) {
        $scope.selectRoom = room;
        if (action == 'show') {
            await $scope.loadBookingDetail();
        } else {
            $scope.invoiceDetail = {};
        }
        $scope.cancelRoom.note = "";
        $('#modal-cancel-room').modal(action);
    }

    $scope.modalExtendDate = async function (action, room) {
        $scope.selectRoom = room;
        if (action == 'show') {
            $scope.extendCheckoutRoom.code = $scope.selectRoom.code;
            $scope.extendCheckoutRoom.extendDate = new Date($scope.selectRoom.checkoutExpected);
            $scope.extendCheckoutRoom.note = "";
            await $scope.loadInvoiceDetail();
        } else {
            $scope.invoiceDetail = {};
        }
        $('#modal-extend-date').modal(action);
    }

    $scope.modalChangeRoom = async function (action, room) {
        $scope.selectRoom = room;
        $scope.changeRoom.toRoomCode = null;
        if (action == 'show') {
            $scope.changeRoom.checkoutDate = new Date($scope.selectRoom.checkoutExpected);
            await $scope.loadInvoiceDetail();
        } else {
            $scope.invoiceDetail = {};
            $scope.roomUnbookeds = [];
        }
        $('#modal-change-room').modal(action);
    }

    $scope.modalQRCodeScan = async function () {
        var modal = document.createElement('div');
        modal.style.zIndex = '10000';
        modal.style.position = 'fixed';
        modal.style.top = '0';
        modal.style.left = '0';
        modal.style.width = '100%';
        modal.style.height = '100%';
        modal.style.background = 'rgba(0, 0, 0, 0.5)';
        modal.style.display = 'flex';
        modal.style.justifyContent = 'center';
        modal.style.alignItems = 'center';
        modal.style.flexDirection = 'column';



        var scanContainer = document.createElement('div');
        scanContainer.id = "reader";
        scanContainer.style.width = "500px";
        scanContainer.style.backgroundColor = "white";

        var note = document.createElement('div');
        note.style.marginTop = "10px";
        note.textContent = 'Nhấn ESC để hủy.';
        note.classList.add('alert', 'alert-secondary');

        modal.appendChild(scanContainer);
        modal.appendChild(note);

        document.body.appendChild(modal);

        var html5QrcodeScanner = new Html5QrcodeScanner("reader", {
            fps: 10,
            qrbox: 250
        });

        function onScanSuccess(decodedText, decodedResult) {

            $scope.$apply(function () {
                $scope.search.keyword = decodedText;
            });

            html5QrcodeScanner.clear();
            modal.remove();
        }


        function onKeyEvent(event) {
            if (event.code === 'Escape') {
                event.preventDefault();
                html5QrcodeScanner.clear();
                modal.remove();
            }
        }
        document.addEventListener('keydown', onKeyEvent);

        html5QrcodeScanner.render(onScanSuccess);
    }

    $scope.handlerFindChangeRoom = async function () {
        const checkoutExpected = new Date($scope.selectRoom.checkoutExpected);
        if ($scope.changeRoom.checkoutDate < checkoutExpected) {
            alert("Ngày trả phòng phải sau ngày trả phòng hiện tại!")
            return;
        }
        $scope.changeRoom.toRoomCode = null;
        await $scope.clearTableChangeRoom();
        await $scope.loadChangeRooms();
        await $scope.initTableChangeRoom();
    }

    $scope.handlerAddCustomer = async function (_customer) {
        const hostedAt = $scope.hostedAts.find(hostedAt => hostedAt.customer.id == _customer.id);
        if (hostedAt) {
            alert("Khách hàng đã tồn tại!");
        } else {
            if (!confirm("Bạn muốn thêm khách hàng " + _customer.fullName + " vào phòng " + $scope.selectRoom.code + "?")) {
                return;
            }
            $http.post("http://localhost:8000/api/hosted-ats", {
                invoiceDetail: {
                    id: $scope.selectRoom.invoiceDetailId
                },
                customer: _customer
            }).then(async function (_resp) {
                alert("Thêm khách hàng thành công!");
                await $scope.clearTableHostedAt();
                await $scope.loadHostedAts();
                await $scope.initTableHostedAt();
                await $scope.loadPeopleInRoom();
                $('.nav-tabs a[href="#hosted-at-tab"]').tab('show');
            }, function (resp) {
                alert(resp.data.error);
            });
        }
    }

    $scope.removeHostedAt = function (hostedAt) {
        if (!confirm("Bạn muốn loại bỏ khách hàng này khỏi phòng?")) {
            return;
        }
        $http.delete("http://localhost:8000/api/hosted-ats/" + hostedAt.id).then(async function () {
            alert("Loại bỏ khách hàng thành công!");
            await $scope.clearTableHostedAt();
            await $scope.loadHostedAts();
            await $scope.initTableHostedAt();
            await $scope.loadPeopleInRoom();
        }, function (resp) {
            alert(resp.data.error);
        });
    }

    $scope.handlerCreateCustomer = async function () {
        if (!$scope.customer.fullName) {
            alert("Vui lòng nhập họ và tên!");
            $("#fullName").focus();
            return;
        }
        if (!$scope.customer.dateOfBirth) {
            alert("Vui lòng nhập ngày sinh!");
            $("#dateOfBirth").focus();
            return;
        }
        if (!$scope.customer.placeOfBirth) {
            alert("Vui lòng nhập quê quán!");
            $("#placeOfBirth").focus();
            return;
        }
        if (!$scope.customer.address) {
            alert("Vui lòng nhập địa chỉ!");
            $("#address").focus();
            return;
        }
        if (!confirm("Bạn muốn thêm khách hàng?")) {
            return;
        }

        var formData = new FormData();

        var binaryFront = atob($scope.frontIdCardBase64);
        var arrayFront = [];
        for (var i = 0; i < binaryFront.length; i++) { arrayFront.push(binaryFront.charCodeAt(i)); }
        var blobFront = new Blob([new Uint8Array(arrayFront)], { type: 'image/jpeg' });

        var binaryBack = atob($scope.backIdCardBase64);
        var arrayBack = [];
        for (var i = 0; i < binaryBack.length; i++) { arrayBack.push(binaryBack.charCodeAt(i)); }
        var blobBack = new Blob([new Uint8Array(arrayBack)], { type: 'image/jpeg' });

        $scope.customer.dateOfBirth = $scope.customer.dateOfBirth.toLocaleDateString('vi-VN');

        formData.append('frontIdCard', blobFront, 'frontIdCard.jpg');
        formData.append('backIdCard', blobBack, 'backIdCard.jpg');
        formData.append('customer', JSON.stringify($scope.customer));

        $http.post('http://localhost:8000/api/hotel/create-customer', formData, {
            transformRequest: angular.identity,
            headers: {
                'Content-Type': undefined
            }
        }).then(async function (response) {
            if (response.status == 200) {
                alert('Thêm khách hàng thành công!');
                $scope.customer = {
                    gender: true
                };
                $scope.frontIdCardBase64 = null;
                $scope.backIdCardBase64 = null;
                $scope.frontIdCardDisplay = null;
                $scope.backIdCardDisplay = null;
                $scope.isFrontImageCaptured = false;
                await $scope.clearTableCustomer();
                await $scope.loadCustomers();
                await $scope.initTableCustomer();
                $('.nav-tabs a[href="#customer-tab"]').tab('show');
            } else {
                alert('Thêm khách hàng thất bại!');
            }
            console.log(response);
        }, function (resp) {
            alert(resp.data.error);
        });
    }

    $scope.handlerCheckExtendCheckout = async function () {
        const newCheckout = new Date($scope.extendCheckoutRoom.extendDate);
        await $http.get("http://localhost:8000/api/hotel/check-extend-checkout-date?code=" + $scope.selectRoom.code + "&checkoutDate=" + newCheckout.toLocaleDateString('vi-VN')).then(function (resp) {
            alert("Ngày trả phòng hợp lệ!");
        }, function (resp) {
            alert(resp.data.error);
        });
    }

    $scope.handlerExtendDateRoom = async function () {
        const checkout = new Date($scope.selectRoom.checkoutExpected);
        const newCheckout = new Date($scope.extendCheckoutRoom.extendDate);
        if (newCheckout <= checkout) {
            alert("Ngày trả phòng không hợp lệ!");
            return;
        }
        if (!$scope.extendCheckoutRoom.note) {
            alert("Vui lòng nhập ghi chú!");
            return;
        }
        if (!confirm("Bạn muốn gia hạn ngày trả phòng " + $scope.selectRoom.code + "?")) {
            return;
        }
        await $http.post("http://localhost:8000/api/hotel/extend-checkout-date", $scope.extendCheckoutRoom).then(function (resp) {
            alert("Gia hạn ngày trả phòng thành công!");
            $scope.statusCounts.forEach(statusCount => {
                if ($scope.selectRoom.status == 5 && statusCount.status == 2) {
                    statusCount.count++
                }
                if ($scope.selectRoom.status == 5 && statusCount.status == 5) {
                    statusCount.count--;
                }
            });
            $scope.selectRoom.status = 2;
            $scope.selectRoom.checkoutExpected = newCheckout;
            $scope.modalExtendDate('hide');
        }, function (resp) {
            alert(resp.data.error);
        });
    }

    $scope.handlerCancelRoom = function () {
        if (!$scope.cancelRoom.note) {
            alert("Vui lòng nhập ghi chú!");
            return;
        }
        if (!confirm("Bạn muốn huỷ phòng " + $scope.selectRoom.code + "?")) {
            return;
        }
        $http.post("http://localhost:8000/api/hotel/cancel", {
            code: $scope.selectRoom.code,
            note: $scope.cancelRoom.note
        }).then(function (resp) {
            alert("Huỷ phòng thành công!");
            $scope.cancelRoom.note = "";
            $window.location.reload();
        }, function (resp) {
            alert(resp.data.error);
        });
    }

    $scope.handlerReadyRoom = async function (room) {
        if (!confirm("Bạn muốn chuyển phòng " + room.code + " về trạng thái sẵn sàng?")) {
            return;
        }
        $scope.isLoading = true;
        $http.post("http://localhost:8000/api/hotel/ready", {
            code: room.code
        }).then(async function () {
            await $http.get("http://localhost:8000/api/hotel/" + room.code).then(async function (resp) {
                await $scope.statusCounts.forEach(statusCount => {
                    if (statusCount.status == resp.data.status) {
                        statusCount.count++
                    }
                    if (statusCount.status == room.status) {
                        statusCount.count--;
                    }
                });
                await $scope.hotelRooms.forEach(hotelRoom => {
                    if (hotelRoom.code == resp.data.code) {
                        hotelRoom.bookingCode = resp.data.bookingCode;
                        hotelRoom.bookingDetailId = resp.data.bookingDetailId;
                        hotelRoom.invoiceDetailId = resp.data.invoiceDetailId;
                        hotelRoom.checkinExpected = resp.data.checkinExpected;
                        hotelRoom.checkoutExpected = resp.data.checkoutExpected;
                        hotelRoom.customer = resp.data.customer;
                        hotelRoom.phoneNumber = resp.data.phoneNumber;
                        hotelRoom.status = resp.data.status;
                        return;
                    }
                });
                $scope.isLoading = false;
                alert("Phòng đã sẵn sàng!");
            });
        }, function (resp) {
            alert(resp.data.error);
        });
    }

    $scope.handlerChangeRoom = function () {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (!$scope.changeRoom.toRoomCode) {
            alert("Vui lòng chọn phòng muốn đổi!");
            return;
        }
        if ($scope.changeRoom.checkoutDate <= today) {
            alert('Ngày trả phòng phải sau ngày hôm nay!');
            return;
        }
        if (!$scope.changeRoom.note) {
            alert("Vui lòng nhập ghi chú!");
            return;
        }
        if (!confirm("Bạn muốn chuyển phòng " + $scope.selectRoom.code + " sang phòng " + $scope.changeRoom.toRoomCode + "?")) {
            return;
        }
        $scope.changeRoom.fromRoomCode = $scope.selectRoom.code;
        console.log("changeRoom", $scope.changeRoom);

        $scope.isLoading = true;
        $http.post("http://localhost:8000/api/hotel/change", $scope.changeRoom).then(async function () {
            await $http.get("http://localhost:8000/api/hotel/" + $scope.changeRoom.toRoomCode).then(async function (resp) {
                await $scope.statusCounts.forEach(statusCount => {
                    if (statusCount.status == 6) {
                        statusCount.count++
                    }
                    if (statusCount.status == 0) {
                        statusCount.count--;
                    }
                });
                await $scope.hotelRooms.forEach(hotelRoom => {
                    if (hotelRoom.code == resp.data.code) {
                        hotelRoom.bookingCode = resp.data.bookingCode;
                        hotelRoom.bookingDetailId = resp.data.bookingDetailId;
                        hotelRoom.invoiceDetailId = resp.data.invoiceDetailId;
                        hotelRoom.checkinExpected = resp.data.checkinExpected;
                        hotelRoom.checkoutExpected = resp.data.checkoutExpected;
                        hotelRoom.customer = resp.data.customer;
                        hotelRoom.phoneNumber = resp.data.phoneNumber;
                        hotelRoom.status = resp.data.status;
                        return;
                    }
                });

                $scope.selectRoom.bookingCode = "";
                $scope.selectRoom.bookingDetailId = null;
                $scope.selectRoom.invoiceDetailId = null;
                $scope.selectRoom.checkinExpected = null;
                $scope.selectRoom.checkoutExpected = null;
                $scope.selectRoom.customer = null;
                $scope.selectRoom.phoneNumber = null;
                $scope.selectRoom.status = 6;
                $scope.modalChangeRoom('hide');
                alert("Đổi phòng thành công!");
                $scope.isLoading = false;
            });
        }, function (resp) {
            alert(resp.data.error);
            $scope.isLoading = false;
        });
    }

    $scope.uploadFrontIdCard = function (imageData) {

        $scope.frontIdCardBase64 = imageData.split(',')[1];

        var url = 'http://localhost:8000/api/bookings/read-front-id-card';
        var formData = new FormData();
        var binary = atob(imageData.split(',')[1]);
        var array = [];
        for (var i = 0; i < binary.length; i++) {
            array.push(binary.charCodeAt(i));
        }
        var blob = new Blob([new Uint8Array(array)], { type: 'image/jpeg' });

        formData.append('frontIdCard', blob);

        return $http.post(url, formData, {
            transformRequest: angular.identity,
            headers: {
                'Content-Type': undefined
            }
        }).then(function (response) {
            if (response.data != '') {

                $scope.checkCustomer(response.data.data[0].id).then(function (result) {
                    if (result) {
                        return response;
                    }
                });

                $scope.customer.fullName = response.data.data[0].name;
                $scope.customer.dateOfBirth = new Date(response.data.data[0].dob);
                $scope.customer.gender = response.data.data[0].sex === 'NAM' ? true : false;
                $scope.customer.peopleId = response.data.data[0].id;
                $scope.customer.address = response.data.data[0].address;
                $scope.customer.placeOfBirth = response.data.data[0].home;
                $scope.isLoading = false;
                return response;
            } else {
                return response;
            }
        }).catch(function (error) {
            console.log(error);
            return error;
        });

    };

    $scope.checkCustomer = async function (peopleId) {
        try {
            const response = await $http.get('http://localhost:8000/api/customers/search-by-people-id/' + peopleId);
            if (response.status == 200) {
                $scope.customer = response.data;
                $scope.customer.dateOfBirth = new Date($scope.customer.dateOfBirth);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error fetching data:', error);
            return false;
        }
    };

    $scope.uploadBackIdCard = function (imageData) {

        $scope.backIdCardBase64 = imageData.split(',')[1];

        var url = 'http://localhost:8000/api/bookings/read-back-id-card';
        var formData = new FormData();
        var binary = atob(imageData.split(',')[1]);
        var array = [];
        for (var i = 0; i < binary.length; i++) {
            array.push(binary.charCodeAt(i));
        }
        var blob = new Blob([new Uint8Array(array)], { type: 'image/jpeg' });
        formData.append('backIdCard', blob);
        return $http.post(url, formData, {
            transformRequest: angular.identity,
            headers: {
                'Content-Type': undefined
            }
        }).then(function (response) {
            console.log(response);
            return response;
        }).catch(function (error) {
            console.log(error);
            return error;
        });

    };

    $scope.takePicture = function () {

        navigator.mediaDevices.getUserMedia({ video: true })
            .then(function (stream) {

                var modal = document.createElement('div');
                modal.style.zIndex = '10000';
                modal.style.position = 'fixed';
                modal.style.top = '0';
                modal.style.left = '0';
                modal.style.width = '100%';
                modal.style.height = '100%';
                modal.style.background = 'rgba(0, 0, 0, 0.5)';
                modal.style.display = 'flex';
                modal.style.justifyContent = 'center';
                modal.style.alignItems = 'center';
                modal.style.flexDirection = 'column';

                var video = document.createElement('video');
                video.srcObject = stream;
                video.play();

                var noteContainer = document.createElement('div');
                noteContainer.style.display = 'flex';
                noteContainer.style.marginTop = '15px';
                noteContainer.style.justifyContent = 'center';
                noteContainer.style.alignItems = 'center';

                var note = document.createElement('div');

                note.textContent = 'Chụp mặt trước CMND/CCCD. Nhấn SPACE để chụp, ESC để hủy.';

                note.classList.add('alert', 'alert-secondary');
                noteContainer.appendChild(note);

                function onKeyEvent(event) {
                    if (event.code === 'Space') {
                        event.preventDefault();
                        captureImage();
                    }
                    if (event.code === 'Escape') {
                        event.preventDefault();
                        video.srcObject = null;
                        stream.getTracks().forEach(function (track) {
                            track.stop();
                        });
                        modal.remove();
                        document.removeEventListener('keydown', onKeyEvent);
                    }
                }

                document.addEventListener('keydown', onKeyEvent);

                modal.appendChild(video);
                modal.appendChild(noteContainer);
                document.body.appendChild(modal);

                async function captureImage() {

                    if ($scope.isFrontImageCaptured == false) {
                        const canvasFront = document.createElement('canvas');
                        canvasFront.width = video.videoWidth;
                        canvasFront.height = video.videoHeight;

                        canvasFront.getContext('2d').drawImage(video, 0, 0, canvasFront.width, canvasFront.height);
                        video.pause();

                        const frontResponse = await $scope.uploadFrontIdCard(canvasFront.toDataURL('image/jpeg'));
                        console.log(frontResponse);

                        if (frontResponse != undefined && frontResponse.data.data[0].id != null) {
                            video.play();
                            document.removeEventListener('keydown', onKeyEvent);
                            note.textContent = 'Chụp mặt sau CMND/CCCD. Nhấn SPACE để chụp, ESC để hủy.';
                            $scope.$apply(function () {
                                $scope.frontIdCardDisplay = canvasFront.toDataURL('image/jpeg');
                            });
                            $scope.isFrontImageCaptured = true;
                        } else {
                            cleanCamera();
                            alert('Không thể nhận diện được ảnh! Vui lòng chụp lại!');
                            $scope.isFrontImageCaptured = false;
                        }
                    }

                    if ($scope.isFrontImageCaptured == true) {
                        function onKeyEvent2(event) {
                            if (event.code === 'Space') {
                                event.preventDefault();
                                capImageBack();
                                cleanCamera2();
                            }
                            if (event.code === 'Escape') {
                                event.preventDefault();
                                video.srcObject = null;
                                stream.getTracks().forEach(function (track) {
                                    track.stop();
                                });
                                modal.remove();
                                document.removeEventListener('keydown', onKeyEvent2);
                            }
                        }
                        document.addEventListener('keydown', onKeyEvent2);
                    }


                    async function capImageBack() {
                        const canvasBack = document.createElement('canvas');
                        canvasBack.width = video.videoWidth;
                        canvasBack.height = video.videoHeight;

                        canvasBack.getContext('2d').drawImage(video, 0, 0, canvasBack.width, canvasBack.height);
                        video.pause();
                        const backResponse = await $scope.uploadBackIdCard(canvasBack.toDataURL('image/jpeg'));
                        if (backResponse.data.data[0].features != null) {
                            $scope.$apply(function () {
                                $scope.backIdCardDisplay = canvasBack.toDataURL('image/jpeg');
                            });
                            alert('Chụp CCCD/CMND thành công!');
                        } else {
                            alert('Không thể nhận diện được ảnh! Vui lòng chụp lại từ đầu!');
                        }
                        $scope.isFrontImageCaptured = false;
                    }

                    function cleanCamera2() {
                        video.srcObject = null;
                        stream.getTracks().forEach(function (track) {
                            track.stop();
                        });
                        modal.remove();
                        document.removeEventListener('keydown', onKeyEvent2);
                    }

                }

                function cleanCamera() {
                    video.srcObject = null;
                    stream.getTracks().forEach(function (track) {
                        track.stop();
                    });
                    modal.remove();
                    document.removeEventListener('keydown', onKeyEvent);
                }

            })
            .catch(function (err) {
                console.log('An error occurred: ' + err);
            });
    };

    $scope.init();

});