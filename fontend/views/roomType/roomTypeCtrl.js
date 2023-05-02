app.controller("roomTypeListCtrl", function ($scope, $http, $location) {
    $scope.roomTypes = [];
    $scope.form = {};
    $scope.roomType = {};

    $scope.supplyRoomTypes = [];

    $scope.imageRoomTypes = [];

    $scope.isLoading = false;
    // Load data room
    $scope.initialize = function(){
        $scope.isLoading = true;
        $http.get("http://localhost:8000/api/room-types").then(resp =>{
            $scope.roomTypes = resp.data;
            $(document).ready(function () {
                // khởi tạo table id 'datatable-room-type'
                tableInvoiceDetailHistory = $('#datatable-room-type').DataTable({
                    language: {
                        url: '//cdn.datatables.net/plug-ins/1.13.4/i18n/vi.json',
                    },
                    dom: 't<"row"<"col-sm-12 col-md-5"i><"col-sm-12 col-md-7"p>>'
                });
                // gắn ô tìm kiếm id 'search-datatable-room-type' cho table
                $('#search-datatable-room-type').keyup(function () {
                    tableInvoiceDetailHistory.search($(this).val()).draw();
                });
            });
            $scope.isLoading = false;
        }).catch(error =>{
            alert("Error load data room type")
            console.log("Error", error);
        })
    }
    
    // Load data supply room type
    $scope.loadSupplyRoomType = function (codeRoomType) {
        $http.get("http://localhost:8000/api/supply-room-types/" + codeRoomType).then(resp => {
            $scope.supplyRoomTypes = resp.data;
        }).catch(error => {
            console.log("Error", error);
        })
    }

    // Load data image room type
    $scope.loadImageRoomType = function (codeRoomType) {
        $http.get("http://localhost:8000/api/room-type-images/" + codeRoomType).then(resp => {
            $scope.imageRoomTypes = resp.data;
        }).catch(error => {
            console.log("Error", error);
        })
    }

    $scope.url = function(imageName){
        return `http://localhost:8000/images/${imageName}`;
    }

    $scope.roomTypeDetail = function(item) {
        $scope.roomType = item;
    }

    $scope.initialize();
});

app.controller("roomTypeCreateFormCtrl", function ($scope, $http, $location) {
    $scope.roomTypes = [];
    $scope.form = {

    };

    $scope.create = function () {
        var roomType = angular.copy($scope.form);
        $http.post("http://localhost:8000/api/room-types", roomType).then(resp =>{
            alert("Create thành công")
        }).catch(error=>{
            alert("Create thất bại")
            console.log("Error", error);
        })
    }


    //Reset form
    $scope.reset = function () {
        $scope.form = {
            
        };
    };
});

