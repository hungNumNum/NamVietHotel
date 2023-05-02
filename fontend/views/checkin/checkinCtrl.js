app.controller("checkinCtrl", function ($scope, $routeParams, $http, $location) {
    
    $scope.isLoading = false;
    $scope.hostedAts = [];
    $scope.serviceRooms = [];
    $scope.usedServices = [];
    $scope.customers = [];
    $scope.bookingDetail = {};
    $scope.customer = {
        gender: true
    };
    $scope.peopleInRoom = {
        numAdults: 0,
        numChilds: 0
    }
    $scope.invoiceDetail = {
        earlyCheckinFee: 0
    }
    $scope.frontIdCardBase64 = null;
    $scope.backIdCardBase64 = null;
    $scope.frontIdCardDisplay = null;
    $scope.backIdCardDisplay = null;
    $scope.isFrontImageCaptured = false;

    $scope.init = async function () {
        await $scope.loadBookingDetail();
    }

    $scope.loadBookingDetail = async function () {
        $scope.isLoading = true;
        await $http.get("http://localhost:8000/api/booking-details/waiting-checkin/" + $routeParams.roomCode).then(function (resp) {
            $scope.bookingDetail = resp.data;
            $scope.isLoading = false;
        }, function () {
            alert("Có lỗi xảy ra vui lòng thử lại!");
            $location.path("/hotel-room");
        });
    }

    $scope.loadCustomers = async function () {
        await $http.get("http://localhost:8000/api/customers").then(function (resp) {
            $scope.customers = resp.data;
        });
    }

    $scope.loadServiceRoom = async function () {
        await $http.get("http://localhost:8000/api/services?status=true").then(function (resp) {
            $scope.serviceRooms = resp.data;
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
            $('#search-datatable-customer').keyup(function(){
                tableCustomer.search($(this).val()).draw() ;
            });
        });
    }

    $scope.clearTableCustomer = function () {
        $(document).ready(function () {
            if (tableCustomer != null) {
                tableCustomer.clear();
                tableCustomer.destroy();
            }
        });
    }

    $scope.initTableServiceRoom = function () {
        $(document).ready(function () {
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
            $('#search-datatable-service-room').keyup(function(){
                tableServiceRoom.search($(this).val()).draw() ;
            });
        });
    }

    $scope.clearTableServiceRoom = function () {
        $(document).ready(function () {
            tableServiceRoom.clear();
            tableServiceRoom.destroy();
        });
    }

    $scope.modalPeopleRoom = async function (action) {
        if (action == "show") {
            await $scope.loadCustomers();
            await $scope.initTableCustomer();
        } else {
            await $scope.clearTableCustomer();
            $scope.customers = [];
            $scope.customer = {
                gender: true
            };
            $scope.frontIdCardBase64 = null;
            $scope.backIdCardBase64 = null;
            $scope.frontIdCardDisplay = null;
            $scope.backIdCardDisplay = null;
            $scope.isFrontImageCaptured = false;
        }
        await $('#modal-people-room').modal(action);
        $('.nav-tabs a[href="#customer-tab"]').click(function () {
            $('#search-datatable-customer').focus()
        });
        $('.nav-tabs a[href="#add-customer-tab"]').click(function () {
            $('#peopleId').focus()
        });
        $('.nav-tabs a[href="#customer-tab"]').tab('show');
        setTimeout(function () {
            $('#search-datatable-customer').focus()
        }, 1000);
    }

    $scope.modalServiceRoom = async function (action) {
        if (action == 'show') {
            await $scope.loadServiceRoom();
            await $scope.initTableServiceRoom();
        } else {
            await $scope.clearTableServiceRoom();
            $scope.serviceRooms = [];
        }
        $('#modal-service-room').modal(action);
        setTimeout(function () {
            $('#search-datatable-service-room').focus()
        }, 1000);
    }

    $scope.modalSurchargeRoom = async function (action) {
        $('#modal-surcharge-room').modal(action);
    }

    $scope.countPeopleInRoom = function () {
        // lấy ngày hiện tại
        const today = new Date();
        const numAdults = $scope.hostedAts.filter(hostedAt => {
            // nhập ngày sinh của người dùng, định dạng: yyyy-mm-dd
            const birthDate = new Date(hostedAt.customer.dateOfBirth);
            // tính số mili giây giữa ngày hiện tại và ngày sinh
            const diff = today.getTime() - birthDate.getTime();
            // chuyển đổi số mili giây thành số năm
            const age = Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
            return age >= 13;
        }).length;
        const numChilds = $scope.hostedAts.filter(hostedAt => {
            // nhập ngày sinh của người dùng, định dạng: yyyy-mm-dd
            const birthDate = new Date(hostedAt.customer.dateOfBirth);
            // tính số mili giây giữa ngày hiện tại và ngày sinh
            const diff = today.getTime() - birthDate.getTime();
            // chuyển đổi số mili giây thành số năm
            const age = Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
            return age < 13;
        }).length;
        return { numAdults, numChilds };
    }

    $scope.handlerAddCustomer = function (_customer) {
        if ($scope.hostedAts.find(hostedAt => hostedAt.customer.peopleId == _customer.peopleId)) {
            alert("khách hàng đã tồn tại!");
            return;
        } else {
            // lấy ngày hiện tại
            const today = new Date();
            const { numAdults, numChilds } = $scope.countPeopleInRoom();
            const room = $scope.bookingDetail.room;
            const birthDate = new Date(_customer.dateOfBirth);
            const diff = today.getTime() - birthDate.getTime();
            const age = Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
            if (age >= 13 && numAdults >= (room.roomType.numAdults + room.roomType.maxAdultsAdd)) {
                // không thể thêm người lớn vào phòng này. số lượng đạt tối đa
                alert("Không thể thêm người lớn vào phòng này. Số lượng đạt tối đa!");
                return;
            }
            if (age < 13 && numChilds >= (room.roomType.numChilds + room.roomType.maxChildsAdd)) {
                // không thể thêm trẻ em vào phòng này. số lượng đạt tối đa
                alert("Không thể thêm trẻ em vào phòng này. Số lượng đạt tối đa!");
                return;
            }
            if (age >= 13) {
                $scope.peopleInRoom.numAdults = numAdults + 1;
            } else {
                $scope.peopleInRoom.numChilds = numChilds + 1;
            }
            if (!confirm("Bạn muốn thêm khách hàng " + _customer.fullName + " vào phòng?")) {
                return;
            }
            $scope.hostedAts.push({
                customer: _customer
            });
            alert("Thêm khách hàng thành công!");
        }
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
        $scope.isLoading = true;

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
        }).then(async function (resp) {
            alert('Thêm khách hàng thành công!');
            $scope.isLoading = false;
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
            console.log(resp);
        }, function () {
            alert('Thêm khách hàng thất bại!');
        });
    }

    $scope.addServiceRoom = function (service) {
        var usedService = $scope.usedServices.find(item => item.serviceRoom.id == service.id);
        if (usedService) {
            alert("Dịch vụ đã tồn tại!");
        } else {
            if (!confirm("Bạn muốn thêm " + service.name + "?")) {
                return;
            }
            usedService = {
                serviceRoom: service,
                bookingDetail: $scope.bookingDetail,
                quantity: 1
            }
            $scope.usedServices.push(usedService);
            alert("Thêm dịch vụ thành công!");
        }
    }

    $scope.removeServiceRoom = function (service) {
        if (!confirm("Bạn muốn loại bỏ dịch vụ này khỏi phòng?")) {
            return;
        }
        const index = $scope.usedServices.findIndex(item => item.serviceRoom.id == service.id);
        $scope.usedServices.splice(index, 1);
    }

    $scope.removeHostedAt = function (customer) {
        if (!confirm("Bạn muốn loại bỏ khách hàng này?")) {
            return;
        }
        const index = $scope.hostedAts.findIndex(item => item.customer.id == customer.id);
        $scope.hostedAts.splice(index, 1);
        $scope.peopleInRoom = $scope.countPeopleInRoom();
    }

    $scope.handlerCheckin = function () {
        const numPeople = $scope.hostedAts.length;
        if (numPeople <= 0) {
            alert("Chưa có thông tin người ở!");
            return;
        }
        if (!confirm("Bạn muốn nhận phòng " + $routeParams.roomCode +  "?")) {
            return;
        }
        $scope.isLoading = true;
        console.log("checkin", {
            code: $routeParams.roomCode,
            hostedAts: $scope.hostedAts,
            usedServices: $scope.usedServices
        });
        const customers = $scope.hostedAts.map(hostedAt => {
            return {
                customerId: hostedAt.customer.id
            }
        });
        const services = $scope.usedServices.map(usedService => {
            return {
                serviceId: usedService.serviceRoom.id,
                quantity: usedService.quantity
            }
        });
        $http.post("http://localhost:8000/api/hotel/checkin", {
            code: $routeParams.roomCode,
            earlyCheckinFee: $scope.invoiceDetail.earlyCheckinFee,
            customers: customers,
            services: services
        }).then(function (resp) {
            alert("Nhận phòng thành công!");
            $scope.isLoading = false;
            $location.path("/hotel-room");
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
                $scope.loading = false;
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