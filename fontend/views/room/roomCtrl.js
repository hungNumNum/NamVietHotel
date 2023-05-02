app.controller("roomListCtrl", function ($scope, $http) {
    $scope.form = {};
    $scope.rooms = [];

    $scope.supplyRooms = [];

    $scope.bedRoom = {}
    $scope.bedRooms = [];
    $scope.imageRooms = [];

    $scope.isLoading = false;

    $scope.initialize = function () {
        $scope.isLoading = true;
        // Load data rooms
        $http.get("http://localhost:8000/api/rooms").then(resp => {
            $scope.rooms = resp.data;
            $scope.rooms.forEach(item =>{
                item.bedRooms = [];
            })
            $(document).ready(function () {
                // khởi tạo table id 'datatable-rooms'
                tableInvoiceDetailHistory = $('#datatable-rooms').DataTable({
                    language: {
                        url: '//cdn.datatables.net/plug-ins/1.13.4/i18n/vi.json',
                    },
                    dom: 't<"row"<"col-sm-12 col-md-5"i><"col-sm-12 col-md-7"p>>'
                });
                // gắn ô tìm kiếm id 'search-datatable-rooms' cho table
                $('#search-datatable-rooms').keyup(function () {
                    tableInvoiceDetailHistory.search($(this).val()).draw();
                });
            });
        }).catch(error => {
            console.log("Error", error);
        })

        // Load data bed room
        $http.get("http://localhost:8000/api/bed-rooms").then(resp => {
            $scope.bedRooms = resp.data;
            $scope.rooms.forEach(item1 =>{
                $scope.bedRooms.forEach(item2 =>{
                    if (item1.id == item2.room.id) {
                        item1.bedRooms.push(item2);
                    }
                })
            })
            $scope.isLoading = false;
        }).catch(error => {
            console.log("Error", error);
        })
    }

    $scope.loadBedRoom = function(room) {
        $scope.bedRoom = room;
        console.log($scope.bedRoom);
    }
    // Load data supply room
    $scope.loadSupplyRoom = function (codeRoom) {
        $http.get("http://localhost:8000/api/supply-rooms/" + codeRoom).then(resp => {
            $scope.supplyRooms = resp.data;
        }).catch(error => {
            console.log("Error", error);
        })
    }    

    // Load data image room
    $scope.loadImageRoom = function (codeRoom) {
        $http.get("http://localhost:8000/api/room-images/" + codeRoom).then(resp => {
            $scope.imageRooms = resp.data;
        }).catch(error => {
            console.log("Error", error);
        })
    }

    $scope.url = function(imageName){
        return `http://localhost:8000/images/${imageName}`;
    }

    $scope.roomDetail = function(room){
        $scope.room1 = room;
    }

    $scope.initialize();
});