app.controller("roomTypeUpdateFormCtrl", function ($scope, $routeParams, $http, $location) {
    $scope.form = {};
    
    $scope.supplys = [];
    $scope.supplyRooms = [];
    $scope.supplySelected = [];

    $scope.imageRoomTypes = [];
    $scope.chooseImageRooms = [];

    $scope.initialize = async function () {
        //Load room detail
        await $http.get("http://localhost:8000/api/room-types/" + $routeParams.id).then(resp => {
            $scope.form = resp.data;
        }).catch(error => {
            console.log("Error", error);
        })

         //Load supply room type
         await $http.get("http://localhost:8000/api/supply-room-types/" + $scope.form.code).then(resp => {
            $scope.supplyRooms = resp.data;
            $scope.supplyRooms.forEach(item => {
                var supply = item.supply;
                supply.count = item.quantity;
                $scope.supplySelected.push(supply);
            })
        }).catch(error => {
            console.log("Error", error);
        })

        //Load supply
        await $http.get("http://localhost:8000/api/supplies").then(resp => {
            $scope.supplys = resp.data;
            $scope.supplys.forEach(item1 => {
                item1.count = 0;
                $scope.supplyRooms.forEach(item2 => {
                    if (item1.id == item2.supply.id) {
                        item1.checked = true;
                        item1.count = item2.quantity;
                    }
                })
            })
        }).catch(error => {
            console.log("Error", error);
        })

        //Load image room type
        await $http.get("http://localhost:8000/api/room-type-images/" + $scope.form.code).then(resp => {
            $scope.imageRooms = resp.data;
            $scope.imageRooms.forEach(item =>{
                $scope.chooseImageRooms.push(item);
            })
        }).catch(error => {
            console.log("Error", error);
        })
    }

    //Load room detail
    $scope.edit = function(){
        $http.get("http://localhost:8000/api/room-types/" + $routeParams.id).then(resp =>{
            $scope.form = resp.data;
        }).catch(error=>{
            console.log("Error", error);
        })

    }
    
    $scope.supplySearch = function (supply) {
        return $scope.supplySelected.find(item => item.id == supply.id);
    }

    $scope.supplyChanged = async function (supply) {
        const supply2 = $scope.supplySearch(supply);
        if (supply2) {
            const index = $scope.supplySelected.findIndex(item => item.id == supply.id);
            $scope.supplySelected.splice(index, 1);
            if (supply.checked) {
                $scope.supplySelected.push(supply);
            }else {
                supply.count = 0;
            }
        } else {
            supply.count = 1;
            await $scope.supplySelected.push(supply);
        }
    }

    $scope.deleteSupplyRoomType = function (){
        if ($scope.supplySelected) {
            $scope.supplySelected.forEach(item1 =>{
                $scope.supplyRooms.forEach(item2 =>{
                    if(item1.id == item2.supply.id){
                        const index1 = $scope.supplyRooms.findIndex(sp => sp.supply.id == item1.id);
                        $scope.supplyRooms.splice(index1, 1);
                        const index2 = $scope.supplySelected.findIndex(sp => sp.id == item2.supply.id);
                        $scope.supplySelected.splice(index2, 1);
                    }
                })
            });
        }

        if ($scope.supplyRooms) {
            $scope.supplyRooms.forEach(item => {
                $http.delete("http://localhost:8000/api/supply-room-types/" + item.id).then(resp => {
                }).catch(error => {
                    console.log("Error", error);
                })
            })
        }
    }

    $scope.updateSupplyRoom = async function (roomType1) {
        $scope.deleteSupplyRoomType();
        if ($scope.supplySelected) {
            var roomType = roomType1;
            await $scope.supplySelected.forEach(item => {
                var supply = item;
                var quantity = item.count;
                var supplyRoom = {
                    roomType,
                    supply,
                    quantity
                }
                $http.post("http://localhost:8000/api/supply-room-types", supplyRoom).then(resp => {
                }).catch(error => {
                    console.log("Error", error);
                })
            });
        }
    }

    $scope.uploadImageStorage = function (files) {
        var fileImages = [];
        for (var index = 0; index < files.length; index++) {
            var file = new FormData();
            file.append("file", files[index]);
            fileImages.push(file);
        }
        fileImages.forEach(item => {
            $http.post("http://localhost:8000/api/storage", item, {
                transformRequest: angular.identity,
                headers: {'Content-Type' : undefined},
                transformResponse: [
                    function (item) { 
                        return item; 
                    }
                ]
            }).then(resp => {
                var fileName = resp.data;
                var imageRoomType = {
                    roomType: null,
                    fileName
                };
                $scope.chooseImageRooms.push(imageRoomType);
            }).catch(error => {
                console.log("Error", error);
            })
        })
    }

    $scope.deleteImageStorage = async function(imageName){
        await $http.delete("http://localhost:8000/api/storage/" + imageName).then(resp => {
            const index = $scope.chooseImageRooms.findIndex(name => name.fileName == imageName);
            $scope.chooseImageRooms.splice(index, 1);
            document.getElementById('formrow-image-input').value = null;
        }).catch(error => {
            console.log("Error", error);
        })
    }

    $scope.deleteImageRoomType = function(){
        if ($scope.chooseImageRooms) {
            $scope.chooseImageRooms.forEach(item1 =>{
                $scope.imageRooms.forEach(item2 =>{
                    if(item1.fileName == item2.fileName){
                        const index1 = $scope.imageRooms.findIndex(name => name.fileName == item1.fileName);
                        $scope.imageRooms.splice(index1, 1);
                        const index2 = $scope.chooseImageRooms.findIndex(name => name.fileName == item2.fileName);
                        $scope.chooseImageRooms.splice(index2, 1);
                    }
                })
            });
        }

        if ($scope.imageRooms) {
            $scope.imageRooms.forEach(item => {
                $http.delete("http://localhost:8000/api/room-type-images/" + item.id).then(resp => { 
                }).catch(error => {
                    console.log("Error", error);
                })
            })
        }
    }

    $scope.updateImageRoomType =function(roomType) {
        $scope.deleteImageRoomType();
        if ($scope.chooseImageRooms) {
            $scope.chooseImageRooms.forEach(item =>{
                var fileName = item.fileName;
                var roomTypeImage = {
                    roomType,
                    fileName
                };
                $http.post("http://localhost:8000/api/room-type-images", roomTypeImage).then(resp =>{
    
                }).catch(error =>{
                    console.log("Error", error);
                })
            })
        }
    }

    $scope.url = function(imageName){
        return `http://localhost:8000/images/${imageName}`;
    }

    //Update room-type
    $scope.update = function(){
        var roomType = angular.copy($scope.form);
        $http.put("http://localhost:8000/api/room-types", roomType).then(resp=>{
            $scope.updateSupplyRoom(resp.data);
            $scope.updateImageRoomType(resp.data);
            alert("Cập nhập loại phòng thành công");
            $location.path("/room-type");
        }).catch(error=>{
            alert("Cập nhập loại phòng thất bại");
            console.log("Error", error);
        })
    }

    //Reset form
    $scope.reset = function () {
        $scope.form = {
        };
    };

    $scope.initialize();
    $scope.edit();
});
