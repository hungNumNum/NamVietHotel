app.controller("listBookingCtrl", function ($scope, $http, $window, $filter) {

    $scope.loading = false;
    $scope.showBookingTable = false;
    $scope.showCustomerTable = false;
    $scope.showConfirmedTable = true;
    $scope.showPendingTable = false;
    $scope.showListRoomEditBkd = false;
    $scope.currentTable = 2;
    $scope.booking = {};
    $scope.addRoom = {};
    $scope.addRoom.checkinDate = null;
    $scope.addRoom.checkoutDate = null;
    $scope.bookingDetail = {};
    $scope.rooms = [];
    $scope.listRoomEditBkd = [];
    $scope.addBookings = [];
    $scope.search = {};
    $scope.pendingBooking = {};
    $scope.pendingBooking.checkinDate = null;
    $scope.pendingBooking.checkoutDate = null;
    $scope.listRoomForPendingBooking = [];
    $scope.pending = [];
    $scope.roomsSelected = [];
    $scope.pendingRoom = true;

    $scope.clearTableBooking = function () {
        $(document).ready(function () {
            if (bookingTable) {
                bookingTable.clear();
                bookingTable.destroy();
            }
            if (confirmedTable) {
                confirmedTable.clear();
                confirmedTable.destroy();
            }
            if (pendingTable) {
                pendingTable.clear();
                pendingTable.destroy();
            }
            if (customerTable) {
                customerTable.clear();
                customerTable.destroy();
            }
        });
    }

    $scope.handlerLoadByRangeDate = function () {
        $scope.loading = true;
        $scope.bookings = [];
        $scope.clearTableBooking();
        $scope.init();
    }

    $scope.closeDropdown = function () {
        $('.dropdown-menu').removeClass('show');
    };

    $scope.init = function () {
        $scope.loading = true;
        $scope.search.startDate = new Date(new Date().setMonth(new Date().getMonth() - 2));
        $scope.search.endDate = new Date();

        var startDate = $filter('date')($scope.search.startDate, "dd-MM-yyyy");
        var endDate = $filter('date')($scope.search.endDate, "dd-MM-yyyy");

        $http.get("http://localhost:8000/api/bookings?startDate=" + startDate + "&endDate=" + endDate).then(function (resp) {
            $scope.bookings = resp.data;
            $(document).ready(function () {
                bookingTable = $('#bookingTable').DataTable({
                    language: {
                        url: '//cdn.datatables.net/plug-ins/1.13.4/i18n/vi.json',
                    },
                    dom: 't<"row"<"col-sm-12 col-md-5"i><"col-sm-12 col-md-7"p>>',
                    columnDefs: [
                        {
                            type: "num",
                            targets: 0
                        }
                    ],
                });
                $('#search-datatable-booking').keyup(function () {
                    bookingTable.search($(this).val()).draw();
                });
            });
            $(document).ready(function () {
                confirmedTable = $('#confirmedTable').DataTable({
                    language: {
                        url: '//cdn.datatables.net/plug-ins/1.13.4/i18n/vi.json',
                    },
                    dom: 't<"row"<"col-sm-12 col-md-5"i><"col-sm-12 col-md-7"p>>',
                    columnDefs: [
                        {
                            type: "num",
                            targets: 0
                        }
                    ],
                });
                $('#search-datatable-confirmBooking').keyup(function () {
                    confirmedTable.search($(this).val()).draw();
                });
            });
            $(document).ready(function () {
                pendingTable = $('#pendingTable').DataTable({
                    language: {
                        url: '//cdn.datatables.net/plug-ins/1.13.4/i18n/vi.json',
                    },
                    dom: 't<"row"<"col-sm-12 col-md-5"i><"col-sm-12 col-md-7"p>>',
                    columnDefs: [
                        {
                            type: "num",
                            targets: 0
                        }
                    ],
                });
                $('#search-datatable-pendingBooking').keyup(function () {
                    pendingTable.search($(this).val()).draw();
                });
            });
            $scope.loading = false;
        }).catch(function (error) {
            console.error('Error fetching data:', error);
            $scope.loading = false;
        });

        $http.get("http://localhost:8000/api/room-types").then(function (resp) {
            $scope.roomTypes = resp.data;
        }).catch(function (error) {
            console.error('Error fetching data room type:', error);
        });

        $http.get("http://localhost:8000/api/customers/in-use").then(function (resp) {
            $scope.customersInUse = resp.data;
            $scope.customersInUse.reverse();
            $(document).ready(function () {
                customerTable = $('#customerTable').DataTable({
                    language: {
                        url: '//cdn.datatables.net/plug-ins/1.13.4/i18n/vi.json',
                    },
                    dom: 't<"row"<"col-sm-12 col-md-5"i><"col-sm-12 col-md-7"p>>'
                });
                $('#search-datatable-customer').keyup(function () {
                    customerTable.search($(this).val()).draw();
                });
            });
        }).catch(function (error) {
            console.error('Error fetching data:', error);
        });

    }
    $scope.init();

    $scope.closeModal = function () {
        $scope.showHistory = false;
        $scope.showAddRoom = false;
        $scope.showEditBkd = false;
        $scope.addBookings = [];
        $scope.showAlert = false;
        $scope.addRoom.checkinDate = null;
        $scope.addRoom.checkoutDate = null;
    }

    $scope.viewCustomer = function (customer) {
        $('#customer-modal').modal('show');
        $scope.selectedCustomer = customer;
        $http.get("http://localhost:8000/api/invoices/count-by-customer/" + $scope.selectedCustomer.peopleId).then(function (resp) {
            $scope.numInvoicesOfCus = resp.data;
        });
        $scope.frontIdCardUrl = "http://localhost:8000/images/" + $scope.selectedCustomer.frontIdCard;
        $scope.backIdCardUrl = "http://localhost:8000/images/" + $scope.selectedCustomer.backIdCard;
    };

    $scope.setFalseAllTable = function () {
        $scope.showBookingTable = false;
        $scope.showCustomerTable = false;
        $scope.showConfirmedTable = false;
        $scope.showPendingTable = false;
    }

    $scope.resetAllCard = function () {
        var cards = document.querySelectorAll('.card.booking-header');
        for (var i = 0; i < cards.length; i++) {
            cards[i].style.backgroundColor = 'white';
            cards[i].style.color = 'black';
        }
    }

    $scope.toggleTable = function (tableId) {
        $scope.setFalseAllTable();
        switch (tableId) {
            case 'bookingTable':
                $scope.currentTable = 0;
                $scope.showBookingTable = true;
                $scope.resetAllCard();
                var card = document.querySelector('.card.booking-header.booking');
                card.style.backgroundColor = '#0d6efd';
                card.style.color = 'white';
                break;
            case 'customerTable':
                $scope.currentTable = 1;
                $scope.showCustomerTable = true;
                $scope.resetAllCard();
                var card = document.querySelector('.card.booking-header.customer');
                card.style.backgroundColor = '#6c757d';
                card.style.color = 'white';
                break;
            case 'confirmedTable':
                $scope.currentTable = 2;
                $scope.showConfirmedTable = true;
                $scope.resetAllCard();
                var card = document.querySelector('.card.booking-header.confirmed');
                card.style.backgroundColor = '#198754';
                card.style.color = 'white';
                break;
            case 'pendingTable':
                $scope.currentTable = 3;
                $scope.showPendingTable = true;
                $scope.resetAllCard();
                var card = document.querySelector('.card.booking-header.pending');
                card.style.backgroundColor = '#dc3545';
                card.style.color = 'white';
                break;
        }
    };

    $scope.showHistoryCard = function () {
        $scope.showHistory = true;
    };

    $scope.hideHistoryCard = function () {
        $scope.showHistory = false;
    };

    $scope.hideAddRoom = function () {
        $scope.showAddRoom = false;
    };

    $scope.viewBooking = function (booking) {
        $scope.loading = true;
        $scope.showHistory = false;
        $scope.currentBooking = booking;
        $http.get("http://localhost:8000/api/bookings/" + booking.code).then(function (resp) {
            $scope.bookingInfo = resp.data;
            for (var i = 0; i < $scope.bookingInfo.bkList.length; i++) {
                var bk = $scope.bookingInfo.bkList[i];
                bk.checkinExpected = new Date(bk.checkinExpected);
                bk.checkoutExpected = new Date(bk.checkoutExpected);
            }
            $('#booking-modal').modal('show');

            $scope.loading = false;
        }).catch(function (error) {
            console.error('Error fetching data:', error);
            $scope.loading = false;
        });

        $http.get("http://localhost:8000/api/booking-histories/" + booking.code).then(function (resp) {
            $scope.bookingHistory = resp.data;
            for (var i = 0; i < $scope.bookingHistory.length; i++) {
                for (var j = 0; j < $scope.bookingHistory[i].bkdhList.length; j++) {
                    var bk = $scope.bookingHistory[i].bkdhList[j];
                    bk.checkinExpected = new Date(bk.checkinExpected);
                    bk.checkoutExpected = new Date(bk.checkoutExpected);
                }
            }
        }).catch(function (error) {
            console.error('Error fetching data:', error);
        });
    };

    $scope.viewPendingBooking = function (booking) {
        $scope.loading = true;
        $scope.currentBooking = booking;
        $http.get("http://localhost:8000/api/bookings/" + booking.code).then(function (resp) {
            $scope.pendingBooking = resp.data;
            for (var i = 0; i < $scope.pendingBooking.bkList.length; i++) {
                var bk = $scope.pendingBooking.bkList[i];
                $scope.pendingBooking.checkinDate = new Date(bk.checkinExpected);
                $scope.pendingBooking.checkoutDate = new Date(bk.checkoutExpected);
                $scope.pendingBooking.roomType = bk.room.roomType.name;
            }

            $http.get('http://localhost:8000/api/bookings/info', {
                params: {
                    checkinDate: $filter('date')($scope.pendingBooking.checkinDate, 'dd-MM-yyyy'),
                    checkoutDate: $filter('date')($scope.pendingBooking.checkoutDate, 'dd-MM-yyyy'),
                    roomType: $scope.pendingBooking.roomType,
                }
            }).then(function (response) {
                $scope.listRoomForPendingBooking = response.data;
                console.log($scope.listRoomForPendingBooking);
                console.log($scope.pendingBooking.bkList);
                $scope.pending = [];
                for (var i = 0; i < $scope.pendingBooking.bkList.length; i++) {
                    var room = $scope.pendingBooking.bkList[i].room;
                    for (var j = 0; j < $scope.listRoomForPendingBooking.length; j++) {
                        var roomType = $scope.listRoomForPendingBooking[j].name;
                        var rooms = $scope.listRoomForPendingBooking[j].listRooms;
                        var count = 0;
                        for (var k = 0; k < rooms.length; k++) {
                            if (rooms[k].id == room.id) {
                                count++;
                                var check = false;
                                for (var l = 0; l < $scope.pending.length; l++) {
                                    if ($scope.pending[l].roomType == roomType) {
                                        check = true;
                                        $scope.pending[l].number += count;
                                        break;
                                    }
                                }
                                if (!check) {
                                    $scope.pending.push({
                                        roomType: roomType,
                                        number: count,
                                        rooms: rooms
                                    });
                                }
                            }
                        }
                    }
                }
                $scope.loading = false;
            }).catch(function (error) {
                console.error('Error fetching data:', error);
                $scope.loading = false;
            });

            $('#pending-booking-modal').modal('show');
            $scope.loading = false;
        }).catch(function (error) {
            console.error('Error fetching data:', error);
            $scope.loading = false;
        });

    };

    $scope.addRoom = function () {
        $scope.addRoom.adults = 2;
        $scope.addRoom.children = 0;
        $scope.showAddRoom = true;
    };

    $scope.clearDataTable = function () {
        $scope.showAlert = false;
        $scope.addBookings = [];
    };

    $scope.checkRoom = function () {

        var today = new Date();

        if ($scope.addRoom.roomType === undefined) {
            $scope.addRoom.roomType = '';
        }

        if ($scope.addRoom.checkinDate == null || $scope.addRoom.checkoutDate == null) {
            alert('Hãy chọn ngày check-in, check-out!.');
        } else if ($scope.addRoom.checkinDate < today.setDate(today.getDate() - 1)) {
            alert('Ngày check-in được tính từ ngày hôm nay.');
        } else if ($scope.addRoom.checkoutDate <= $scope.addRoom.checkinDate) {
            alert('Ngày check-out phỉa sau ngày check-in.');
        } else {
            $scope.loading = true;
            $http.get('http://localhost:8000/api/bookings/info', {
                params: {
                    checkinDate: $filter('date')($scope.addRoom.checkinDate, 'dd-MM-yyyy'),
                    checkoutDate: $filter('date')($scope.addRoom.checkoutDate, 'dd-MM-yyyy'),
                    roomType: $scope.addRoom.roomType
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
                $scope.loading = false;
            }).catch(function (error) {
                console.error('Error fetching data:', error);
                $scope.loading = false;
            });
        }
    };

    $scope.updateSelectedRooms = function (info) {
        $scope.totalPrice = 0;
        $scope.rooms = [];
        var numAdults = $scope.booking.adults;
        var numChildren = $scope.booking.children;
        var maxAdults = 0;
        var maxChildren = 0;
        var selectedCount = 0;
        angular.forEach(info.listRooms, function (room) {
            if (room.selected) {
                selectedCount++;
            }
        });
        info.roomCount = selectedCount;
        for (var i = 0; i < $scope.addBookings.length; i++) {
            var infoBook = $scope.addBookings[i];
            for (var j = 0; j < infoBook.listRooms.length; j++) {
                var room = infoBook.listRooms[j];
                if (room.selected) {
                    maxAdults += room.roomType.numAdults;
                    maxChildren += room.roomType.numChilds;
                    if (infoBook.newPrice != undefined) {
                        $scope.totalPrice += infoBook.newPrice;
                        room.roomType.price = infoBook.newPrice;
                    } else {
                        $scope.totalPrice += room.roomType.price;
                    }
                    $scope.rooms.push(room);
                }
            }
        }
        if (numAdults > maxAdults && numChildren > maxChildren) {
            $scope.showAlert = true;
            $scope.alertMessage = 'Đã chọn ' + $scope.rooms.length + ' phòng. Bạn cần chọn thêm cho ' + (numAdults - maxAdults) + ' người lớn và ' + (numChildren - maxChildren) + ' trẻ em nữa!';
        } else if (numAdults > maxAdults) {
            $scope.showAlert = true;
            $scope.alertMessage = 'Đã chọn ' + $scope.rooms.length + ' phòng. Bạn cần chọn thêm cho ' + (numAdults - maxAdults) + ' người lớn nữa!';
        } else if (numChildren > maxChildren) {
            $scope.showAlert = true;
            $scope.alertMessage = 'Đã chọn ' + $scope.rooms.length + ' phòng. Bạn cần chọn thêm cho ' + (numChildren - maxChildren) + ' trẻ em nữa!';
        }
        else {
            $scope.showAlert = true;
            $scope.alertMessage = 'Đã chọn ' + $scope.rooms.length + ' phòng đáp ứng đủ số lượng khách!';
        }
    };

    $scope.addRoomToBooking = function () {

        if ($scope.rooms.length == 0) {
            alert("Vui lòng chọn phòng!");
            return;
        }

        var note = prompt("Nhập ghi chú và xác nhận thêm phòng vào " + $scope.currentBooking.code);
        if (note == '' || note == null || note == 'undefined') {
            return;
        }

        $scope.loading = true;

        var formData = new FormData();

        const bookingDetailJson = JSON.stringify({
            bookingCode: $scope.currentBooking.code,
            bookingDetailCode: "",
            checkinExpected: $filter('date')($scope.addRoom.checkinDate, 'dd-MM-yyyy'),
            checkoutExpected: $filter('date')($scope.addRoom.checkoutDate, 'dd-MM-yyyy'),
            note: note,
            numAdults: $scope.addRoom.adults,
            numChilds: $scope.addRoom.children,
            rooms: $scope.rooms.map(room => {
                const { selected, $$hashKey, ...cleanedRoom } = room;
                return cleanedRoom;
            }),
        });

        formData.append('bookingDetailReq', bookingDetailJson);

        $http.post('http://localhost:8000/api/booking-details/add-bkd', formData, {
            transformRequest: angular.identity,
            headers: {
                'Content-Type': undefined
            }
        }).then(function (response) {
            if (response.status == 200) {
                alert('Thêm phòng thành công!');
                $scope.showAddRoom = false;
                $scope.viewBooking($scope.currentBooking);
                $scope.addRoom.checkinDate = null;
                $scope.addRoom.checkoutDate = null;
                $scope.clearDataTable();
                $scope.loading = false;
            }
        }).catch(function (error) {
            if (error.data && error.data.error) {
                alert(error.data.error);
                $scope.loading = false;
            } else {
                console.error('Error fetching data:', error);
            }
        });
    }

    $scope.openEditBkd = function (id) {
        $scope.loading = true;
        $http.get('http://localhost:8000/api/booking-details/get-info/' + id).then(function (response) {
            $scope.bookingDetail = response.data;
            $scope.bookingDetail.checkin_expected = new Date($scope.bookingDetail.checkin_expected);
            $scope.bookingDetail.checkout_expected = new Date($scope.bookingDetail.checkout_expected);
            $scope.loading = false;
        }).catch(function (error) {
            console.error('Error fetching data:', error);
            $scope.loading = false;
        });
        $scope.showEditBkd = true;
    };

    $scope.hideEditBkd = function () {
        $scope.showEditBkd = false;
    };

    $scope.changeDay = function () {
        $scope.listRoomEditBkd = [];
        $scope.showListRoomEditBkd = false;
    }

    $scope.checkRoomEditBkd = function () {

        $scope.loading = true;
        $http.get('http://localhost:8000/api/booking-details/get-room-by-type', {
            params: {
                bookingCode: $scope.bookingInfo.code,
                roomCode: $scope.bookingDetail.roomCode,
                checkin: $filter('date')($scope.bookingDetail.checkin_expected, 'dd-MM-yyyy'),
                checkout: $filter('date')($scope.bookingDetail.checkout_expected, 'dd-MM-yyyy'),
                roomType: $scope.bookingDetail.type,
            }
        }).then(function (response) {
            $scope.listRoomEditBkd = response.data;
            if ($scope.listRoomEditBkd.length == 0) {
                alert('Không có phòng trống trong khoảng thời gian này!');
            } else {
                $scope.showListRoomEditBkd = true;
            }

            $scope.loading = false;
        }).catch(function (error) {
            console.error('Error fetching data:', error);
            $scope.loading = false;
        });

    };

    $scope.editBkd = function () {
        var today = new Date();
        if ($scope.bookingDetail.checkin_expected == null || $scope.bookingDetail.checkout_expected == null) {
            alert('Hãy chọn ngày check-in, check-out!.');
        } else if ($scope.bookingDetail.checkin_expected < today.setDate(today.getDate() - 1)) {
            alert('Ngày check-in được tính từ ngày hôm nay.');
        } else if ($scope.bookingDetail.checkout_expected <= $scope.bookingDetail.checkin_expected) {
            alert('Ngày check-out phỉa sau ngày check-in.');
        } else {

            var note = prompt("Nhập lí do và xác chỉnh sửa thông tin booking " + $scope.currentBooking.code);
            if (note == '' || note == null || note == 'undefined') {
                return;
            }
            $scope.loading = true;
            var formData = new FormData();
            var rooms = [
                $scope.bookingDetail.roomSelected
            ];

            const bookingDetailJson = JSON.stringify({
                bookingCode: $scope.currentBooking.code,
                bookingDetailCode: $scope.bookingDetail.bkdCode,
                checkinExpected: $filter('date')($scope.bookingDetail.checkin_expected, 'dd-MM-yyyy'),
                checkoutExpected: $filter('date')($scope.bookingDetail.checkout_expected, 'dd-MM-yyyy'),
                note: $scope.bookingDetail.note + ' - Cập nhật: ' + note + ", " + $scope.bookingDetail.moreNote,
                numAdults: 0,
                numChilds: 0,
                rooms: rooms.map(room => {
                    const { selected, $$hashKey, ...cleanedRoom } = room;
                    return cleanedRoom;
                }),
            });

            formData.append('bookingDetailReq', bookingDetailJson);

            $http.post('http://localhost:8000/api/booking-details/edit-bkd', formData, {
                transformRequest: angular.identity,
                headers: {
                    'Content-Type': undefined
                }
            }).then(function (response) {
                if (response.status == 200) {
                    alert('Chỉnh sửa thành công!');
                    $scope.showEditBkd = false;
                    $scope.viewBooking($scope.currentBooking);
                    $scope.bookingDetail.checkin_expected = null;
                    $scope.bookingDetail.checkout_expected = null;
                    $scope.showListRoomEditBkd = false;
                    $scope.loading = false;
                }
            }).catch(function (error) {
                if (error.data && error.data.error) {
                    alert(error.data.error);
                    $scope.loading = false;
                } else {
                    alert('Chỉnh sửa thất bại!');
                    console.error('Error fetching data:', error);
                    $scope.loading = false;
                }
            });

        }

    };

    $scope.deleteRoom = function (id) {

        var reason = prompt("Nhập lý do và xác nhận bỏ phòng");
        if (reason == '' || reason == null || reason == 'undefined') {
            return;
        }

        $scope.loading = true;

        $http.post('http://localhost:8000/api/booking-details/delete-bkd', {
            id: id,
            reason: reason
        }).then(function (response) {
            if (response.status == 200) {
                alert('Bỏ phòng thành công!');
                $scope.viewBooking($scope.currentBooking);
            }
        }).catch(function (error) {
            if (error.data && error.data.error) {
                alert(error.data.error);
                $scope.loading = false;
            } else {
                alert('Chỉnh sửa thất bại!');
                console.error('Error fetching data:', error);
                $scope.loading = false;
            }
        });

    };

    $scope.getSelectedRoomPending = function () {
        var selectedRooms = [];
        $scope.pendingRoom = true;
        for (var i = 0; i < $scope.pending.length; i++) {
            var bk = $scope.pending[i];
            var roomList = bk.rooms.filter(function (room) {
                return room.selected;
            }).map(function (room) {
                return room;
            });
            selectedRooms.push({
                roomType: bk.roomType,
                rooms: roomList
            });
            if (roomList.length > bk.number) {
                $scope.pendingRoom = false;
                alert('Số lượng phòng đã chọn vượt quá số lượng phòng đã đặt! Vui lòng kiểm tra lại.');
                return;
            }
            if (roomList.length < bk.number) {
                $scope.pendingRoom = false;
            }
        }
        $scope.roomsSelected = selectedRooms;
    };


    $scope.confirmBooking = function () {

        if ($scope.roomsSelected == null || $scope.roomsSelected.length == 0) {
            alert('Hãy chọn phòng!');
            return;
        }

        if (!$scope.pendingRoom) {
            alert('Số lượng phòng đã chọn chưa khớp! Vui lòng kiểm tra lại.');
            return;
        }

        var r = confirm("Xác nhận Booking " + $scope.currentBooking.code);
        if (r != true) {
            return;
        }

        const bookingConfirmJson = JSON.stringify({
            bookingCode: $scope.currentBooking.code,
            note: $scope.currentBooking.note,
            rooms: $scope.roomsSelected.reduce((accumulator, currentValue) => {
                return accumulator.concat(currentValue.rooms.map(({ selected, $$hashKey, ...room }) => room));
            }, []),
        });

        const formData = new FormData();
        formData.append('bookingConfirmJson', bookingConfirmJson);

        $http.post('http://localhost:8000/api/booking-online/confirm', formData, {
            transformRequest: angular.identity,
            headers: {
                'Content-Type': undefined
            }
        }).then(function (response) {
            if (response.status == 200) {
                alert('Xác nhận booking thành công!');
                $scope.loading = false;
                $window.location.reload();
            }
        }).catch(function (error) {
            if (error.data && error.data.error) {
                alert(error.data.error);
                $scope.loading = false;
            } else {
                alert('Xác nhận booking thất bại!');
                console.error('Error fetching data:', error);
                $scope.loading = false;
            }
        });
    }

    $scope.cancelBooking = function () {
        var reason = prompt("Nhập lý do và xác nhận huỷ booking " + $scope.currentBooking.code);
        if (reason == '' || reason == null || reason == 'undefined') {
            return;
        }
        $scope.currentBooking.note = $scope.currentBooking.note + " ----- Lí do huỷ: "
            + reason;
        $scope.loading = true;

        const data = {
            code: $scope.currentBooking.code,
            note: $scope.currentBooking.note
        };
        $scope.clearTableBooking();
        $http.put("http://localhost:8000/api/bookings/cancel", data).then(function (resp) {
            $scope.init();
            $('#booking-modal').modal('hide');
            alert('Huỷ booking thành công!');
            $scope.loading = false;
        }).catch(function (error) {
            console.error('Error fetching data:', error);
        });
    };

});

app.controller("createBookingCtrl", function ($scope, $http, $location, $filter) {

    $scope.bookings = [];
    $scope.booking = {};
    $scope.booking.adults = 2;
    $scope.booking.children = 0;
    $scope.customer = {};
    $scope.frontIdResp = {};
    $scope.loading = false;
    $scope.currentSection = 0;
    $scope.rooms = [];
    $scope.finalRooms = [];
    $scope.totalPrice = 0;
    $scope.frontIdCardBase64 = null;
    $scope.backIdCardBase64 = null;
    $scope.frontIdCardDisplay = null;
    $scope.backIdCardDisplay = null;
    $scope.isFrontImageCaptured = false;
    $scope.bookingByRangeDay = [];
    $scope.numRoomPending = [];
    $scope.checkNumberRoomPending = true;

    $scope.closeDropdown = function () {
        $('.dropdown-menu').removeClass('show');
    };

    $scope.nextSection = function () {
        if ($scope.currentSection == 0) {
            if ($scope.bookingByRangeDay.length == 0) {
                alert("Vui lòng chọn phòng!");
                return;
            }
            if ($scope.checkNumberRoomPending == false) {
                alert("Vui lòng kiểm tra lại số lượng phòng đặt!");
                return;
            }
        }
        // if ($scope.currentSection == 1) {
        //     if ($scope.frontIdCardDisplay == null
        //         || $scope.backIdCardDisplay == null
        //         || $scope.customer.phoneNumber == null
        //         || $scope.customer.email == null) {
        //         alert("Vui lòng nhập đủ thông tin khách hàng!");
        //         return;
        //     }
        // }
        $scope.currentSection++;
    };

    $scope.prevSection = function () {
        $scope.currentSection--;
    };

    $scope.init = function () {
        //room type
        $http.get("http://localhost:8000/api/room-types").then(function (resp) {
            $scope.roomTypes = resp.data;
        }).catch(function (error) {
            console.error('Error fetching data room type:', error);
        });

        //payment
        $http.get("http://localhost:8000/api/payment-methods").then(function (resp) {
            $scope.paymentMethods = resp.data;
        }).catch(function (error) {
            console.error('Error fetching data payment method:', error);
        });

    }
    $scope.init();

    $scope.clearDataTable = function () {
        $scope.showAlert = false;
        $scope.bookings = [];
    };

    $scope.checkRoom = function () {

        var today = new Date();

        if ($scope.booking.roomType === undefined || $scope.booking.roomType === null) {
            $scope.booking.roomType = '';
        }

        if ($scope.booking.checkinDate == null || $scope.booking.checkoutDate == null) {
            alert('Hãy chọn ngày check-in, check-out!.');
        } else if ($scope.booking.checkinDate < today.setDate(today.getDate() - 1)) {
            alert('Ngày check-in được tính từ ngày hôm nay.');
        } else if ($scope.booking.checkoutDate <= $scope.booking.checkinDate) {
            alert('Ngày check-out phải sau ngày check-in.');
        } else {
            $scope.loading = true;

            $http.get('http://localhost:8000/api/bookings/info', {
                params: {
                    checkinDate: $filter('date')($scope.booking.checkinDate, 'dd-MM-yyyy'),
                    checkoutDate: $filter('date')($scope.booking.checkoutDate, 'dd-MM-yyyy'),
                    roomType: $scope.booking.roomType
                }
            }).then(async function (response) {
                $scope.bookings = response.data;

                await $http.get("http://localhost:8000/api/booking-online/get-number-room/pending", {
                    params: {
                        checkinDate: $filter('date')($scope.booking.checkinDate, 'dd-MM-yyyy'),
                        checkoutDate: $filter('date')($scope.booking.checkoutDate, 'dd-MM-yyyy'),
                    }
                }).then(function (resp) {
                    $scope.numRoomPending = resp.data;
                }).catch(function (error) {
                    console.error('Error fetching data payment method:', error);
                });

                for (var i = 0; i < $scope.bookings.length; i++) {

                    for (var j = 0; j < $scope.numRoomPending.length; j++) {
                        if ($scope.bookings[i].name == $scope.numRoomPending[j].type) {
                            $scope.bookings[i].quantity = $scope.bookings[i].quantity - $scope.numRoomPending[j].numberPending;
                        }
                    }

                    if ($scope.bookings[i].promotion != null) {
                        var percent = $scope.bookings[i].promotion.percent;
                        var price = $scope.bookings[i].price;
                        var maxDiscount = $scope.bookings[i].promotion.maxDiscount;

                        $scope.bookings[i].newPrice = price * (100 - percent) / 100;
                        if ((percent / 100 * price) > maxDiscount) {
                            $scope.bookings[i].newPrice = price - maxDiscount;
                        }
                    }
                }
                if ($scope.bookings.length == 0) {
                    alert('Không có phòng hợp lệ.');
                }
                $scope.loading = false;
            }).catch(function (error) {
                console.error('Error fetching data:', error);
                $scope.loading = false;
            });
        }
    };

    $scope.addAnotherRangeDay = function () {

        if ($scope.rooms.length == 0) {
            alert("Vui lòng chọn phòng!");
            return;
        }

        var isExist = false;
        for (var i = 0; i < $scope.bookingByRangeDay.length; i++) {
            if (new Date($scope.bookingByRangeDay[i].checkinDate).getTime() === new Date($scope.booking.checkinDate).getTime()
                && new Date($scope.bookingByRangeDay[i].checkoutDate).getTime() === new Date($scope.booking.checkoutDate).getTime()) {
                for (var j = 0; j < $scope.rooms.length; j++) {
                    var isExistRoom = false;
                    for (var k = 0; k < $scope.bookingByRangeDay[i].rooms.length; k++) {
                        if ($scope.bookingByRangeDay[i].rooms[k].id == $scope.rooms[j].id) {
                            isExistRoom = true;
                            break;
                        }
                    }
                    if (isExistRoom == false) {
                        $scope.bookingByRangeDay[i].rooms.push($scope.rooms[j]);
                    }
                }
                isExist = true;
                break;
            }
        }
        if (isExist) {
            alert('Ngày check-in, check-out đã tồn tại, phòng sẽ được cộng dồn.');
            $scope.booking.checkinDate = null;
            $scope.booking.checkoutDate = null;
            $scope.booking.adults = 2;
            $scope.booking.children = 0;
            $scope.rooms = [];
            $scope.clearDataTable();
            return;
        }

        for (var i = 0; i < $scope.bookingByRangeDay.length; i++) {
            if ($scope.booking.checkinDate >= $scope.bookingByRangeDay[i].checkinDate
                && $scope.booking.checkinDate <= $scope.bookingByRangeDay[i].checkoutDate
                || $scope.booking.checkoutDate >= $scope.bookingByRangeDay[i].checkinDate
                && $scope.booking.checkoutDate <= $scope.bookingByRangeDay[i].checkoutDate
                || $scope.booking.checkinDate <= $scope.bookingByRangeDay[i].checkinDate
                && $scope.booking.checkoutDate >= $scope.bookingByRangeDay[i].checkoutDate
            ) {
                for (var j = 0; j < $scope.rooms.length; j++) {
                    var isExistRoom = false;
                    for (var k = 0; k < $scope.bookingByRangeDay[i].rooms.length; k++) {
                        if ($scope.bookingByRangeDay[i].rooms[k].id == $scope.rooms[j].id) {
                            isExistRoom = true;
                            break;
                        }
                    }
                    if (isExistRoom) {
                        alert('Phòng đã được chọn trong một khoảng ngày có thời gian trùng với khoảng ngày mới. Vui lòng chọn lại phòng khác.');
                        return;
                    }
                }
            }
        }

        $scope.finalRooms = [];

        if (typeof $scope.booking.checkinDate === 'string' && /\d{2}-\d{2}-\d{4}/.test($scope.booking.checkinDate)) {
            var parts = $scope.booking.checkinDate.split('-');
            $scope.booking.checkinDate = new Date(parts[2], parts[1] - 1, parts[0]);
        }

        if (typeof $scope.booking.checkoutDate === 'string' && /\d{2}-\d{2}-\d{4}/.test($scope.booking.checkoutDate)) {
            var parts = $scope.booking.checkoutDate.split('-');
            $scope.booking.checkoutDate = new Date(parts[2], parts[1] - 1, parts[0]);
        }

        $scope.bookingByRangeDay.push({
            id: $scope.bookingByRangeDay.length + 1,
            checkinDate: $scope.booking.checkinDate,
            checkoutDate: $scope.booking.checkoutDate,
            numAdults: $scope.booking.adults,
            numChildren: $scope.booking.children,
            rooms: $scope.rooms
        });

        $scope.finalRooms = $scope.bookingByRangeDay.flatMap(function (bookingDetailRangeDay) {
            return bookingDetailRangeDay.rooms.map(function (room) {
                return {
                    checkinDate: bookingDetailRangeDay.checkinDate,
                    checkoutDate: bookingDetailRangeDay.checkoutDate,
                    numAdults: bookingDetailRangeDay.numAdults,
                    numChildren: bookingDetailRangeDay.numChildren,
                    room: room
                };
            });
        });

        $scope.totalPrice = $scope.finalRooms.map(function (room) {
            return room.room.roomType.price * (room.checkoutDate - room.checkinDate) / (1000 * 60 * 60 * 24);
        }).reduce(function (a, b) {
            return a + b;
        }, 0);

        $scope.booking.checkinDate = null;
        $scope.booking.checkoutDate = null;
        $scope.booking.adults = 2;
        $scope.booking.children = 0;
        $scope.rooms = [];
        $scope.clearDataTable();
    }

    $scope.isRoomSelected = function (room, rooms) {
        for (var i = 0; i < rooms.length; i++) {
            if (rooms[i].id === room.id) {
                return true;
            }
        }
        return false;
    };

    $scope.editBookingRangeDay = function (id) {

        for (var i = 0; i < $scope.bookingByRangeDay.length; i++) {
            if ($scope.bookingByRangeDay[i].id == id) {
                $scope.booking.checkinDate = $filter('date')($scope.bookingByRangeDay[i].checkinDate, 'dd-MM-yyyy');
                $scope.booking.checkoutDate = $filter('date')($scope.bookingByRangeDay[i].checkoutDate, 'dd-MM-yyyy');
                $scope.booking.adults = $scope.bookingByRangeDay[i].numAdults;
                $scope.booking.children = $scope.bookingByRangeDay[i].numChildren;
                $scope.rooms = $scope.bookingByRangeDay[i].rooms;
                $scope.bookingByRangeDay.splice(i, 1);
                $scope.checkRoom();
                break;
            }
        }
    }

    $scope.deleteBookingRangeDay = function (id) {

        var r = confirm("Xác nhận bỏ?");
        if (r != true) {
            return;
        }

        for (var i = 0; i < $scope.bookingByRangeDay.length; i++) {
            if ($scope.bookingByRangeDay[i].id == id) {
                $scope.bookingByRangeDay.splice(i, 1);
                break;
            }
        }
        $scope.finalRooms = $scope.bookingByRangeDay.flatMap(function (bookingDetailRangeDay) {
            return bookingDetailRangeDay.rooms.map(function (room) {
                return {
                    checkinDate: bookingDetailRangeDay.checkinDate,
                    checkoutDate: bookingDetailRangeDay.checkoutDate,
                    numAdults: bookingDetailRangeDay.numAdults,
                    numChildren: bookingDetailRangeDay.numChildren,
                    room: room
                };
            });
        });

        $scope.totalPrice = $scope.finalRooms.map(function (room) {
            return room.room.roomType.price * (room.checkoutDate - room.checkinDate) / (1000 * 60 * 60 * 24);
        }).reduce(function (a, b) {
            return a + b;
        }, 0);
    }

    $scope.showDetailRoomType = function (roomType) {
        $scope.currentRoomType = roomType;
        $('#room-type-modal').modal('show');
    };

    $scope.updateSelectedRooms = function (info) {

        $scope.checkNumberRoomPending = true;
        $scope.rooms = [];
        var inforRoomSelected = [];
        var numAdults = $scope.booking.adults;
        var numChildren = $scope.booking.children;
        var maxAdults = 0;
        var maxChildren = 0;
        var selectedCount = 0;
        angular.forEach(info.listRooms, function (room) {
            if (room.selected) {
                selectedCount++;
            }
        });
        info.roomCount = selectedCount;
        for (var i = 0; i < $scope.bookings.length; i++) {
            var infoBook = $scope.bookings[i];
            for (var j = 0; j < infoBook.listRooms.length; j++) {
                var room = infoBook.listRooms[j];
                if (room.selected) {
                    maxAdults += room.roomType.numAdults;
                    maxChildren += room.roomType.numChilds;
                    if (infoBook.newPrice != undefined) {
                        room.roomType.price = infoBook.newPrice;
                    }
                    $scope.rooms.push(room);
                }
            }
        }
        $scope.rooms.forEach(async function (room) {
            await $http.get('http://localhost:8000/api/rooms/get-name-type/' + room.code).then(function (response) {

                var isExist = false;
                for (var i = 0; i < inforRoomSelected.length; i++) {
                    if (inforRoomSelected[i].type == response.data.type) {
                        inforRoomSelected[i].number++;
                        isExist = true;
                        break;
                    }
                }
                if (!isExist) {
                    inforRoomSelected.push({
                        number: 1,
                        type: response.data.type
                    });
                }
            }).catch(function (error) {
                console.error('Error fetching data:', error);
            });
        });

        console.log(info);
        console.log(inforRoomSelected);

        if (info.roomCount > info.quantity) {
            alert('Số phòng ' + info.name + ' đã chọn vượt quá số phòng còn lại! Vui lòng kiểm tra lại!');
            $scope.checkNumberRoomPending = false;
            return;
        }

        if (numAdults > maxAdults && numChildren > maxChildren) {
            $scope.showAlert = true;
            $scope.alertMessage = 'Đã chọn ' + $scope.rooms.length + ' phòng. Bạn cần chọn thêm cho ' + (numAdults - maxAdults) + ' người lớn và ' + (numChildren - maxChildren) + ' trẻ em nữa!';
        } else if (numAdults > maxAdults) {
            $scope.showAlert = true;
            $scope.alertMessage = 'Đã chọn ' + $scope.rooms.length + ' phòng. Bạn cần chọn thêm cho ' + (numAdults - maxAdults) + ' người lớn nữa!';
        } else if (numChildren > maxChildren) {
            $scope.showAlert = true;
            $scope.alertMessage = 'Đã chọn ' + $scope.rooms.length + ' phòng. Bạn cần chọn thêm cho ' + (numChildren - maxChildren) + ' trẻ em nữa!';
        }
        else {
            $scope.showAlert = true;
            $scope.alertMessage = 'Đã chọn ' + $scope.rooms.length + ' phòng đáp ứng đủ số lượng khách!';
        }
    };

    $scope.getBookings = function () {

        var r = confirm("Xác nhận đặt phòng?");
        if (r != true) {
            return;
        }

        $scope.loading = true;

        var formData = new FormData();

        var binaryFront = atob($scope.frontIdCardBase64);
        var arrayFront = [];
        for (var i = 0; i < binaryFront.length; i++) { arrayFront.push(binaryFront.charCodeAt(i)); }
        var blobFront = new Blob([new Uint8Array(arrayFront)], { type: 'image/jpeg' });

        var binaryBack = atob($scope.backIdCardBase64);
        var arrayBack = [];
        for (var i = 0; i < binaryBack.length; i++) { arrayBack.push(binaryBack.charCodeAt(i)); }
        var blobBack = new Blob([new Uint8Array(arrayBack)], { type: 'image/jpeg' });

        var dateOfBirth = $scope.customer.dateOfBirth;
        var dateOfBirthArray = dateOfBirth.split('/');
        var dateOfBirthString = dateOfBirthArray[0] + '-' + dateOfBirthArray[1] + '-' + dateOfBirthArray[2];
        $scope.customer.dateOfBirth = dateOfBirthString;

        const bookingReqJson = JSON.stringify({
            customer: $scope.customer,
            bookingDetailRangeDay: $scope.bookingByRangeDay.map(booking => {
                const { $$hashKey, ...cleanedBooking } = booking;
                return {
                    checkinDate: $filter('date')(booking.checkinDate, 'dd-MM-yyyy'),
                    checkoutDate: $filter('date')(booking.checkoutDate, 'dd-MM-yyyy'),
                    numAdults: booking.numAdults,
                    numChildren: booking.numChildren,
                    rooms: booking.rooms.map(room => {
                        const { selected, $$hashKey, ...cleanedRoom } = room;
                        return cleanedRoom;
                    })
                }
            }),
            paymentCode: $scope.booking.paymentMethod,
            note: $scope.booking.note
        });

        formData.append('frontIdCard', blobFront, 'frontIdCard.jpg');
        formData.append('backIdCard', blobBack, 'backIdCard.jpg');
        formData.append('bookingReq', bookingReqJson);

        $http.post('http://localhost:8000/api/bookings', formData, {
            transformRequest: angular.identity,
            headers: {
                'Content-Type': undefined
            }
        }).then(function (response) {
            if (response.status == 200) {
                alert('Đặt phòng thành công!');
                var today = $filter('date')(new Date(), 'dd-MM-yyyy');
                var found = false;
                for (var i = 0; i < $scope.bookingByRangeDay.length; i++) {
                    var checkinDate = $filter('date')($scope.bookingByRangeDay[i].checkinDate, 'dd-MM-yyyy');
                    if (checkinDate === today) {
                        found = true;
                        break;
                    }
                }
                if (found) {
                    $http.get('http://localhost:8000/api/bookings/get-by-id/' + response.data.id).then(function (response) {
                        if (response.status == 200) {
                            $location.path("/hotel-room/" + response.data.code);
                        }
                    }).catch(function (error) {
                        console.error('Error fetching data:', error);
                    });
                } else {
                    $location.path("/bookings");
                }
                $scope.loading = false;
            } else {
                alert('Đặt phòng thất bại!');
                $scope.loading = false;
            }
        }).catch(function (error) {
            if (error.data && error.data.error) {
                alert(error.data.error);
                $scope.loading = false;
            } else {
                console.error('Error fetching data:', error);
                $scope.loading = false;
            }
        });

    }

    $scope.checkCustomer = async function (peopleId) {
        $scope.loading = true;
        try {
            const response = await $http.get('http://localhost:8000/api/customers/search-by-people-id/' + peopleId);
            if (response.status == 200) {
                $scope.customer = response.data;
                $scope.customer.dateOfBirth = $filter('date')($scope.customer.dateOfBirth, 'dd-MM-yyyy');
                return true;
            }
            $scope.loading = false;
            return false;
        } catch (error) {
            console.error('Error fetching data:', error);
            $scope.loading = false;
            return false;
        }
    };

    $scope.uploadFrontIdCard = function (imageData) {

        $scope.loading = true;
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
                $scope.customer.dateOfBirth = response.data.data[0].dob;
                $scope.customer.gender = response.data.data[0].sex === 'NAM' ? true : false;
                $scope.customer.peopleId = response.data.data[0].id;
                $scope.customer.address = response.data.data[0].address;
                $scope.customer.placeOfBirth = response.data.data[0].home;
                $scope.loading = false;
                return response;
            } else {
                $scope.loading = false;
                return response;
            }
        }).catch(function (error) {
            $scope.loading = false;
            return error;
        });

    };

    $scope.uploadBackIdCard = function (imageData) {

        $scope.loading = true;
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
            $scope.loading = false;
            return response;
        }).catch(function (error) {
            $scope.loading = false;
            return error;
        });

    };

    $scope.takePicture = function () {

        navigator.mediaDevices.getUserMedia({ video: true })
            .then(function (stream) {

                var modal = document.createElement('div');
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
                        if (frontResponse != undefined && frontResponse.data != '' && frontResponse.data.data[0].id != null) {
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
                        if (backResponse.data != '' && backResponse.data.data[0].features != null) {
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

});