app.controller("roomCreateFormCtrl", function ($scope, $http, $location) {
    $scope.form = {
        // number: null,
        // price: 3000000,
        // maxAdultAdd: 0,
        // maxChildAdd: 0,
        // area: 60,
        // isSmoking: true,
        // description: "No",
        // floor: {
        //     id: 1
        // },
        // roomType: {
        //     id: 5
        // },
        // status: true
    };

    $scope.formFloor = {
        code:"",
        status: true
    };

    $scope.rooms = [];
    $scope.floors = [];

    $scope.bedTypes = [];
    $scope.bedTypeSelected = [];

    // Load data room
    $scope.initialize = function () {
        //Load room type
        $http.get("http://localhost:8000/api/room-types").then(resp => {
            $scope.roomTypes = resp.data;
        }).catch(error => {
            console.log("Error", error);
        })
        //Load data floors
        $http.get("http://localhost:8000/api/floors").then(resp => {
            $scope.floors = resp.data;
        }).catch(error => {
            console.log("Error", error);
        })

        // Load data rooms
        $http.get("http://localhost:8000/api/rooms").then(resp => {
            $scope.rooms = resp.data;
        }).catch(error => {
            console.log("Error", error);
        })

        // Load data bed type
        $http.get("http://localhost:8000/api/bed-types").then(resp => {
            $scope.bedTypes = resp.data;
            $scope.bedTypes.forEach(item => {
                item.count = 0;
                item.checked = false;
            });
        }).catch(error => {
            console.log("Error", error);
        })
    }

    $scope.setCodeRoom = function(floor_id){
        $http.get("http://localhost:8000/api/rooms/set-code-room/" + floor_id).then(resp => {
            $scope.form.code = resp.data;
        }).catch(error => {
            console.log("Error", error);
        })
    }

    $scope.setCodeFloor = function () {
        var array = [];
        var max = 0;
        $scope.floors.forEach(item =>{
            max = item.code.slice(1);
            array.push(max);
        })
        max = Math.max.apply(null, array) + 1;
        $scope.formFloor.code = "T" + max.toString();
    }
    $scope.statusFloorChange = function (floor1) {
        floor1.status = !floor1.status;
        if(!floor1.status){
            $scope.rooms.forEach(item =>{
                if (floor1.id == item.floor.id && item.status != 1 && floor1.status == false) {
                    console.log(2);
                    alert("Tầng này vẫn có phòng đang hoạt động");
                    floor1.status = true;
                }
            })
        }
        $http.put("http://localhost:8000/api/floors", floor1).then(resp => {
            alert("Đổi trạng thái tầng thành công");
        }).catch(error => {
            console.log("Error", error);
        })
    }

    $scope.bedTypeSearch = function (bedType) {
        return $scope.bedTypeSelected.find(item => item.id == bedType.id)
    }

    $scope.bedTypeChanged = async function (bedType) {
        const bedType2 = $scope.bedTypeSearch(bedType);
        if (bedType2) {
            const index = $scope.bedTypeSelected.findIndex(item => item.id == bedType.id);
            $scope.bedTypeSelected.splice(index, 1);
            if (bedType.checked == true) {
                $scope.bedTypeSelected.push(bedType);
            }else {
                bedType.count = 0;
            }
        } else {
            $scope.bedTypeSelected.forEach(item =>{
                if (item.id == 5 || item.id == 6 || item.id == 7) {
                    alert("Trong phòng chỉ được tối thiểu 1 loại giường");
                    bedType.checked = false;
                }
            })
            if (bedType.checked) {
                if (bedType.id == 6 || bedType.id == 7) {
                    bedType.count = 1;
                }else {
                    bedType.count = 2;
                }
                $scope.bedTypeSelected.push(bedType);
            }
        }
    }

    $scope.createBedRoom = async function (room1) {
        if ($scope.bedTypeSelected) {
            var room = room1;
            room.numAdults = 0;
            room.numChilds = 0;
            $scope.bedTypeSelected.forEach(item => {
                var bedType = item;
                var quantityBed = item.count;
                var bedRoom = {
                    room,
                    bedType,
                    quantityBed
                }
                $http.post("http://localhost:8000/api/bed-rooms", bedRoom).then(resp => {
                }).catch(error => {
                    console.log("Error", error);
                })
                room.numAdults += bedType.maxAdults * quantityBed;
                room.numChilds += bedType.maxChilds * quantityBed;
    
                $http.put("http://localhost:8000/api/rooms", room).then(resp => {
                }).catch(error => {
                    console.log("Error", error);
                });
            });
        }
    }

    $scope.create = async function () {
        if ($scope.form.status) {
            $scope.form.status = 0;
        }else{
            $scope.form.status = 1;
        }
        var room = angular.copy($scope.form);
        await $http.post("http://localhost:8000/api/rooms", room).then(resp => { 
            $scope.createBedRoom(resp.data);
            alert("Create thành công");
            $location.path("/room");
        }).catch(error => {
            alert("Create thất bại")
            console.log("Error", error);
        })
    }

    $scope.reset = function () {
        $scope.form = {
            code: "",
            price: "",
            maxAdultAdd: "",
            maxChildAdd: "",
            area: "",
            isSmoking: true,
            description: "",
            floor: {
                id: 1
            },
            roomType: {
                id: 5
            },
            status: true
        };
        $scope.supplySelected = [];
        $scope.supplys.forEach(item => {
            item.count = 0;
            item.checked = false;
        });

        $scope.bedTypeSelected = [];
        $scope.bedTypes.forEach(item => {
            item.count = 0;
            item.checked = false;
        });
        $scope.chooseImageRooms = [];
        document.getElementById('formrow-image-input').value = null;
    };

    $scope.createFloor = function () {
        var floor = angular.copy($scope.formFloor);
        $http.post("http://localhost:8000/api/floors", floor).then(resp => {
            $scope.floors.push(resp.data);
            alert("Thêm tầng thành công");
            $('#viewFloor').modal('show')
        }).catch(error => {
            alert("Thêm tầng thất bại")
            console.log("Error", error);
        })
    }
    
    $scope.resetFormFloor = function(){
        $scope.formFloor = {
            status: true
        }
    }

    $scope.initialize();
});

