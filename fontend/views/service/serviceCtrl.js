app.controller("serviceCtrl", function ($scope, $http) {
	$scope.showbut = true;
	$scope.loading = false;
	$scope.form = {
		status:false,
		serviceType: { id: 1 }
	};
	$scope.items = [];
	$scope.serTypes = [];
	$scope.initialize = function () {
		$scope.loading = true;
		$http.get("http://localhost:8000/api/services").then(resp => {
			$scope.items = resp.data;
			$(document).ready(function () {
                tableServices = $('#datatable-services').DataTable({
                    language: {
                        url: '//cdn.datatables.net/plug-ins/1.13.4/i18n/vi.json',
                    },
					dom: 't<"row"<"col-sm-12 col-md-5"i><"col-sm-12 col-md-7"p>>'
                });

				$('#search-datatable-services').keyup(function () {
					tableServices.search($(this).val()).draw();
				});
            });
		})

		$http.get("http://localhost:8000/api/service-types").then(resp => {
			$scope.serTypes = resp.data;
			$scope.loading = false;
		})
		
	}
	$scope.initialize();

	$scope.create = function () { //create a new service 
		var item = angular.copy($scope.form);
		$http.post("http://localhost:8000/api/services", item).then(resp => {
			$scope.initialize();
			alert("Adding success !");
			$scope.close();
		}).catch(error => {
			alert("Adding failed !")
			console.log("Error", error)
		})

	}

	$scope.update = function () {
		var item = angular.copy($scope.form);
		$http.put("http://localhost:8000/api/services", item).then(resp => {
			var index = $scope.items.findIndex(p => p.id == item.id)
			$scope.items[index] = item;
			alert("Update success!");	
			$scope.close();
		}).catch(error => {
			alert("Update failed!")
			console.log("Error", error)
		})
	}

	$scope.view = function (s) {//update
		const myModal = new bootstrap.Modal('#exampleModal');
		myModal.show();
		$scope.showbut = false;
		$scope.form = angular.copy(s);
	}
	$scope.close = function () {
		var myModalEl = document.getElementById('exampleModal');
		var modal = bootstrap.Modal.getInstance(myModalEl)
		modal.hide();
		$scope.form = {}
		$scope.showbut = true;
	}
});