app.controller("roomUpdateFormCtrl", function ($scope, $routeParams, $http, $location) {
    $scope.form = {};

    $scope.floors = [];

    $scope.bedTypes = [];
    $scope.bedRooms = [];
    $scope.bedTypeSelected = [];

    // Load data room
    $scope.initialize = async function () {
        //Load room detail
        await $http.get("http://localhost:8000/api/rooms/" + $routeParams.id).then(resp => {
            $scope.form = resp.data;
            if ($scope.form.status == 1) {
                $scope.form.status2 = false;
            } else {
                $scope.form.status2 = true;
            }
        }).catch(error => {
            console.log("Error", error);
        })

        //Load room type
        $http.get("http://localhost:8000/api/room-types").then(resp => {
            $scope.roomTypes = resp.data;
        }).catch(error => {
            console.log("Error", error);
        })

        //Load data floors
        $http.get("http://localhost:8000/api/floors").then(resp => {
            $scope.floors = resp.data;
        }).catch(error => {
            console.log("Error", error);
        })

        //Load bed room
        await $http.get("http://localhost:8000/api/bed-rooms/" + $scope.form.code).then(resp => {
            $scope.bedRooms = resp.data;
            $scope.bedRooms.forEach(item => {
                var bedRoom = item.bedType;
                bedRoom.count = item.quantityBed;
                $scope.bedTypeSelected.push(bedRoom);
            })
        }).catch(error => {
            console.log("Error", error);
        })

        //Load data floors
        $http.get("http://localhost:8000/api/floors").then(resp => {
            $scope.floors = resp.data;
        }).catch(error => {
            console.log("Error", error);
        })

        //Load bed type
        await $http.get("http://localhost:8000/api/bed-types").then(resp => {
            $scope.bedTypes = resp.data;
            $scope.bedTypes.forEach(item1 => {
                item1.count = 0;
                $scope.bedRooms.forEach(item2 => {
                    if (item1.id == item2.bedType.id) {
                        item1.checked = true;
                        item1.count = item2.quantityBed;
                    }
                })
            })
        }).catch(error => {
            console.log("Error", error);
        })
    }

    $scope.bedTypeSearch = function (bedType) {
        return $scope.bedTypeSelected.find(item => item.id == bedType.id)
    }

    $scope.bedTypeChanged = async function (bedType) {
        const bedType2 = $scope.bedTypeSearch(bedType);
        if (bedType2) {
            const index = $scope.bedTypeSelected.findIndex(item => item.id == bedType.id);
            $scope.bedTypeSelected.splice(index, 1);
            if (bedType.checked == true) {
                $scope.bedTypeSelected.push(bedType);
            }else {
                bedType.count = 0;
            }
        } else {
            $scope.bedTypeSelected.forEach(item =>{
                if (item.id == 5 || item.id == 6 || item.id == 7) {
                    alert("Trong phòng chỉ được tối thiểu 1 loại giường");
                    bedType.checked = false;
                }
            })
            if (bedType.checked) {
                if (bedType.id == 6 || bedType.id == 7) {
                    bedType.count = 1;
                }else {
                    bedType.count = 2;
                }
                $scope.bedTypeSelected.push(bedType);
            }
        }
    }

    $scope.deleteBedRoom = function(){
        if ($scope.bedTypeSelected) {
            $scope.bedTypeSelected.forEach(item1 =>{
                $scope.bedRooms.forEach(item2 =>{
                    if(item1.id == item2.bedType.id){
                        const index1 = $scope.bedRooms.findIndex(bedRoom => bedRoom.bedType.id == item1.id);
                        $scope.bedRooms.splice(index1, 1);
                        const index2 = $scope.bedTypeSelected.findIndex(bedRoom => bedRoom.id == item2.bedType.id);
                        $scope.bedTypeSelected.splice(index2, 1);
                    }
                })
            });
        }

        if ($scope.bedRooms) {
            $scope.bedRooms.forEach(item => {
                $http.delete("http://localhost:8000/api/bed-rooms/" + item.id).then(resp => {
                }).catch(error => {
                    console.log("Error", error);
                })
            })
        }
    }

    $scope.updateBedRoom = async function (room1) {
        $scope.deleteBedRoom();
        if ($scope.bedTypeSelected) {
            var room = room1;
            room.numAdults = 0;
            room.numChilds = 0;
            await $scope.bedTypeSelected.forEach(item => {
                var bedType = item;
                var quantityBed = item.count;
                var bedRoom = {
                    room,
                    bedType,
                    quantityBed
                }
                $http.post("http://localhost:8000/api/bed-rooms", bedRoom).then(resp => {
                }).catch(error => {
                    console.log("Error", error);
                })
                room.numAdults += bedType.maxAdults * quantityBed;
                room.numChilds += bedType.maxChilds * quantityBed;
    
                $http.put("http://localhost:8000/api/rooms", room).then(resp => {
                }).catch(error => {
                    console.log("Error", error);
                });
            });
        }
    }

    //Update room
    $scope.update = function () {
        if ($scope.form.status2 && $scope.form.status == 1) {
            $scope.form.status = 0;
        }else if(!$scope.form.status2 && $scope.form.status == 0){
            $scope.form.status = 1;
        }
        var room = angular.copy($scope.form);
        $http.put("http://localhost:8000/api/rooms", room).then(resp => {
            $scope.updateBedRoom(resp.data);
            alert("Cập nhập thành công");
            $location.path("/room");
        }).catch(error => {
            alert("Cập nhập không thành công");
            console.log("Error", error);
        })
    }

    //Reset form
    $scope.reset = function () {
        $scope.form = {
            code: "",
            price: "",
            maxAdult: "",
            maxAdultAdd: "",
            maxChild: "",
            maxChildAdd: "",
            area: "",
            isSmoking: true,
            description: "",
            roomType: {
                id: 5,
                code: null,
                name: "Single room",
                adultSurcharge: 200000,
                childSurcharge: 200000,
                cancellationPolicy: "No refunds",
                otherPolicy: "No",
                description: "for 1 person"
            },
        };
        $scope.supplySelected = [];
    };
    $scope.initialize();

});
